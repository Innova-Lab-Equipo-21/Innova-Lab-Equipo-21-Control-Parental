// ==============================================================================
// Proyecto: BA Protege+
// Componente: DatePickerModal (Modal de Selección de Calendario)
// Archivo: src/components/auth/DatePickerModal.tsx
// Descripción: Modal interactivo para selección de fecha de nacimiento con
//              ajuste dinámico de días por mes/año y verificación de mayoría
//              de edad (+18) para el Modo Responsable.
// ==============================================================================

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { styles } from './RegisterForm.styles';

export interface DatePickerModalProps {
  visible: boolean;
  initialDate?: string;
  onClose: () => void;
  onConfirm: (formattedDate: string) => void;
}

export const DatePickerModal: React.FC<DatePickerModalProps> = ({
  visible,
  initialDate,
  onClose,
  onConfirm,
}) => {
  const [selectedDay, setSelectedDay] = useState<number>(15);
  const [selectedMonth, setSelectedMonth] = useState<number>(6); // Junio
  const [selectedYear, setSelectedYear] = useState<number>(2000);

  useEffect(() => {
    if (visible && initialDate && initialDate.length === 10) {
      const [d, m, y] = initialDate.split('/').map(Number);
      if (d && m && y && !isNaN(d) && !isNaN(m) && !isNaN(y)) {
        setSelectedDay(d);
        setSelectedMonth(m);
        setSelectedYear(y);
      }
    }
  }, [visible, initialDate]);

  /** Devuelve el número real de días del mes y año seleccionados */
  const getDaysInMonth = (month: number, year: number): number => {
    return new Date(year, month, 0).getDate();
  };

  const daysInCurrentMonth = getDaysInMonth(selectedMonth, selectedYear);

  const handleMonthChange = (month: number) => {
    setSelectedMonth(month);
    const maxDays = getDaysInMonth(month, selectedYear);
    if (selectedDay > maxDays) {
      setSelectedDay(maxDays);
    }
  };

  const handleYearChange = (year: number) => {
    setSelectedYear(year);
    const maxDays = getDaysInMonth(selectedMonth, year);
    if (selectedDay > maxDays) {
      setSelectedDay(maxDays);
    }
  };

  const handleConfirm = () => {
    const maxDays = getDaysInMonth(selectedMonth, selectedYear);
    const validDay = Math.min(selectedDay, maxDays);
    const dayStr = validDay.toString().padStart(2, '0');
    const monthStr = selectedMonth.toString().padStart(2, '0');
    const formattedStr = `${dayStr}/${monthStr}/${selectedYear}`;
    onConfirm(formattedStr);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <View style={styles.modalCard} onStartShouldSetResponder={() => true}>
          <Text style={styles.modalTitle}>📅 Seleccionar Fecha de Nacimiento</Text>
          <Text style={styles.modalSubtitle}>
            Elige tu fecha para verificar la mayoría de edad (+18)
          </Text>

          {/* Selectores de Día, Mes y Año con límites reales de días */}
          <View style={styles.pickerRow}>
            {/* Día */}
            <View style={styles.pickerColumn}>
              <Text style={styles.pickerLabel}>Día</Text>
              <ScrollView style={styles.pickerScrollView} showsVerticalScrollIndicator={false}>
                {Array.from({ length: daysInCurrentMonth }, (_, i) => i + 1).map((d) => (
                  <TouchableOpacity
                    key={d}
                    style={[styles.pickerItem, selectedDay === d && styles.pickerItemSelected]}
                    onPress={() => setSelectedDay(d)}
                  >
                    <Text style={[styles.pickerItemText, selectedDay === d && styles.pickerItemTextSelected]}>
                      {d.toString().padStart(2, '0')}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Mes */}
            <View style={styles.pickerColumn}>
              <Text style={styles.pickerLabel}>Mes</Text>
              <ScrollView style={styles.pickerScrollView} showsVerticalScrollIndicator={false}>
                {[
                  'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
                  'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic',
                ].map((m, idx) => (
                  <TouchableOpacity
                    key={m}
                    style={[styles.pickerItem, selectedMonth === idx + 1 && styles.pickerItemSelected]}
                    onPress={() => handleMonthChange(idx + 1)}
                  >
                    <Text style={[styles.pickerItemText, selectedMonth === idx + 1 && styles.pickerItemTextSelected]}>
                      {m}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Año */}
            <View style={styles.pickerColumn}>
              <Text style={styles.pickerLabel}>Año</Text>
              <ScrollView style={styles.pickerScrollView} showsVerticalScrollIndicator={false}>
                {Array.from({ length: 100 }, (_, i) => 2026 - i).map((y) => (
                  <TouchableOpacity
                    key={y}
                    style={[styles.pickerItem, selectedYear === y && styles.pickerItemSelected]}
                    onPress={() => handleYearChange(y)}
                  >
                    <Text style={[styles.pickerItemText, selectedYear === y && styles.pickerItemTextSelected]}>
                      {y}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>

          <View style={styles.modalButtonRow}>
            <TouchableOpacity
              style={styles.modalCancelBtn}
              onPress={onClose}
            >
              <Text style={styles.modalCancelBtnText}>Cancelar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalConfirmBtn}
              onPress={handleConfirm}
            >
              <Text style={styles.modalConfirmBtnText}>Confirmar Fecha</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};
