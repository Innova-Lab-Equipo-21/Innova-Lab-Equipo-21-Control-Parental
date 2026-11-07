// ==============================================================================
// Proyecto: BA Protege+
// Componente: MenorCuentaSection
// Archivo: src/components/dashboard/protected/menor/MenorCuentaSection.tsx
// Descripción: Pestaña Cuenta del Modo Protegido Menor replicando la vista
//              institucional con tarjeta de perfil informativa, Ayuda y soporte,
//              Información legal y valoración, cierre de sesión y versión.
// ==============================================================================

import React from 'react';
import {
  View,
  Text,
  Image,
} from 'react-native';
import { ActionButton } from '../../../ActionButton';
import { HelpSection } from '../../cuenta/HelpSection';
import { LegalSection } from '../../cuenta/LegalSection';
import { BOTITO_ASSETS } from '../botAssets';
import { styles } from './MenorCuentaSection.styles';

export interface MenorCuentaSectionProps {
  deviceUuid: string;
  childName?: string;
  childPhone?: string;
  tutorName?: string;
  onOpenOnboarding: () => void;
  onExitMode: () => void;
}

export const MenorCuentaSection: React.FC<MenorCuentaSectionProps> = ({
  childName,
  childPhone,
  tutorName = 'Ana',
  onOpenOnboarding,
  onExitMode,
}) => {
  const displayName = childName?.trim() || 'Menor protegido';

  return (
    <View style={styles.container}>
      {/* 1. Tarjeta de Perfil (solo lectura para modo protegido) */}
      <View style={styles.profileCard}>
        <View style={styles.profileHeader}>
          <View style={styles.profileAvatarContainer}>
            <Image
              source={BOTITO_ASSETS.feliz}
              style={styles.avatarImage}
              resizeMode="contain"
            />
          </View>

          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{displayName}</Text>
            <Text style={styles.profileSubtitle}>
              Vinculado con responsable: {tutorName}
            </Text>
            {childPhone ? (
              <Text style={styles.profilePhone}>{childPhone}</Text>
            ) : null}

            <View style={styles.roleBadgeContainer}>
              <View style={styles.roleBadge}>
                <Text style={styles.roleBadgeText}>MENOR PROTEGIDO</Text>
              </View>
              <View style={styles.verifiedBadge}>
                <Text style={styles.verifiedBadgeText}>✓ Vinculado</Text>
              </View>
            </View>
          </View>
        </View>
      </View>

      {/* 2. Ayuda y soporte (Tutorial y Preguntas frecuentes) */}
      <HelpSection onOpenOnboarding={onOpenOnboarding} />

      {/* 3. Información legal y valoración (Términos, Privacidad y Evaluar la app) */}
      <LegalSection />

      {/* 4. Cerrar sesión */}
      <View style={styles.footer}>
        <ActionButton
          title="Cerrar sesión"
          variant="secondary"
          onPress={onExitMode}
        />
      </View>

      {/* 5. Versión de la app al final */}
      <View style={styles.versionFooter}>
        <Text style={styles.versionTitle}>
          BA Protege+ v1.0.0 (Build 2025.3)
        </Text>
        <Text style={styles.versionSubtitle}>
          Lotería de la Ciudad de Buenos Aires (LOTBA S.E.)
        </Text>
      </View>
    </View>
  );
};
