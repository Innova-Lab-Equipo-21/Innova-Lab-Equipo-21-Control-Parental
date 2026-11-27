/**
 * ==============================================================================
 * Proyecto: BA Protege+
 * Componente: Android Native Core — Lector QR (CameraX + ML Kit)
 * Archivo: QrScannerActivity.kt
 * Descripción: Actividad nativa de pantalla completa con CameraX (LifecycleCameraController
 *              y PreviewView) y MlKitAnalyzer (BarcodeScanning) para escanear códigos QR
 *              de vinculación de 6 dígitos en dispositivos protegidos.
 * ==============================================================================
 */

package com.baprotege

import android.Manifest
import android.app.Activity
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.graphics.Canvas
import android.graphics.Color
import android.graphics.Paint
import android.graphics.PorterDuff
import android.graphics.PorterDuffXfermode
import android.graphics.RectF
import android.graphics.Typeface
import android.graphics.drawable.GradientDrawable
import android.os.Bundle
import android.util.Log
import android.util.TypedValue
import android.view.Gravity
import android.view.View
import android.view.ViewGroup
import android.widget.FrameLayout
import android.widget.LinearLayout
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity
import androidx.camera.core.CameraSelector
import androidx.camera.core.ImageAnalysis
import androidx.camera.mlkit.vision.MlKitAnalyzer
import androidx.camera.view.LifecycleCameraController
import androidx.camera.view.PreviewView
import androidx.core.content.ContextCompat
import com.google.mlkit.vision.barcode.BarcodeScanner
import com.google.mlkit.vision.barcode.BarcodeScannerOptions
import com.google.mlkit.vision.barcode.BarcodeScanning
import com.google.mlkit.vision.barcode.common.Barcode
import java.util.concurrent.atomic.AtomicBoolean

class QrScannerActivity : AppCompatActivity() {

    companion object {
        private const val TAG = "QrScannerActivity"
        const val EXTRA_QR_CODE = "qr_code"
        const val EXTRA_RAW_VALUE = "qr_raw_value"
        const val EXTRA_ERROR_MESSAGE = "qr_error_message"
        const val RESULT_ERROR = Activity.RESULT_FIRST_USER

        private val SIX_DIGIT_REGEX = Regex("\\b(\\d{6})\\b")

        /**
         * Extrae un código numérico de 6 dígitos desde el texto bruto del QR.
         * Soporta tanto un código puro ("123456") como URLs o payloads con el código embebido.
         */
        fun extractSixDigitCode(rawValue: String?): String? {
            if (rawValue.isNullOrBlank()) return null
            val trimmed = rawValue.trim()
            if (trimmed.length == 6 && trimmed.all { it.isDigit() }) {
                return trimmed
            }
            return SIX_DIGIT_REGEX.find(trimmed)?.groupValues?.getOrNull(1)
        }
    }

    private lateinit var previewView: PreviewView
    private lateinit var statusHintText: TextView
    private lateinit var torchButton: TextView

    private var cameraController: LifecycleCameraController? = null
    private var barcodeScanner: BarcodeScanner? = null
    private val hasDeliveredResult = AtomicBoolean(false)
    private var isTorchEnabled = false

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        if (ContextCompat.checkSelfPermission(this, Manifest.permission.CAMERA)
            != PackageManager.PERMISSION_GRANTED
        ) {
            finishWithError("No se otorgó permiso de cámara para escanear el código QR.")
            return
        }

        buildScannerUi()
        startCameraScanner()
    }

    private fun dp(value: Int): Int {
        return TypedValue.applyDimension(
            TypedValue.COMPLEX_UNIT_DIP,
            value.toFloat(),
            resources.displayMetrics
        ).toInt()
    }

    private fun buildScannerUi() {
        val root = FrameLayout(this).apply {
            layoutParams = ViewGroup.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.MATCH_PARENT
            )
            setBackgroundColor(Color.BLACK)
        }

        // Vista previa de cámara en tiempo real (CameraX PreviewView)
        previewView = PreviewView(this).apply {
            layoutParams = FrameLayout.LayoutParams(
                FrameLayout.LayoutParams.MATCH_PARENT,
                FrameLayout.LayoutParams.MATCH_PARENT
            )
            implementationMode = PreviewView.ImplementationMode.COMPATIBLE
            scaleType = PreviewView.ScaleType.FILL_CENTER
        }
        root.addView(previewView)

        // Capa oscura con recorte central translúcido y esquinas azules institucionales
        val overlayView = ScannerOverlayView(this).apply {
            layoutParams = FrameLayout.LayoutParams(
                FrameLayout.LayoutParams.MATCH_PARENT,
                FrameLayout.LayoutParams.MATCH_PARENT
            )
        }
        root.addView(overlayView)

        // Cabecera superior con botón Cerrar y título
        val topBar = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            layoutParams = FrameLayout.LayoutParams(
                FrameLayout.LayoutParams.MATCH_PARENT,
                FrameLayout.LayoutParams.WRAP_CONTENT,
                Gravity.TOP
            )
            setPadding(dp(20), dp(48), dp(20), dp(16))
        }

        val actionRow = LinearLayout(this).apply {
            orientation = LinearLayout.HORIZONTAL
            gravity = Gravity.CENTER_VERTICAL
            layoutParams = LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                LinearLayout.LayoutParams.WRAP_CONTENT
            )
        }

        val closeButton = TextView(this).apply {
            text = "✕ Cancelar"
            setTextColor(Color.WHITE)
            setTextSize(TypedValue.COMPLEX_UNIT_SP, 15f)
            typeface = Typeface.DEFAULT_BOLD
            setPadding(dp(16), dp(10), dp(16), dp(10))
            background = GradientDrawable().apply {
                setColor(Color.parseColor("#88000000"))
                cornerRadius = dp(24).toFloat()
                setStroke(dp(1), Color.parseColor("#66FFFFFF"))
            }
            setOnClickListener {
                setResult(Activity.RESULT_CANCELED)
                finish()
            }
        }
        actionRow.addView(closeButton)

        val spacer = View(this).apply {
            layoutParams = LinearLayout.LayoutParams(0, 1, 1f)
        }
        actionRow.addView(spacer)

        torchButton = TextView(this).apply {
            text = "Linterna"
            setTextColor(Color.WHITE)
            setTextSize(TypedValue.COMPLEX_UNIT_SP, 14f)
            typeface = Typeface.DEFAULT_BOLD
            setPadding(dp(16), dp(10), dp(16), dp(10))
            visibility = View.GONE
            background = GradientDrawable().apply {
                setColor(Color.parseColor("#88000000"))
                cornerRadius = dp(24).toFloat()
                setStroke(dp(1), Color.parseColor("#66FFFFFF"))
            }
            setOnClickListener {
                toggleTorch()
            }
        }
        actionRow.addView(torchButton)
        topBar.addView(actionRow)

        val titleView = TextView(this).apply {
            text = "Escaneá el código QR"
            setTextColor(Color.WHITE)
            setTextSize(TypedValue.COMPLEX_UNIT_SP, 22f)
            typeface = Typeface.DEFAULT_BOLD
            gravity = Gravity.CENTER
            layoutParams = LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                LinearLayout.LayoutParams.WRAP_CONTENT
            ).apply {
                topMargin = dp(28)
            }
        }
        topBar.addView(titleView)

        val subtitleView = TextView(this).apply {
            text = "Apuntá la cámara al código QR que generó la persona responsable."
            setTextColor(Color.parseColor("#E5E7EB"))
            setTextSize(TypedValue.COMPLEX_UNIT_SP, 14f)
            gravity = Gravity.CENTER
            layoutParams = LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                LinearLayout.LayoutParams.WRAP_CONTENT
            ).apply {
                topMargin = dp(8)
            }
        }
        topBar.addView(subtitleView)
        root.addView(topBar)

        // Mensaje guía inferior
        val bottomContainer = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            gravity = Gravity.CENTER
            layoutParams = FrameLayout.LayoutParams(
                FrameLayout.LayoutParams.MATCH_PARENT,
                FrameLayout.LayoutParams.WRAP_CONTENT,
                Gravity.BOTTOM
            )
            setPadding(dp(24), dp(16), dp(24), dp(44))
        }

        statusHintText = TextView(this).apply {
            text = "Centrá el código QR dentro del recuadro"
            setTextColor(Color.WHITE)
            setTextSize(TypedValue.COMPLEX_UNIT_SP, 14f)
            gravity = Gravity.CENTER
            setPadding(dp(18), dp(12), dp(18), dp(12))
            background = GradientDrawable().apply {
                setColor(Color.parseColor("#AA111827"))
                cornerRadius = dp(24).toFloat()
            }
        }
        bottomContainer.addView(statusHintText)
        root.addView(bottomContainer)

        setContentView(root)
    }

    private fun startCameraScanner() {
        try {
            val mainExecutor = ContextCompat.getMainExecutor(this)
            val controller = LifecycleCameraController(this)
            cameraController = controller

            val options = BarcodeScannerOptions.Builder()
                .setBarcodeFormats(Barcode.FORMAT_QR_CODE)
                .build()
            val scanner = BarcodeScanning.getClient(options)
            barcodeScanner = scanner

            val mlKitAnalyzer = MlKitAnalyzer(
                listOf(scanner),
                ImageAnalysis.COORDINATE_SYSTEM_ORIGINAL,
                mainExecutor
            ) { result ->
                if (hasDeliveredResult.get()) return@MlKitAnalyzer
                val barcodes: List<Barcode>? = result.getValue(scanner)
                if (barcodes.isNullOrEmpty()) return@MlKitAnalyzer

                for (barcode in barcodes) {
                    val rawValue = barcode.rawValue ?: continue
                    val extracted = extractSixDigitCode(rawValue)
                    if (extracted != null) {
                        if (hasDeliveredResult.compareAndSet(false, true)) {
                            deliverCode(extracted, rawValue)
                        }
                        return@MlKitAnalyzer
                    } else {
                        statusHintText.text = "Este QR no corresponde a un código de BA Protege+"
                    }
                }
            }

            controller.setImageAnalysisAnalyzer(mainExecutor, mlKitAnalyzer)
            controller.cameraSelector = CameraSelector.DEFAULT_BACK_CAMERA
            controller.bindToLifecycle(this)
            previewView.controller = controller

            controller.initializationFuture.addListener({
                try {
                    controller.initializationFuture.get()
                    if (!controller.hasCamera(CameraSelector.DEFAULT_BACK_CAMERA)) {
                        if (controller.hasCamera(CameraSelector.DEFAULT_FRONT_CAMERA)) {
                            controller.cameraSelector = CameraSelector.DEFAULT_FRONT_CAMERA
                        } else {
                            finishWithError("No se detectó una cámara disponible en este dispositivo.")
                            return@addListener
                        }
                    }
                    val hasFlash = controller.cameraInfo?.hasFlashUnit() == true
                    torchButton.visibility = if (hasFlash) View.VISIBLE else View.GONE
                } catch (e: Exception) {
                    Log.e(TAG, "Error al inicializar CameraX: ${e.message}", e)
                    finishWithError("No pudimos iniciar la cámara. Intentá ingresando el código de 6 dígitos.")
                }
            }, mainExecutor)
        } catch (e: Exception) {
            Log.e(TAG, "Excepción iniciando lector QR: ${e.message}", e)
            finishWithError("No pudimos iniciar la cámara. Intentá ingresando el código de 6 dígitos.")
        }
    }

    private fun toggleTorch() {
        val controller = cameraController ?: return
        isTorchEnabled = !isTorchEnabled
        controller.enableTorch(isTorchEnabled)
        torchButton.text = if (isTorchEnabled) "Linterna: ON" else "Linterna"
    }

    private fun deliverCode(code: String, rawValue: String) {
        try {
            cameraController?.clearImageAnalysisAnalyzer()
            cameraController?.unbind()
        } catch (_: Exception) {
        }
        val resultIntent = Intent().apply {
            putExtra(EXTRA_QR_CODE, code)
            putExtra(EXTRA_RAW_VALUE, rawValue)
        }
        setResult(Activity.RESULT_OK, resultIntent)
        finish()
    }

    private fun finishWithError(message: String) {
        if (!hasDeliveredResult.compareAndSet(false, true)) return
        val errorIntent = Intent().apply {
            putExtra(EXTRA_ERROR_MESSAGE, message)
        }
        setResult(RESULT_ERROR, errorIntent)
        finish()
    }

    override fun onDestroy() {
        super.onDestroy()
        try {
            cameraController?.clearImageAnalysisAnalyzer()
            cameraController?.unbind()
        } catch (_: Exception) {
        }
        try {
            barcodeScanner?.close()
        } catch (_: Exception) {
        }
        barcodeScanner = null
        cameraController = null
    }

    /**
     * Vista de superposición semitransparente con marco de escaneo central.
     */
    private class ScannerOverlayView(context: Context) : View(context) {
        private val scrimPaint = Paint().apply {
            color = Color.parseColor("#99000000")
            style = Paint.Style.FILL
        }

        private val clearPaint = Paint().apply {
            xfermode = PorterDuffXfermode(PorterDuff.Mode.CLEAR)
            isAntiAlias = true
        }

        private val borderPaint = Paint().apply {
            color = Color.parseColor("#007AFF")
            style = Paint.Style.STROKE
            strokeWidth = TypedValue.applyDimension(
                TypedValue.COMPLEX_UNIT_DIP,
                3.5f,
                context.resources.displayMetrics
            )
            isAntiAlias = true
        }

        private val frameRect = RectF()
        private val cornerRadius = TypedValue.applyDimension(
            TypedValue.COMPLEX_UNIT_DIP,
            20f,
            context.resources.displayMetrics
        )

        init {
            setLayerType(LAYER_TYPE_SOFTWARE, null)
        }

        override fun onDraw(canvas: Canvas) {
            super.onDraw(canvas)
            val boxSize = (minOf(width, height) * 0.68f).coerceAtMost(
                TypedValue.applyDimension(
                    TypedValue.COMPLEX_UNIT_DIP,
                    280f,
                    resources.displayMetrics
                )
            )
            val left = (width - boxSize) / 2f
            val top = (height - boxSize) / 2f
            frameRect.set(left, top, left + boxSize, top + boxSize)

            canvas.drawRect(0f, 0f, width.toFloat(), height.toFloat(), scrimPaint)
            canvas.drawRoundRect(frameRect, cornerRadius, cornerRadius, clearPaint)
            canvas.drawRoundRect(frameRect, cornerRadius, cornerRadius, borderPaint)
        }
    }
}
