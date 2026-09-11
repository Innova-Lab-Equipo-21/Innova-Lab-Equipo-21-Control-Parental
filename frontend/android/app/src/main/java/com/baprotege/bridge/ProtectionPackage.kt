/**
 * ==============================================================================
 * Proyecto: BA Protege+
 * Componente: Bridge React Native <-> Android Native
 * Archivo: ProtectionPackage.kt
 * Descripción: Registro del paquete de módulos nativos para React Native.
 * ==============================================================================
 */

package com.baprotege.bridge

import android.view.View
import com.facebook.react.ReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.uimanager.ReactShadowNode
import com.facebook.react.uimanager.ViewManager

class ProtectionPackage : ReactPackage {
    override fun createNativeModules(reactContext: ReactApplicationContext): List<NativeModule> {
        return listOf(ProtectionModule(reactContext))
    }

    override fun createViewManagers(reactContext: ReactApplicationContext): List<ViewManager<View, ReactShadowNode<*>>> {
        return emptyList()
    }
}
