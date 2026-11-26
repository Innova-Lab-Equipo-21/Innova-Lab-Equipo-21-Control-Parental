/**
 * ==============================================================================
 * Proyecto: BA Protege+
 * Componente: Bridge React Native <-> Android Native (ViewManager de Video Splash)
 * Archivo: SplashVideoViewManager.kt
 * Descripción: Expone SplashVideoView como componente nativo de React Native
 *              para la pantalla de apertura del aplicativo.
 * ==============================================================================
 */

package com.baprotege.bridge

import com.facebook.react.uimanager.SimpleViewManager
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.annotations.ReactProp

class SplashVideoViewManager : SimpleViewManager<SplashVideoView>() {

    companion object {
        const val REACT_CLASS = "SplashVideoView"
    }

    override fun getName(): String = REACT_CLASS

    override fun createViewInstance(reactContext: ThemedReactContext): SplashVideoView {
        return SplashVideoView(reactContext)
    }

    override fun onDropViewInstance(view: SplashVideoView) {
        view.cleanup()
        super.onDropViewInstance(view)
    }

    @ReactProp(name = "resourceName")
    fun setResourceName(view: SplashVideoView, resourceName: String?) {
        view.setResourceName(resourceName)
    }

    @ReactProp(name = "muted", defaultBoolean = true)
    fun setMuted(view: SplashVideoView, muted: Boolean) {
        view.setMuted(muted)
    }

    @ReactProp(name = "repeat", defaultBoolean = false)
    fun setRepeat(view: SplashVideoView, repeat: Boolean) {
        view.setRepeat(repeat)
    }

    @ReactProp(name = "paused", defaultBoolean = false)
    fun setPaused(view: SplashVideoView, paused: Boolean) {
        view.setPaused(paused)
    }

    @ReactProp(name = "resizeMode")
    fun setResizeMode(view: SplashVideoView, resizeMode: String?) {
        view.setResizeMode(resizeMode)
    }

    override fun getExportedCustomDirectEventTypeConstants(): MutableMap<String, Any> {
        return mutableMapOf(
            SplashVideoView.EVENT_VIDEO_READY to mapOf("registrationName" to "onVideoReady"),
            SplashVideoView.EVENT_VIDEO_END to mapOf("registrationName" to "onVideoEnd"),
            SplashVideoView.EVENT_VIDEO_ERROR to mapOf("registrationName" to "onVideoError")
        )
    }
}
