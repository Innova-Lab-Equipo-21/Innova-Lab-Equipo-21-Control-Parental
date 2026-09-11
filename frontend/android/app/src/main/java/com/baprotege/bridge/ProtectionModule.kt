/**
 * ==============================================================================
 * Proyecto: BA Protege+
 * Componente: Bridge React Native <-> Android Native
 * Archivo: ProtectionModule.kt
 * Descripción: Módulo nativo que expone las capacidades del motor de protección VPN
 *              y persistencia a la capa JavaScript/TypeScript de React Native.
 * ==============================================================================
 */

package com.baprotege.bridge

import android.app.Activity
import android.content.Context
import android.content.Intent
import android.net.VpnService
import android.os.Build
import com.baprotege.vpn.LotbaFilterEngine
import com.baprotege.vpn.ProtectionVpnService
import com.facebook.react.bridge.*
import com.facebook.react.modules.core.DeviceEventManagerModule

class ProtectionModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext), ActivityEventListener {

    companion object {
        const val MODULE_NAME = "ProtectionModule"
        private const val REQUEST_VPN_PERMISSION = 101
    }

    private var pendingPromise: Promise? = null
    private val filterEngine = LotbaFilterEngine.getInstance(reactContext)

    init {
        reactContext.addActivityEventListener(this)
    }

    override fun getName(): String = MODULE_NAME

    /**
     * Solicita la autorización del sistema operativo para activar el VpnService.
     * Retorna true si ya estaba autorizado o abre el diálogo nativo de Android.
     */
    @ReactMethod
    fun prepareVpn(promise: Promise) {
        val currentActivity = currentActivity
        if (currentActivity == null) {
            promise.reject("E_NO_ACTIVITY", "No hay una actividad activa para solicitar permisos")
            return
        }

        val intent = VpnService.prepare(currentActivity)
        if (intent != null) {
            this.pendingPromise = promise
            currentActivity.startActivityForResult(intent, REQUEST_VPN_PERMISSION)
        } else {
            // Ya se cuenta con autorización previa
            promise.resolve(true)
        }
    }

    /**
     * Inicia el servicio de protección VPN en segundo plano.
     */
    @ReactMethod
    fun startProtection(promise: Promise) {
        try {
            val intent = Intent(reactContext, ProtectionVpnService::class.java).apply {
                action = ProtectionVpnService.ACTION_START
            }

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                reactContext.startForegroundService(intent)
            } else {
                reactContext.startService(intent)
            }

            // Persistir preferencia de estado para BootReceiver
            val prefs = reactContext.getSharedPreferences("ba_protege_settings_prefs", Context.MODE_PRIVATE)
            prefs.edit().putBoolean("protection_should_be_enabled", true).apply()

            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("E_START_VPN", "Falla al iniciar servicio VPN: ${e.message}", e)
        }
    }

    /**
     * Detiene el servicio de protección VPN.
     */
    @ReactMethod
    fun stopProtection(promise: Promise) {
        try {
            val intent = Intent(reactContext, ProtectionVpnService::class.java).apply {
                action = ProtectionVpnService.ACTION_STOP
            }
            reactContext.startService(intent)

            val prefs = reactContext.getSharedPreferences("ba_protege_settings_prefs", Context.MODE_PRIVATE)
            prefs.edit().putBoolean("protection_should_be_enabled", false).apply()

            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("E_STOP_VPN", "Falla al detener servicio VPN: ${e.message}", e)
        }
    }

    /**
     * Consulta el estado de ejecución actual del motor de protección.
     */
    @ReactMethod
    fun isProtectionActive(promise: Promise) {
        val active = ProtectionVpnService.isProtectionActive()
        promise.resolve(active)
    }

    /**
     * Actualiza la lista de dominios bloqueados en la memoria y caché local.
     */
    @ReactMethod
    fun updateBlocklist(version: Int, domainsArray: ReadableArray, promise: Promise) {
        try {
            val domainList = mutableListOf<String>()
            for (i in 0 until domainsArray.size()) {
                domainsArray.getString(i)?.let { domainList.add(it) }
            }
            filterEngine.updateBlocklist(version, domainList)

            val result = Arguments.createMap().apply {
                putInt("version", filterEngine.getBlocklistVersion())
                putInt("totalDomains", filterEngine.getBlockedDomainsCount())
            }
            promise.resolve(result)
        } catch (e: Exception) {
            promise.reject("E_UPDATE_LIST", "Error al actualizar lista de dominios: ${e.message}", e)
        }
    }

    /**
     * Obtiene estadísticas de la lista de bloqueo local.
     */
    @ReactMethod
    fun getBlocklistInfo(promise: Promise) {
        val result = Arguments.createMap().apply {
            putInt("version", filterEngine.getBlocklistVersion())
            putInt("totalDomains", filterEngine.getBlockedDomainsCount())
        }
        promise.resolve(result)
    }

    override fun onActivityResult(activity: Activity?, requestCode: Int, resultCode: Int, data: Intent?) {
        if (requestCode == REQUEST_VPN_PERMISSION) {
            if (resultCode == Activity.RESULT_OK) {
                pendingPromise?.resolve(true)
            } else {
                pendingPromise?.reject("E_VPN_PERMISSION_DENIED", "El usuario rechazó el permiso de VPN")
            }
            pendingPromise = null
        }
    }

    override fun onNewIntent(intent: Intent?) {
        // No-op
    }
}
