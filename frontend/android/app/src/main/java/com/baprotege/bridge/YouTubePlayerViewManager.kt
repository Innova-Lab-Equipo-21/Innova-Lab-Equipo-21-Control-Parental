/**
 * ==============================================================================
 * Proyecto: BA Protege+
 * Componente: Bridge React Native <-> Android Native (ViewManager YouTube)
 * Archivo: YouTubePlayerViewManager.kt
 * Descripción: Expone YouTubePlayerView como componente nativo de React Native
 *              para reproducir el video explicativo del Onboarding Paso 3.
 * ==============================================================================
 */

package com.baprotege.bridge

import com.facebook.react.uimanager.SimpleViewManager
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.annotations.ReactProp

class YouTubePlayerViewManager : SimpleViewManager<YouTubePlayerView>() {

    companion object {
        const val REACT_CLASS = "YouTubePlayerView"
    }

    override fun getName(): String = REACT_CLASS

    override fun createViewInstance(reactContext: ThemedReactContext): YouTubePlayerView {
        return YouTubePlayerView(reactContext)
    }

    override fun onDropViewInstance(view: YouTubePlayerView) {
        view.cleanup()
        super.onDropViewInstance(view)
    }

    @ReactProp(name = "videoId")
    fun setVideoId(view: YouTubePlayerView, videoId: String?) {
        view.setVideoId(videoId)
    }

    override fun getExportedCustomDirectEventTypeConstants(): MutableMap<String, Any> {
        return mutableMapOf(
            YouTubePlayerView.EVENT_VIDEO_READY to mapOf("registrationName" to "onVideoReady"),
            YouTubePlayerView.EVENT_VIDEO_END to mapOf("registrationName" to "onVideoEnd"),
            YouTubePlayerView.EVENT_VIDEO_ERROR to mapOf("registrationName" to "onVideoError")
        )
    }
}
