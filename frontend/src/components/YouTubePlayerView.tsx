// ==============================================================================
// Proyecto: BA Protege+
// Componente: YouTubePlayerView (Wrapper React Native del reproductor YouTube)
// Archivo: src/components/YouTubePlayerView.tsx
// Descripción: Envoltorio tipado para el ViewManager nativo Android
//              YouTubePlayerView usado en el Paso 3 del Onboarding.
// ==============================================================================

import React from 'react';
import {
  NativeSyntheticEvent,
  Platform,
  StyleProp,
  UIManager,
  View,
  ViewStyle,
  requireNativeComponent,
} from 'react-native';

export interface YouTubeVideoErrorEvent {
  message?: string;
}

export interface YouTubePlayerViewProps {
  videoId: string;
  style?: StyleProp<ViewStyle>;
  onVideoReady?: () => void;
  onVideoEnd?: () => void;
  onVideoError?: (event: NativeSyntheticEvent<YouTubeVideoErrorEvent>) => void;
}

const VIEW_NAME = 'YouTubePlayerView';

export function hasNativeYouTubePlayer(): boolean {
  if (Platform.OS !== 'android') return false;
  return UIManager.getViewManagerConfig(VIEW_NAME) != null;
}

const NativeYouTubePlayerView =
  Platform.OS === 'android'
    ? requireNativeComponent<YouTubePlayerViewProps>(VIEW_NAME)
    : null;

export const YouTubePlayerView: React.FC<YouTubePlayerViewProps> = (props) => {
  if (!NativeYouTubePlayerView || !hasNativeYouTubePlayer()) {
    return <View style={props.style} />;
  }

  return <NativeYouTubePlayerView {...props} />;
};
