// ==============================================================================
// Proyecto: BA Protege+
// Componente: SplashVideoView (Wrapper React Native del reproductor nativo)
// Archivo: src/components/SplashVideoView.tsx
// Descripción: Envoltorio tipado para el ViewManager nativo Android
//              SplashVideoView usado en la pantalla de apertura del app.
// ==============================================================================

import React from 'react';
import {
  NativeSyntheticEvent,
  Platform,
  StyleProp,
  View,
  ViewStyle,
  requireNativeComponent,
} from 'react-native';

export interface SplashVideoErrorEvent {
  message?: string;
}

export interface SplashVideoViewProps {
  resourceName: string;
  muted?: boolean;
  repeat?: boolean;
  resizeMode?: 'cover' | 'contain';
  style?: StyleProp<ViewStyle>;
  onVideoReady?: () => void;
  onVideoEnd?: () => void;
  onVideoError?: (event: NativeSyntheticEvent<SplashVideoErrorEvent>) => void;
}

const NativeSplashVideoView =
  Platform.OS === 'android'
    ? requireNativeComponent<SplashVideoViewProps>('SplashVideoView')
    : null;

export const SplashVideoView: React.FC<SplashVideoViewProps> = (props) => {
  if (!NativeSplashVideoView) {
    return <View style={props.style} />;
  }

  return <NativeSplashVideoView {...props} />;
};
