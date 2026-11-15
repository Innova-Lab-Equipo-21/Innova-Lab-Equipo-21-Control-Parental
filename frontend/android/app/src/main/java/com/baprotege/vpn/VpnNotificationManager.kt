/**
 * ==============================================================================
 * Proyecto: BA Protege+
 * Componente: Android Native Core
 * Archivo: VpnNotificationManager.kt
 * Descripción: Gestor de notificaciones en primer plano para el servicio VPN.
 * ==============================================================================
 */

package com.baprotege.vpn

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.os.Build
import com.baprotege.MainActivity

class VpnNotificationManager(private val context: Context) {

    companion object {
        const val NOTIFICATION_ID = 1001
        const val CHANNEL_ID = "ba_protege_vpn_channel"
        const val CHANNEL_NAME = "Protección Parental Activa"
        const val ALERTS_CHANNEL_ID = "ba_protege_alerts_channel"
        const val ALERTS_CHANNEL_NAME = "Alertas de Supervisión"
    }

    private val notificationManager =
        context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager

    init {
        ensureChannelsCreated()
    }

    fun ensureChannelsCreated() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val protectionChannel = NotificationChannel(
                CHANNEL_ID,
                CHANNEL_NAME,
                NotificationManager.IMPORTANCE_LOW
            ).apply {
                description = "Notificación persistente que indica el estado activo de BA Protege+"
                setShowBadge(false)
            }
            val alertsChannel = NotificationChannel(
                ALERTS_CHANNEL_ID,
                ALERTS_CHANNEL_NAME,
                NotificationManager.IMPORTANCE_HIGH
            ).apply {
                description = "Alertas inmediatas de bloqueos, límites y supervisión parental"
            }
            notificationManager.createNotificationChannel(protectionChannel)
            notificationManager.createNotificationChannel(alertsChannel)
        }
    }

    /**
     * Construye la notificación persistente requerida para Foreground Service de Android.
     */
    fun buildProtectionNotification(isProtected: Boolean, domainCount: Int = 0): Notification {
        val launchIntent = Intent(context, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_SINGLE_TOP or Intent.FLAG_ACTIVITY_CLEAR_TOP
        }

        val pendingIntent = PendingIntent.getActivity(
            context,
            0,
            launchIntent,
            PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT
        )

        val title = if (isProtected) "🛡️ BA Protege+ Activo" else "⚠️ Protección Pausada"
        val text = if (isProtected) {
            "Navegación segura y protección activa"
        } else {
            "El servicio de protección no está activo"
        }

        val builder = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            Notification.Builder(context, CHANNEL_ID)
        } else {
            @Suppress("DEPRECATION")
            Notification.Builder(context)
        }

        return builder
            .setContentTitle(title)
            .setContentText(text)
            .setSmallIcon(android.R.drawable.ic_lock_lock)
            .setContentIntent(pendingIntent)
            .setOngoing(true)
            .setAutoCancel(false)
            .build()
    }
}
