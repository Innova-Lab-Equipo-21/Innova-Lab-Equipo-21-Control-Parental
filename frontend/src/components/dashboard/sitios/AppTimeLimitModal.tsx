// ==============================================================================
// Proyecto: BA Protege+
// Componente: AppTimeLimitModal (Modal para Configurar Límite de Tiempo Diario de App)
// Archivo: src/components/dashboard/sitios/AppTimeLimitModal.tsx
// ==============================================================================

import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal, Image } from 'react-native';
import { ActionButton } from '../../ActionButton';
import { colors } from '../../../theme/colors';
import { CustomBlockedApp } from '../../../types';
import { styles } from './CustomSitesSection.styles';

interface AppTimeLimitModalProps {
  app: CustomBlockedApp | null;
  onClose: () => void;
  loading: boolean;
  onSave: (dailyLimitMinutes?: number) => void;
}

const TIME_LIMIT_OPTIONS = [
  { label: 'Bloqueo total', value: undefined },
  { label: '30 min', value: 30 },
  { label: '1 hora', value: 60 },
  { label: '2 horas', value: 120 },
  { label: '5 horas', value: 300 },
];

export const AppTimeLimitModal: React.FC<AppTimeLimitModalProps> = ({
  app,
  onClose,
  loading,
  onSave,
}) => {
  const [selectedLimit, setSelectedLimit] = useState<number | undefined>(app?.dailyLimitMinutes);

  useEffect(() => {
    setSelectedLimit(app?.dailyLimitMinutes);
  }, [app]);

  return (
    <Modal
      visible={!!app}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.bottomSheetOverlay}>
        <View style={styles.bottomSheetModalContent}>
          {/* Manija táctil del Bottom Sheet */}
          <View style={styles.bottomSheetHandle} />

          {/* Encabezado */}
          <View style={styles.sheetHeaderRow}>
            <Text style={styles.sheetTitle}>Tiempo de uso diario</Text>
            <TouchableOpacity
              style={styles.sheetCloseBtn}
              onPress={onClose}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              accessibilityLabel="Cerrar modal"
            >
              <Text style={styles.sheetCloseText}>✕</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.sheetSubtitle}>
            Definí el límite máximo diario para {app?.appName || 'la aplicación'}.
          </Text>

          <View style={{ marginVertical: 10 }}>
            {TIME_LIMIT_OPTIONS.map((opt) => {
              const isSelected = selectedLimit === opt.value;
              return (
                <TouchableOpacity
                  key={opt.label}
                  style={[
                    styles.deviceRow,
                    {
                      paddingVertical: 10,
                      paddingHorizontal: 12,
                      borderRadius: 10,
                      borderWidth: 1,
                      borderColor: isSelected ? colors.primary : colors.borderLight,
                      backgroundColor: isSelected ? '#E7F1FF' : '#FFFFFF',
                      marginBottom: 6,
                    },
                  ]}
                  onPress={() => setSelectedLimit(opt.value)}
                  activeOpacity={0.7}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                    <Text
                      style={{
                        fontSize: 13,
                        fontWeight: isSelected ? '700' : '500',
                        color: isSelected ? colors.primary : colors.textPrimary,
                      }}
                    >
                      {opt.label}
                    </Text>
                  </View>
                  <View
                    style={{
                      width: 18,
                      height: 18,
                      borderRadius: 9,
                      borderWidth: 2,
                      borderColor: isSelected ? colors.primary : colors.border,
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: isSelected ? colors.primary : 'transparent',
                    }}
                  >
                    {isSelected && (
                      <View
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: 4,
                          backgroundColor: '#FFFFFF',
                        }}
                      />
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={{ flexDirection: 'row', gap: 12, marginTop: 8 }}>
            <View style={{ flex: 1 }}>
              <ActionButton
                title="Cancelar"
                variant="secondary"
                onPress={onClose}
              />
            </View>
            <View style={{ flex: 1 }}>
              <ActionButton
                title="Guardar"
                variant="primary"
                loading={loading}
                onPress={() => onSave(selectedLimit)}
              />
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};
