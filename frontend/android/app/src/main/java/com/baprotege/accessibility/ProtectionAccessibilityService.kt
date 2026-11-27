/**
 * ==============================================================================
 * Proyecto: BA Protege+
 * Componente: Android Native Core (Servicio de Accesibilidad)
 * Archivo: ProtectionAccessibilityService.kt
 * Descripción: Implementación de AccessibilityService para:
 *              1. Bloqueo de aplicaciones restringidas (ej. WhatsApp).
 *              2. Bloqueo de sitios web en navegadores (Chrome, Edge, Firefox, etc.)
 *                 según la lista LOTBA y reglas personalizadas.
 *              3. Protección antidesinstalación y cierre forzado de BA Protege+.
 * ==============================================================================
 */

package com.baprotege.accessibility

import android.accessibilityservice.AccessibilityService
import android.accessibilityservice.AccessibilityServiceInfo
import android.app.usage.UsageStatsManager
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
import com.baprotege.vpn.LotbaFilterEngine
import org.json.JSONArray
import org.json.JSONObject
import java.text.SimpleDateFormat
import java.util.Calendar
import java.util.Date
import java.util.Locale
import java.util.concurrent.ConcurrentHashMap
import java.util.concurrent.CopyOnWriteArrayList
import java.util.concurrent.atomic.AtomicBoolean

data class BlockedAppRule(
    val appName: String,
    val packageName: String,
    val dailyLimitMinutes: Int? = null,
    val webDomains: Set<String> = emptySet()
)

data class BlockedDomainMatch(
    val domain: String,
    val appDisplayName: String,
    val isLotba: Boolean
)

class ProtectionAccessibilityService : AccessibilityService() {

    companion object {
        private const val TAG = "ProtectionA11yService"
        private const val PREFS_NAME = "ba_protege_settings_prefs"
        private const val KEY_ANTI_UNINSTALL = "anti_uninstall_enabled"
        private const val KEY_BLOCKED_APPS = "key_blocked_apps_json"
        private const val KEY_BLOCKED_DOMAINS = "key_blocked_domains_custom"
        private const val KEY_LOTBA_DOMAINS = "key_blocked_domains_lotba"
        private const val KEY_RECENT_BLOCK_EVENTS = "key_recent_block_events"
        private const val KEY_RECENT_SECURITY_EVENTS = "key_recent_security_events"
        private const val KEY_USER_MODE = "key_user_mode"

        private val isRunning = AtomicBoolean(false)
        private val blockedAppPackages = ConcurrentHashMap.newKeySet<String>()
        private val blockedAppNames = ConcurrentHashMap.newKeySet<String>()
        private val appPackageToNameMap = ConcurrentHashMap<String, String>()
        private val customBlockedDomains = ConcurrentHashMap.newKeySet<String>()
        private val lotbaBlockedDomains = ConcurrentHashMap.newKeySet<String>()
        private val blockedAppRules = CopyOnWriteArrayList<BlockedAppRule>()

        private val APP_DEFAULT_DOMAINS = mapOf(
            "youtube" to listOf("youtube.com", "m.youtube.com", "youtu.be", "music.youtube.com", "kids.youtube.com"),
            "whatsapp" to listOf("whatsapp.com", "web.whatsapp.com"),
            "tiktok" to listOf("tiktok.com", "m.tiktok.com"),
            "instagram" to listOf("instagram.com"),
            "facebook" to listOf("facebook.com", "m.facebook.com", "fb.com", "messenger.com"),
            "twitter" to listOf("twitter.com", "x.com", "mobile.twitter.com"),
            "x" to listOf("x.com", "twitter.com"),
            "twitch" to listOf("twitch.tv", "m.twitch.tv"),
            "netflix" to listOf("netflix.com"),
            "spotify" to listOf("spotify.com", "open.spotify.com"),
            "reddit" to listOf("reddit.com", "m.reddit.com"),
            "discord" to listOf("discord.com", "discord.gg"),
            "telegram" to listOf("telegram.org", "web.telegram.org", "t.me"),
            "roblox" to listOf("roblox.com"),
            "pinterest" to listOf("pinterest.com"),
            "snapchat" to listOf("snapchat.com"),
            "bet365" to listOf("bet365.bet.ar", "bet365.com"),
            "betsson" to listOf("betsson.bet.ar", "betsson.com"),
            "1xbet" to listOf("1xbet.com"),
            "codere" to listOf("codere.bet.ar", "codere.com"),
            "jugadon" to listOf("jugadon.bet.ar"),
            "bplay" to listOf("bplay.bet.ar"),
            "casinobuenosaires" to listOf("casinobuenosairesonline.bet.ar")
        )

        private val APP_KNOWN_PACKAGES = mapOf(
            "youtube" to listOf("com.google.android.youtube", "com.google.android.apps.youtube.music", "com.google.android.apps.youtube.kids"),
            "whatsapp" to listOf("com.whatsapp", "com.whatsapp.w4b"),
            "tiktok" to listOf("com.zhiliaoapp.musically", "com.ss.android.ugc.trill"),
            "instagram" to listOf("com.instagram.android"),
            "facebook" to listOf("com.facebook.katana", "com.facebook.lite", "com.facebook.orca"),
            "twitter" to listOf("com.twitter.android"),
            "x" to listOf("com.twitter.android"),
            "twitch" to listOf("tv.twitch.android.app"),
            "netflix" to listOf("com.netflix.mediaclient"),
            "spotify" to listOf("com.spotify.music"),
            "reddit" to listOf("com.reddit.frontpage"),
            "discord" to listOf("com.discord"),
            "telegram" to listOf("org.telegram.messenger", "org.telegram.messenger.web"),
            "roblox" to listOf("com.roblox.client"),
            "pinterest" to listOf("com.pinterest"),
            "snapchat" to listOf("com.snapchat.android"),
            "bet365" to listOf("com.bet365wrapper.bet365_application", "com.bet365.bet365gamesapp.play", "com.bet365.authenticator", "com.bet365"),
            "betsson" to listOf("com.betsson.android", "net.pronosticosbetsson.twa", "com.betsson"),
            "1xbet" to listOf("org.xbet", "com.xbet"),
            "codere" to listOf("ar.codere.club", "spain.codere.apuestas", "com.codere"),
            "jugadon" to listOf("ar.bet.jugadon"),
            "bplay" to listOf("com.bplayliga.app", "ar.bet.bplay"),
            "casinobuenosaires" to listOf("ar.bet.casinobuenosaires")
        )

        private val APP_DISPLAY_NAMES = mapOf(
            "youtube" to "YouTube",
            "whatsapp" to "WhatsApp",
            "tiktok" to "TikTok",
            "instagram" to "Instagram",
            "facebook" to "Facebook",
            "twitter" to "X (Twitter)",
            "x" to "X (Twitter)",
            "twitch" to "Twitch",
            "netflix" to "Netflix",
            "spotify" to "Spotify",
            "reddit" to "Reddit",
            "discord" to "Discord",
            "telegram" to "Telegram",
            "roblox" to "Roblox",
            "pinterest" to "Pinterest",
            "snapchat" to "Snapchat",
            "bet365" to "Bet365",
            "betsson" to "Betsson",
            "1xbet" to "1xBet",
            "codere" to "Codere",
            "jugadon" to "Jugadon",
            "bplay" to "bplay",
            "casinobuenosaires" to "Casino Buenos Aires"
        )

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
         * Recarga tanto las aplicaciones bloqueadas como los dominios personalizados desde SharedPreferences.
         */
        fun reloadRules(context: Context) {
            reloadBlockedApps(context)
            reloadBlockedDomains(context)
        }

        fun reloadBlockedApps(context: Context) {
            val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
            val jsonStr = prefs.getString(KEY_BLOCKED_APPS, null)
            blockedAppPackages.clear()
            blockedAppNames.clear()
            appPackageToNameMap.clear()
            blockedAppRules.clear()

            if (!jsonStr.isNullOrBlank()) {
                try {
                    val array = JSONArray(jsonStr)
                    for (i in 0 until array.length()) {
                        val item = array.get(i)
                        if (item is JSONObject) {
                            val pkg = item.optString("packageName").lowercase().trim()
                            val name = item.optString("appName").trim()
                            val limit = if (item.has("dailyLimitMinutes") && !item.isNull("dailyLimitMinutes")) {
                                item.getInt("dailyLimitMinutes")
                            } else null

                            val domainsSet = mutableSetOf<String>()
                            if (item.has("webDomains")) {
                                val wArr = item.optJSONArray("webDomains")
                                if (wArr != null) {
                                    for (j in 0 until wArr.length()) {
                                        val d = wArr.optString(j).lowercase().trim()
                                        if (d.isNotEmpty()) domainsSet.add(d)
                                    }
                                }
                            }

                            // Si no vinieron dominios en el JSON, resolver de APP_DEFAULT_DOMAINS
                            if (domainsSet.isEmpty()) {
                                val searchKey = (name.ifEmpty { pkg }).lowercase()
                                for ((key, doms) in APP_DEFAULT_DOMAINS) {
                                    if (searchKey.contains(key) || pkg.contains(key)) {
                                        domainsSet.addAll(doms)
                                    }
                                }
                                if (searchKey.contains(".") && !searchKey.contains(" ")) {
                                    domainsSet.add(searchKey)
                                }
                            }

                            if (pkg.isNotEmpty()) {
                                blockedAppPackages.add(pkg)
                                if (name.isNotEmpty()) {
                                    appPackageToNameMap[pkg] = name
                                }
                            }
                            if (name.isNotEmpty()) {
                                blockedAppNames.add(name.lowercase())
                            }

                            val resolvedName = name.ifEmpty {
                                if (pkg.isNotEmpty()) pkg else "Aplicación"
                            }
                            blockedAppRules.add(
                                BlockedAppRule(
                                    appName = resolvedName,
                                    packageName = pkg,
                                    dailyLimitMinutes = limit,
                                    webDomains = domainsSet
                                )
                            )
                        } else if (item is String) {
                            val str = item.lowercase().trim()
                            if (str.contains(".")) {
                                blockedAppPackages.add(str)
                            } else {
                                blockedAppNames.add(str)
                            }
                            val domainsSet = mutableSetOf<String>()
                            for ((key, doms) in APP_DEFAULT_DOMAINS) {
                                if (str.contains(key)) {
                                    domainsSet.addAll(doms)
                                }
                            }
                            blockedAppRules.add(
                                BlockedAppRule(
                                    appName = str.replaceFirstChar { it.uppercase() },
                                    packageName = if (str.contains(".")) str else "",
                                    dailyLimitMinutes = null,
                                    webDomains = domainsSet
                                )
                            )
                        }
                    }
                } catch (e: Exception) {
                    Log.e(TAG, "Error parseando blocked_apps_json: ${e.message}")
                }
            }
            Log.i(TAG, "📱 Apps bloqueadas cargadas: ${blockedAppPackages.size} paquetes, ${blockedAppNames.size} nombres, ${blockedAppRules.size} reglas con límites")
        }

        fun getTodayUsageMinutes(context: Context, rule: BlockedAppRule): Long {
            var usageMs = 0L

            // 1. Consultar UsageStatsManager si hay permiso
            if (rule.packageName.isNotBlank()) {
                try {
                    val usm = context.getSystemService(Context.USAGE_STATS_SERVICE) as? UsageStatsManager
                    if (usm != null) {
                        val cal = Calendar.getInstance().apply {
                            set(Calendar.HOUR_OF_DAY, 0)
                            set(Calendar.MINUTE, 0)
                            set(Calendar.SECOND, 0)
                            set(Calendar.MILLISECOND, 0)
                        }
                        val startOfDay = cal.timeInMillis
                        val now = System.currentTimeMillis()
                        val stats = usm.queryUsageStats(UsageStatsManager.INTERVAL_DAILY, startOfDay, now)
                        if (!stats.isNullOrEmpty()) {
                            for (us in stats) {
                                if (us.packageName.equals(rule.packageName, ignoreCase = true)) {
                                    usageMs += us.totalTimeInForeground
                                }
                            }
                        }
                    }
                } catch (e: Exception) {
                    Log.w(TAG, "Error leyendo UsageStatsManager: ${e.message}")
                }
            }

            // 2. Consultar tiempo local acumulado en SharedPreferences
            try {
                val todayKey = SimpleDateFormat("yyyyMMdd", Locale.US).format(Date())
                val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
                val trackedAppMs = prefs.getLong("tracked_time_${todayKey}_${rule.appName.lowercase()}", 0L)
                usageMs = maxOf(usageMs, trackedAppMs)

                for (domain in rule.webDomains) {
                    val trackedWebMs = prefs.getLong("tracked_web_${todayKey}_$domain", 0L)
                    usageMs += trackedWebMs
                }
            } catch (_: Exception) {}

            return usageMs / (1000 * 60)
        }

        fun isRuleLimitExceeded(context: Context, rule: BlockedAppRule): Boolean {
            val limit = rule.dailyLimitMinutes
            // Bloqueo total (sin límite especificado o 0 minutos) -> siempre bloqueado
            if (limit == null || limit <= 0) {
                return true
            }
            val usedMinutes = getTodayUsageMinutes(context, rule)
            return usedMinutes >= limit
        }

        fun findMatchingAppRule(cleanPkg: String): BlockedAppRule? {
            // 1. Coincidencia directa por paquete
            for (rule in blockedAppRules) {
                if (rule.packageName.isNotBlank() && (cleanPkg == rule.packageName || cleanPkg.startsWith("${rule.packageName}."))) {
                    return rule
                }
            }

            // 2. Coincidencia por nombres de aplicaciones y servicios
            for (rule in blockedAppRules) {
                val name = rule.appName.lowercase()
                if (name == "whatsapp" && (cleanPkg == "com.whatsapp" || cleanPkg == "com.whatsapp.w4b")) return rule
                if (name == "tiktok" && (cleanPkg.contains("musically") || cleanPkg.contains("trill"))) return rule
                if (name == "instagram" && cleanPkg.contains("instagram")) return rule
                if (name == "facebook" && (cleanPkg.contains("katana") || cleanPkg.contains("facebook.lite") || cleanPkg.contains("orca"))) return rule
                if (name == "youtube" && (cleanPkg == "com.google.android.youtube" || cleanPkg.contains("youtube"))) return rule
                if (name.length >= 3 && cleanPkg.contains(name)) return rule
            }

            return null
        }

        fun findAppRuleForDomain(host: String): BlockedAppRule? {
            val cleanHost = host.lowercase().trim()
            for (rule in blockedAppRules) {
                for (dom in rule.webDomains) {
                    val cleanDom = dom.lowercase().trim()
                    if (cleanDom.isNotEmpty()) {
                        if (cleanHost == cleanDom || cleanHost.endsWith(".$cleanDom")) {
                            return rule
                        }
                    }
                }
            }
            return null
        }

        /**
         * Lógica de reciprocidad: Evalúa si un paquete de aplicación en ejecución corresponde
         * a un sitio web bloqueado por el usuario (en lista personalizada) o por LOTBA oficial.
         * Si el sitio web está bloqueado, la app nativa correspondiente también queda bloqueada.
         */
        fun findBlockedDomainForApp(cleanPkg: String): BlockedDomainMatch? {
            // 1. Coincidencia de la app contra aplicaciones conocidas con dominios web
            for ((key, pkgs) in APP_KNOWN_PACKAGES) {
                val matchesPackage = pkgs.any {
                    val pkgLower = it.lowercase()
                    cleanPkg == pkgLower || cleanPkg.startsWith("$pkgLower.")
                }
                val matchesKey = (key.length >= 4 && cleanPkg.contains(key))
                if (matchesPackage || matchesKey) {
                    val defaultDomains = APP_DEFAULT_DOMAINS[key] ?: emptyList()
                    val displayName = APP_DISPLAY_NAMES[key] ?: key.replaceFirstChar { it.uppercase() }

                    // A. Verificar si algún dominio web de la app está en la lista personalizada del usuario
                    for (dom in defaultDomains) {
                        if (isCustomDomainBlocked(dom)) {
                            return BlockedDomainMatch(dom, displayName, isLotba = false)
                        }
                    }

                    // B. Verificar si algún dominio web de la app está en la lista oficial de LOTBA
                    for (dom in defaultDomains) {
                        if (isLotbaDomainBlocked(dom)) {
                            return BlockedDomainMatch(dom, displayName, isLotba = true)
                        }
                    }
                }
            }

            // 2. Coincidencia directa o por raíz de dominio con lista personalizada del usuario
            for (blocked in customBlockedDomains) {
                val cleanBlocked = blocked.lowercase().trim().removePrefix("www.")
                if (cleanBlocked.isEmpty()) continue

                // Paquete idéntico al dominio bloqueado (ej. dominio com.ejemplo.app)
                if (cleanPkg == cleanBlocked || cleanPkg.startsWith("$cleanBlocked.")) {
                    val displayName = appPackageToNameMap[cleanPkg] ?: cleanBlocked
                    return BlockedDomainMatch(cleanBlocked, displayName, isLotba = false)
                }

                // Raíz del dominio contenida en el paquete (ej. "facebook" en "com.facebook.katana")
                val rootName = cleanBlocked.substringBeforeLast('.').substringAfterLast('.')
                if (rootName.length >= 4 && cleanPkg.contains(rootName)) {
                    val displayName = appPackageToNameMap[cleanPkg] ?: rootName.replaceFirstChar { it.uppercase() }
                    return BlockedDomainMatch(cleanBlocked, displayName, isLotba = false)
                }
            }

            // 3. Coincidencia con lista oficial LOTBA
            for (lotbaDom in lotbaBlockedDomains) {
                val cleanLotba = lotbaDom.lowercase().trim().removePrefix("www.")
                if (cleanLotba.isEmpty()) continue

                val rootName = cleanLotba.substringBeforeLast('.').substringAfterLast('.')
                if (rootName.length >= 4 && cleanPkg.contains(rootName)) {
                    val displayName = appPackageToNameMap[cleanPkg] ?: rootName.replaceFirstChar { it.uppercase() }
                    return BlockedDomainMatch(cleanLotba, displayName, isLotba = true)
                }
            }

            return null
        }

        fun reloadBlockedDomains(context: Context) {
            val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)

            // 1. Cargar dominios personalizados del usuario
            val jsonCustom = prefs.getString(KEY_BLOCKED_DOMAINS, null)
            customBlockedDomains.clear()
            if (!jsonCustom.isNullOrBlank()) {
                try {
                    val array = JSONArray(jsonCustom)
                    for (i in 0 until array.length()) {
                        val d = array.getString(i).lowercase().trim()
                        if (d.isNotEmpty()) {
                            customBlockedDomains.add(d)
                        }
                    }
                } catch (e: Exception) {
                    Log.e(TAG, "Error parseando blocked_domains_custom: ${e.message}")
                }
            }

            // 2. Cargar dominios oficiales LOTBA por separado
            val jsonLotba = prefs.getString(KEY_LOTBA_DOMAINS, null)
            lotbaBlockedDomains.clear()
            if (!jsonLotba.isNullOrBlank()) {
                try {
                    val array = JSONArray(jsonLotba)
                    for (i in 0 until array.length()) {
                        val d = array.getString(i).lowercase().trim()
                        if (d.isNotEmpty()) {
                            lotbaBlockedDomains.add(d)
                        }
                    }
                } catch (e: Exception) {
                    Log.e(TAG, "Error parseando blocked_domains_lotba: ${e.message}")
                }
            }

            Log.i(TAG, "🌐 Dominios cargados: ${customBlockedDomains.size} personalizados, ${lotbaBlockedDomains.size} oficiales LOTBA")
        }

        fun isCustomDomainBlocked(host: String): Boolean {
            val cleanHost = host.lowercase().trim().removeSuffix(".")
            if (cleanHost.isEmpty()) return false
            if (customBlockedDomains.contains(cleanHost)) return true
            for (blocked in customBlockedDomains) {
                if (cleanHost.endsWith(".$blocked")) return true
            }
            return false
        }

        fun isLotbaDomainBlocked(host: String): Boolean {
            val cleanHost = host.lowercase().trim().removeSuffix(".")
            if (cleanHost.isEmpty()) return false
            if (lotbaBlockedDomains.contains(cleanHost)) return true
            for (blocked in lotbaBlockedDomains) {
                if (cleanHost.endsWith(".$blocked")) return true
            }
            return false
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

    private val browserPackages = setOf(
        "com.android.chrome",
        "com.chrome.beta",
        "com.chrome.dev",
        "com.chrome.canary",
        "org.chromium.chrome",
        "com.google.android.apps.chrome",
        "com.microsoft.emmx",
        "org.mozilla.firefox",
        "org.mozilla.firefox_beta",
        "org.mozilla.fenix",
        "com.opera.browser",
        "com.opera.mini.native",
        "com.opera.gx",
        "com.sec.android.app.sbrowser",
        "com.sec.android.app.sbrowser.beta",
        "com.brave.browser",
        "com.duckduckgo.mobile.android",
        "com.android.browser",
        "com.vivo.browser",
        "com.mi.globalbrowser",
        "com.coloros.browser"
    )

    override fun onServiceConnected() {
        super.onServiceConnected()
        isRunning.set(true)
        reloadRules(this)
        Log.i(TAG, "✅ Servicio de accesibilidad BA Protege+ conectado y reglas cargadas.")
    }

    override fun onAccessibilityEvent(event: AccessibilityEvent?) {
        if (event == null) return

        val pkgName = event.packageName?.toString() ?: return

        // 1. Bloqueo de aplicaciones restringidas (ej. WhatsApp)
        if (checkAndBlockApp(pkgName, event)) {
            return
        }

        // 2. Bloqueo de sitios web en navegadores (Chrome, etc.)
        if (browserPackages.contains(pkgName.lowercase().trim())) {
            if (checkAndBlockBrowserUrl(pkgName, event)) {
                return
            }
        }

        // 3. Protección antidesinstalación
        if (isAntiUninstallEnabled(this)) {
            checkAndBlockUninstall(pkgName, event)
        }
    }

    // --------------------------------------------------------------------------
    // LÓGICA DE BLOQUEO DE APLICACIONES
    // --------------------------------------------------------------------------
    private fun checkAndBlockApp(pkgName: String, event: AccessibilityEvent): Boolean {
        val cleanPkg = pkgName.lowercase().trim()

        // Ignorar la propia app de BA Protege+, el sistema base y launchers
        if (cleanPkg == packageName || cleanPkg == "com.android.systemui" || cleanPkg.contains("launcher") || cleanPkg == "android") {
            return false
        }

        // 1. Reciprocidad: Evaluar si la aplicación corresponde a un sitio web bloqueado por el usuario o LOTBA
        val domainBlock = findBlockedDomainForApp(cleanPkg)
        if (domainBlock != null) {
            Log.w(TAG, "🛡️ Aplicación $cleanPkg (${domainBlock.appDisplayName}) bloqueada porque el sitio web ${domainBlock.domain} está bloqueado (LOTBA: ${domainBlock.isLotba})")
            blockAppAttempt(appName = domainBlock.appDisplayName, fromSite = domainBlock.domain, isLotba = domainBlock.isLotba)
            return true
        }

        // 2. Evaluar según regla de app con límites de tiempo
        val rule = findMatchingAppRule(cleanPkg)
        if (rule != null) {
            if (isRuleLimitExceeded(this, rule)) {
                blockAppAttempt(rule.appName)
                return true
            }
            return false
        }

        // 3. Fallback de coincidencia directa
        var matchedAppName: String? = null
        for (blockedPkg in blockedAppPackages) {
            if (cleanPkg == blockedPkg || cleanPkg.startsWith("$blockedPkg.")) {
                matchedAppName = appPackageToNameMap[blockedPkg] ?: blockedPkg
                break
            }
        }

        if (matchedAppName != null) {
            blockAppAttempt(matchedAppName)
            return true
        }

        return false
    }

    private fun blockAppAttempt(appName: String, fromSite: String? = null, isLotba: Boolean = false) {
        val now = System.currentTimeMillis()
        if (now - lastBlockTimestamp < 1500) {
            return
        }
        lastBlockTimestamp = now

        Log.w(TAG, "🛡️ Aplicación bloqueada por BA Protege+: $appName (fromSite: $fromSite, isLotba: $isLotba)")

        val prefs = getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        val userMode = prefs.getString(KEY_USER_MODE, "PARENT") ?: "PARENT"

        try {
            val intent = com.baprotege.BlockedScreenActivity.createIntent(
                context = applicationContext,
                type = "APP",
                targetName = appName,
                isLotba = isLotba,
                userMode = userMode,
                fromApp = null,
                fromSite = fromSite
            )
            startActivity(intent)
        } catch (e: Exception) {
            Log.e(TAG, "Error abriendo BlockedScreenActivity para app: ${e.message}")
        }

        recordBlockEvent("APP", appName, isLotba)
    }

    // --------------------------------------------------------------------------
    // LÓGICA DE BLOQUEO DE SITIOS WEB EN NAVEGADORES
    // --------------------------------------------------------------------------
    private fun checkAndBlockBrowserUrl(pkgName: String, event: AccessibilityEvent): Boolean {
        val rawUrl = findUrlInActiveWindow() ?: findUrlInEvent(event) ?: return false
        val cleanHost = extractHost(rawUrl)
        if (cleanHost.isEmpty() || !cleanHost.contains(".")) {
            return false
        }

        // 1. PRIMERO: ¿Es una URL correspondiente a una aplicación bloqueada por el usuario (ej. YouTube, WhatsApp)?
        val matchedAppRule = findAppRuleForDomain(cleanHost)
        if (matchedAppRule != null) {
            if (isRuleLimitExceeded(this, matchedAppRule)) {
                Log.w(TAG, "🛡️ Dominio $cleanHost bloqueado por restricción de app: ${matchedAppRule.appName}")
                blockSiteAttempt(cleanHost, isLotba = false, fromApp = matchedAppRule.appName)
                return true
            }
        }

        // 2. SEGUNDO: ¿Es un sitio web personalizado bloqueado por el usuario (ej. g1.globo.com)?
        if (isCustomDomainBlocked(cleanHost)) {
            Log.w(TAG, "🛡️ Dominio $cleanHost bloqueado por lista personalizada del usuario")
            blockSiteAttempt(cleanHost, isLotba = false, fromApp = null)
            return true
        }

        // 3. TERCERO: ¿Forma parte de la lista oficial de apuestas ilegales de LOTBA?
        if (isLotbaDomainBlocked(cleanHost)) {
            Log.w(TAG, "🛡️ Dominio $cleanHost bloqueado por lista oficial de LOTBA")
            blockSiteAttempt(cleanHost, isLotba = true, fromApp = null)
            return true
        }

        return false
    }

    private fun findUrlInActiveWindow(): String? {
        val root = rootInActiveWindow ?: return null
        try {
            val targetIds = listOf(
                "com.android.chrome:id/url_bar",
                "com.android.chrome:id/search_box_text",
                "org.chromium.chrome:id/url_bar",
                "com.microsoft.emmx:id/url_bar",
                "org.mozilla.firefox:id/url_bar_title",
                "org.mozilla.firefox:id/toolbar_title",
                "com.sec.android.app.sbrowser:id/location_bar_edit_text",
                "com.opera.browser:id/url_field",
                "com.brave.browser:id/url_bar"
            )
            for (id in targetIds) {
                val nodes = root.findAccessibilityNodeInfosByViewId(id)
                if (!nodes.isNullOrEmpty()) {
                    for (node in nodes) {
                        val text = node.text?.toString()
                        if (!text.isNullOrBlank()) {
                            return text
                        }
                    }
                }
            }

            return findUrlRecursively(root, 0)
        } catch (e: Exception) {
            Log.w(TAG, "Error buscando URL en ventana activa: ${e.message}")
            return null
        }
    }

    private fun findUrlRecursively(node: AccessibilityNodeInfo?, depth: Int): String? {
        if (node == null || depth > 8) return null
        val viewId = node.viewIdResourceName?.lowercase() ?: ""
        if (viewId.contains("url_bar") || viewId.contains("location_bar") || viewId.contains("search_box") || viewId.contains("address_bar")) {
            val text = node.text?.toString()
            if (!text.isNullOrBlank()) return text
        }
        val childCount = node.childCount
        for (i in 0 until childCount) {
            val child = node.getChild(i)
            val res = findUrlRecursively(child, depth + 1)
            child?.recycle()
            if (res != null) return res
        }
        return null
    }

    private fun findUrlInEvent(event: AccessibilityEvent): String? {
        val texts = event.text ?: return null
        for (cs in texts) {
            val str = cs?.toString()?.trim() ?: continue
            if (str.contains(".") && !str.contains(" ") && (str.contains("http") || str.contains(".com") || str.contains(".net") || str.contains(".org") || str.contains(".bet") || str.contains(".ar") || str.contains(".br") || str.contains(".io"))) {
                return str
            }
        }
        return null
    }

    private fun extractHost(raw: String): String {
        var s = raw.lowercase().trim()
        if (s.startsWith("http://")) s = s.substring(7)
        if (s.startsWith("https://")) s = s.substring(8)
        if (s.startsWith("www.")) s = s.substring(4)
        val slashIdx = s.indexOf('/')
        if (slashIdx != -1) s = s.substring(0, slashIdx)
        val colonIdx = s.indexOf(':')
        if (colonIdx != -1) s = s.substring(0, colonIdx)
        val qIdx = s.indexOf('?')
        if (qIdx != -1) s = s.substring(0, qIdx)
        return s.trim()
    }

    private fun isDomainBlocked(host: String): Boolean {
        val cleanHost = extractHost(host)
        if (cleanHost.isEmpty()) return false

        try {
            if (LotbaFilterEngine.getInstance(this).isDomainBlocked(cleanHost)) {
                return true
            }
        } catch (_: Exception) {}

        for (blocked in customBlockedDomains) {
            val cleanBlocked = extractHost(blocked)
            if (cleanBlocked.isNotEmpty()) {
                if (cleanHost == cleanBlocked || cleanHost.endsWith(".$cleanBlocked")) {
                    return true
                }
            }
        }

        return false
    }

    private fun cleanBrowserAddressBar(root: AccessibilityNodeInfo?) {
        if (root == null) return
        try {
            // 1. Hacer clic en el botón de borrar/limpiar texto ("X") de Chrome si está visible
            val clearIds = listOf(
                "com.android.chrome:id/clear_button",
                "com.android.chrome:id/delete_button",
                "org.chromium.chrome:id/clear_button",
                "com.microsoft.emmx:id/clear_button"
            )
            for (id in clearIds) {
                val clearNodes = root.findAccessibilityNodeInfosByViewId(id)
                if (!clearNodes.isNullOrEmpty()) {
                    for (cn in clearNodes) {
                        cn.performAction(AccessibilityNodeInfo.ACTION_CLICK)
                        cn.recycle()
                    }
                }
            }

            // 2. Limpiar el texto directamente en el campo de la barra de direcciones
            val urlIds = listOf(
                "com.android.chrome:id/url_bar",
                "com.android.chrome:id/search_box_text",
                "org.chromium.chrome:id/url_bar",
                "com.microsoft.emmx:id/url_bar"
            )
            for (id in urlIds) {
                val urlNodes = root.findAccessibilityNodeInfosByViewId(id)
                if (!urlNodes.isNullOrEmpty()) {
                    for (un in urlNodes) {
                        val args = android.os.Bundle().apply {
                            putCharSequence(
                                AccessibilityNodeInfo.ACTION_ARGUMENT_SET_TEXT_CHARSEQUENCE,
                                ""
                            )
                        }
                        un.performAction(AccessibilityNodeInfo.ACTION_SET_TEXT, args)
                        un.recycle()
                    }
                }
            }
        } catch (e: Exception) {
            Log.w(TAG, "Error limpiando barra de direcciones: ${e.message}")
        }
    }

    private fun blockSiteAttempt(domain: String, isLotba: Boolean = false, fromApp: String? = null) {
        val now = System.currentTimeMillis()
        if (now - lastBlockTimestamp < 1500) {
            return
        }
        lastBlockTimestamp = now

        Log.w(TAG, "🛡️ Sitio web bloqueado por BA Protege+: $domain (LOTBA: $isLotba, fromApp: $fromApp)")

        // 1. Limpiar la barra de direcciones en el navegador y retroceder
        cleanBrowserAddressBar(rootInActiveWindow)
        performGlobalAction(GLOBAL_ACTION_BACK)

        val prefs = getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        val userMode = prefs.getString(KEY_USER_MODE, "PARENT") ?: "PARENT"

        try {
            val intent = com.baprotege.BlockedScreenActivity.createIntent(
                context = applicationContext,
                type = "SITE",
                targetName = domain,
                isLotba = isLotba,
                userMode = userMode,
                fromApp = fromApp
            )
            startActivity(intent)
        } catch (e: Exception) {
            Log.e(TAG, "Error abriendo BlockedScreenActivity para sitio: ${e.message}")
        }

        recordBlockEvent("SITE", domain, isLotba)
    }

    private fun recordBlockEvent(type: String, target: String, isLotba: Boolean = false) {
        try {
            val prefs = getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
            val existing = prefs.getString(KEY_RECENT_BLOCK_EVENTS, "[]")
            val array = JSONArray(existing)
            val eventObj = JSONObject().apply {
                put("type", type)
                put("target", target)
                put("isLotba", isLotba)
                put("timestamp", System.currentTimeMillis())
            }
            array.put(eventObj)
            while (array.length() > 50) {
                array.remove(0)
            }
            prefs.edit().putString(KEY_RECENT_BLOCK_EVENTS, array.toString()).apply()
        } catch (e: Exception) {
            Log.w(TAG, "Error registrando evento de bloqueo: ${e.message}")
        }
    }

    // --------------------------------------------------------------------------
    // LÓGICA DE PROTECCIÓN ANTIDESINSTALACIÓN
    // --------------------------------------------------------------------------
    private fun checkAndBlockUninstall(pkgName: String, event: AccessibilityEvent) {
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

    private fun recordSecurityEvent(eventType: String, description: String) {
        try {
            val prefs = getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
            val existing = prefs.getString(KEY_RECENT_SECURITY_EVENTS, "[]")
            val array = JSONArray(existing)
            val eventObj = JSONObject().apply {
                put("eventType", eventType)
                put("description", description)
                put("timestamp", System.currentTimeMillis())
            }
            array.put(eventObj)
            while (array.length() > 50) {
                array.remove(0)
            }
            prefs.edit().putString(KEY_RECENT_SECURITY_EVENTS, array.toString()).apply()
        } catch (e: Exception) {
            Log.w(TAG, "Error registrando evento de seguridad: ${e.message}")
        }
    }

    private fun blockUninstallAttempt() {
        val now = System.currentTimeMillis()
        if (now - lastBlockTimestamp < 1500) {
            return
        }
        lastBlockTimestamp = now

        Log.w(TAG, "🛡️ Intento de desinstalación o detención de BA Protege+ bloqueado por antidesinstalación.")
        recordSecurityEvent(
            "UNINSTALL_ATTEMPT",
            "Se detectó un intento de desinstalación o detención de BA Protege+"
        )

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
