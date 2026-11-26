// ==============================================================================
// Proyecto: BA Protege+
// Componente: SplashScreen (Pantalla de Apertura con Video Centrado)
// Archivo: src/components/SplashScreen.tsx
// Descripción: Pantalla de abertura del app que reproduce únicamente el video
//              apertura.mp4 centrado con márgenes delicados sin invadir los bordes
//              y transición suave de salida.
// ==============================================================================

import React, { useCallback, useEffect, useRef } from 'react';
import {
  Animated,
  StatusBar,
  StyleSheet,
  View,
} from 'react-native';
import { SplashVideoView } from './SplashVideoView';

interface SplashScreenProps {
  onFinish: () => void;
}

const SPLASH_VIDEO_RESOURCE = 'apertura';
const FALLBACK_TIMEOUT_MS = 11500;
const ERROR_FALLBACK_DELAY_MS = 1800;

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const containerOpacity = useRef(new Animated.Value(1)).current;
  const videoOpacity = useRef(new Animated.Value(0)).current;

  const hasFinishedRef = useRef<boolean>(false);
  const fallbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const errorTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const finishSplash = useCallback(() => {
    if (hasFinishedRef.current) return;
    hasFinishedRef.current = true;

    if (fallbackTimerRef.current) {
      clearTimeout(fallbackTimerRef.current);
      fallbackTimerRef.current = null;
    }
    if (errorTimerRef.current) {
      clearTimeout(errorTimerRef.current);
      errorTimerRef.current = null;
    }

    Animated.timing(containerOpacity, {
      toValue: 0,
      duration: 350,
      useNativeDriver: true,
    }).start(() => {
      onFinish();
    });
  }, [containerOpacity, onFinish]);

  useEffect(() => {
    // Respaldo de seguridad para garantizar que la pantalla siempre avance
    fallbackTimerRef.current = setTimeout(() => {
      finishSplash();
    }, FALLBACK_TIMEOUT_MS);

    return () => {
      if (fallbackTimerRef.current) {
        clearTimeout(fallbackTimerRef.current);
      }
      if (errorTimerRef.current) {
        clearTimeout(errorTimerRef.current);
      }
    };
  }, [finishSplash]);

  const handleVideoReady = useCallback(() => {
    Animated.timing(videoOpacity, {
      toValue: 1,
      duration: 250,
      useNativeDriver: true,
    }).start();
  }, [videoOpacity]);

  const handleVideoEnd = useCallback(() => {
    finishSplash();
  }, [finishSplash]);

  const handleVideoError = useCallback(() => {
    if (hasFinishedRef.current || errorTimerRef.current) return;
    errorTimerRef.current = setTimeout(() => {
      finishSplash();
    }, ERROR_FALLBACK_DELAY_MS);
  }, [finishSplash]);

  return (
    <Animated.View style={[styles.container, { opacity: containerOpacity }]}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="dark-content"
      />

      {/* Video de apertura centrado y proporcionado sin invadir los bordes */}
      <View style={styles.videoCenterWrapper}>
        <Animated.View style={[styles.videoFrame, { opacity: videoOpacity }]}>
          <SplashVideoView
            resourceName={SPLASH_VIDEO_RESOURCE}
            resizeMode="contain"
            muted
            repeat={false}
            style={StyleSheet.absoluteFill}
            onVideoReady={handleVideoReady}
            onVideoEnd={handleVideoEnd}
            onVideoError={handleVideoError}
          />
        </Animated.View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  videoCenterWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 48,
    paddingVertical: 64,
  },
  videoFrame: {
    width: '72%',
    maxWidth: 280,
    aspectRatio: 480 / 848,
    overflow: 'hidden',
  },
});
