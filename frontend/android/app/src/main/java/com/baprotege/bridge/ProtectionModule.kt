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

import android.Manifest
import android.app.Activity
import android.app.AppOpsManager
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.location.Location
import android.location.LocationManager
import android.net.Uri
import android.net.VpnService
import android.os.Build
import android.os.PowerManager
import android.os.Process
import android.provider.Settings
import android.util.Log
import androidx.core.app.NotificationManagerCompat
import androidx.core.content.ContextCompat
import com.baprotege.accessibility.BlockedAppRule
import com.baprotege.accessibility.ProtectionAccessibilityService
import com.baprotege.vpn.LotbaFilterEngine
import com.baprotege.vpn.ProtectionVpnService
import com.baprotege.vpn.VpnNotificationManager
import com.facebook.react.bridge.*
import com.facebook.react.modules.core.DeviceEventManagerModule

class ProtectionModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext), ActivityEventListener {

    companion object {
        const val MODULE_NAME = "ProtectionModule"
        private const val REQUEST_VPN_PERMISSION = 101
        private const val REQUEST_ACCESSIBILITY_SETTINGS = 102
        private const val REQUEST_NOTIFICATION_SETTINGS = 103
        private const val REQUEST_BATTERY_OPTIMIZATION = 104
        private const val REQUEST_LOCATION_SETTINGS = 105
        private const val REQUEST_USAGE_STATS_SETTINGS = 106
    }

    private var pendingVpnPromise: Promise? = null
    private var pendingAccessibilityPromise: Promise? = null
    private var pendingNotificationPromise: Promise? = null
    private var pendingBatteryPromise: Promise? = null
    private var pendingLocationPromise: Promise? = null
    private var pendingUsageStatsPromise: Promise? = null
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

        try {
            val intent = VpnService.prepare(currentActivity)
            if (intent != null) {
                pendingVpnPromise?.reject("E_VPN_CANCELLED", "Se inició una nueva solicitud de permiso VPN")
                this.pendingVpnPromise = promise
                currentActivity.startActivityForResult(intent, REQUEST_VPN_PERMISSION)
            } else {
                // Ya se cuenta con autorización previa en la configuración del dispositivo
                promise.resolve(true)
            }
        } catch (e: Exception) {
            pendingVpnPromise = null
            promise.reject("E_VPN_PREPARE_FAILED", "No se pudo solicitar el permiso de VPN: ${e.message}", e)
        }
    }

    /**
     * Verifica en el sistema operativo Android si el permiso de VPN está realmente
     * activado en la configuración del dispositivo (VpnService.prepare(context) == null).
     */
    @ReactMethod
    fun isVpnPrepared(promise: Promise) {
        try {
            val prepared = VpnService.prepare(reactContext) == null
            promise.resolve(prepared)
        } catch (e: Exception) {
            promise.resolve(false)
        }
    }

    /**
     * Abre los Ajustes de Accesibilidad de Android para que el usuario habilite
     * o deshabilite el servicio BA Protege+ y retorna el estado real al regresar.
     */
    @ReactMethod
    fun openAccessibilitySettings(promise: Promise) {
        val currentActivity = currentActivity
        if (currentActivity == null) {
            promise.reject("E_NO_ACTIVITY", "No hay una actividad activa para abrir Ajustes de Accesibilidad")
            return
        }

        try {
            val intent = Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS)
            pendingAccessibilityPromise?.resolve(ProtectionAccessibilityService.isEnabled(reactContext))
            pendingAccessibilityPromise = promise
            currentActivity.startActivityForResult(intent, REQUEST_ACCESSIBILITY_SETTINGS)
        } catch (e: Exception) {
            pendingAccessibilityPromise = null
            promise.reject(
                "E_ACCESSIBILITY_SETTINGS",
                "No se pudieron abrir los Ajustes de Accesibilidad: ${e.message}",
                e
            )
        }
    }

    /**
     * Consulta en el sistema Android si el servicio de accesibilidad de BA Protege+
     * está realmente habilitado en la configuración del dispositivo.
     */
    @ReactMethod
    fun isAccessibilityEnabled(promise: Promise) {
        try {
            promise.resolve(ProtectionAccessibilityService.isEnabled(reactContext))
        } catch (e: Exception) {
            promise.resolve(false)
        }
    }

    /**
     * Consulta si la protección antidesinstalación está activa en el sistema.
     */
    @ReactMethod
    fun isAntiUninstallEnabled(promise: Promise) {
        try {
            promise.resolve(ProtectionAccessibilityService.isAntiUninstallEnabled(reactContext))
        } catch (e: Exception) {
            promise.resolve(true)
        }
    }

    /**
     * Activa o desactiva la protección antidesinstalación del servicio de accesibilidad.
     */
    @ReactMethod
    fun setAntiUninstallEnabled(enabled: Boolean, promise: Promise) {
        try {
            ProtectionAccessibilityService.setAntiUninstallEnabled(reactContext, enabled)
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("E_ANTI_UNINSTALL", "Error al actualizar antidesinstalación: ${e.message}", e)
        }
    }

    private fun areNotificationsReallyEnabled(): Boolean {
        val notificationsEnabled = try {
            NotificationManagerCompat.from(reactContext).areNotificationsEnabled()
        } catch (e: Exception) {
            false
        }
        if (!notificationsEnabled) {
            return false
        }
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            val postGranted = ContextCompat.checkSelfPermission(
                reactContext,
                Manifest.permission.POST_NOTIFICATIONS
            ) == PackageManager.PERMISSION_GRANTED
            return postGranted
        }
        return true
    }

    /**
     * Garantiza la creación de los canales de notificación y consulta si las
     * notificaciones del sistema están realmente habilitadas para BA Protege+.
     */
    @ReactMethod
    fun isNotificationsEnabled(promise: Promise) {
        try {
            VpnNotificationManager(reactContext).ensureChannelsCreated()
            promise.resolve(areNotificationsReallyEnabled())
        } catch (e: Exception) {
            promise.resolve(false)
        }
    }

    /**
     * Abre la pantalla de configuración de notificaciones de la app en Android
     * para habilitar o deshabilitar alertas y verifica al regresar.
     */
    @ReactMethod
    fun openNotificationSettings(promise: Promise) {
        try {
            VpnNotificationManager(reactContext).ensureChannelsCreated()
        } catch (_: Exception) {
        }

        val currentActivity = currentActivity
        if (currentActivity == null) {
            promise.reject("E_NO_ACTIVITY", "No hay una actividad activa para abrir Ajustes de Notificaciones")
            return
        }

        try {
            val intent = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                Intent(Settings.ACTION_APP_NOTIFICATION_SETTINGS).apply {
                    putExtra(Settings.EXTRA_APP_PACKAGE, reactContext.packageName)
                }
            } else {
                Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS).apply {
                    data = Uri.fromParts("package", reactContext.packageName, null)
                }
            }
            pendingNotificationPromise?.resolve(areNotificationsReallyEnabled())
            pendingNotificationPromise = promise
            currentActivity.startActivityForResult(intent, REQUEST_NOTIFICATION_SETTINGS)
        } catch (e: Exception) {
            try {
                val fallbackIntent = Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS).apply {
                    data = Uri.fromParts("package", reactContext.packageName, null)
                }
                pendingNotificationPromise = promise
                currentActivity.startActivityForResult(fallbackIntent, REQUEST_NOTIFICATION_SETTINGS)
            } catch (fallbackEx: Exception) {
                pendingNotificationPromise = null
                promise.reject(
                    "E_NOTIFICATION_SETTINGS",
                    "No se pudieron abrir los Ajustes de Notificaciones: ${fallbackEx.message}",
                    fallbackEx
                )
            }
        }
    }

    private fun isBatteryOptimizationIgnored(): Boolean {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            val powerManager = reactContext.getSystemService(Context.POWER_SERVICE) as? PowerManager
            return powerManager?.isIgnoringBatteryOptimizations(reactContext.packageName) ?: false
        }
        return true
    }

    /**
     * Consulta en el sistema Android si la app cuenta con exención de optimización
     * de batería (isIgnoringBatteryOptimizations).
     */
    @ReactMethod
    fun isBatteryOptimizationIgnored(promise: Promise) {
        try {
            promise.resolve(isBatteryOptimizationIgnored())
        } catch (e: Exception) {
            promise.resolve(false)
        }
    }

    /**
     * Solicita la exención de optimización de batería al sistema Android:
     * Abre el diálogo directo del sistema (ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS)
     * o la lista de optimización (ACTION_IGNORE_BATTERY_OPTIMIZATION_SETTINGS)
     * y valida al regresar si la exención fue concedida.
     */
    @ReactMethod
    fun requestIgnoreBatteryOptimization(promise: Promise) {
        if (isBatteryOptimizationIgnored()) {
            promise.resolve(true)
            return
        }

        val currentActivity = currentActivity
        if (currentActivity == null) {
            promise.reject("E_NO_ACTIVITY", "No hay una actividad activa para solicitar exención de batería")
            return
        }

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            try {
                val intent = Intent(Settings.ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS).apply {
                    data = Uri.parse("package:${reactContext.packageName}")
                }
                pendingBatteryPromise?.resolve(isBatteryOptimizationIgnored())
                pendingBatteryPromise = promise
                currentActivity.startActivityForResult(intent, REQUEST_BATTERY_OPTIMIZATION)
            } catch (e: Exception) {
                try {
                    val fallbackIntent = Intent(Settings.ACTION_IGNORE_BATTERY_OPTIMIZATION_SETTINGS)
                    pendingBatteryPromise = promise
                    currentActivity.startActivityForResult(fallbackIntent, REQUEST_BATTERY_OPTIMIZATION)
                } catch (fallbackEx: Exception) {
                    pendingBatteryPromise = null
                    promise.reject(
                        "E_BATTERY_OPTIMIZATION",
                        "No se pudo solicitar la exención de batería: ${fallbackEx.message}",
                        fallbackEx
                    )
                }
            }
        } else {
            promise.resolve(true)
        }
    }

    /**
     * Abre los Ajustes de Batería / Optimización de batería del dispositivo
     * para que el usuario pueda administrar o restablecer la optimización.
     */
    @ReactMethod
    fun openBatterySettings(promise: Promise) {
        val currentActivity = currentActivity
        if (currentActivity == null) {
            promise.reject("E_NO_ACTIVITY", "No hay una actividad activa para abrir Ajustes de Batería")
            return
        }

        try {
            val intent = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                Intent(Settings.ACTION_IGNORE_BATTERY_OPTIMIZATION_SETTINGS)
            } else {
                Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS).apply {
                    data = Uri.fromParts("package", reactContext.packageName, null)
                }
            }
            pendingBatteryPromise?.resolve(isBatteryOptimizationIgnored())
            pendingBatteryPromise = promise
            currentActivity.startActivityForResult(intent, REQUEST_BATTERY_OPTIMIZATION)
        } catch (e: Exception) {
            try {
                val fallbackIntent = Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS).apply {
                    data = Uri.fromParts("package", reactContext.packageName, null)
                }
                pendingBatteryPromise = promise
                currentActivity.startActivityForResult(fallbackIntent, REQUEST_BATTERY_OPTIMIZATION)
            } catch (fallbackEx: Exception) {
                pendingBatteryPromise = null
                promise.reject(
                    "E_BATTERY_SETTINGS",
                    "No se pudieron abrir los Ajustes de Batería: ${fallbackEx.message}",
                    fallbackEx
                )
            }
        }
    }

    /**
     * Abre la pantalla de Ajustes de VPN del sistema Android.
     */
    @ReactMethod
    fun openVpnSettings(promise: Promise) {
        val currentActivity = currentActivity
        if (currentActivity == null) {
            promise.reject("E_NO_ACTIVITY", "No hay una actividad activa para abrir Ajustes de VPN")
            return
        }

        try {
            val intent = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
                Intent(Settings.ACTION_VPN_SETTINGS)
            } else {
                Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS).apply {
                    data = Uri.fromParts("package", reactContext.packageName, null)
                }
            }
            currentActivity.startActivity(intent)
            promise.resolve(true)
        } catch (e: Exception) {
            try {
                val fallbackIntent = Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS).apply {
                    data = Uri.fromParts("package", reactContext.packageName, null)
                }
                currentActivity.startActivity(fallbackIntent)
                promise.resolve(true)
            } catch (fallbackEx: Exception) {
                promise.reject(
                    "E_VPN_SETTINGS",
                    "No se pudieron abrir los Ajustes de VPN: ${fallbackEx.message}",
                    fallbackEx
                )
            }
        }
    }

    /**
     * Abre la pantalla de Información de la aplicación en Ajustes de Android
     * para revocar permisos de ubicación/GPS u otras preferencias del sistema.
     */
    @ReactMethod
    fun openAppSettings(promise: Promise) {
        val currentActivity = currentActivity
        if (currentActivity == null) {
            promise.reject("E_NO_ACTIVITY", "No hay una actividad activa para abrir Ajustes de la Aplicación")
            return
        }

        try {
            val intent = Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS).apply {
                data = Uri.fromParts("package", reactContext.packageName, null)
            }
            currentActivity.startActivity(intent)
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject(
                "E_APP_SETTINGS",
                "No se pudieron abrir los Ajustes de la Aplicación: ${e.message}",
                e
            )
        }
    }

    private fun hasLocationPermission(): Boolean {
        val fine = ContextCompat.checkSelfPermission(
            reactContext,
            Manifest.permission.ACCESS_FINE_LOCATION
        ) == PackageManager.PERMISSION_GRANTED
        val coarse = ContextCompat.checkSelfPermission(
            reactContext,
            Manifest.permission.ACCESS_COARSE_LOCATION
        ) == PackageManager.PERMISSION_GRANTED
        return fine || coarse
    }

    private fun isLocationProviderEnabled(): Boolean {
        val lm = reactContext.getSystemService(Context.LOCATION_SERVICE) as? LocationManager ?: return false
        return try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
                lm.isLocationEnabled
            } else {
                lm.isProviderEnabled(LocationManager.GPS_PROVIDER) ||
                    lm.isProviderEnabled(LocationManager.NETWORK_PROVIDER)
            }
        } catch (e: Exception) {
            false
        }
    }

    /**
     * Consulta en el sistema operativo Android si los permisos de ubicación
     * (ACCESS_FINE_LOCATION o ACCESS_COARSE_LOCATION) están otorgados.
     */
    @ReactMethod
    fun isLocationPermissionGranted(promise: Promise) {
        try {
            promise.resolve(hasLocationPermission())
        } catch (e: Exception) {
            promise.resolve(false)
        }
    }

    /**
     * Consulta en el sistema si el hardware/servicio GPS o de red está habilitado.
     */
    @ReactMethod
    fun isLocationEnabled(promise: Promise) {
        try {
            promise.resolve(isLocationProviderEnabled())
        } catch (e: Exception) {
            promise.resolve(false)
        }
    }

    /**
     * Abre los Ajustes de Ubicación del dispositivo Android (Settings.ACTION_LOCATION_SOURCE_SETTINGS)
     * y verifica al regresar si la ubicación quedó habilitada.
     */
    @ReactMethod
    fun openLocationSettings(promise: Promise) {
        val currentActivity = currentActivity
        if (currentActivity == null) {
            promise.reject("E_NO_ACTIVITY", "No hay una actividad activa para abrir Ajustes de Ubicación")
            return
        }

        try {
            val intent = Intent(Settings.ACTION_LOCATION_SOURCE_SETTINGS)
            pendingLocationPromise?.resolve(hasLocationPermission())
            pendingLocationPromise = promise
            currentActivity.startActivityForResult(intent, REQUEST_LOCATION_SETTINGS)
        } catch (e: Exception) {
            try {
                val fallbackIntent = Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS).apply {
                    data = Uri.fromParts("package", reactContext.packageName, null)
                }
                pendingLocationPromise = promise
                currentActivity.startActivityForResult(fallbackIntent, REQUEST_LOCATION_SETTINGS)
            } catch (fallbackEx: Exception) {
                pendingLocationPromise = null
                promise.reject(
                    "E_LOCATION_SETTINGS",
                    "No se pudieron abrir los Ajustes de Ubicación: ${fallbackEx.message}",
                    fallbackEx
                )
            }
        }
    }

    /**
     * Obtiene la última ubicación conocida del dispositivo usando LocationManager nativo.
     * Retorna latitude, longitude, accuracy, provider y timestamp.
     */
    @ReactMethod
    fun getLastKnownLocation(promise: Promise) {
        if (!hasLocationPermission()) {
            promise.reject("E_LOCATION_PERMISSION_DENIED", "Permiso de ubicación no concedido en el sistema")
            return
        }

        val lm = reactContext.getSystemService(Context.LOCATION_SERVICE) as? LocationManager
        if (lm == null) {
            promise.reject("E_LOCATION_SERVICE_UNAVAILABLE", "Servicio de ubicación no disponible")
            return
        }

        var bestLocation: Location? = null

        try {
            if (lm.isProviderEnabled(LocationManager.GPS_PROVIDER)) {
                val gpsLoc = lm.getLastKnownLocation(LocationManager.GPS_PROVIDER)
                if (gpsLoc != null) {
                    bestLocation = gpsLoc
                }
            }
        } catch (e: SecurityException) {
            Log.w(MODULE_NAME, "Sin permiso para GPS_PROVIDER: ${e.message}")
        }

        try {
            if (lm.isProviderEnabled(LocationManager.NETWORK_PROVIDER)) {
                val netLoc = lm.getLastKnownLocation(LocationManager.NETWORK_PROVIDER)
                if (netLoc != null) {
                    if (bestLocation == null || netLoc.time > bestLocation.time) {
                        bestLocation = netLoc
                    }
                }
            }
        } catch (e: SecurityException) {
            Log.w(MODULE_NAME, "Sin permiso para NETWORK_PROVIDER: ${e.message}")
        }

        if (bestLocation != null) {
            val result = Arguments.createMap().apply {
                putDouble("latitude", bestLocation.latitude)
                putDouble("longitude", bestLocation.longitude)
                putDouble("accuracy", bestLocation.accuracy.toDouble())
                putString("provider", bestLocation.provider ?: "GPS")
                putDouble("timestamp", bestLocation.time.toDouble())
            }
            promise.resolve(result)
        } else {
            promise.reject("E_NO_LOCATION_AVAILABLE", "No se encontró una ubicación reciente del GPS")
        }
    }

    private fun hasUsageStatsPermission(): Boolean {
        return try {
            val appOps = reactContext.getSystemService(Context.APP_OPS_SERVICE) as? AppOpsManager ?: return false
            val mode = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                appOps.unsafeCheckOpNoThrow(
                    AppOpsManager.OPSTR_GET_USAGE_STATS,
                    Process.myUid(),
                    reactContext.packageName
                )
            } else {
                @Suppress("DEPRECATION")
                appOps.checkOpNoThrow(
                    AppOpsManager.OPSTR_GET_USAGE_STATS,
                    Process.myUid(),
                    reactContext.packageName
                )
            }
            mode == AppOpsManager.MODE_ALLOWED
        } catch (e: Exception) {
            false
        }
    }

    /**
     * Consulta en el sistema operativo Android si la app cuenta con autorización
     * para acceder a las estadísticas de uso de aplicaciones (PACKAGE_USAGE_STATS).
     */
    @ReactMethod
    fun isUsageStatsPermissionGranted(promise: Promise) {
        try {
            promise.resolve(hasUsageStatsPermission())
        } catch (e: Exception) {
            promise.resolve(false)
        }
    }

    /**
     * Abre la sección de Ajustes de Acceso de Uso de Android (Settings.ACTION_USAGE_ACCESS_SETTINGS)
     * para habilitar o deshabilitar el acceso y valida al regresar.
     */
    @ReactMethod
    fun openUsageStatsSettings(promise: Promise) {
        val currentActivity = currentActivity
        if (currentActivity == null) {
            promise.reject("E_NO_ACTIVITY", "No hay una actividad activa para abrir Ajustes de Acceso de Uso")
            return
        }

        try {
            val intent = Intent(Settings.ACTION_USAGE_ACCESS_SETTINGS).apply {
                data = Uri.parse("package:${reactContext.packageName}")
            }
            pendingUsageStatsPromise?.resolve(hasUsageStatsPermission())
            pendingUsageStatsPromise = promise
            currentActivity.startActivityForResult(intent, REQUEST_USAGE_STATS_SETTINGS)
        } catch (e: Exception) {
            try {
                val fallbackIntent = Intent(Settings.ACTION_USAGE_ACCESS_SETTINGS)
                pendingUsageStatsPromise = promise
                currentActivity.startActivityForResult(fallbackIntent, REQUEST_USAGE_STATS_SETTINGS)
            } catch (fallbackEx: Exception) {
                pendingUsageStatsPromise = null
                promise.reject(
                    "E_USAGE_STATS_SETTINGS",
                    "No se pudieron abrir los Ajustes de Acceso de Uso: ${fallbackEx.message}",
                    fallbackEx
                )
            }
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
            val jsonDomains = org.json.JSONArray()
            for (i in 0 until domainsArray.size()) {
                val d = domainsArray.getString(i)
                if (!d.isNullOrBlank()) {
                    val clean = d.lowercase().trim()
                    domainList.add(clean)
                    jsonDomains.put(clean)
                }
            }
            filterEngine.updateBlocklist(version, domainList)

            val prefs = reactContext.getSharedPreferences("ba_protege_settings_prefs", Context.MODE_PRIVATE)
            prefs.edit().putString("key_blocked_domains_custom", jsonDomains.toString()).apply()
            ProtectionAccessibilityService.reloadRules(reactContext)

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
     * Actualiza la lista de aplicaciones bloqueadas en SharedPreferences y recarga el servicio de accesibilidad.
     */
    @ReactMethod
    fun updateBlockedApps(appsArray: ReadableArray, promise: Promise) {
        try {
            val jsonArray = org.json.JSONArray()
            for (i in 0 until appsArray.size()) {
                if (appsArray.getType(i) == ReadableType.Map) {
                    val map = appsArray.getMap(i) ?: continue
                    val obj = org.json.JSONObject().apply {
                        put("appName", map.getString("appName") ?: "")
                        put("packageName", map.getString("packageName") ?: "")
                        if (map.hasKey("dailyLimitMinutes") && !map.isNull("dailyLimitMinutes")) {
                            put("dailyLimitMinutes", map.getInt("dailyLimitMinutes"))
                        }
                        if (map.hasKey("webDomains") && !map.isNull("webDomains")) {
                            val wArr = map.getArray("webDomains")
                            val wJson = org.json.JSONArray()
                            if (wArr != null) {
                                for (j in 0 until wArr.size()) {
                                    val w = wArr.getString(j)
                                    if (!w.isNullOrBlank()) wJson.put(w.lowercase().trim())
                                }
                            }
                            put("webDomains", wJson)
                        }
                    }
                    jsonArray.put(obj)
                } else if (appsArray.getType(i) == ReadableType.String) {
                    val s = appsArray.getString(i)
                    if (!s.isNullOrBlank()) {
                        jsonArray.put(s)
                    }
                }
            }

            val prefs = reactContext.getSharedPreferences("ba_protege_settings_prefs", Context.MODE_PRIVATE)
            prefs.edit().putString("key_blocked_apps_json", jsonArray.toString()).apply()

            ProtectionAccessibilityService.reloadRules(reactContext)

            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("E_UPDATE_APPS", "Error actualizando apps bloqueadas: ${e.message}", e)
        }
    }

    /**
     * Sincroniza atómicamente dominios bloqueados y apps bloqueadas con los servicios nativos de Android,
     * diferenciando dominios personalizados del usuario de los dominios oficiales de LOTBA.
     */
    @ReactMethod
    fun syncProtectionRules(
        domainsArray: ReadableArray,
        appsArray: ReadableArray,
        lotbaDomainsArray: ReadableArray?,
        promise: Promise
    ) {
        try {
            // 1. Guardar dominios personalizados
            val customDomainList = mutableListOf<String>()
            val jsonCustomDomains = org.json.JSONArray()
            for (i in 0 until domainsArray.size()) {
                val d = domainsArray.getString(i)
                if (!d.isNullOrBlank()) {
                    val clean = d.lowercase().trim()
                    customDomainList.add(clean)
                    jsonCustomDomains.put(clean)
                }
            }

            // 2. Guardar dominios oficiales LOTBA
            val lotbaDomainList = mutableListOf<String>()
            val jsonLotbaDomains = org.json.JSONArray()
            if (lotbaDomainsArray != null) {
                for (i in 0 until lotbaDomainsArray.size()) {
                    val d = lotbaDomainsArray.getString(i)
                    if (!d.isNullOrBlank()) {
                        val clean = d.lowercase().trim()
                        lotbaDomainList.add(clean)
                        jsonLotbaDomains.put(clean)
                    }
                }
            }

            // Actualizar LotbaFilterEngine con el consolidado total para VPN/DNS
            val allDomains = (customDomainList + lotbaDomainList).distinct()
            filterEngine.updateBlocklist(filterEngine.getBlocklistVersion() + 1, allDomains)

            val prefs = reactContext.getSharedPreferences("ba_protege_settings_prefs", Context.MODE_PRIVATE)
            prefs.edit()
                .putString("key_blocked_domains_custom", jsonCustomDomains.toString())
                .putString("key_blocked_domains_lotba", jsonLotbaDomains.toString())
                .apply()

            // 3. Actualizar aplicaciones con límites de tiempo y mapeo web
            val jsonApps = org.json.JSONArray()
            for (i in 0 until appsArray.size()) {
                if (appsArray.getType(i) == ReadableType.Map) {
                    val map = appsArray.getMap(i) ?: continue
                    val obj = org.json.JSONObject().apply {
                        put("appName", map.getString("appName") ?: "")
                        put("packageName", map.getString("packageName") ?: "")
                        if (map.hasKey("dailyLimitMinutes") && !map.isNull("dailyLimitMinutes")) {
                            put("dailyLimitMinutes", map.getInt("dailyLimitMinutes"))
                        }
                        if (map.hasKey("webDomains") && !map.isNull("webDomains")) {
                            val wArr = map.getArray("webDomains")
                            val wJson = org.json.JSONArray()
                            if (wArr != null) {
                                for (j in 0 until wArr.size()) {
                                    val w = wArr.getString(j)
                                    if (!w.isNullOrBlank()) wJson.put(w.lowercase().trim())
                                }
                            }
                            put("webDomains", wJson)
                        }
                    }
                    jsonApps.put(obj)
                } else if (appsArray.getType(i) == ReadableType.String) {
                    val s = appsArray.getString(i)
                    if (!s.isNullOrBlank()) {
                        jsonApps.put(s)
                    }
                }
            }
            prefs.edit().putString("key_blocked_apps_json", jsonApps.toString()).apply()

            // 4. Recargar reglas en el servicio de accesibilidad
            ProtectionAccessibilityService.reloadRules(reactContext)

            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("E_SYNC_RULES", "Error sincronizando reglas: ${e.message}", e)
        }
    }

    /**
     * Establece el perfil de usuario actual ("PARENT", "ADULT" o "CHILD")
     * para que la pantalla completa de bloqueo (BlockedScreenActivity) y los servicios
     * nativos utilicen la mascota (Boti/Botito) y los mensajes empáticos correspondientes.
     */
    @ReactMethod
    fun setUserMode(userMode: String, promise: Promise) {
        try {
            val cleanMode = userMode.uppercase().trim()
            val prefs = reactContext.getSharedPreferences("ba_protege_settings_prefs", Context.MODE_PRIVATE)
            prefs.edit().putString("key_user_mode", cleanMode).apply()
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("E_SET_USER_MODE", "Error guardando modo de usuario: ${e.message}", e)
        }
    }

    /**
     * Obtiene los eventos recientes de bloqueo capturados nativamente por el servicio de accesibilidad.
     */
    @ReactMethod
    fun getRecentBlockEvents(promise: Promise) {
        try {
            val prefs = reactContext.getSharedPreferences("ba_protege_settings_prefs", Context.MODE_PRIVATE)
            val jsonStr = prefs.getString("key_recent_block_events", "[]") ?: "[]"
            val array = org.json.JSONArray(jsonStr)
            val result = Arguments.createArray()
            for (i in 0 until array.length()) {
                val obj = array.getJSONObject(i)
                val map = Arguments.createMap().apply {
                    putString("type", obj.optString("type"))
                    putString("target", obj.optString("target"))
                    putDouble("timestamp", obj.optLong("timestamp").toDouble())
                }
                result.pushMap(map)
            }
            // Limpiar eventos leídos
            prefs.edit().putString("key_recent_block_events", "[]").apply()
            promise.resolve(result)
        } catch (e: Exception) {
            promise.resolve(Arguments.createArray())
        }
    }

    /**
     * Calcula el tiempo real de uso de hoy (en minutos) para cada aplicación de la lista
     * proporcionada (o las reglas actualmente sincronizadas), utilizando UsageStatsManager
     * y el contador local acumulado del servicio de accesibilidad.
     */
    @ReactMethod
    fun getBlockedAppsUsageToday(appsArray: ReadableArray?, promise: Promise) {
        try {
            val rulesToCheck = mutableListOf<BlockedAppRule>()
            if (appsArray != null && appsArray.size() > 0) {
                for (i in 0 until appsArray.size()) {
                    if (appsArray.getType(i) == ReadableType.Map) {
                        val map = appsArray.getMap(i) ?: continue
                        val appName = map.getString("appName") ?: ""
                        val packageName = map.getString("packageName") ?: ""
                        val limit = if (map.hasKey("dailyLimitMinutes") && !map.isNull("dailyLimitMinutes")) {
                            map.getInt("dailyLimitMinutes")
                        } else {
                            null
                        }
                        val webDomains = mutableSetOf<String>()
                        if (map.hasKey("webDomains") && !map.isNull("webDomains")) {
                            val wArr = map.getArray("webDomains")
                            if (wArr != null) {
                                for (j in 0 until wArr.size()) {
                                    val dom = wArr.getString(j)
                                    if (!dom.isNullOrBlank()) webDomains.add(dom.lowercase().trim())
                                }
                            }
                        }
                        rulesToCheck.add(
                            BlockedAppRule(
                                appName = appName,
                                packageName = packageName,
                                dailyLimitMinutes = limit,
                                webDomains = webDomains
                            )
                        )
                    }
                }
            }

            val result = Arguments.createArray()
            for (rule in rulesToCheck) {
                val usedMinutes = ProtectionAccessibilityService.getTodayUsageMinutes(reactContext, rule).toInt()
                val limit = rule.dailyLimitMinutes
                val isBlocked = limit == null || limit <= 0 || usedMinutes >= limit
                val remaining = if (limit != null && limit > 0) maxOf(0, limit - usedMinutes) else 0

                val itemMap = Arguments.createMap().apply {
                    putString("appName", rule.appName)
                    putString("packageName", rule.packageName)
                    putInt("usedMinutes", usedMinutes)
                    if (limit != null) {
                        putInt("dailyLimitMinutes", limit)
                    } else {
                        putNull("dailyLimitMinutes")
                    }
                    putInt("remainingMinutes", remaining)
                    putBoolean("isBlocked", isBlocked)
                }
                result.pushMap(itemMap)
            }

            promise.resolve(result)
        } catch (e: Exception) {
            Log.w(MODULE_NAME, "Error consultando uso de apps bloqueadas: ${e.message}")
            promise.resolve(Arguments.createArray())
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
            val promise = pendingVpnPromise
            pendingVpnPromise = null
            if (promise == null) return

            val isReallyPrepared = try {
                VpnService.prepare(reactContext) == null
            } catch (e: Exception) {
                false
            }

            if (resultCode == Activity.RESULT_OK && isReallyPrepared) {
                promise.resolve(true)
            } else {
                promise.reject(
                    "E_VPN_PERMISSION_DENIED",
                    "El usuario rechazó el permiso de VPN o no se confirmó en la configuración del dispositivo"
                )
            }
        } else if (requestCode == REQUEST_ACCESSIBILITY_SETTINGS) {
            val promise = pendingAccessibilityPromise
            pendingAccessibilityPromise = null
            if (promise == null) return

            val enabled = try {
                ProtectionAccessibilityService.isEnabled(reactContext)
            } catch (e: Exception) {
                false
            }
            promise.resolve(enabled)
        } else if (requestCode == REQUEST_NOTIFICATION_SETTINGS) {
            val promise = pendingNotificationPromise
            pendingNotificationPromise = null
            if (promise == null) return

            promise.resolve(areNotificationsReallyEnabled())
        } else if (requestCode == REQUEST_BATTERY_OPTIMIZATION) {
            val promise = pendingBatteryPromise
            pendingBatteryPromise = null
            if (promise == null) return

            promise.resolve(isBatteryOptimizationIgnored())
        } else if (requestCode == REQUEST_LOCATION_SETTINGS) {
            val promise = pendingLocationPromise
            pendingLocationPromise = null
            if (promise == null) return

            promise.resolve(hasLocationPermission())
        } else if (requestCode == REQUEST_USAGE_STATS_SETTINGS) {
            val promise = pendingUsageStatsPromise
            pendingUsageStatsPromise = null
            if (promise == null) return

            promise.resolve(hasUsageStatsPermission())
        }
    }

    override fun onNewIntent(intent: Intent?) {
        // No-op
    }
}
