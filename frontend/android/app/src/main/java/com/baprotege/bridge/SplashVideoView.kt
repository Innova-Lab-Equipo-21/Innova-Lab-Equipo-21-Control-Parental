/**
 * ==============================================================================
 * Proyecto: BA Protege+
 * Componente: Bridge React Native <-> Android Native (Reproductor de Video Splash)
 * Archivo: SplashVideoView.kt
 * Descripción: Vista nativa liviana basada en TextureView + MediaPlayer para
 *              reproducir videos locales desde res/raw (apertura.mp4 en Splash y
 *              hola_botito.mp4 en Onboarding) con ajuste cover o contain sin distorsión.
 * ==============================================================================
 */

package com.baprotege.bridge

import android.graphics.Matrix
import android.graphics.SurfaceTexture
import android.media.MediaPlayer
import android.util.Log
import android.view.Gravity
import android.view.Surface
import android.view.TextureView
import android.widget.FrameLayout
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.LifecycleEventListener
import com.facebook.react.bridge.WritableMap
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.UIManagerHelper
import com.facebook.react.uimanager.events.Event

class SplashVideoView(private val reactContext: ThemedReactContext) :
    FrameLayout(reactContext),
    TextureView.SurfaceTextureListener,
    LifecycleEventListener {

    companion object {
        private const val TAG = "SplashVideoView"
        const val EVENT_VIDEO_READY = "topSplashVideoReady"
        const val EVENT_VIDEO_END = "topSplashVideoEnd"
        const val EVENT_VIDEO_ERROR = "topSplashVideoError"
    }

    private val textureView: TextureView = TextureView(reactContext).apply {
        layoutParams = LayoutParams(
            LayoutParams.MATCH_PARENT,
            LayoutParams.MATCH_PARENT,
            Gravity.CENTER
        )
        isOpaque = false
        surfaceTextureListener = this@SplashVideoView
    }

    private var mediaPlayer: MediaPlayer? = null
    private var surface: Surface? = null
    private var resourceName: String? = null
    private var muted: Boolean = true
    private var repeat: Boolean = false
    private var paused: Boolean = false
    private var resizeMode: String = "cover"

    private var videoWidth: Int = 0
    private var videoHeight: Int = 0
    private var isPrepared: Boolean = false
    private var hasCompleted: Boolean = false
    private var readyEventSent: Boolean = false
    private var isLifecycleRegistered: Boolean = false

    init {
        addView(textureView)
        registerLifecycle()
    }

    fun setResourceName(name: String?) {
        if (name == resourceName && mediaPlayer != null) return
        resourceName = name
        if (surface != null && !name.isNullOrBlank()) {
            startPlayback()
        }
    }

    fun setMuted(isMuted: Boolean) {
        muted = isMuted
        applyVolume()
    }

    fun setRepeat(shouldRepeat: Boolean) {
        repeat = shouldRepeat
        try {
            mediaPlayer?.isLooping = shouldRepeat
        } catch (_: IllegalStateException) {
            // Ignorar si MediaPlayer aún no está listo
        }
    }

    fun setPaused(isPaused: Boolean) {
        paused = isPaused
        val player = mediaPlayer ?: return
        if (!isPrepared) return
        try {
            if (isPaused) {
                if (player.isPlaying) {
                    player.pause()
                }
            } else if (!hasCompleted && !player.isPlaying) {
                player.start()
            }
        } catch (_: IllegalStateException) {
            // Ignorar si MediaPlayer aún no está listo
        }
    }

    fun setResizeMode(mode: String?) {
        val normalized = if (mode == "contain") "contain" else "cover"
        if (resizeMode != normalized) {
            resizeMode = normalized
            updateTextureTransform()
        }
    }

    private fun applyVolume() {
        val volume = if (muted) 0f else 1f
        try {
            mediaPlayer?.setVolume(volume, volume)
        } catch (_: IllegalStateException) {
            // Ignorar si MediaPlayer aún no está listo
        }
    }

    private fun startPlayback() {
        val name = resourceName
        val currentSurface = surface
        if (name.isNullOrBlank() || currentSurface == null) return

        releasePlayer()
        hasCompleted = false
        readyEventSent = false

        val cleanName = name.substringBeforeLast('.')
        val resId = reactContext.resources.getIdentifier(
            cleanName,
            "raw",
            reactContext.packageName
        )

        if (resId == 0) {
            Log.e(TAG, "Recurso de video raw no encontrado: $cleanName")
            emitEvent(EVENT_VIDEO_ERROR, "Video resource not found: $cleanName")
            return
        }

        try {
            val afd = reactContext.resources.openRawResourceFd(resId)
            val player = MediaPlayer()
            mediaPlayer = player

            player.setDataSource(afd.fileDescriptor, afd.startOffset, afd.length)
            afd.close()

            player.setSurface(currentSurface)
            player.isLooping = repeat

            player.setOnVideoSizeChangedListener { _, width, height ->
                if (width > 0 && height > 0) {
                    videoWidth = width
                    videoHeight = height
                    post { updateTextureTransform() }
                }
            }

            player.setOnInfoListener { _, what, _ ->
                if (what == MediaPlayer.MEDIA_INFO_VIDEO_RENDERING_START && !readyEventSent) {
                    readyEventSent = true
                    emitEvent(EVENT_VIDEO_READY)
                }
                false
            }

            player.setOnPreparedListener { mp ->
                isPrepared = true
                videoWidth = mp.videoWidth
                videoHeight = mp.videoHeight
                applyVolume()
                post { updateTextureTransform() }
                if (!paused) {
                    mp.start()
                } else {
                    try {
                        mp.seekTo(1)
                    } catch (_: IllegalStateException) {
                    }
                }

                // Respaldo si el dispositivo no dispara MEDIA_INFO_VIDEO_RENDERING_START
                postDelayed({
                    if (!readyEventSent && mediaPlayer === mp) {
                        readyEventSent = true
                        emitEvent(EVENT_VIDEO_READY)
                    }
                }, 120L)
            }

            player.setOnCompletionListener {
                if (!repeat) {
                    hasCompleted = true
                    emitEvent(EVENT_VIDEO_END)
                }
            }

            player.setOnErrorListener { _, what, extra ->
                Log.e(TAG, "Error de MediaPlayer: what=$what extra=$extra")
                emitEvent(EVENT_VIDEO_ERROR, "MediaPlayer error ($what, $extra)")
                true
            }

            player.prepareAsync()
        } catch (e: Exception) {
            Log.e(TAG, "No se pudo iniciar la reproducción del video splash", e)
            emitEvent(EVENT_VIDEO_ERROR, e.message ?: "Unknown playback error")
        }
    }

    private fun updateTextureTransform() {
        val viewW = textureView.width
        val viewH = textureView.height
        if (viewW <= 0 || viewH <= 0 || videoWidth <= 0 || videoHeight <= 0) return

        val videoAspect = videoWidth.toFloat() / videoHeight.toFloat()
        val viewAspect = viewW.toFloat() / viewH.toFloat()

        var scaleX = 1f
        var scaleY = 1f

        if (resizeMode == "contain") {
            if (videoAspect > viewAspect) {
                scaleY = viewAspect / videoAspect
            } else {
                scaleX = videoAspect / viewAspect
            }
        } else {
            // Modo "cover" (center-crop): llena la pantalla vertical sin distorsión ni franjas
            if (videoAspect > viewAspect) {
                scaleX = videoAspect / viewAspect
            } else {
                scaleY = viewAspect / videoAspect
            }
        }

        val matrix = Matrix()
        matrix.setScale(scaleX, scaleY, viewW / 2f, viewH / 2f)
        textureView.setTransform(matrix)
    }

    override fun onSizeChanged(w: Int, h: Int, oldw: Int, oldh: Int) {
        super.onSizeChanged(w, h, oldw, oldh)
        post { updateTextureTransform() }
    }

    override fun onSurfaceTextureAvailable(st: SurfaceTexture, width: Int, height: Int) {
        surface?.release()
        surface = Surface(st)
        if (!resourceName.isNullOrBlank()) {
            startPlayback()
        }
    }

    override fun onSurfaceTextureSizeChanged(st: SurfaceTexture, width: Int, height: Int) {
        updateTextureTransform()
    }

    override fun onSurfaceTextureDestroyed(st: SurfaceTexture): Boolean {
        releasePlayer()
        surface?.release()
        surface = null
        return true
    }

    override fun onSurfaceTextureUpdated(st: SurfaceTexture) {
        // Sin acción requerida por fotograma
    }

    override fun onHostResume() {
        val player = mediaPlayer ?: return
        if (isPrepared && !hasCompleted && !paused && !player.isPlaying) {
            try {
                player.start()
            } catch (_: IllegalStateException) {
                // Ignorar si ya fue liberado
            }
        }
    }

    override fun onHostPause() {
        val player = mediaPlayer ?: return
        if (isPrepared) {
            try {
                if (player.isPlaying) {
                    player.pause()
                }
            } catch (_: IllegalStateException) {
                // Ignorar si ya fue liberado
            }
        }
    }

    override fun onHostDestroy() {
        releasePlayer()
    }

    override fun onAttachedToWindow() {
        super.onAttachedToWindow()
        registerLifecycle()
    }

    override fun onDetachedFromWindow() {
        super.onDetachedFromWindow()
        unregisterLifecycle()
        releasePlayer()
        surface?.release()
        surface = null
    }

    fun cleanup() {
        unregisterLifecycle()
        releasePlayer()
        surface?.release()
        surface = null
    }

    private fun registerLifecycle() {
        if (!isLifecycleRegistered) {
            reactContext.addLifecycleEventListener(this)
            isLifecycleRegistered = true
        }
    }

    private fun unregisterLifecycle() {
        if (isLifecycleRegistered) {
            reactContext.removeLifecycleEventListener(this)
            isLifecycleRegistered = false
        }
    }

    private fun releasePlayer() {
        isPrepared = false
        mediaPlayer?.let { player ->
            try {
                if (player.isPlaying) {
                    player.stop()
                }
            } catch (_: Exception) {
            }
            try {
                player.reset()
            } catch (_: Exception) {
            }
            try {
                player.release()
            } catch (_: Exception) {
            }
        }
        mediaPlayer = null
    }

    private fun emitEvent(eventName: String, message: String? = null) {
        val surfaceId = UIManagerHelper.getSurfaceId(reactContext)
        val dispatcher = UIManagerHelper.getEventDispatcherForReactTag(reactContext, id)
        dispatcher?.dispatchEvent(SplashVideoEvent(surfaceId, id, eventName, message))
    }

    private class SplashVideoEvent(
        surfaceId: Int,
        viewTag: Int,
        private val name: String,
        private val message: String?
    ) : Event<SplashVideoEvent>(surfaceId, viewTag) {
        override fun getEventName(): String = name

        override fun getEventData(): WritableMap {
            val map = Arguments.createMap()
            if (message != null) {
                map.putString("message", message)
            }
            return map
        }
    }
}
