// ==============================================================================
// Proyecto: BA Protege+
// Componente: PairingSection (Vinculación de Dispositivos y Código QR)
// Archivo: src/components/dashboard/dispositivos/PairingSection.tsx
// Descripción: Formulario de vinculación con Fecha de Nacimiento arriba de Tipo,
//              tipo calculado automáticamente, y calendario integrado dentro del textfield (estilo RegisterForm).
// ==============================================================================

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  Share,
  Alert,
  Platform,
} from 'react-native';
import { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { ActionButton } from '../../ActionButton';
import { Icon } from '../../Icon';
import { DatePickerModal } from '../../auth/DatePickerModal';
import { colors } from '../../../theme/colors';
import { MAX_PARENT_DEVICES } from '../../../types';
import { calculateAge } from '../../../utils/age';
import {
  formatBirthDate,
  formatPhone,
  validateLettersOnly,
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
  const [birthDate, setBirthDate] = useState('15/05/2012');
  const [protectedType, setProtectedType] = useState<'Menor' | 'Adulto' | null>('Menor');
  const [protectedPhone, setProtectedPhone] = useState('11 2345-6789');
  const [deviceModel, setDeviceModel] = useState('');

  // Estados de UI
  const [isGenderDropdownOpen, setIsGenderDropdownOpen] = useState(false);
  const [showDatePickerModal, setShowDatePickerModal] = useState(false);

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
      let currentDate = new Date(2012, 4, 15);
      if (birthDate && birthDate.length === 10) {
        const [d, m, y] = birthDate.split('/').map(Number);
        if (d && m && y && !isNaN(d) && !isNaN(m) && !isNaN(y)) {
          currentDate = new Date(y, m - 1, d);
        }
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

  const handleValidationAndGenerate = () => {
    const newErrors: {
      protectedName?: string;
      genero?: string;
      birthDate?: string;
      protectedPhone?: string;
      protectedType?: string;
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

    if (Object.keys(newErrors).length > 0 || !protectedType) {
      return;
    }

    onGenerateCode({
      protectedName: trimmedName,
      genero,
      protectedType,
      birthDate: trimmedBirth,
      protectedPhone: protectedPhone.trim(),
      deviceModel: deviceModel.trim() || undefined,
    });
  };

  const handleShareCode = async () => {
    if (!pairingCode) return;

    const message = `BA Protege+ • Código de vinculación para ${protectedName || 'Dispositivo'} (${protectedType || 'Protegido'}): ${pairingCode}.`;

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
            Nombre del protegido<Text style={styles.requiredAsterisk}>*</Text>
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

        {/* Campo 2: Género (*) Dropdown */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>
            Género<Text style={styles.requiredAsterisk}>*</Text>
          </Text>
          <TouchableOpacity
            style={styles.dropdownContainer}
            onPress={() => setIsGenderDropdownOpen((prev) => !prev)}
            activeOpacity={0.8}
            accessibilityLabel="Seleccionar género"
          >
            <Text style={styles.dropdownSelectedText}>{genero}</Text>
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

        {/* Campo 4: Tipo (*) - Seleccionado automáticamente por fecha de nacimiento */}
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
                    {type === 'Menor' ? 'Menor' : 'Adulto'}
                  </Text>
                </View>
              );
            })}
          </View>
          {protectedType === null && (
            <Text style={[styles.errorText, { color: colors.textMuted }]}>
              ℹ️ Ingrese una fecha de nacimiento válida para determinar el tipo automáticamente.
            </Text>
          )}
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
              Vinculando a: {protectedName} ({protectedType || 'Pendiente'})
            </Text>
            <Text style={styles.codeNumber}>{pairingCode}</Text>
          </View>

          <View style={styles.qrCodeBox}>
            <Text style={styles.qrTitle}>Código QR de vinculación</Text>
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
                title="Compartir código"
                variant="primary"
                onPress={handleShareCode}
              />
            </View>
          </View>
        </View>
      ) : null}

      <ActionButton
        title={pairingCode ? 'Generar nuevo código' : 'Generar código y QR de vinculación'}
        variant="primary"
        onPress={handleValidationAndGenerate}
        loading={loading}
        disabled={deviceCount >= MAX_PARENT_DEVICES}
      />

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
    </View>
  );
};
