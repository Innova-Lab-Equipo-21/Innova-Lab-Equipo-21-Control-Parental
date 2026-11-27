// ==============================================================================
// Proyecto: BA Protege+
// Componente: BotitoWelcomeVideoModal (Modal de Bienvenida con Video)
// Archivo: src/components/BotitoWelcomeVideoModal.tsx
// Descripción: Modal a pantalla completa que reproduce botito_bienvenida.mp4
//              mientras se crea una cuenta Responsable o se vincula un dispositivo
//              protegido, mostrando luego una frase divertida en español argentino
//              antes de avanzar a la siguiente pantalla.
// ==============================================================================

import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Image,
  Modal,
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SplashVideoView } from './SplashVideoView';
import { ActionButton } from './ActionButton';
import { colors } from '../theme/colors';
import { styles } from './BotitoWelcomeVideoModal.styles';

export const BOTITO_WELCOME_VIDEO_RESOURCE = 'botito_bienvenida';
export const MIN_WELCOME_VIDEO_MS = 2600;

export type WelcomeVideoStatus = 'loading' | 'success';

export interface BotitoWelcomeVideoModalProps {
  visible: boolean;
  status: WelcomeVideoStatus;
  loadingTitle: string;
  loadingSubtitle: string;
  successBadge?: string;
  successTitle: string;
  successMessage: string;
  ctaText?: string;
  onContinue?: () => void;
}

/**
 * Garantiza un tiempo mínimo de visualización del video de bienvenida para
 * que la transición resulte fluida incluso cuando el servidor responde rápido.
 */
export const ensureMinimumWelcomeVideoTime = async (
  startedAt: number,
  minMs: number = MIN_WELCOME_VIDEO_MS
): Promise<void> => {
  const elapsed = Date.now() - startedAt;
  const remaining = minMs - elapsed;
  if (remaining > 0) {
    await new Promise<void>((resolve) => setTimeout(resolve, remaining));
  }
};

export const BotitoWelcomeVideoModal: React.FC<BotitoWelcomeVideoModalProps> = ({
  visible,
  status,
  loadingTitle,
  loadingSubtitle,
  successBadge = '¡Todo listo!',
  successTitle,
  successMessage,
  ctaText = '¡Vamos!',
  onContinue,
}) => {
  const [hasVideoError, setHasVideoError] = useState(false);
  const videoOpacity = useRef(new Animated.Value(0)).current;
  const successOpacity = useRef(new Animated.Value(0)).current;
  const successTranslateY = useRef(new Animated.Value(14)).current;

  useEffect(() => {
    if (!visible) {
      setHasVideoError(false);
      videoOpacity.setValue(0);
      successOpacity.setValue(0);
      successTranslateY.setValue(14);
      return;
    }

    const readyFallback = setTimeout(() => {
      Animated.timing(videoOpacity, {
        toValue: 1,
        duration: 240,
        useNativeDriver: true,
      }).start();
    }, 450);

    return () => clearTimeout(readyFallback);
  }, [visible, videoOpacity, successOpacity, successTranslateY]);

  useEffect(() => {
    if (visible && status === 'success') {
      successOpacity.setValue(0);
      successTranslateY.setValue(14);
      Animated.parallel([
        Animated.timing(successOpacity, {
          toValue: 1,
          duration: 320,
          useNativeDriver: true,
        }),
        Animated.timing(successTranslateY, {
          toValue: 0,
          duration: 320,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, status, successOpacity, successTranslateY]);

  const handleVideoReady = useCallback(() => {
    Animated.timing(videoOpacity, {
      toValue: 1,
      duration: 240,
      useNativeDriver: true,
    }).start();
  }, [videoOpacity]);

  const handleVideoError = useCallback(() => {
    setHasVideoError(true);
    videoOpacity.setValue(1);
  }, [videoOpacity]);

  if (!visible) {
    return null;
  }

  const shouldRenderNativeVideo = Platform.OS === 'android' && !hasVideoError;

  return (
    <Modal
      visible={visible}
      transparent={false}
      animationType="fade"
      statusBarTranslucent
      onRequestClose={() => {
        if (status === 'success' && onContinue) {
          onContinue();
        }
      }}
    >
      <SafeAreaView style={styles.safeArea}>
        <StatusBar
          translucent
          backgroundColor="#FFFFFF"
          barStyle="dark-content"
        />

        <View style={styles.container}>
          {/* Video vertical de Botito */}
          <View style={styles.videoSection}>
            <Animated.View style={[styles.videoFrame, { opacity: videoOpacity }]}>
              {shouldRenderNativeVideo ? (
                <SplashVideoView
                  resourceName={BOTITO_WELCOME_VIDEO_RESOURCE}
                  resizeMode="contain"
                  muted={false}
                  repeat
                  paused={false}
                  style={StyleSheet.absoluteFill}
                  onVideoReady={handleVideoReady}
                  onVideoError={handleVideoError}
                />
              ) : (
                <Image
                  source={require('../assets/icons/bot/menor/botito_feliz.png')}
                  style={styles.fallbackImage}
                  resizeMode="contain"
                />
              )}
            </Animated.View>
          </View>

          {/* Estado inferior: procesando en servidor o frase divertida de éxito */}
          <View style={styles.bottomSection}>
            {status === 'loading' ? (
              <View style={styles.loadingBox}>
                <View style={styles.loadingPill}>
                  <ActivityIndicator size="small" color={colors.primary} />
                  <Text style={styles.loadingTitle}>{loadingTitle}</Text>
                </View>
                <Text style={styles.loadingSubtitle}>{loadingSubtitle}</Text>
              </View>
            ) : (
              <Animated.View
                style={[
                  styles.successBox,
                  {
                    opacity: successOpacity,
                    transform: [{ translateY: successTranslateY }],
                  },
                ]}
              >
                {successBadge && successBadge.trim().length > 0 ? (
                  <View style={styles.successBadge}>
                    <Text style={styles.successBadgeText}>{successBadge}</Text>
                  </View>
                ) : null}
                <Text style={styles.successTitle}>{successTitle}</Text>
                <Text style={styles.successMessage}>{successMessage}</Text>
                <View style={styles.ctaWrapper}>
                  <ActionButton
                    title={ctaText}
                    variant="primary"
                    onPress={() => onContinue?.()}
                  />
                </View>
              </Animated.View>
            )}
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
};
