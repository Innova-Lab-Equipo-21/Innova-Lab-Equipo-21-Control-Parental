// ==============================================================================
// Proyecto: BA Protege+
// Componente: PairingSection (Vinculación de Dispositivos y Código QR)
// Archivo: src/components/dashboard/dispositivos/PairingSection.tsx
// Descripción: Formulario de vinculación con campos en blanco (sin datos mocados),
//              CTA "Generar código", íconos específicos para compartir y recargar código,
//              y calendario integrado dentro del textfield (estilo RegisterForm).
// ==============================================================================

import React, { useState, useEffect, useImperativeHandle } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  Share,
  Platform,
} from 'react-native';
import { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { ActionButton } from '../../ActionButton';
import { Icon } from '../../Icon';
import { DatePickerModal } from '../../auth/DatePickerModal';
import { FeedbackModal } from '../../FeedbackModal';
import { BOTITO_ASSETS } from '../protected/botAssets';
import { colors } from '../../../theme/colors';
import { MAX_PROTECTED_DEVICES } from '../../../types';
import { calculateAge } from '../../../utils/age';
import {
  formatBirthDate,
  formatPhone,
  validateLettersOnly,
  validateDeviceName,
  MAX_DEVICE_NAME_LENGTH,
} from '../../../utils/authValidation';
import { styles } from './PairingSection.styles';

export type GenderOption = 'Masculino' | 'Femenino' | 'Otro' | 'No informado';

export interface PairingFormData {
  protectedName: string;
  genero: GenderOption;
  protectedType: 'Menor' | 'Adulto';
  birthDate?: string;
  protectedPhone: string;
  deviceModel?: string;
}

export interface PairingSectionRef {
  submit: () => PairingFormData | null;
  reset: () => void;
  getFormData: () => PairingFormData | null;
}

interface PairingSectionProps {
  pairingCode?: string | null;
  deviceCount: number;
  loading?: boolean;
  onGenerateCode?: (data?: PairingFormData) => void;
}

export const PairingSection = React.forwardRef<PairingSectionRef, PairingSectionProps>(({
  pairingCode,
  deviceCount,
  loading,
  onGenerateCode,
}, ref) => {
  // Sin datos mocados: todos los campos inician limpios
  const [protectedName, setProtectedName] = useState('');
  const [genero, setGenero] = useState<GenderOption | ''>('');
  const [birthDate, setBirthDate] = useState('');
  const [protectedType, setProtectedType] = useState<'Menor' | 'Adulto' | null>(null);
  const [protectedPhone, setProtectedPhone] = useState('');
  const [deviceModel, setDeviceModel] = useState('');

  // Estados de UI
  const [isGenderDropdownOpen, setIsGenderDropdownOpen] = useState(false);
  const [showDatePickerModal, setShowDatePickerModal] = useState(false);
  const [feedbackModal, setFeedbackModal] = useState<{
    visible: boolean;
    imageSource?: any;
    title: string;
    message: string;
  }>({
    visible: false,
    title: '',
    message: '',
  });

  const [errors, setErrors] = useState<{
    protectedName?: string;
    genero?: string;
    birthDate?: string;
    protectedPhone?: string;
    protectedType?: string;
  }>({});

  // Calcular y actualizar el tipo automáticamente cuando cambia la fecha de nacimiento
  useEffect(() => {
    const trimmed = birthDate.trim();
    if (!trimmed || trimmed.length !== 10) {
      setProtectedType(null);
      return;
    }
    const age = calculateAge(trimmed);
    if (age === null) {
      setProtectedType(null);
    } else if (age < 18) {
      setProtectedType('Menor');
    } else {
      setProtectedType('Adulto');
    }
  }, [birthDate]);

  const handleOpenDatePicker = () => {
    if (Platform.OS === 'android') {
      let currentDate = new Date();
      if (birthDate && birthDate.length === 10) {
        const [d, m, y] = birthDate.split('/').map(Number);
        if (d && m && y && !isNaN(d) && !isNaN(m) && !isNaN(y)) {
          currentDate = new Date(y, m - 1, d);
        }
      } else {
        const now = new Date();
        currentDate = new Date(now.getFullYear() - 10, now.getMonth(), now.getDate());
      }
      try {
        DateTimePickerAndroid.open({
          value: currentDate,
          onChange: (event, selectedDate) => {
            if (event.type === 'set' && selectedDate) {
              const day = selectedDate.getDate().toString().padStart(2, '0');
              const month = (selectedDate.getMonth() + 1).toString().padStart(2, '0');
              const year = selectedDate.getFullYear();
              const formattedStr = `${day}/${month}/${year}`;
              setBirthDate(formattedStr);
              if (errors.birthDate) {
                setErrors((prev) => ({ ...prev, birthDate: undefined }));
              }
            }
          },
          mode: 'date',
          maximumDate: new Date(),
        });
      } catch (err) {
        setShowDatePickerModal(true);
      }
    } else {
      setShowDatePickerModal(true);
    }
  };

  const handleValidationAndGenerate = (): PairingFormData | null => {
    const newErrors: {
      protectedName?: string;
      genero?: string;
      birthDate?: string;
      protectedPhone?: string;
      protectedType?: string;
    } = {};

    // 1. Validación de Nombre del Protegido
    const nameError = validateDeviceName(protectedName);
    if (nameError) {
      newErrors.protectedName = nameError;
    }

    // 2. Validación de Género (Obligatorio)
    if (!genero) {
      newErrors.genero = 'El género es obligatorio.';
    }

    // 3. Validación de Fecha de Nacimiento
    const trimmedBirth = birthDate.trim();
    if (!trimmedBirth) {
      newErrors.birthDate = 'La fecha de nacimiento es obligatoria.';
    } else if (trimmedBirth.length !== 10) {
      newErrors.birthDate = 'Formato inválido. Debe ser DD/MM/AAAA.';
    } else {
      const age = calculateAge(trimmedBirth);
      if (age === null) {
        newErrors.birthDate = 'Fecha de nacimiento inválida.';
      }
    }

    // 4. Validación de Tipo automático
    if (!protectedType) {
      newErrors.protectedType = 'Debe ingresar una fecha de nacimiento válida para determinar el tipo.';
    }

    // 5. Validación de Teléfono (Obligatorio, mínimo 10 dígitos)
    const phoneDigits = protectedPhone.replace(/\D/g, '');
    if (!protectedPhone.trim()) {
      newErrors.protectedPhone = 'El teléfono es obligatorio.';
    } else if (phoneDigits.length < 10) {
      newErrors.protectedPhone = 'El teléfono debe contener al menos 10 dígitos (ej. 11 2345-6789).';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0 || !protectedType || !genero) {
      return null;
    }

    const trimmedName = protectedName.trim();
    const payload: PairingFormData = {
      protectedName: trimmedName,
      genero: genero as GenderOption,
      protectedType,
      birthDate: trimmedBirth,
      protectedPhone: protectedPhone.trim(),
      deviceModel: deviceModel.trim() || undefined,
    };

    onGenerateCode?.(payload);
    return payload;
  };

  useImperativeHandle(ref, () => ({
    submit: () => handleValidationAndGenerate(),
    reset: () => {
      setProtectedName('');
      setGenero('');
      setBirthDate('');
      setProtectedType(null);
      setProtectedPhone('');
      setDeviceModel('');
      setErrors({});
      setIsGenderDropdownOpen(false);
    },
    getFormData: () => {
      const trimmedName = protectedName.trim();
      const trimmedBirth = birthDate.trim();
      if (!trimmedName || !genero || !protectedType || !trimmedBirth || !protectedPhone.trim()) {
        return null;
      }
      return {
        protectedName: trimmedName,
        genero: genero as GenderOption,
        protectedType,
        birthDate: trimmedBirth,
        protectedPhone: protectedPhone.trim(),
        deviceModel: deviceModel.trim() || undefined,
      };
    },
  }));

  const handleShareCode = async () => {
    if (!pairingCode) return;

    const message = `BA Protege+ • Código de vinculación para ${protectedName || 'Dispositivo'} (${protectedType || 'Protegido'}): ${pairingCode}.`;

    try {
      const result = await Share.share({
        title: 'Código de Vinculación BA Protege+',
        message,
      });

      if (result.action === Share.sharedAction) {
        setFeedbackModal({
          visible: true,
          imageSource: BOTITO_ASSETS.feliz,
          title: 'Código compartido',
          message: 'El código de vinculación ha sido enviado.',
        });
      }
    } catch (error: any) {
      setFeedbackModal({
        visible: true,
        imageSource: BOTITO_ASSETS.pensando,
        title: 'Código para compartir',
        message,
      });
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.descText}>
        Completá estos datos para generar el código y el QR (hasta {MAX_PROTECTED_DEVICES} dispositivos).
      </Text>

      {/* FORMULARIO DE DATOS DEL PROTEGIDO */}
      <View style={styles.formCard}>
        {/* Campo 1: Nombre de la persona a proteger (*) */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>
            Nombre de la persona a proteger<Text style={styles.requiredAsterisk}>*</Text>
          </Text>
          <TextInput
            style={[
              styles.input,
              errors.protectedName ? styles.inputErrorBorder : null,
            ]}
            value={protectedName}
            selectTextOnFocus={true}
            maxLength={45}
            onChangeText={(text) => {
              setProtectedName(text);
              if (text.trim().length > MAX_DEVICE_NAME_LENGTH) {
                setErrors((prev) => ({
                  ...prev,
                  protectedName: `El nombre no puede superar los ${MAX_DEVICE_NAME_LENGTH} caracteres (actual: ${text.trim().length}).`,
                }));
              } else if (errors.protectedName) {
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

        {/* Campo 2: Género (*) Dropdown */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>
            Género<Text style={styles.requiredAsterisk}>*</Text>
          </Text>
          <TouchableOpacity
            style={[
              styles.dropdownContainer,
              errors.genero ? styles.inputErrorBorder : null,
            ]}
            onPress={() => setIsGenderDropdownOpen((prev) => !prev)}
            activeOpacity={0.8}
            accessibilityLabel="Seleccionar género"
          >
            <Text
              style={[
                styles.dropdownSelectedText,
                !genero && styles.dropdownPlaceholderText,
              ]}
            >
              {genero || 'Seleccionar género'}
            </Text>
            <Text style={styles.dropdownArrow}>{isGenderDropdownOpen ? '▲' : '▼'}</Text>
          </TouchableOpacity>

          {isGenderDropdownOpen && (
            <View style={styles.dropdownMenu}>
              {(['Masculino', 'Femenino', 'Otro', 'No informado'] as GenderOption[]).map((opt) => (
                <TouchableOpacity
                  key={opt}
                  style={[
                    styles.dropdownMenuItem,
                    genero === opt && styles.dropdownMenuItemSelected,
                  ]}
                  onPress={() => {
                    setGenero(opt);
                    setIsGenderDropdownOpen(false);
                    if (errors.genero) {
                      setErrors((prev) => ({ ...prev, genero: undefined }));
                    }
                  }}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.dropdownMenuItemText,
                      genero === opt && styles.dropdownMenuItemTextSelected,
                    ]}
                  >
                    {opt}
                  </Text>
                  {genero === opt && (
                    <Text style={styles.dropdownCheckmark}>✓</Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}
          {errors.genero && (
            <Text style={styles.errorText}>⚠️ {errors.genero}</Text>
          )}
        </View>

        {/* Campo 3: Fecha de Nacimiento (*) con icono dentro del textfield (estilo RegisterForm) */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>
            Fecha de nacimiento<Text style={styles.requiredAsterisk}>*</Text>
          </Text>
          <View
            style={[
              styles.inputContainer,
              errors.birthDate ? styles.inputContainerError : null,
            ]}
          >
            <TextInput
              style={styles.inputNoBorder}
              value={birthDate}
              selectTextOnFocus={true}
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
              style={styles.inputIconAction}
              onPress={handleOpenDatePicker}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              accessibilityLabel="Abrir calendario"
            >
              <Icon name="calendario" size={22} color="#007AFF" />
            </TouchableOpacity>
          </View>
          {errors.birthDate && (
            <Text style={styles.errorText}>⚠️ {errors.birthDate}</Text>
          )}
        </View>

        {/* Campo 4: Tipo (*) - Determinado automáticamente según fecha de nacimiento */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>
            Tipo<Text style={styles.requiredAsterisk}>*</Text>
          </Text>
          <View style={styles.typeSelectorRow}>
            {(['Menor', 'Adulto'] as const).map((type) => {
              const isSelected = protectedType === type;
              return (
                <View
                  key={type}
                  style={[
                    styles.typeChip,
                    isSelected && styles.typeChipSelected,
                  ]}
                >
                  <Text
                    style={[
                      styles.typeChipText,
                      isSelected && styles.typeChipTextSelected,
                    ]}
                  >
                    {type === 'Adulto' ? 'Persona adulta' : type}
                  </Text>
                </View>
              );
            })}
          </View>
          {errors.protectedType && (
            <Text style={styles.errorText}>⚠️ {errors.protectedType}</Text>
          )}
        </View>

        {/* Campo 5: Teléfono (*) */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>
            Teléfono<Text style={styles.requiredAsterisk}>*</Text>
          </Text>
          <TextInput
            style={[
              styles.input,
              errors.protectedPhone ? styles.inputErrorBorder : null,
            ]}
            value={protectedPhone}
            selectTextOnFocus={true}
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

        {/* Campo 6: Modelo del dispositivo (opcional) */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>
            Modelo del dispositivo <Text style={styles.optionalText}>(opcional)</Text>
          </Text>
          <TextInput
            style={styles.input}
            value={deviceModel}
            selectTextOnFocus={true}
            onChangeText={setDeviceModel}
            placeholder="Ej: Samsung Galaxy A54"
            placeholderTextColor={colors.textMuted}
          />
        </View>
      </View>

      {/* Modal de Selección de Calendario */}
      <DatePickerModal
        visible={showDatePickerModal}
        initialDate={birthDate}
        onClose={() => setShowDatePickerModal(false)}
        onConfirm={(formattedDate) => {
          setBirthDate(formattedDate);
          if (errors.birthDate) {
            setErrors((prev) => ({ ...prev, birthDate: undefined }));
          }
        }}
      />

      {/* Modal estándar de retroalimentación */}
      <FeedbackModal
        visible={feedbackModal.visible}
        imageSource={feedbackModal.imageSource}
        title={feedbackModal.title}
        message={feedbackModal.message}
        asOverlay={true}
        onClose={() => setFeedbackModal((prev) => ({ ...prev, visible: false }))}
      />
    </View>
  );
});
