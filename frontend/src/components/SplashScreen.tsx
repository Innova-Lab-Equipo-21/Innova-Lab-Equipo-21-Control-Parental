// ==============================================================================
// Proyecto: BA Protege+
// Componente: SplashScreen (Pantalla de Apertura con Video Vertical y Logo)
// Archivo: src/components/SplashScreen.tsx
// Descripción: Pantalla de abertura del app que reproduce el video vertical
//              hola_botito.mp4 a pantalla completa con logo_baprotege.png
//              centrado en la parte superior y transición suave de salida.
// ==============================================================================

import React, { useCallback, useEffect, useRef } from 'react';
import {
  Animated,
  Image,
  Platform,
  StatusBar,
  StyleSheet,
  View,
} from 'react-native';
import { SplashVideoView } from './SplashVideoView';

interface SplashScreenProps {
  onFinish: () => void;
}

const SPLASH_VIDEO_RESOURCE = 'hola_botito';
const FALLBACK_TIMEOUT_MS = 8500;
const ERROR_FALLBACK_DELAY_MS = 1800;

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const containerOpacity = useRef(new Animated.Value(1)).current;
  const videoOpacity = useRef(new Animated.Value(0)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoTranslateY = useRef(new Animated.Value(-12)).current;

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
    // Entrada suave del logotipo centrado en la parte superior
    Animated.parallel([
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(logoTranslateY, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

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
  }, [finishSplash, logoOpacity, logoTranslateY]);

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

      {/* Video vertical de abertura a pantalla completa */}
      <Animated.View style={[StyleSheet.absoluteFill, { opacity: videoOpacity }]}>
        <SplashVideoView
          resourceName={SPLASH_VIDEO_RESOURCE}
          resizeMode="cover"
          muted
          repeat={false}
          style={StyleSheet.absoluteFill}
          onVideoReady={handleVideoReady}
          onVideoEnd={handleVideoEnd}
          onVideoError={handleVideoError}
        />
      </Animated.View>

      {/* Logotipo oficial centrado en la parte superior */}
      <View style={styles.topLogoOverlay} pointerEvents="none">
        <Animated.View
          style={{
            opacity: logoOpacity,
            transform: [{ translateY: logoTranslateY }],
          }}
        >
          <Image
            source={require('../assets/logo/logo_baprotege.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
        </Animated.View>
      </View>
    </Animated.View>
  );
};

const TOP_INSET = Platform.OS === 'android' ? (StatusBar.currentHeight ?? 24) : 44;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  topLogoOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingTop: TOP_INSET + 28,
    paddingHorizontal: 24,
    alignItems: 'center',
    zIndex: 2,
  },
  logoImage: {
    width: 220,
    height: 96,
  },
});
