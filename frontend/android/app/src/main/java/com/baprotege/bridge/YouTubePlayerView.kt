/**
 * ==============================================================================
 * Proyecto: BA Protege+
 * Componente: Bridge React Native <-> Android Native (Reproductor YouTube Inline)
 * Archivo: YouTubePlayerView.kt
 * Descripción: Vista nativa basada en WebView para reproducir videos verticales
 *              de YouTube (Shorts / Embed) inline dentro del Onboarding.
 * ==============================================================================
 */

package com.baprotege.bridge

import android.annotation.SuppressLint
import android.graphics.Color
import android.net.Uri
import android.os.Handler
import android.os.Looper
import android.util.Log
import android.webkit.JavascriptInterface
import android.webkit.WebChromeClient
import android.webkit.WebResourceRequest
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.FrameLayout
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.LifecycleEventListener
import com.facebook.react.bridge.WritableMap
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.UIManagerHelper
import com.facebook.react.uimanager.events.Event

class YouTubePlayerView(private val reactContext: ThemedReactContext) :
    FrameLayout(reactContext),
    LifecycleEventListener {

    companion object {
        private const val TAG = "YouTubePlayerView"
        private const val EMBED_BASE_URL = "https://www.baprotege.ar"
        private val VALID_VIDEO_ID_REGEX = Regex("^[A-Za-z0-9_-]{6,20}$")

        const val EVENT_VIDEO_READY = "topYouTubeVideoReady"
        const val EVENT_VIDEO_END = "topYouTubeVideoEnd"
        const val EVENT_VIDEO_ERROR = "topYouTubeVideoError"
    }

    private val mainHandler = Handler(Looper.getMainLooper())
    private var webView: WebView? = null
    private var currentVideoId: String? = null
    private var isLifecycleRegistered = false
    private var isDestroyed = false

    init {
        setBackgroundColor(Color.BLACK)
        createWebView()
        registerLifecycle()
    }

    @SuppressLint("SetJavaScriptEnabled")
    private fun createWebView() {
        val wv = WebView(reactContext).apply {
            layoutParams = LayoutParams(LayoutParams.MATCH_PARENT, LayoutParams.MATCH_PARENT)
            setBackgroundColor(Color.BLACK)
            isVerticalScrollBarEnabled = false
            isHorizontalScrollBarEnabled = false

            settings.apply {
                javaScriptEnabled = true
                domStorageEnabled = true
                mediaPlaybackRequiresUserGesture = false
                loadWithOverviewMode = true
                useWideViewPort = true
                mixedContentMode = WebSettings.MIXED_CONTENT_COMPATIBILITY_MODE
                cacheMode = WebSettings.LOAD_DEFAULT
            }

            addJavascriptInterface(YouTubeJsBridge(), "AndroidYouTubeBridge")
            webChromeClient = WebChromeClient()
            webViewClient = object : WebViewClient() {
                override fun shouldOverrideUrlLoading(
                    view: WebView?,
                    request: WebResourceRequest?
                ): Boolean {
                    val host = request?.url?.host?.lowercase() ?: return true
                    val allowed = host.endsWith("youtube.com") ||
                        host.endsWith("youtube-nocookie.com") ||
                        host.endsWith("youtu.be") ||
                        host.endsWith("googlevideo.com") ||
                        host.endsWith("gstatic.com") ||
                        host.endsWith("google.com") ||
                        host.endsWith("baprotege.ar")
                    return !allowed
                }
            }
        }

        webView = wv
        addView(wv)
    }

    fun setVideoId(videoId: String?) {
        val sanitized = videoId?.trim()
        if (sanitized.isNullOrEmpty() || sanitized == currentVideoId) return
        if (!VALID_VIDEO_ID_REGEX.matches(sanitized)) {
            Log.w(TAG, "Video ID inválido: $sanitized")
            emitEvent(EVENT_VIDEO_ERROR, "ID de video inválido")
            return
        }

        currentVideoId = sanitized
        loadYouTubeEmbed(sanitized)
    }

    private fun loadYouTubeEmbed(videoId: String) {
        val wv = webView ?: return
        val encodedId = Uri.encode(videoId)

        val html = """
            <!DOCTYPE html>
            <html>
            <head>
              <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
              <style>
                * { margin: 0; padding: 0; box-sizing: border-box; }
                html, body { width: 100%; height: 100%; background-color: #000000; overflow: hidden; }
                #player { width: 100%; height: 100%; border: 0; display: block; }
              </style>
            </head>
            <body>
              <div id="player"></div>
              <script src="https://www.youtube.com/iframe_api"></script>
              <script>
                var ytPlayer = null;
                function onYouTubeIframeAPIReady() {
                  ytPlayer = new YT.Player('player', {
                    width: '100%',
                    height: '100%',
                    videoId: '$encodedId',
                    playerVars: {
                      autoplay: 1,
                      playsinline: 1,
                      rel: 0,
                      modestbranding: 1,
                      fs: 0,
                      controls: 1,
                      origin: '$EMBED_BASE_URL'
                    },
                    events: {
                      onReady: function(event) {
                        try { event.target.playVideo(); } catch (e) {}
                        if (window.AndroidYouTubeBridge) {
                          window.AndroidYouTubeBridge.onReady();
                        }
                      },
                      onStateChange: function(event) {
                        if (event.data === 0 && window.AndroidYouTubeBridge) {
                          window.AndroidYouTubeBridge.onEnded();
                        }
                      },
                      onError: function(event) {
                        if (window.AndroidYouTubeBridge) {
                          window.AndroidYouTubeBridge.onError(String(event.data));
                        }
                      }
                    }
                  });
                }
              </script>
            </body>
            </html>
        """.trimIndent()

        wv.loadDataWithBaseURL(EMBED_BASE_URL, html, "text/html", "utf-8", null)
    }

    private inner class YouTubeJsBridge {
        @JavascriptInterface
        fun onReady() {
            mainHandler.post {
                if (!isDestroyed) emitEvent(EVENT_VIDEO_READY)
            }
        }

        @JavascriptInterface
        fun onEnded() {
            mainHandler.post {
                if (!isDestroyed) emitEvent(EVENT_VIDEO_END)
            }
        }

        @JavascriptInterface
        fun onError(code: String?) {
            mainHandler.post {
                if (!isDestroyed) emitEvent(EVENT_VIDEO_ERROR, "YouTube error: ${code ?: "unknown"}")
            }
        }
    }

    override fun onHostResume() {
        webView?.onResume()
    }

    override fun onHostPause() {
        webView?.evaluateJavascript("if (window.ytPlayer && ytPlayer.pauseVideo) { ytPlayer.pauseVideo(); }", null)
        webView?.onPause()
    }

    override fun onHostDestroy() {
        cleanup()
    }

    fun cleanup() {
        if (isDestroyed) return
        isDestroyed = true
        unregisterLifecycle()
        webView?.let { wv ->
            try {
                wv.stopLoading()
                wv.loadUrl("about:blank")
                wv.removeJavascriptInterface("AndroidYouTubeBridge")
                wv.clearHistory()
                removeView(wv)
                wv.destroy()
            } catch (e: Exception) {
                Log.w(TAG, "Error limpiando WebView: ${e.message}")
            }
        }
        webView = null
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

    private fun emitEvent(eventName: String, message: String? = null) {
        val surfaceId = UIManagerHelper.getSurfaceId(reactContext)
        val dispatcher = UIManagerHelper.getEventDispatcherForReactTag(reactContext, id)
        dispatcher?.dispatchEvent(YouTubeVideoEvent(surfaceId, id, eventName, message))
    }

    private class YouTubeVideoEvent(
        surfaceId: Int,
        viewTag: Int,
        private val name: String,
        private val message: String?
    ) : Event<YouTubeVideoEvent>(surfaceId, viewTag) {
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
