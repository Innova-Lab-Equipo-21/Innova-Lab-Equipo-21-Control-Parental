// ==============================================================================
// Proyecto: BA Protege+
// Componente: PinKeyboard (Teclado PIN UI Kit)
// Archivo: src/components/PinKeyboard.tsx
// ==============================================================================

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';

interface PinKeyboardProps {
  onKeyPress: (key: string) => void;
  onDelete: () => void;
  onClear?: () => void;
}

export const PinKeyboard: React.FC<PinKeyboardProps> = ({
  onKeyPress,
  onDelete,
  onClear,
}) => {
  const keys = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['clear', '0', 'delete'],
  ];

  const handlePress = (key: string) => {
    if (key === 'delete') {
      onDelete();
    } else if (key === 'clear') {
      if (onClear) onClear();
    } else {
      onKeyPress(key);
    }
  };

  return (
    <View style={styles.container}>
      {keys.map((row, rowIndex) => (
        <View key={rowIndex} style={styles.row}>
          {row.map((key) => {
            if (key === 'clear') {
              return (
                <TouchableOpacity
                  key={key}
                  style={[styles.keyButton, styles.specialKey]}
                  onPress={() => handlePress(key)}
                >
                  <Text style={styles.specialKeyText}>Limpiar</Text>
                </TouchableOpacity>
              );
            }
            if (key === 'delete') {
              return (
                <TouchableOpacity
                  key={key}
                  style={[styles.keyButton, styles.specialKey]}
                  onPress={() => handlePress(key)}
                >
                  <Text style={styles.specialKeyText}>⌫</Text>
                </TouchableOpacity>
              );
            }
            return (
              <TouchableOpacity
                key={key}
                style={styles.keyButton}
                onPress={() => handlePress(key)}
              >
                <Text style={styles.keyText}>{key}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    maxWidth: 320,
    alignSelf: 'center',
    paddingVertical: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 6,
  },
  keyButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderLight,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  keyText: {
    ...typography.header,
    color: colors.textPrimary,
  },
  specialKey: {
    backgroundColor: colors.background,
  },
  specialKeyText: {
    ...typography.body,
    fontWeight: '600',
    color: colors.textSecondary,
  },
});
