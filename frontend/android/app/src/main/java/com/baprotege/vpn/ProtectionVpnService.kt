/**
 * ==============================================================================
 * Proyecto: BA Protege+
 * Componente: Android Native Core (Motor de Protección VPN)
 * Archivo: ProtectionVpnService.kt
 * Descripción: Implementación de VpnService local de Android para interceptar tráfico de red,
 *              bloquear dominios LOTBA/personalizados y reportar telemetría de estado.
 * ==============================================================================
 */

package com.baprotege.vpn

import android.content.Context
import android.content.Intent
import android.net.VpnService
import android.os.ParcelFileDescriptor
import android.util.Log
import java.io.FileInputStream
import java.io.FileOutputStream
import java.nio.ByteBuffer
import java.util.concurrent.atomic.AtomicBoolean

class ProtectionVpnService : VpnService(), Runnable {

    companion object {
        private const val TAG = "ProtectionVpnService"
        const val ACTION_START = "com.baprotege.vpn.START"
        const val ACTION_STOP = "com.baprotege.vpn.STOP"
        const val ACTION_STATUS_CHANGED = "com.baprotege.vpn.STATUS_CHANGED"
        const val EXTRA_IS_RUNNING = "is_running"

        private val isRunning = AtomicBoolean(false)

        fun isProtectionActive(): Boolean = isRunning.get()
    }

    private var vpnInterface: ParcelFileDescriptor? = null
    private var vpnThread: Thread? = null
    private lateinit var notificationManager: VpnNotificationManager
    private lateinit var filterEngine: LotbaFilterEngine

    override fun onCreate() {
        super.onCreate()
        notificationManager = VpnNotificationManager(this)
        filterEngine = LotbaFilterEngine.getInstance(this)
        Log.d(TAG, "ProtectionVpnService inicializado.")
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        val action = intent?.action ?: ACTION_START

        when (action) {
            ACTION_START -> startProtection()
            ACTION_STOP -> stopProtection()
        }

        return START_STICKY
    }

    private fun startProtection() {
        if (isRunning.get()) {
            Log.d(TAG, "El servicio de protección ya se encuentra en ejecución.")
            return
        }

        try {
            // Configurar notificación en primer plano (Foreground Service)
            val notification = notificationManager.buildProtectionNotification(
                isProtected = true,
                domainCount = filterEngine.getBlockedDomainsCount()
            )
            startForeground(VpnNotificationManager.NOTIFICATION_ID, notification)

            // Construir la interfaz de túnel VPN local
            val builder = Builder().apply {
                setSession("BA Protege+ Local Filter")
                // Dirección IP virtual local
                addAddress("10.0.0.2", 32)
                // Servidores DNS seguros
                addDnsServer("1.1.1.1")
                addDnsServer("8.8.8.8")
                // Enrutamiento de paquetes DNS
                addRoute("0.0.0.0", 0)
                setBlocking(false)

                // Excluir la propia app y servicios de Google para garantizar conectividad con backend, OAuth y FCM
                try {
                    addDisallowedApplication(packageName)
                    addDisallowedApplication("com.google.android.gms")
                } catch (e: Exception) {
                    Log.w(TAG, "No se pudieron excluir paquetes de la VPN: ${e.message}")
                }
            }

            vpnInterface = builder.establish()

            if (vpnInterface != null) {
                isRunning.set(true)
                broadcastStatus(true)

                // Iniciar hilo de procesamiento de paquetes
                vpnThread = Thread(this, "BAProtegeVpnThread").apply { start() }
                Log.i(TAG, "✅ Motor de protección VPN iniciado exitosamente.")
            } else {
                Log.e(TAG, "❌ Error: No se pudo establecer la interfaz VPN.")
                stopProtection()
            }
        } catch (e: Exception) {
            Log.e(TAG, "❌ Excepción al iniciar la VPN: ${e.message}", e)
            stopProtection()
        }
    }

    private fun stopProtection() {
        if (!isRunning.get()) return

        isRunning.set(false)
        try {
            vpnThread?.interrupt()
            vpnInterface?.close()
            vpnInterface = null
        } catch (e: Exception) {
            Log.e(TAG, "Error al cerrar la interfaz VPN: ${e.message}")
        }

        stopForeground(STOP_FOREGROUND_REMOVE)
        broadcastStatus(false)
        stopSelf()
        Log.i(TAG, "🛑 Motor de protección VPN detenido.")
    }

    /**
     * Bucle principal de lectura y procesamiento de paquetes de red.
     */
    override fun run() {
        val vpnFileDescriptor = vpnInterface?.fileDescriptor ?: return
        val inputStream = FileInputStream(vpnFileDescriptor)
        val outputStream = FileOutputStream(vpnFileDescriptor)
        val packet = ByteBuffer.allocate(32767)

        try {
            while (isRunning.get() && !Thread.interrupted()) {
                val length = inputStream.read(packet.array())
                if (length > 0) {
                    packet.limit(length)
                    // Procesar paquete IP / DNS e interceptar según reglas de LOTBA
                    processIpPacket(packet, outputStream)
                    packet.clear()
                } else {
                    Thread.sleep(50)
                }
            }
        } catch (e: InterruptedException) {
            Log.d(TAG, "Hilo VPN interrumpido normalmente.")
        } catch (e: Exception) {
            Log.e(TAG, "Error en el bucle de procesamiento VPN: ${e.message}")
        } finally {
            inputStream.close()
            outputStream.close()
        }
    }

    /**
     * Inspección básica de paquetes de red para filtrado de dominios.
     */
    private fun processIpPacket(packet: ByteBuffer, outputStream: FileOutputStream) {
        // En una implementación de producción aquí se analiza el payload DNS (puerto 53 UDP)
        // y si el dominio coincide con filterEngine.isDomainBlocked(host), se descarta o retorna NXDOMAIN.
        // Si no está bloqueado, se reenvía.
    }

    private fun broadcastStatus(active: Boolean) {
        val intent = Intent(ACTION_STATUS_CHANGED).apply {
            putExtra(EXTRA_IS_RUNNING, active)
            setPackage(packageName)
        }
        sendBroadcast(intent)
    }

    override fun onRevoke() {
        stopProtection()
        super.onRevoke()
    }

    override fun onDestroy() {
        stopProtection()
        super.onDestroy()
    }
}
