/**
 * ==============================================================================
 * Proyecto: BA Protege+
 * Componente: Android Native Core (Servicio de Accesibilidad)
 * Archivo: ProtectionAccessibilityService.kt
 * Descripción: Implementación de AccessibilityService para protección antidesinstalación,
 *              bloqueo activo de intentos de desinstalación/cierre forzado y
 *              verificación real de habilitación en la configuración de Android.
 * ==============================================================================
 */

package com.baprotege.accessibility

import android.accessibilityservice.AccessibilityService
import android.accessibilityservice.AccessibilityServiceInfo
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.os.Handler
import android.os.Looper
import android.provider.Settings
import android.text.TextUtils
import android.util.Log
import android.view.accessibility.AccessibilityEvent
import android.view.accessibility.AccessibilityManager
import android.view.accessibility.AccessibilityNodeInfo
import android.widget.Toast
import java.util.concurrent.atomic.AtomicBoolean

class ProtectionAccessibilityService : AccessibilityService() {

    companion object {
        private const val TAG = "ProtectionA11yService"
        private const val PREFS_NAME = "ba_protege_settings_prefs"
        private const val KEY_ANTI_UNINSTALL = "anti_uninstall_enabled"
        private val isRunning = AtomicBoolean(false)

        fun isServiceActive(): Boolean = isRunning.get()

        /**
         * Consulta en SharedPreferences si la protección antidesinstalación está habilitada.
         */
        fun isAntiUninstallEnabled(context: Context): Boolean {
            val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
            return prefs.getBoolean(KEY_ANTI_UNINSTALL, true)
        }

        /**
         * Actualiza en SharedPreferences el estado de la protección antidesinstalación.
         */
        fun setAntiUninstallEnabled(context: Context, enabled: Boolean) {
            val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
            prefs.edit().putBoolean(KEY_ANTI_UNINSTALL, enabled).apply()
            Log.i(TAG, "🔒 Antidesinstalación configurada en: $enabled")
        }

        /**
         * Verifica en el sistema Android si este servicio de accesibilidad se encuentra
         * realmente habilitado en la configuración del dispositivo.
         */
        fun isEnabled(context: Context): Boolean {
            if (isRunning.get()) {
                return true
            }

            val expectedComponent = ComponentName(context, ProtectionAccessibilityService::class.java)
            val expectedFlatten = expectedComponent.flattenToString()
            val expectedShort = expectedComponent.flattenToShortString()

            try {
                val am = context.getSystemService(Context.ACCESSIBILITY_SERVICE) as? AccessibilityManager
                if (am != null) {
                    val enabledServices = am.getEnabledAccessibilityServiceList(
                        AccessibilityServiceInfo.FEEDBACK_ALL_MASK
                    )
                    for (service in enabledServices) {
                        val serviceInfo = service.resolveInfo?.serviceInfo ?: continue
                        if (serviceInfo.packageName == context.packageName &&
                            serviceInfo.name == ProtectionAccessibilityService::class.java.name
                        ) {
                            return true
                        }
                    }
                }
            } catch (e: Exception) {
                Log.w(TAG, "Error consultando AccessibilityManager: ${e.message}")
            }

            return try {
                val accessibilityEnabled = Settings.Secure.getInt(
                    context.contentResolver,
                    Settings.Secure.ACCESSIBILITY_ENABLED,
                    0
                )
                if (accessibilityEnabled != 1) {
                    return false
                }

                val enabledSetting = Settings.Secure.getString(
                    context.contentResolver,
                    Settings.Secure.ENABLED_ACCESSIBILITY_SERVICES
                ) ?: return false

                val splitter = TextUtils.SimpleStringSplitter(':')
                splitter.setString(enabledSetting)
                while (splitter.hasNext()) {
                    val componentName = splitter.next()
                    if (componentName.equals(expectedFlatten, ignoreCase = true) ||
                        componentName.equals(expectedShort, ignoreCase = true)
                    ) {
                        return true
                    }
                }
                false
            } catch (e: Exception) {
                Log.w(TAG, "Error consultando Settings.Secure: ${e.message}")
                false
            }
        }
    }

    private var lastBlockTimestamp = 0L

    override fun onServiceConnected() {
        super.onServiceConnected()
        isRunning.set(true)
        Log.i(TAG, "✅ Servicio de accesibilidad BA Protege+ conectado.")
    }

    override fun onAccessibilityEvent(event: AccessibilityEvent?) {
        if (event == null) return
        if (!isAntiUninstallEnabled(this)) return

        val pkgName = event.packageName?.toString() ?: return

        val isInstaller = pkgName.contains("packageinstaller") ||
                pkgName.contains("installer") ||
                pkgName == "com.android.settings"

        if (!isInstaller) return

        // 1. Revisar texto directo en el evento
        val eventTexts = event.text
        var mentionsTarget = false
        if (eventTexts != null) {
            for (cs in eventTexts) {
                val str = cs.toString().lowercase()
                if (str.contains("ba protege") || str.contains("baprotege")) {
                    mentionsTarget = true
                    break
                }
            }
        }

        // 2. Revisar la jerarquía de ventanas activas
        val rootNode = rootInActiveWindow
        if (!mentionsTarget && rootNode != null) {
            mentionsTarget = containsKeyword(rootNode, listOf("ba protege", "baprotege"))
        }

        if (!mentionsTarget) {
            return
        }

        // Si se trata de packageinstaller y menciona BA Protege+ -> Intento de desinstalación directo
        if (pkgName.contains("packageinstaller") || pkgName.contains("installer")) {
            blockUninstallAttempt()
            return
        }

        // Si se trata de com.android.settings -> Verificar si está en la ficha de aplicación de BA Protege+
        if (pkgName == "com.android.settings") {
            if (rootNode != null && containsKeyword(
                    rootNode,
                    listOf("desinstalar", "uninstall", "forzar detención", "force stop", "inhabilitar", "disable")
                )
            ) {
                blockUninstallAttempt()
            }
        }
    }

    private fun containsKeyword(node: AccessibilityNodeInfo?, keywords: List<String>): Boolean {
        if (node == null) return false

        val text = node.text?.toString()?.lowercase() ?: ""
        val desc = node.contentDescription?.toString()?.lowercase() ?: ""

        for (kw in keywords) {
            if (text.contains(kw) || desc.contains(kw)) {
                return true
            }
        }

        val childCount = node.childCount
        for (i in 0 until childCount) {
            val child = node.getChild(i)
            if (child != null) {
                val found = containsKeyword(child, keywords)
                child.recycle()
                if (found) return true
            }
        }
        return false
    }

    private fun blockUninstallAttempt() {
        val now = System.currentTimeMillis()
        if (now - lastBlockTimestamp < 1500) {
            return
        }
        lastBlockTimestamp = now

        Log.w(TAG, "🛡️ Intento de desinstalación o detención de BA Protege+ bloqueado por antidesinstalación.")

        // Enviar al Home del sistema para cancelar el diálogo o salir de ajustes
        performGlobalAction(GLOBAL_ACTION_HOME)
        performGlobalAction(GLOBAL_ACTION_BACK)

        Handler(Looper.getMainLooper()).post {
            Toast.makeText(
                applicationContext,
                "La desinstalación de BA Protege+ está bloqueada por la protección antidesinstalación.",
                Toast.LENGTH_LONG
            ).show()
        }
    }

    override fun onInterrupt() {
        Log.d(TAG, "Servicio de accesibilidad interrumpido.")
    }

    override fun onUnbind(intent: Intent?): Boolean {
        isRunning.set(false)
        Log.i(TAG, "🛑 Servicio de accesibilidad desconectado.")
        return super.onUnbind(intent)
    }

    override fun onDestroy() {
        isRunning.set(false)
        super.onDestroy()
    }
}
