/**
 * ==============================================================================
 * Proyecto: BA Protege+
 * Componente: Android Native (Pantalla Completa de Bloqueo Empático)
 * Archivo: BlockedScreenActivity.kt
 * Descripción: Actividad nativa a pantalla completa que se abre al bloquear
 *              un sitio web o una aplicación restringida. Muestra a Boti o Botito,
 *              un mensaje cálido de cuidado y protección adaptado a cada perfil
 *              (Responsable, Adulto Protegido o Menor Protegido), y sugiere
 *              actividades recreativas fuera de las pantallas.
 * ==============================================================================
 */

package com.baprotege

import android.content.Context
import android.content.Intent
import android.os.Bundle
import android.widget.Button
import android.widget.ImageView
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity

class BlockedScreenActivity : AppCompatActivity() {

    companion object {
        const val EXTRA_BLOCK_TYPE = "extra_block_type"      // "SITE" o "APP"
        const val EXTRA_TARGET_NAME = "extra_target_name"    // ej. "g1.globo.com" o "WhatsApp"
        const val EXTRA_IS_LOTBA = "extra_is_lotba"          // Boolean
        const val EXTRA_USER_MODE = "extra_user_mode"        // "PARENT", "ADULT", "CHILD"
        const val EXTRA_FROM_APP = "extra_from_app"          // Nombre de app que originó el bloqueo (ej. "YouTube")
        const val EXTRA_FROM_SITE = "extra_from_site"        // Dominio del sitio web que originó el bloqueo (ej. "facebook.com")

        fun createIntent(
            context: Context,
            type: String,
            targetName: String,
            isLotba: Boolean,
            userMode: String,
            fromApp: String? = null,
            fromSite: String? = null
        ): Intent {
            return Intent(context, BlockedScreenActivity::class.java).apply {
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP or Intent.FLAG_ACTIVITY_SINGLE_TOP)
                putExtra(EXTRA_BLOCK_TYPE, type)
                putExtra(EXTRA_TARGET_NAME, targetName)
                putExtra(EXTRA_IS_LOTBA, isLotba)
                putExtra(EXTRA_USER_MODE, userMode)
                if (!fromApp.isNullOrBlank()) {
                    putExtra(EXTRA_FROM_APP, fromApp)
                }
                if (!fromSite.isNullOrBlank()) {
                    putExtra(EXTRA_FROM_SITE, fromSite)
                }
            }
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_blocked_screen)

        val btnUnderstood = findViewById<Button>(R.id.btnUnderstood)
        btnUnderstood.setOnClickListener {
            navigateToHomeAndFinish()
        }

        val btnContinueBrowsing = findViewById<Button>(R.id.btnContinueBrowsing)
        btnContinueBrowsing.setOnClickListener {
            try {
                val searchIntent = Intent(Intent.ACTION_VIEW, android.net.Uri.parse("https://www.google.com")).apply {
                    flags = Intent.FLAG_ACTIVITY_NEW_TASK
                }
                startActivity(searchIntent)
            } catch (_: Exception) {}
            finish()
        }

        renderUI(intent)
    }

    override fun onNewIntent(intent: Intent?) {
        super.onNewIntent(intent)
        setIntent(intent)
        renderUI(intent)
    }

    private fun renderUI(intentData: Intent?) {
        val blockType = intentData?.getStringExtra(EXTRA_BLOCK_TYPE) ?: "SITE"
        val targetName = intentData?.getStringExtra(EXTRA_TARGET_NAME) ?: "este contenido"
        val isLotba = intentData?.getBooleanExtra(EXTRA_IS_LOTBA, false) ?: false
        val userMode = intentData?.getStringExtra(EXTRA_USER_MODE) ?: "PARENT"
        val fromApp = intentData?.getStringExtra(EXTRA_FROM_APP)
        val fromSite = intentData?.getStringExtra(EXTRA_FROM_SITE)

        val ivMascot = findViewById<ImageView>(R.id.ivMascot)
        val tvBadge = findViewById<TextView>(R.id.tvBadge)
        val tvTitle = findViewById<TextView>(R.id.tvTitle)
        val tvMessage = findViewById<TextView>(R.id.tvMessage)
        val tvSuggestionHeader = findViewById<TextView>(R.id.tvSuggestionHeader)
        val tvSuggestions = findViewById<TextView>(R.id.tvSuggestions)
        val btnContinueBrowsing = findViewById<Button>(R.id.btnContinueBrowsing)
        val btnUnderstood = findViewById<Button>(R.id.btnUnderstood)

        val density = resources.displayMetrics.density
        val marginPx = (6 * density).toInt()

        if (blockType == "SITE") {
            btnContinueBrowsing.visibility = android.view.View.VISIBLE
            btnContinueBrowsing.text = "Seguir navegando"
            btnUnderstood.text = "Hacer una pausa"
            (btnContinueBrowsing.layoutParams as? android.widget.LinearLayout.LayoutParams)?.marginEnd = marginPx
            (btnUnderstood.layoutParams as? android.widget.LinearLayout.LayoutParams)?.marginStart = marginPx
        } else {
            btnContinueBrowsing.visibility = android.view.View.GONE
            btnUnderstood.text = "Hacer una pausa"
            (btnContinueBrowsing.layoutParams as? android.widget.LinearLayout.LayoutParams)?.marginEnd = 0
            (btnUnderstood.layoutParams as? android.widget.LinearLayout.LayoutParams)?.marginStart = 0
        }

        // 1. Configurar Mascota (Botito para Menor, Boti para Adulto y Responsable)
        val isMenor = (userMode == "CHILD")
        if (isMenor) {
            ivMascot.setImageResource(R.drawable.src_assets_icons_bot_menor_botito_feliz)
            tvBadge.text = "🛡️ Botito te cuida • BA Protege+"
        } else {
            ivMascot.setImageResource(R.drawable.src_assets_icons_bot_adulto_boti_feliz)
            tvBadge.text = "🛡️ Boti te cuida • BA Protege+"
        }

        // 2. Construir Mensaje Personalizado según los 7 escenarios y reciprocidad
        if (isLotba) {
            // Escenario 7: Sitio o app bloqueado por Lista Oficial LOTBA (Apuestas ilegales)
            tvTitle.text = if (blockType == "APP") "Aplicación no autorizada" else "Sitio no autorizado"
            if (isMenor) {
                tvMessage.text = if (blockType == "APP") {
                    "¡Hola! Esta aplicación está bloqueada por la lista oficial de protección de Lotería de la Ciudad (LOTBA) para mantenerte siempre seguro."
                } else {
                    "¡Hola! Este sitio web está bloqueado por la lista oficial de protección de Lotería de la Ciudad (LOTBA) para mantenerte siempre seguro."
                }
                tvSuggestionHeader.text = "🎮 ¡Hay un mundo genial esperándote afuera!"
                tvSuggestions.text = "• Jugá a armar rompecabezas o tu juego favorito.\n• Salí a pasear en bicicleta o jugar con amigos.\n• Hacé un dibujo colorido de tu personaje favorito."
            } else if (userMode == "ADULT") {
                tvMessage.text = if (blockType == "APP") {
                    "Esta aplicación forma parte de las plataformas restringidas por la lista oficial de LOTBA y se encuentra bloqueada para resguardar tu seguridad y bienestar financiero."
                } else {
                    "Esta plataforma forma parte de la lista oficial de LOTBA y se encuentra bloqueada para resguardar tu seguridad y bienestar financiero."
                }
                tvSuggestionHeader.text = "🌿 Pausa saludable fuera de las pantallas:"
                tvSuggestions.text = "• Salí a caminar al aire libre o hacer algo de ejercicio.\n• Disfrutá de un café o mate conversando con alguien.\n• Retomá esa lectura o proyecto que tanto te gusta."
            } else {
                // Responsable / Tutor
                tvMessage.text = if (blockType == "APP") {
                    "El uso de esta aplicación está bloqueado por la lista oficial de LOTBA de apuestas no autorizadas para proteger a todos los dispositivos de tu cuenta."
                } else {
                    "El acceso a este sitio está bloqueado por la lista oficial de LOTBA de apuestas no autorizadas para proteger a todos los dispositivos de tu cuenta."
                }
                tvSuggestionHeader.text = "💡 Recomendación para tu bienestar:"
                tvSuggestions.text = "• Hacé una pausa visual y estirá el cuerpo.\n• Aprovechá para compartir tiempo en familia fuera de las pantallas.\n• Disfrutá de una caminata o desconexión al aire libre."
            }
        } else if (userMode == "CHILD") {
            // Escenarios Menor Protegido
            if (!fromApp.isNullOrBlank()) {
                tvTitle.text = "¡Pausa para $fromApp!"
                tvMessage.text = "Tu responsable configuró un momento de descanso para $fromApp. ¡También cuidamos su acceso desde el navegador ($targetName) para que puedas disfrutar y jugar afuera!"
            } else if (!fromSite.isNullOrBlank()) {
                tvTitle.text = "¡Pausa para $targetName!"
                tvMessage.text = "Tu responsable configuró una restricción para el sitio web $fromSite. ¡También cuidamos el acceso a su aplicación ($targetName) para que puedas disfrutar y jugar afuera!"
            } else if (blockType == "APP") {
                // Escenario 6: App bloqueada para Menor
                tvTitle.text = "¡Hagamos una pausa de $targetName!"
                tvMessage.text = "Tu responsable configuró un momento de descanso para esta aplicación. ¡Cuidar el tiempo que pasamos con el celu nos ayuda a crecer felices!"
            } else {
                // Escenario 5: Sitio bloqueado para Menor
                tvTitle.text = "Sitio web protegido"
                tvMessage.text = "Tu responsable decidió restringir el acceso a $targetName para que navegues por Internet de forma tranquila y segura."
            }
            tvSuggestionHeader.text = "🎈 ¡Actividades divertidas fuera del celular!"
            tvSuggestions.text = "• Jugá a un juego de mesa o a las cartas en familia.\n• Andá a la plaza, corré o disfrutá del aire libre.\n• Leé un cuento o creá una historieta divertida."
        } else if (userMode == "ADULT") {
            // Escenarios Adulto Protegido
            if (!fromApp.isNullOrBlank()) {
                tvTitle.text = "Pausa digital para $fromApp"
                tvMessage.text = "El uso de $fromApp fue restringido por tu responsable, incluyendo su versión web ($targetName), para acompañarte en tus metas de autocontrol y equilibrio digital."
            } else if (!fromSite.isNullOrBlank()) {
                tvTitle.text = "Aplicación restringida ($targetName)"
                tvMessage.text = "El acceso al sitio web $fromSite fue restringido por tu responsable, por lo que también se restringió el uso de su aplicación ($targetName) para acompañarte en tus metas de autocontrol y equilibrio digital."
            } else if (blockType == "APP") {
                // Escenario 4: App bloqueada para Adulto
                tvTitle.text = "Aplicación restringida"
                tvMessage.text = "El uso de $targetName fue restringido por tu responsable para acompañarte en tus metas de autocontrol y equilibrio digital."
            } else {
                // Escenario 3: Sitio bloqueado para Adulto
                tvTitle.text = "Sitio web restringido"
                tvMessage.text = "El acceso a $targetName se encuentra bloqueado por la configuración de protección establecida por tu responsable."
            }
            tvSuggestionHeader.text = "🌿 Desconexión saludable fuera de pantalla:"
            tvSuggestions.text = "• Realizá una caminata al aire libre o actividad física.\n• Compartí una charla agradable con un amigo o familiar.\n• Dedicale tiempo a tus pasatiempos favoritos sin tecnología."
        } else {
            // Escenarios Responsable (su propio dispositivo / "Mi dispositivo")
            if (!fromApp.isNullOrBlank()) {
                tvTitle.text = "¡Pausa digital para $fromApp!"
                tvMessage.text = "Bloqueaste la aplicación $fromApp en tu dispositivo. También protegemos el acceso a su versión web ($targetName) respetando tu tiempo de descanso."
            } else if (!fromSite.isNullOrBlank()) {
                tvTitle.text = "¡Pausa digital para $targetName!"
                tvMessage.text = "Bloqueaste el sitio web $fromSite en tu dispositivo. También protegemos el acceso a su aplicación ($targetName) respetando tu tiempo de descanso."
            } else if (blockType == "APP") {
                // Escenario 2: App bloqueada en su propio dispositivo
                tvTitle.text = "¡Pausa digital para $targetName!"
                tvMessage.text = "Bloqueaste esta aplicación en tu dispositivo para cuidar tus tiempos diarios y enfocarte en lo que de verdad importa."
            } else {
                // Escenario 1: Sitio bloqueado en su propio dispositivo
                tvTitle.text = "Sitio web bloqueado por vos"
                tvMessage.text = "Agregaste $targetName a tu lista de bloqueo personal para evitar distracciones y promover un uso consciente de la tecnología."
            }
            tvSuggestionHeader.text = "☕ Ideas para recargar energías sin pantallas:"
            tvSuggestions.text = "• Hacé una pausa activa, caminá o estirá unos minutos.\n• Compartí un momento presente y de calidad con tu familia.\n• Leé unas páginas de tu libro favorito o escuchá buena música."
        }
    }

    private fun navigateToHomeAndFinish() {
        try {
            val homeIntent = Intent(Intent.ACTION_MAIN).apply {
                addCategory(Intent.CATEGORY_HOME)
                flags = Intent.FLAG_ACTIVITY_NEW_TASK
            }
            startActivity(homeIntent)
        } catch (_: Exception) {}
        finish()
    }

    override fun onBackPressed() {
        navigateToHomeAndFinish()
    }
}
