// ==============================================================================
// Proyecto: BA Protege+
// Componente: PairingSection (Vinculación de Dispositivos y Código QR)
// Archivo: src/components/dashboard/PairingSection.tsx
// ==============================================================================

import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { ActionButton } from '../ActionButton';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { MAX_PARENT_DEVICES } from '../../types';

interface PairingSectionProps {
  pairingCode: string | null;
  deviceCount: number;
  loading: boolean;
  onGenerateCode: () => void;
}

export const PairingSection: React.FC<PairingSectionProps> = ({
  pairingCode,
  deviceCount,
  loading,
  onGenerateCode,
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.descText}>
        Genera un código o muestra el QR para vincular el celular del menor (Máximo {MAX_PARENT_DEVICES} dispositivos).
      </Text>

      {pairingCode ? (
        <View style={styles.codeDisplayCard}>
          <View style={styles.codeDisplay}>
            <Text style={styles.codeNumber}>{pairingCode}</Text>
            <Text style={styles.codeExpiry}>Válido por 15 minutos</Text>
          </View>

          <View style={styles.qrCodeBox}>
            <Text style={styles.qrTitle}>Código QR de Vinculación</Text>
            <Text style={styles.qrSubtitle}>
              Apunta la cámara del celular del menor aquí para vincular
            </Text>

            <View style={styles.qrImageContainer}>
              <Image
                source={{
                  uri: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${pairingCode}&color=007AFF&bgcolor=FFFFFF`,
                }}
                style={styles.qrImage}
                resizeMode="contain"
              />
            </View>
          </View>
        </View>
      ) : null}

      <ActionButton
        title={pairingCode ? 'Generar Nuevo Código' : 'Generar Código y QR de Vinculación'}
        variant="secondary"
        onPress={onGenerateCode}
        loading={loading}
        disabled={deviceCount >= MAX_PARENT_DEVICES}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 4,
  },
  descText: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 16,
    marginBottom: 8,
  },
  codeDisplayCard: {
    marginVertical: 8,
  },
  codeDisplay: {
    backgroundColor: colors.primaryLight,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    marginBottom: 8,
  },
  codeNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    letterSpacing: 6,
    color: colors.primaryDark,
  },
  codeExpiry: {
    ...typography.caption,
    color: colors.primaryDark,
    marginTop: 2,
  },
  qrCodeBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#C7D2FE',
    borderStyle: 'dashed',
    padding: 12,
    alignItems: 'center',
  },
  qrTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  qrSubtitle: {
    fontSize: 11,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 2,
    marginBottom: 8,
  },
  qrImageContainer: {
    padding: 6,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  qrImage: {
    width: 130,
    height: 130,
  },
});
