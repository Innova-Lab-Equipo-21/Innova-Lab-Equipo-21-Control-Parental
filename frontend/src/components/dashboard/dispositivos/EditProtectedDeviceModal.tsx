// ==============================================================================
// Proyecto: BA Protege+
// Componente: EditProtectedDeviceModal (Modal de Edición de Datos del Protegido)
// Archivo: src/components/dashboard/dispositivos/EditProtectedDeviceModal.tsx
// Descripción: Modal para editar datos del protegido que adopta el mismo estilo
//              visual y pulido de EditResponsibleModal (sin fondo gris ni ícono de lápiz).
// ==============================================================================

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Platform,
  Image,
  Share,
  ActivityIndicator,
} from 'react-native';
import { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { ActionButton } from '../../ActionButton';
import { Icon } from '../../Icon';
import { DatePickerModal } from '../../auth/DatePickerModal';
import { FeedbackModal } from '../../FeedbackModal';
import { BOTITO_ASSETS } from '../protected/botAssets';
import { colors } from '../../../theme/colors';
import { DeviceInfo } from '../../../types';
import { apiService } from '../../../services/api.service';
import { calculateAge } from '../../../utils/age';
import {
  formatBirthDate,
  formatPhone,
  validateLettersOnly,
  validateDeviceName,
  MAX_DEVICE_NAME_LENGTH,
} from '../../../utils/authValidation';
import { GenderOption } from './PairingSection';
import { styles } from './EditProtectedDeviceModal.styles';

interface EditProtectedDeviceModalProps {
  visible: boolean;
  device: DeviceInfo | null;
  onClose: () => void;
  onSaveSuccess: (updatedName?: string) => void;
}

export const EditProtectedDeviceModal: React.FC<EditProtectedDeviceModalProps> = ({
  visible,
  device,
  onClose,
  onSaveSuccess,
}) => {
  const [protectedName, setProtectedName] = useState('');
  const [genero, setGenero] = useState<GenderOption>('Femenino');
  const [birthDate, setBirthDate] = useState('');
  const [protectedType, setProtectedType] = useState<'Menor' | 'Adulto' | null>('Menor');
  const [protectedPhone, setProtectedPhone] = useState('');
  const [deviceModel, setDeviceModel] = useState('');

  const [isGenderDropdownOpen, setIsGenderDropdownOpen] = useState(false);
  const [showDatePickerModal, setShowDatePickerModal] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const isSubmittingRef = useRef<boolean>(false);
  const [pairingCode, setPairingCode] = useState<string | null>(null);
  const [generatingCode, setGeneratingCode] = useState(false);
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

  const genderOptions: GenderOption[] = ['Masculino', 'Femenino', 'Otro', 'No informado'];

  // Cargar datos del dispositivo al abrir
  useEffect(() => {
    if (visible && device) {
      const name = device.childName || device.deviceName || '';
      const gen = (device.gender as GenderOption) || 'No informado';
      const bDate = device.birthDate || '';
      const phone = device.phone || '';
      const model = device.deviceModel || '';

      setProtectedName(name);
      setGenero(gen);
      setBirthDate(bDate);
      setProtectedPhone(phone);
      setDeviceModel(model);
      setErrors({});

      if (device.pairingCode) {
        setPairingCode(device.pairingCode);
        setGeneratingCode(false);
      } else if (device.status === 'INACTIVE') {
        setGeneratingCode(true);
        apiService
          .generatePairingCode({
            deviceId: device.deviceId,
            childName: name,
            gender: gen,
            personType: device.profileType || 'Menor',
            birthDate: bDate,
            phone,
          })
          .then((res) => {
            const code = res.data?.code || res.data?.pairingCode || null;
            setPairingCode(code);
          })
          .catch(() => {
            setPairingCode(null);
          })
          .finally(() => {
            setGeneratingCode(false);
          });
      } else {
        setPairingCode(null);
        setGeneratingCode(false);
      }

      if (bDate && bDate.length === 10) {
        const age = calculateAge(bDate);
        setProtectedType(age !== null && age < 18 ? 'Menor' : 'Adulto');
      } else {
        setProtectedType(device.profileType === 'Adulto' ? 'Adulto' : 'Menor');
      }
    }
  }, [visible, device]);

  // Actualizar Tipo automáticamente según la Fecha de Nacimiento
  useEffect(() => {
    const trimmed = birthDate.trim();
    if (!trimmed || trimmed.length !== 10) {
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

  const handleGenerateNewCode = async () => {
    if (!device) return;
    setGeneratingCode(true);
    try {
      const res = await apiService.generatePairingCode({
        deviceId: device.deviceId,
        childName: protectedName.trim() || device?.childName || 'Protegido',
        gender: genero,
        personType: protectedType || 'Menor',
        birthDate: birthDate.trim() || device?.birthDate,
        phone: protectedPhone.trim() || device?.phone,
      });
      const code = res.data?.code || res.data?.pairingCode;
      if (!code) {
        throw new Error('No se recibió un nuevo código del servidor.');
      }
      setPairingCode(code);
    } catch (e: any) {
      setFeedbackModal({
        visible: true,
        imageSource: BOTITO_ASSETS.nervioso,
        title: 'No pudimos generar un nuevo código',
        message:
          e?.message ||
          'Verificá tu conexión a internet e intentá generar el código nuevamente.',
      });
    } finally {
      setGeneratingCode(false);
    }
  };

  const handleShareCode = async () => {
    if (!pairingCode) return;
    const name = protectedName.trim() || device?.childName || 'Dispositivo';
    const type = protectedType || device?.profileType || 'Protegido';
    const message = `BA Protege+ • Código de vinculación para ${name} (${type}): ${pairingCode}.`;
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

  const handleSave = async () => {
    if (!device) return;

    const newErrors: {
      protectedName?: string;
      genero?: string;
      birthDate?: string;
      protectedPhone?: string;
      protectedType?: string;
    } = {};

    // 1. Validación de Nombre
    const nameError = validateDeviceName(protectedName);
    if (nameError) {
      newErrors.protectedName = nameError;
    }

    // 2. Validación de Género
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

    // 4. Validación de Tipo
    if (!protectedType) {
      newErrors.protectedType = 'Debe ingresar una fecha de nacimiento válida para determinar el tipo.';
    }

    // 5. Validación de Teléfono
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

    if (isSubmittingRef.current || loading) {
      return;
    }

    const trimmedName = protectedName.trim();
    isSubmittingRef.current = true;
    setLoading(true);
    try {
      await apiService.updateDevice(device.deviceId, {
        childName: trimmedName,
        birthDate: trimmedBirth,
        profileType: protectedType,
        gender: genero,
        phone: protectedPhone.trim(),
        deviceModel: deviceModel.trim() || undefined,
      });

      onSaveSuccess(trimmedName);
      onClose();
    } catch (e: any) {
      const rawMsg = e?.message || '';
      const isTechnicalOrNetwork =
        !rawMsg ||
        /application failed to respond|network error|timeout|status code|failed to fetch|econnrefused|enotfound|bad gateway/i.test(
          rawMsg
        );
      const friendlyMessage = isTechnicalOrNetwork
        ? 'Tuvimos un inconveniente al guardar los cambios. Por favor, comprobá tu conexión a internet e intentá nuevamente en unos instantes.'
        : rawMsg;

      setFeedbackModal({
        visible: true,
        imageSource: BOTITO_ASSETS.nervioso,
        title: 'No pudimos guardar los cambios',
        message: friendlyMessage,
      });
    } finally {
      isSubmittingRef.current = false;
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Cabecera sin emoji */}
          <View style={styles.modalHeader}>
            <View style={{ flex: 1 }}>
              <Text style={styles.modalTitle}>Editar datos de la persona protegida</Text>
              <Text style={styles.modalSubtitle}>
                Actualizá los datos de la persona menor o adulta vinculada a tu cuenta.
              </Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              style={styles.closeBtn}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Campo 1: Nombre de la persona a proteger (*) */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Nombre de la persona a proteger<Text style={styles.requiredAsterisk}>*</Text>
              </Text>
              <View
                style={[
                  styles.inputContainer,
                  focusedField === 'protectedName' && styles.inputFocusedBorder,
                  errors.protectedName ? styles.inputErrorBorder : null,
                ]}
              >
                <TextInput
                  style={styles.input}
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
                  onFocus={() => setFocusedField('protectedName')}
                  onBlur={() => setFocusedField(null)}
                  placeholder="Ej: Sofía"
                  placeholderTextColor={colors.textMuted}
                />
              </View>
              {errors.protectedName && (
                <Text style={styles.fieldErrorText}>{errors.protectedName}</Text>
              )}
            </View>

            {/* Campo 2: Género (*) Dropdown */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Género<Text style={styles.requiredAsterisk}>*</Text>
              </Text>
              <TouchableOpacity
                style={[
                  styles.inputContainer,
                  styles.dropdownContainer,
                  isGenderDropdownOpen && styles.inputFocusedBorder,
                ]}
                onPress={() => setIsGenderDropdownOpen((prev) => !prev)}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.dropdownSelectedText,
                    genero === 'No informado' && styles.dropdownPlaceholderText,
                  ]}
                >
                  {genero}
                </Text>
                <Text style={styles.dropdownArrow}>{isGenderDropdownOpen ? '▲' : '▼'}</Text>
              </TouchableOpacity>

              {isGenderDropdownOpen && (
                <View style={styles.dropdownMenu}>
                  {genderOptions.map((opt) => (
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
                <Text style={styles.fieldErrorText}>{errors.genero}</Text>
              )}
            </View>

            {/* Campo 3: Fecha de Nacimiento (*) con icono dentro del textfield */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Fecha de nacimiento<Text style={styles.requiredAsterisk}>*</Text>
              </Text>
              <TouchableOpacity
                style={[
                  styles.inputContainer,
                  errors.birthDate ? styles.inputErrorBorder : null,
                ]}
                onPress={handleOpenDatePicker}
                activeOpacity={0.8}
              >
                <TextInput
                  style={styles.input}
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
                <Icon name="calendario" size={24} color={colors.primary} />
              </TouchableOpacity>
              {errors.birthDate && (
                <Text style={styles.fieldErrorText}>{errors.birthDate}</Text>
              )}
            </View>

            {/* Campo 4: Tipo (*) - Menor / Adulto */}
            <View style={styles.inputGroup}>
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
                        {type === 'Menor' ? 'Menor' : 'Persona adulta'}
                      </Text>
                    </View>
                  );
                })}
              </View>
              {errors.protectedType && (
                <Text style={styles.fieldErrorText}>{errors.protectedType}</Text>
              )}
            </View>

            {/* Campo 5: Teléfono (*) */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Teléfono<Text style={styles.requiredAsterisk}>*</Text>
              </Text>
              <View
                style={[
                  styles.inputContainer,
                  focusedField === 'protectedPhone' && styles.inputFocusedBorder,
                  errors.protectedPhone ? styles.inputErrorBorder : null,
                ]}
              >
                <TextInput
                  style={styles.input}
                  value={protectedPhone}
                  selectTextOnFocus={true}
                  onChangeText={(text) => {
                    const formatted = formatPhone(text);
                    setProtectedPhone(formatted);
                    if (errors.protectedPhone) {
                      setErrors((prev) => ({ ...prev, protectedPhone: undefined }));
                    }
                  }}
                  onFocus={() => setFocusedField('protectedPhone')}
                  onBlur={() => setFocusedField(null)}
                  placeholder="Ej: 11 2345-6789"
                  placeholderTextColor={colors.textMuted}
                  keyboardType="phone-pad"
                  maxLength={13}
                />
              </View>
              {errors.protectedPhone && (
                <Text style={styles.fieldErrorText}>{errors.protectedPhone}</Text>
              )}
            </View>

            {/* Campo 6: Modelo del dispositivo (opcional) */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Modelo del dispositivo <Text style={styles.optionalText}>(opcional)</Text>
              </Text>
              <View
                style={[
                  styles.inputContainer,
                  focusedField === 'deviceModel' && styles.inputFocusedBorder,
                ]}
              >
                <TextInput
                  style={styles.input}
                  value={deviceModel}
                  selectTextOnFocus={true}
                  onChangeText={setDeviceModel}
                  onFocus={() => setFocusedField('deviceModel')}
                  onBlur={() => setFocusedField(null)}
                  placeholder="Ej: Samsung Galaxy A54"
                  placeholderTextColor={colors.textMuted}
                />
              </View>
            </View>

            {/* Sección: Vinculación de dispositivo recuperada de la base de datos */}
            {device?.status === 'INACTIVE' ? (
              <View style={styles.pairingSectionContainer}>
                <View style={styles.pairingDivider} />
                <Text style={styles.pairingSectionTitle}>Vinculación de dispositivo</Text>
                <Text style={styles.pairingSectionSubtitle}>
                  Este dispositivo todavía no se vinculó. Usá este código o escaneá el QR desde el otro celular.
                </Text>

                <View style={styles.codeDisplayCard}>
                  <View style={styles.codeDisplay}>
                    <Text style={styles.protectedSummaryText}>
                      Código para vincular a {protectedName.trim() || device?.childName || 'Protegido'} ({protectedType === 'Adulto' ? 'persona adulta' : protectedType === 'Menor' ? 'menor' : 'pendiente'})
                    </Text>
                    {generatingCode && !pairingCode ? (
                      <ActivityIndicator size="small" color={colors.primary} style={{ marginVertical: 6 }} />
                    ) : (
                      <Text style={styles.codeNumber}>
                        {pairingCode ? pairingCode.replace(/\s+/g, '').split('').join(' ') : '------'}
                      </Text>
                    )}
                  </View>

                  <View style={styles.qrCodeBox}>
                    <Text style={styles.qrTitle}>Código QR de vinculación</Text>
                    <Text style={styles.qrSubtitle}>
                      Apuntá la cámara del celular de {protectedName.trim() || device?.childName || 'la persona protegida'} acá para vincularlo.
                    </Text>

                    <View style={styles.qrImageContainer}>
                      {pairingCode ? (
                        <Image
                          source={{
                            uri: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${pairingCode}&color=007AFF&bgcolor=FFFFFF`,
                          }}
                          style={styles.qrImage}
                          resizeMode="contain"
                        />
                      ) : (
                        <ActivityIndicator size="large" color={colors.primary} style={{ width: 130, height: 130 }} />
                      )}
                    </View>

                    {/* CTAs con íconos específicos: Generar nuevo código y Compartir código */}
                    <View style={styles.codeActionsRow}>
                      <TouchableOpacity
                        style={styles.actionIconButton}
                        onPress={handleGenerateNewCode}
                        disabled={generatingCode}
                        activeOpacity={0.7}
                        accessibilityLabel="Generar nuevo código"
                      >
                        <View style={styles.actionIconCircle}>
                          <Icon name="recargar" size={22} color={colors.primary} />
                        </View>
                        <Text style={styles.actionIconLabel}>Generar nuevo código</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.actionIconButton}
                        onPress={handleShareCode}
                        disabled={!pairingCode}
                        activeOpacity={0.7}
                        accessibilityLabel="Compartir código"
                      >
                        <View style={styles.actionIconCircle}>
                          <Icon name="compartir" size={22} color={colors.primary} />
                        </View>
                        <Text style={styles.actionIconLabel}>Compartir código</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </View>
            ) : (
              <View style={styles.pairingSectionContainer}>
                <View style={styles.pairingDivider} />
                <Text style={styles.pairingSectionTitle}>Vinculación de dispositivo</Text>
                <View style={styles.linkedCard}>
                  <Text style={styles.linkedCardIcon}>✅</Text>
                  <View style={styles.linkedCardContent}>
                    <Text style={styles.linkedCardTitle}>Dispositivo vinculado y protegido</Text>
                    <Text style={styles.linkedCardText}>
                      Este dispositivo completó exitosamente la vinculación y se encuentra activo bajo las reglas de protección.
                    </Text>
                  </View>
                </View>
              </View>
            )}
          </ScrollView>

          <View style={styles.buttonsRow}>
            <View style={{ flex: 1 }}>
              <ActionButton
                title="Cancelar"
                variant="secondary"
                disabled={loading}
                onPress={onClose}
              />
            </View>
            <View style={{ flex: 1 }}>
              <ActionButton
                title="Guardar"
                variant="primary"
                loading={loading}
                onPress={handleSave}
              />
            </View>
          </View>
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
    </Modal>
  );
};
