// ==============================================================================
// Proyecto: BA Protege+
// Componente: SplashScreen (Pantalla de Bienvenida con Animación Suave)
// Archivo: src/components/SplashScreen.tsx
// Descripción: Splash screen animado al abrir la aplicación con logo_baprotege.png,
//              animación de escala, desvanecimiento y desvanecimiento final.
// ==============================================================================

import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Image, StatusBar } from 'react-native';
import { colors } from '../theme/colors';

interface SplashScreenProps {
  onFinish: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.85)).current;
  const subtitleFade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Sequência de animação ao abrir o app
    Animated.sequence([
      // 1. Entrada suave com opacidade e escala (0ms - 800ms)
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 6,
          tension: 40,
          useNativeDriver: true,
        }),
      ]),
      // 2. Aparecimento suave do subtítulo (800ms - 1200ms)
      Animated.timing(subtitleFade, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      // 3. Pausa para visualização (1200ms - 2000ms)
      Animated.delay(800),
      // 4. Saída suave com desvanecimiento (2000ms - 2400ms)
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onFinish();
    });
  }, [fadeAnim, scaleAnim, subtitleFade, onFinish]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <Image
          source={require('../assets/logo/logo_baprotege.png')}
          style={styles.logoImage}
          resizeMode="contain"
        />

        <Animated.View style={{ opacity: subtitleFade }}>
          <Text style={styles.subtitle}>Control Parental y Protección Digital</Text>
          <View style={styles.badgeLine}>
            <Text style={styles.badgeText}>Gobernanza de Buenos Aires</Text>
          </View>
        </Animated.View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  logoImage: {
    width: 240,
    height: 105,
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary || '#64748B',
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  badgeLine: {
    marginTop: 12,
    backgroundColor: '#EAF3FF',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 12,
    alignSelf: 'center',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary || '#007AFF',
  },
});
