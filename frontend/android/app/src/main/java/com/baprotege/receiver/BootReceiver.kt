/**
 * ==============================================================================
 * Proyecto: BA Protege+
 * Componente: Android Native Core (Anti-Bypass & Resiliencia)
 * Archivo: BootReceiver.kt
 * Descripción: BroadcastReceiver para reiniciar automáticamente el servicio de protección
 *              tras el arranque del sistema operativo (BOOT_COMPLETED) o actualización de app.
 * ==============================================================================
 */

package com.baprotege.receiver

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.os.Build
import android.util.Log
import com.baprotege.vpn.ProtectionVpnService

class BootReceiver : BroadcastReceiver() {

    companion object {
        private const val TAG = "BootReceiver"
        private const val PREFS_NAME = "ba_protege_settings_prefs"
        private const val KEY_PROTECTION_ENABLED = "protection_should_be_enabled"
    }

    override fun onReceive(context: Context, intent: Intent) {
        val action = intent.action
        Log.i(TAG, "Evento del sistema recibido: $action")

        if (Intent.ACTION_BOOT_COMPLETED == action ||
            Intent.ACTION_MY_PACKAGE_REPLACED == action ||
            "android.intent.action.QUICKBOOT_POWERON" == action
        ) {
            val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
            val shouldBeActive = prefs.getBoolean(KEY_PROTECTION_ENABLED, true)

            if (shouldBeActive) {
                Log.i(TAG, "🔄 Reiniciando servicio de protección tras arranque del sistema...")
                val vpnIntent = Intent(context, ProtectionVpnService::class.java).apply {
                    this.action = ProtectionVpnService.ACTION_START
                }

                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                    context.startForegroundService(vpnIntent)
                } else {
                    context.startService(vpnIntent)
                }
            }
        }
    }
}
