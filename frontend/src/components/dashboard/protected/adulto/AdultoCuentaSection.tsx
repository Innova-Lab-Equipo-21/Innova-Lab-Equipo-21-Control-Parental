// ==============================================================================
// Proyecto: BA Protege+
// Componente: AdultoCuentaSection
// Archivo: src/components/dashboard/protected/adulto/AdultoCuentaSection.tsx
// Descripción: Pestaña Cuenta del Modo Protegido Adulto replicando la vista
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
import { BOTI_ASSETS } from '../botAssets';
import { styles } from './AdultoCuentaSection.styles';

export interface AdultoCuentaSectionProps {
  deviceUuid: string;
  adultName?: string;
  adultPhone?: string;
  tutorName?: string;
  onOpenOnboarding: () => void;
  onExitMode: () => void;
}

export const AdultoCuentaSection: React.FC<AdultoCuentaSectionProps> = ({
  adultName,
  adultPhone,
  tutorName = 'Ana',
  onOpenOnboarding,
  onExitMode,
}) => {
  const displayName = adultName?.trim() || 'Adulto protegido';

  return (
    <View style={styles.container}>
      {/* 1. Tarjeta de Perfil (solo lectura para modo protegido) */}
      <View style={styles.profileCard}>
        <View style={styles.profileHeader}>
          <View style={styles.profileAvatarContainer}>
            <Image
              source={BOTI_ASSETS.feliz}
              style={styles.avatarImage}
              resizeMode="contain"
            />
          </View>

          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{displayName}</Text>
            <Text style={styles.profileSubtitle}>
              Vinculado con responsable: {tutorName}
            </Text>
            {adultPhone ? (
              <Text style={styles.profilePhone}>{adultPhone}</Text>
            ) : null}

            <View style={styles.roleBadgeContainer}>
              <View style={styles.roleBadge}>
                <Text style={styles.roleBadgeText}>ADULTO PROTEGIDO</Text>
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
