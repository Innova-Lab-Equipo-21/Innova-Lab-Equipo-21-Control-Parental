/**
 * ==============================================================================
 * Proyecto: BA Protege+
 * Componente: Android Native Core (Motor de Protección)
 * Archivo: LotbaFilterEngine.kt
 * Descripción: Motor de filtrado y coincidencia de dominios para la lista oficial
 *              de LOTBA y reglas personalizadas con soporte de almacenamiento local offline.
 * ==============================================================================
 */

package com.baprotege.vpn

import android.content.Context
import android.content.SharedPreferences
import org.json.JSONArray
import org.json.JSONObject
import java.util.concurrent.ConcurrentHashMap

class LotbaFilterEngine private constructor(context: Context) {

    private val prefs: SharedPreferences = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
    
    // Conjunto en memoria para búsqueda O(1) de dominios bloqueados
    private val blockedDomains = ConcurrentHashMap.newKeySet<String>()

    private var currentVersion: Int = 1

    init {
        loadCachedBlocklist()
    }

    companion object {
        private const val PREFS_NAME = "ba_protege_blocklist_prefs"
        private const val KEY_DOMAINS_JSON = "key_blocked_domains_json"
        private const val KEY_VERSION = "key_blocklist_version"

        @Volatile
        private var INSTANCE: LotbaFilterEngine? = null

        fun getInstance(context: Context): LotbaFilterEngine {
            return INSTANCE ?: synchronized(this) {
                INSTANCE ?: LotbaFilterEngine(context.applicationContext).also { INSTANCE = it }
            }
        }
    }

    /**
     * Carga la lista de dominios almacenada en la memoria local (SharedPreferences)
     * para garantizar funcionamiento ininterrumpido en modo Offline.
     */
    private fun loadCachedBlocklist() {
        currentVersion = prefs.getInt(KEY_VERSION, 1)
        val rawJson = prefs.getString(KEY_DOMAINS_JSON, null)

        blockedDomains.clear()
        if (rawJson != null) {
            try {
                val jsonArray = JSONArray(rawJson)
                for (i in 0 until jsonArray.length()) {
                    blockedDomains.add(jsonArray.getString(i).lowercase().trim())
                }
            } catch (e: Exception) {
                e.printStackTrace()
                seedDefaultLotbaDomains()
            }
        } else {
            seedDefaultLotbaDomains()
        }
    }

    /**
     * Carga un conjunto inicial de dominios de prueba de LOTBA si no hay datos en caché.
     */
    private fun seedDefaultLotbaDomains() {
        val initialDomains = listOf(
            "apuestas-online-ilegal.bet",
            "casino-sin-licencia.com",
            "juegos-azar-clandestino.net",
            "slot-virtual-no-autorizado.xyz"
        )
        blockedDomains.addAll(initialDomains)
        saveToCache(1, initialDomains)
    }

    /**
     * Actualiza y persiste la lista de dominios bloqueados sincronizada desde el backend.
     */
    @Synchronized
    fun updateBlocklist(version: Int, domains: List<String>) {
        this.currentVersion = version
        this.blockedDomains.clear()
        val normalized = domains.map { it.lowercase().trim() }
        this.blockedDomains.addAll(normalized)
        saveToCache(version, normalized)
    }

    /**
     * Guarda la lista de dominios en almacenamiento persistente local.
     */
    private fun saveToCache(version: Int, domains: List<String>) {
        val jsonArray = JSONArray()
        for (domain in domains) {
            jsonArray.put(domain)
        }
        prefs.edit()
            .putInt(KEY_VERSION, version)
            .putString(KEY_DOMAINS_JSON, jsonArray.toString())
            .apply()
    }

    /**
     * Evalúa si un nombre de host o dominio solicitado debe ser bloqueado.
     * Soporta coincidencia exacta y verificación de subdominios (ej. "m.apuestas.bet").
     */
    fun isDomainBlocked(host: String): Boolean {
        val cleanHost = host.lowercase().trim().removeSuffix(".")
        
        // Coincidencia exacta
        if (blockedDomains.contains(cleanHost)) {
            return true
        }

        // Coincidencia con subdominios
        for (blocked in blockedDomains) {
            if (cleanHost.endsWith(".$blocked")) {
                return true
            }
        }

        return false
    }

    fun getBlocklistVersion(): Int = currentVersion

    fun getBlockedDomainsCount(): Int = blockedDomains.size
}
