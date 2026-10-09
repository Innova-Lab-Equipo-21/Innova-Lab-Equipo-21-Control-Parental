// ==============================================================================
// Proyecto: BA Protege+
// Componente: PairingSection (Vinculación de Dispositivos y Código QR)
// Archivo: src/components/dashboard/dispositivos/PairingSection.tsx
// Descripción: Formulario previo a la generación de código con campos obligatorios
//              (Nombre, Género, Tipo Menor/Adulto, Fecha de Nacimiento si Menor con
//              icono de calendario y modal interactivo, Teléfono) y opcional (Modelo).
// ==============================================================================

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  StyleSheet,
  Share,
  Alert,
  Modal,
} from 'react-native';
import { ActionButton } from '../../ActionButton';
import { colors } from '../../../theme/colors';
import { typography } from '../../../theme/typography';
import { MAX_PARENT_DEVICES } from '../../../types';
import { calculateAge } from '../../../utils/age';
import {
  formatBirthDate,
  formatPhone,
  validateLettersOnly,
} from '../../../utils/authValidation';

export type GenderOption = 'Masculino' | 'Femenino' | 'Otro' | 'No informado';

export interface PairingFormData {
  protectedName: string;
  genero: GenderOption;
  protectedType: 'Menor' | 'Adulto';
  birthDate?: string;
  protectedPhone: string;
  deviceModel?: string;
}

interface PairingSectionProps {
  pairingCode: string | null;
  deviceCount: number;
  loading: boolean;
  onGenerateCode: (data?: PairingFormData) => void;
}

export const PairingSection: React.FC<PairingSectionProps> = ({
  pairingCode,
  deviceCount,
  loading,
  onGenerateCode,
}) => {
  const [protectedName, setProtectedName] = useState('Sofía');
  const [genero, setGenero] = useState<GenderOption>('Femenino');
  const [protectedType, setProtectedType] = useState<'Menor' | 'Adulto'>('Menor');
  const [birthDate, setBirthDate] = useState('15/05/2012');
  const [protectedPhone, setProtectedPhone] = useState('11 2345-6789');
  const [deviceModel, setDeviceModel] = useState('');

  // Estados para Modal de Calendario
  const [showDatePickerModal, setShowDatePickerModal] = useState(false);
  const [selectedDay, setSelectedDay] = useState<number>(15);
  const [selectedMonth, setSelectedMonth] = useState<number>(5); // Mayo
  const [selectedYear, setSelectedYear] = useState<number>(2012);

  const [errors, setErrors] = useState<{
    protectedName?: string;
    genero?: string;
    birthDate?: string;
    protectedPhone?: string;
  }>({});

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

  const handleValidationAndGenerate = () => {
    const newErrors: {
      protectedName?: string;
      genero?: string;
      birthDate?: string;
      protectedPhone?: string;
    } = {};

    // 1. Validación de Nombre del Protegido
    const trimmedName = protectedName.trim();
    if (!trimmedName) {
      newErrors.protectedName = 'El nombre del protegido es obligatorio.';
    } else if (trimmedName.length < 2) {
      newErrors.protectedName = 'El nombre debe tener al menos 2 caracteres.';
    } else if (!validateLettersOnly(trimmedName)) {
      newErrors.protectedName = 'El nombre solo debe contener letras y espacios.';
    }

    // 2. Validación de Género (Obligatorio)
    if (!genero) {
      newErrors.genero = 'El género es obligatorio.';
    }

    // 3. Validación de Fecha de Nacimiento (Obligatorio únicamente cuando el Tipo es 'Menor')
    if (protectedType === 'Menor') {
      const trimmedBirth = birthDate.trim();
      if (!trimmedBirth) {
        newErrors.birthDate = 'La fecha de nacimiento es obligatoria para un menor.';
      } else if (trimmedBirth.length !== 10) {
        newErrors.birthDate = 'Formato inválido. Debe ser DD/MM/AAAA.';
      } else {
        const age = calculateAge(trimmedBirth);
        if (age === null) {
          newErrors.birthDate = 'Fecha de nacimiento inválida.';
        } else if (age >= 18) {
          newErrors.birthDate = 'La fecha ingresada debe corresponder a un menor de 18 años.';
        }
      }
    }

    // 4. Validación de Teléfono (Obligatorio, mínimo 10 dígitos)
    const phoneDigits = protectedPhone.replace(/\D/g, '');
    if (!protectedPhone.trim()) {
      newErrors.protectedPhone = 'El teléfono es obligatorio.';
    } else if (phoneDigits.length < 10) {
      newErrors.protectedPhone = 'El teléfono debe contener al menos 10 dígitos (ej. 11 2345-6789).';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      return;
    }

    onGenerateCode({
      protectedName: trimmedName,
      genero,
      protectedType,
      birthDate: protectedType === 'Menor' ? birthDate.trim() : undefined,
      protectedPhone: protectedPhone.trim(),
      deviceModel: deviceModel.trim() || undefined,
    });
  };

  const handleShareCode = async () => {
    if (!pairingCode) return;

    const message = `BA Protege+ • Código de vinculación para ${protectedName || 'Dispositivo'} (${protectedType}): ${pairingCode}. Válido por 15 minutos.`;

    try {
      const result = await Share.share({
        title: 'Código de Vinculación BA Protege+',
        message,
      });

      if (result.action === Share.sharedAction) {
        Alert.alert('Código Compartido', 'El código de vinculación ha sido enviado.');
      }
    } catch (error: any) {
      Alert.alert('Código para Compartir', message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.descText}>
        Completa los datos requeridos para generar el código y QR de vinculación (Máximo {MAX_PARENT_DEVICES} dispositivos).
      </Text>

      {/* FORMULARIO DE DATOS DEL PROTEGIDO */}
      <View style={styles.formCard}>
        {/* Campo 1: Nombre del protegido (*) */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>
            Nombre del protegido <Text style={styles.requiredAsterisk}>*</Text>
          </Text>
          <TextInput
            style={[
              styles.input,
              errors.protectedName ? styles.inputErrorBorder : null,
            ]}
            value={protectedName}
            onChangeText={(text) => {
              setProtectedName(text);
              if (errors.protectedName) {
                setErrors((prev) => ({ ...prev, protectedName: undefined }));
              }
            }}
            placeholder="Ej: Sofía"
            placeholderTextColor={colors.textMuted}
          />
          {errors.protectedName && (
            <Text style={styles.errorText}>⚠️ {errors.protectedName}</Text>
          )}
        </View>

        {/* Campo 2: Género (*) en Carrusel Horizontal */}
        <View style={styles.fieldGroup}>
          <View style={styles.labelRow}>
            <Text style={styles.label}>
              Género <Text style={styles.requiredAsterisk}>*</Text>
            </Text>
            <Text style={styles.carouselHint}>Desliza para elegir ▸</Text>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.genderCarouselContainer}
          >
            {(
              [
                { id: 'Masculino', label: 'Masculino' },
                { id: 'Femenino', label: 'Femenino' },
                { id: 'Otro', label: 'Otro' },
                { id: 'No informado', label: 'No informado' },
              ] as { id: GenderOption; label: string }[]
            ).map((item) => {
              const isSelected = genero === item.id;
              return (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.genderCarouselCard,
                    isSelected && styles.genderCarouselCardSelected,
                  ]}
                  onPress={() => {
                    setGenero(item.id);
                    if (errors.genero) {
                      setErrors((prev) => ({ ...prev, genero: undefined }));
                    }
                  }}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.genderCarouselText,
                      isSelected && styles.genderCarouselTextSelected,
                    ]}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
          {errors.genero && (
            <Text style={styles.errorText}>⚠️ {errors.genero}</Text>
          )}
        </View>

        {/* Campo 3: Tipo (*) */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>
            Tipo <Text style={styles.requiredAsterisk}>*</Text>
          </Text>
          <View style={styles.typeSelectorRow}>
            {(['Menor', 'Adulto'] as const).map((type) => {
              const isSelected = protectedType === type;
              return (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.typeChip,
                    isSelected && styles.typeChipSelected,
                  ]}
                  onPress={() => {
                    setProtectedType(type);
                    if (type === 'Adulto' && errors.birthDate) {
                      setErrors((prev) => ({ ...prev, birthDate: undefined }));
                    }
                  }}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.typeChipText,
                      isSelected && styles.typeChipTextSelected,
                    ]}
                  >
                    {type === 'Menor' ? '👦 Menor' : '👤 Adulto'}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Campo 4: Fecha de Nacimiento (*) - Condicional únicamente cuando Tipo es 'Menor' */}
        {protectedType === 'Menor' && (
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>
              Fecha de Nacimiento <Text style={styles.requiredAsterisk}>*</Text>
            </Text>
            <View style={styles.inputWithIconContainer}>
              <TextInput
                style={[
                  styles.input,
                  styles.inputFlex,
                  errors.birthDate ? styles.inputErrorBorder : null,
                ]}
                value={birthDate}
                onChangeText={(text) => {
                  const formatted = formatBirthDate(text);
                  setBirthDate(formatted);
                  if (errors.birthDate) {
                    setErrors((prev) => ({ ...prev, birthDate: undefined }));
                  }
                }}
                placeholder="DD/MM/AAAA"
                placeholderTextColor={colors.textMuted}
                keyboardType="numeric"
                maxLength={10}
              />
              <TouchableOpacity
                style={styles.calendarIconButton}
                onPress={() => setShowDatePickerModal(true)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Text style={{ fontSize: 18 }}>📅</Text>
              </TouchableOpacity>
            </View>
            {errors.birthDate && (
              <Text style={styles.errorText}>⚠️ {errors.birthDate}</Text>
            )}
          </View>
        )}

        {/* Campo 5: Teléfono (*) */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>
            Teléfono <Text style={styles.requiredAsterisk}>*</Text>
          </Text>
          <TextInput
            style={[
              styles.input,
              errors.protectedPhone ? styles.inputErrorBorder : null,
            ]}
            value={protectedPhone}
            onChangeText={(text) => {
              const formatted = formatPhone(text);
              setProtectedPhone(formatted);
              if (errors.protectedPhone) {
                setErrors((prev) => ({ ...prev, protectedPhone: undefined }));
              }
            }}
            placeholder="Ej: 11 2345-6789"
            placeholderTextColor={colors.textMuted}
            keyboardType="phone-pad"
            maxLength={13}
          />
          {errors.protectedPhone && (
            <Text style={styles.errorText}>⚠️ {errors.protectedPhone}</Text>
          )}
        </View>

        {/* Campo 6: Modelo dispositivo (Opcional) */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>
            Modelo dispositivo <Text style={styles.optionalText}>(Opcional)</Text>
          </Text>
          <TextInput
            style={styles.input}
            value={deviceModel}
            onChangeText={setDeviceModel}
            placeholder="Ej: Samsung Galaxy A54"
            placeholderTextColor={colors.textMuted}
          />
        </View>
      </View>

      {/* MUESTRA DE CÓDIGO, QR Y BOTÓN COMPARTIR */}
      {pairingCode ? (
        <View style={styles.codeDisplayCard}>
          <View style={styles.codeDisplay}>
            <Text style={styles.protectedSummaryText}>
              Vinculando a: {protectedName} ({protectedType})
            </Text>
            <Text style={styles.codeNumber}>{pairingCode}</Text>
            <Text style={styles.codeExpiry}>Válido por 15 minutos</Text>
          </View>

          <View style={styles.qrCodeBox}>
            <Text style={styles.qrTitle}>Código QR de Vinculación</Text>
            <Text style={styles.qrSubtitle}>
              Apunta la cámara del celular de {protectedName || 'del protegido'} aquí para vincular
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

            {/* BOTÓN PARA COMPARTIR EL CÓDIGO */}
            <View style={styles.shareContainer}>
              <ActionButton
                title="📲 Compartir Código"
                variant="primary"
                onPress={handleShareCode}
              />
            </View>
          </View>
        </View>
      ) : null}

      <ActionButton
        title={pairingCode ? 'Generar Nuevo Código' : 'Generar Código y QR de Vinculación'}
        variant="secondary"
        onPress={handleValidationAndGenerate}
        loading={loading}
        disabled={deviceCount >= MAX_PARENT_DEVICES}
      />

      {/* Modal de Selección de Calendario */}
      <Modal
        visible={showDatePickerModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowDatePickerModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowDatePickerModal(false)}
        >
          <View style={styles.modalCard} onStartShouldSetResponder={() => true}>
            <Text style={styles.modalTitle}>📅 Seleccionar Fecha de Nacimiento</Text>
            <Text style={styles.modalSubtitle}>
              Elige la fecha de nacimiento del menor protegido
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
                  {Array.from({ length: 30 }, (_, i) => 2026 - i).map((y) => (
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
                onPress={() => setShowDatePickerModal(false)}
              >
                <Text style={styles.modalCancelBtnText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalConfirmBtn}
                onPress={() => {
                  const maxDays = getDaysInMonth(selectedMonth, selectedYear);
                  const validDay = Math.min(selectedDay, maxDays);
                  const dayStr = validDay.toString().padStart(2, '0');
                  const monthStr = selectedMonth.toString().padStart(2, '0');
                  const formattedStr = `${dayStr}/${monthStr}/${selectedYear}`;
                  setBirthDate(formattedStr);
                  setShowDatePickerModal(false);
                  if (errors.birthDate) {
                    setErrors((prev) => ({ ...prev, birthDate: undefined }));
                  }
                }}
              >
                <Text style={styles.modalConfirmBtnText}>Confirmar Fecha</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
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
    marginBottom: 10,
  },
  formCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginBottom: 10,
  },
  fieldGroup: {
    marginBottom: 10,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  requiredAsterisk: {
    color: colors.statusDanger,
    fontWeight: '800',
  },
  optionalText: {
    fontSize: 11,
    fontWeight: '400',
    color: colors.textMuted,
  },
  carouselHint: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: '500',
  },
  genderCarouselContainer: {
    gap: 8,
    paddingVertical: 2,
  },
  genderCarouselCard: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  genderCarouselCardSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  genderCarouselText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  genderCarouselTextSelected: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  inputWithIconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputFlex: {
    flex: 1,
  },
  calendarIconButton: {
    padding: 8,
    marginLeft: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 13,
    color: colors.textPrimary,
  },
  inputErrorBorder: {
    borderColor: colors.statusDanger,
    borderWidth: 1.5,
  },
  errorText: {
    fontSize: 11,
    color: colors.statusDanger,
    marginTop: 3,
    fontWeight: '600',
  },
  typeSelectorRow: {
    flexDirection: 'row',
    gap: 8,
  },
  typeChip: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  typeChipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  typeChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  typeChipTextSelected: {
    color: '#FFFFFF',
    fontWeight: '700',
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
  protectedSummaryText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primaryDark,
    marginBottom: 4,
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
  shareContainer: {
    width: '100%',
    marginTop: 10,
  },

  // Estilos de Modal de Calendario
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 16,
  },
  pickerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 20,
  },
  pickerColumn: {
    flex: 1,
    alignItems: 'center',
  },
  pickerLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 8,
  },
  pickerScrollView: {
    height: 140,
    width: '100%',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pickerItem: {
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pickerItemSelected: {
    backgroundColor: colors.primaryLight,
  },
  pickerItemText: {
    fontSize: 14,
    color: colors.textPrimary,
    fontWeight: '500',
  },
  pickerItemTextSelected: {
    color: colors.primaryDark,
    fontWeight: '800',
  },
  modalButtonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  modalCancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
  },
  modalCancelBtnText: {
    color: '#475569',
    fontSize: 14,
    fontWeight: '700',
  },
  modalConfirmBtn: {
    flex: 1.5,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: colors.primary,
    alignItems: 'center',
  },
  modalConfirmBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
