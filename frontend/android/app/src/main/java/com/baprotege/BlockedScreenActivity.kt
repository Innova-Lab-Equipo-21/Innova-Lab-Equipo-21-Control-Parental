/**
 * ==============================================================================
 * Proyecto: BA Protege+
 * Componente: Android Native (Pantalla Completa de Bloqueo)
 * Archivo: BlockedScreenActivity.kt
 * Descripción: Actividad nativa a pantalla completa que se abre al bloquear
 *              un sitio web o una aplicación restringida. Muestra a Botito
 *              nervioso y el mensaje adaptado según perfil (Responsable,
 *              Adulto Protegido o Menor Protegido) y origen del bloqueo
 *              (lista LOTBA o lista personalizada).
 * ==============================================================================
 */

package com.baprotege

import android.content.Context
import android.content.Intent
import android.os.Bundle
import android.view.View
import android.widget.Button
import android.widget.ImageView
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity

class BlockedScreenActivity : AppCompatActivity() {

    companion object {
        const val EXTRA_BLOCK_TYPE = "extra_block_type"      // "SITE" o "APP"
        const val EXTRA_TARGET_NAME = "extra_target_name"    // ej. "bet365.bet.ar" o "WhatsApp"
        const val EXTRA_IS_LOTBA = "extra_is_lotba"          // Boolean
        const val EXTRA_USER_MODE = "extra_user_mode"        // "PARENT", "ADULT", "CHILD"
        const val EXTRA_FROM_APP = "extra_from_app"          // Nombre de app que originó el bloqueo
        const val EXTRA_FROM_SITE = "extra_from_site"        // Dominio del sitio web que originó el bloqueo

        private const val QUESTION_TEXT =
            "¿Querés seguir navegando o descansar de las pantallas un rato?"

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
                addFlags(
                    Intent.FLAG_ACTIVITY_NEW_TASK or
                        Intent.FLAG_ACTIVITY_CLEAR_TOP or
                        Intent.FLAG_ACTIVITY_SINGLE_TOP
                )
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
                val searchIntent = Intent(
                    Intent.ACTION_VIEW,
                    android.net.Uri.parse("https://www.google.com")
                ).apply {
                    flags = Intent.FLAG_ACTIVITY_NEW_TASK
                }
                startActivity(searchIntent)
            } catch (_: Exception) {
            }
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
        val isApp = blockType == "APP"
        val isLotba = intentData?.getBooleanExtra(EXTRA_IS_LOTBA, false) ?: false
        val userMode = intentData?.getStringExtra(EXTRA_USER_MODE) ?: "PARENT"

        val ivMascot = findViewById<ImageView>(R.id.ivMascot)
        val tvMessage = findViewById<TextView>(R.id.tvMessage)
        val tvQuestion = findViewById<TextView>(R.id.tvQuestion)
        val btnContinueBrowsing = findViewById<Button>(R.id.btnContinueBrowsing)
        val btnUnderstood = findViewById<Button>(R.id.btnUnderstood)

        ivMascot.setImageResource(R.drawable.src_assets_icons_bot_menor_botito_nervioso)

        btnContinueBrowsing.visibility = View.VISIBLE
        btnContinueBrowsing.text = "Seguir"
        btnUnderstood.text = "Descansar"

        tvMessage.text = when {
            userMode == "CHILD" -> {
                if (isApp) {
                    "Esta aplicación está bloqueada para tu protección. Si querés saber más, podés conversar con la persona responsable de tu cuenta."
                } else {
                    "Este sitio está bloqueado para tu protección. Si querés saber más, podés conversar con la persona responsable de tu cuenta."
                }
            }

            isLotba -> {
                if (isApp) {
                    "Esta aplicación está bloqueada para tu protección."
                } else {
                    "Este sitio está bloqueado para tu protección."
                }
            }

            userMode == "ADULT" -> {
                if (isApp) {
                    "Recordá que bloqueaste esta aplicación para tu bienestar digital. Para modificar tu lista de bloqueos, podés hablar con la persona responsable de tu cuenta."
                } else {
                    "Recordá que bloqueaste este sitio para tu bienestar digital. Para modificar tu lista de bloqueos, podés hablar con la persona responsable de tu cuenta."
                }
            }

            else -> {
                if (isApp) {
                    "Recordá que bloqueaste esta aplicación para tu bienestar digital. Podés modificar tu lista de bloqueos desde “Sitios y apps”."
                } else {
                    "Recordá que bloqueaste este sitio para tu bienestar digital. Podés modificar tu lista de bloqueos desde “Sitios y apps”."
                }
            }
        }

        tvQuestion.text = QUESTION_TEXT
    }

    private fun navigateToHomeAndFinish() {
        try {
            val homeIntent = Intent(Intent.ACTION_MAIN).apply {
                addCategory(Intent.CATEGORY_HOME)
                flags = Intent.FLAG_ACTIVITY_NEW_TASK
            }
            startActivity(homeIntent)
        } catch (_: Exception) {
        }
        finish()
    }

    override fun onBackPressed() {
        navigateToHomeAndFinish()
    }
}
