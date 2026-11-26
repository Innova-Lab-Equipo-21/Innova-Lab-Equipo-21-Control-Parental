// ==============================================================================
// Proyecto: BA Protege+
// Componente: EditResponsibleModal (Modal Oficial de Edición del Responsable)
// Archivo: src/components/dashboard/cuenta/EditResponsibleModal.tsx
// Descripción: Modal institucional reutilizable para editar los datos del responsable.
// ==============================================================================

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Platform,
} from 'react-native';
import { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { ActionButton } from '../../ActionButton';
import { Icon } from '../../Icon';
import { DatePickerModal } from '../../auth/DatePickerModal';
import { FeedbackModal } from '../../FeedbackModal';
import { BOTITO_ASSETS } from '../protected/botAssets';
import { colors } from '../../../theme/colors';
import {
  formatBirthDate,
  formatPhone,
  validateRegisterFields,
} from '../../../utils/authValidation';
import { calculateAge } from '../../../utils/age';
import { styles } from './EditResponsibleModal.styles';

interface EditResponsibleModalProps {
  visible: boolean;
  currentUser: any;
  onClose: () => void;
  onSave: (updatedUser: any) => Promise<void> | void;
}

const normalizeBirthDateForInput = (raw?: string | Date | null): string => {
  if (!raw) return '';
  const str = typeof raw === 'string' ? raw.trim() : raw.toISOString();
  if (!str) return '';
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(str)) {
    return str;
  }
  const isoMatch = str.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (isoMatch) {
    return `${isoMatch[3]}/${isoMatch[2]}/${isoMatch[1]}`;
  }
  return formatBirthDate(str);
};

const normalizeGenderForInput = (raw?: string | null): string => {
  if (!raw) return 'No informado';
  const normalized = raw.trim().toUpperCase().replace(/\s+/g, '_');
  if (normalized === 'MASCULINO') return 'Masculino';
  if (normalized === 'FEMENINO') return 'Femenino';
  if (normalized === 'OTRO') return 'Otro';
  return 'No informado';
};

const normalizePhoneForInput = (raw?: string | null): string => {
  if (!raw) return '';
  const trimmed = raw.trim().replace(/^\+54\s*9?\s*/, '');
  return formatPhone(trimmed);
};

export const EditResponsibleModal: React.FC<EditResponsibleModalProps> = ({
  visible,
  currentUser,
  onClose,
  onSave,
}) => {
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [fechaNacimiento, setFechaNacimiento] = useState('');
  const [genero, setGenero] = useState<string>('No informado');
  const [telefono, setTelefono] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showGenderDropdown, setShowGenderDropdown] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [feedbackModal, setFeedbackModal] = useState<{
    visible: boolean;
    icon?: string;
    imageSource?: any;
    title: string;
    message: string;
  } | null>(null);

  const genderOptions = ['Masculino', 'Femenino', 'Otro', 'No informado'];

  // Sincronizar datos al abrir el modal con el usuario actual
  useEffect(() => {
    if (visible && currentUser) {
      setNombre(currentUser.firstName || currentUser.fullName?.split(' ')[0] || '');
      setApellido(currentUser.lastName || currentUser.fullName?.split(' ').slice(1).join(' ') || '');
      setFechaNacimiento(normalizeBirthDateForInput(currentUser.birthDate));
      setGenero(normalizeGenderForInput(currentUser.gender));
      setTelefono(normalizePhoneForInput(currentUser.phone));
      setRegisterEmail(currentUser.email || '');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setShowCurrentPassword(false);
      setShowNewPassword(false);
      setShowConfirmPassword(false);
      setFieldErrors({});
    }
  }, [visible, currentUser]);

  const handleOpenDatePicker = () => {
    if (Platform.OS === 'android') {
      let currentDate = new Date(1985, 2, 10);
      if (fechaNacimiento && fechaNacimiento.length === 10) {
        const [d, m, y] = fechaNacimiento.split('/').map(Number);
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
              setFechaNacimiento(formattedStr);
              if (fieldErrors.fechaNacimiento) setFieldErrors((p) => ({ ...p, fechaNacimiento: '' }));
            }
          },
          mode: 'date',
          maximumDate: new Date(),
        });
      } catch (err) {
        setShowDatePicker(true);
      }
    } else {
      setShowDatePicker(true);
    }
  };

  const handleSave = async () => {
    const wantsPasswordChange = Boolean(
      currentPassword.trim() || newPassword.trim() || confirmPassword.trim()
    );

    const formData = {
      nombre,
      apellido,
      fechaNacimiento,
      telefono,
      registerEmail,
      registerPassword: 'placeholder-password',
      confirmPassword: 'placeholder-password',
    };

    const errors = validateRegisterFields(formData);
    delete errors.registerPassword;
    delete errors.confirmPassword;

    if (wantsPasswordChange) {
      if (!currentPassword.trim()) {
        errors.currentPassword = 'Ingresá tu contraseña actual.';
      }
      if (!newPassword.trim()) {
        errors.newPassword = 'Ingresá tu nueva contraseña.';
      } else if (newPassword.length < 6) {
        errors.newPassword = 'La contraseña debe tener al menos 6 caracteres.';
      }
      if (!confirmPassword.trim()) {
        errors.confirmPassword = 'Repetí tu nueva contraseña.';
      } else if (newPassword !== confirmPassword) {
        errors.confirmPassword = 'Las contraseñas no coinciden.';
      }
    }

    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) {
      setFeedbackModal({
        visible: true,
        imageSource: BOTITO_ASSETS.pensando,
        title: 'Revisá los datos cargados',
        message: 'Por favor, verificá los campos marcados en rojo antes de guardar.',
      });
      return;
    }

    const age = calculateAge(fechaNacimiento);
    if (age !== null && age < 18) {
      setFeedbackModal({
        visible: true,
        imageSource: BOTITO_ASSETS.nervioso,
        title: 'Validación de edad',
        message: 'Solo personas adultas (+18) pueden registrarse en el modo responsable.',
      });
      return;
    }

    const updatedUser: any = {
      ...currentUser,
      firstName: nombre.trim(),
      lastName: apellido.trim(),
      fullName: `${nombre.trim()} ${apellido.trim()}`.trim() || currentUser?.fullName,
      birthDate: fechaNacimiento,
      gender: genero,
      phone: telefono,
      email: registerEmail.trim(),
    };

    if (wantsPasswordChange) {
      updatedUser.currentPassword = currentPassword;
      updatedUser.password = newPassword;
    } else {
      delete updatedUser.currentPassword;
      delete updatedUser.password;
    }

    setIsSaving(true);
    try {
      await onSave(updatedUser);
      onClose();
    } catch (err: any) {
      const backendMsg = err?.response?.data?.message;
      const isWrongCurrentPassword =
        typeof backendMsg === 'string' &&
        backendMsg.toLowerCase().includes('contraseña actual');
      setFeedbackModal({
        visible: true,
        imageSource: BOTITO_ASSETS.pensando,
        title: 'No pudimos realizar la actualización',
        message: isWrongCurrentPassword
          ? backendMsg
          : 'No se pudieron guardar los cambios. Podés probar de nuevo en unos minutos o volver a iniciar sesión.',
      });
    } finally {
      setIsSaving(false);
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
          <View style={styles.modalHeader}>
            <View style={{ flex: 1 }}>
              <Text style={styles.modalTitle}>Editar perfil</Text>
              <Text style={styles.modalSubtitle}>Actualizá tus datos personales y de acceso.</Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              style={styles.modalCloseBtn}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={styles.modalCloseText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 440 }}>
            {/* Nombre */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nombre<Text style={styles.requiredAsterisk}>*</Text></Text>
              <View style={[
                styles.inputContainer,
                focusedField === 'nombre' && styles.inputFocusedBorder,
                fieldErrors.nombre ? styles.inputErrorBorder : null,
              ]}>
                <TextInput
                  style={styles.input}
                  value={nombre}
                  selectTextOnFocus={true}
                  onChangeText={(t) => {
                    setNombre(t);
                    if (fieldErrors.nombre) setFieldErrors((p) => ({ ...p, nombre: '' }));
                  }}
                  onFocus={() => setFocusedField('nombre')}
                  onBlur={() => setFocusedField(null)}
                  placeholder="Ej. Juan"
                  placeholderTextColor={colors.textMuted}
                />
              </View>
              {fieldErrors.nombre ? <Text style={styles.fieldErrorText}>{fieldErrors.nombre}</Text> : null}
            </View>

            {/* Apellido */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Apellido<Text style={styles.requiredAsterisk}>*</Text></Text>
              <View style={[
                styles.inputContainer,
                focusedField === 'apellido' && styles.inputFocusedBorder,
                fieldErrors.apellido ? styles.inputErrorBorder : null,
              ]}>
                <TextInput
                  style={styles.input}
                  value={apellido}
                  selectTextOnFocus={true}
                  onChangeText={(t) => {
                    setApellido(t);
                    if (fieldErrors.apellido) setFieldErrors((p) => ({ ...p, apellido: '' }));
                  }}
                  onFocus={() => setFocusedField('apellido')}
                  onBlur={() => setFocusedField(null)}
                  placeholder="Ej. Pérez"
                  placeholderTextColor={colors.textMuted}
                />
              </View>
              {fieldErrors.apellido ? <Text style={styles.fieldErrorText}>{fieldErrors.apellido}</Text> : null}
            </View>

            {/* Fecha de Nacimiento con Calendario Nativo Android */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Fecha de nacimiento<Text style={styles.requiredAsterisk}>*</Text></Text>
              <TouchableOpacity
                style={[
                  styles.inputContainer,
                  fieldErrors.fechaNacimiento ? styles.inputErrorBorder : null,
                ]}
                onPress={handleOpenDatePicker}
                activeOpacity={0.8}
              >
                <TextInput
                  style={styles.input}
                  value={fechaNacimiento}
                  selectTextOnFocus={true}
                  onChangeText={(t) => {
                    const formatted = formatBirthDate(t);
                    setFechaNacimiento(formatted);
                    if (fieldErrors.fechaNacimiento) setFieldErrors((p) => ({ ...p, fechaNacimiento: '' }));
                  }}
                  placeholder="DD/MM/AAAA"
                  placeholderTextColor={colors.textMuted}
                  keyboardType="numeric"
                  maxLength={10}
                />
                <Icon name="calendario" size={24} color={colors.primary} />
              </TouchableOpacity>
              {fieldErrors.fechaNacimiento ? <Text style={styles.fieldErrorText}>{fieldErrors.fechaNacimiento}</Text> : null}
            </View>

            {/* Género con Dropdown y checkmark */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Género</Text>
              <TouchableOpacity
                style={[
                  styles.inputContainer,
                  styles.dropdownContainer,
                  showGenderDropdown && styles.inputFocusedBorder,
                ]}
                onPress={() => setShowGenderDropdown(!showGenderDropdown)}
                activeOpacity={0.8}
              >
                <Text style={[styles.dropdownSelectedText, genero === 'No informado' && styles.dropdownPlaceholderText]}>
                  {genero}
                </Text>
                <Text style={styles.dropdownArrow}>{showGenderDropdown ? '▲' : '▼'}</Text>
              </TouchableOpacity>

              {showGenderDropdown && (
                <View style={styles.dropdownMenu}>
                  {genderOptions.map((opt) => (
                    <TouchableOpacity
                      key={opt}
                      style={[styles.dropdownMenuItem, genero === opt && styles.dropdownMenuItemSelected]}
                      onPress={() => {
                        setGenero(opt);
                        setShowGenderDropdown(false);
                      }}
                    >
                      <Text style={[styles.dropdownMenuItemText, genero === opt && styles.dropdownMenuItemTextSelected]}>
                        {opt}
                      </Text>
                      {genero === opt && <Text style={styles.dropdownCheckmark}>✓</Text>}
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            {/* Teléfono */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Teléfono</Text>
              <View style={[
                styles.inputContainer,
                focusedField === 'telefono' && styles.inputFocusedBorder,
                fieldErrors.telefono ? styles.inputErrorBorder : null,
              ]}>
                <TextInput
                  style={styles.input}
                  value={telefono}
                  selectTextOnFocus={true}
                  onChangeText={(t) => {
                    const formatted = formatPhone(t);
                    setTelefono(formatted);
                    if (fieldErrors.telefono) setFieldErrors((p) => ({ ...p, telefono: '' }));
                  }}
                  onFocus={() => setFocusedField('telefono')}
                  onBlur={() => setFocusedField(null)}
                  keyboardType="phone-pad"
                  placeholder="11 2345-6789"
                  placeholderTextColor={colors.textMuted}
                  maxLength={12}
                />
              </View>
              {fieldErrors.telefono ? <Text style={styles.fieldErrorText}>{fieldErrors.telefono}</Text> : null}
            </View>

            {/* Correo electrónico */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Correo electrónico<Text style={styles.requiredAsterisk}>*</Text></Text>
              <View style={[
                styles.inputContainer,
                focusedField === 'registerEmail' && styles.inputFocusedBorder,
                fieldErrors.registerEmail ? styles.inputErrorBorder : null,
              ]}>
                <TextInput
                  style={styles.input}
                  value={registerEmail}
                  selectTextOnFocus={true}
                  onChangeText={(t) => {
                    setRegisterEmail(t);
                    if (fieldErrors.registerEmail) setFieldErrors((p) => ({ ...p, registerEmail: '' }));
                  }}
                  onFocus={() => setFocusedField('registerEmail')}
                  onBlur={() => setFocusedField(null)}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  placeholder="tutor@ejemplo.com"
                  placeholderTextColor={colors.textMuted}
                />
              </View>
              {fieldErrors.registerEmail ? <Text style={styles.fieldErrorText}>{fieldErrors.registerEmail}</Text> : null}
            </View>

            {/* Contraseña actual (opcional si no cambia la clave) */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Contraseña actual</Text>
              <View style={[
                styles.inputContainer,
                focusedField === 'currentPassword' && styles.inputFocusedBorder,
                fieldErrors.currentPassword ? styles.inputErrorBorder : null,
              ]}>
                <TextInput
                  style={styles.input}
                  value={currentPassword}
                  onChangeText={(t) => {
                    setCurrentPassword(t);
                    if (fieldErrors.currentPassword) setFieldErrors((p) => ({ ...p, currentPassword: '' }));
                  }}
                  onFocus={() => setFocusedField('currentPassword')}
                  onBlur={() => setFocusedField(null)}
                  secureTextEntry={!showCurrentPassword}
                  placeholder="Ingresá tu contraseña actual"
                  placeholderTextColor={colors.textMuted}
                />
                <TouchableOpacity onPress={() => setShowCurrentPassword(!showCurrentPassword)} style={{ padding: 4 }}>
                  <Icon name="ojo" size={22} color={showCurrentPassword ? colors.primary : colors.textMuted} />
                </TouchableOpacity>
              </View>
              {fieldErrors.currentPassword ? <Text style={styles.fieldErrorText}>{fieldErrors.currentPassword}</Text> : null}
            </View>

            {/* Nueva contraseña con ícono Ojo oficial */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nueva contraseña</Text>
              <View style={[
                styles.inputContainer,
                focusedField === 'newPassword' && styles.inputFocusedBorder,
                fieldErrors.newPassword ? styles.inputErrorBorder : null,
              ]}>
                <TextInput
                  style={styles.input}
                  value={newPassword}
                  onChangeText={(t) => {
                    setNewPassword(t);
                    if (fieldErrors.newPassword) setFieldErrors((p) => ({ ...p, newPassword: '' }));
                  }}
                  onFocus={() => setFocusedField('newPassword')}
                  onBlur={() => setFocusedField(null)}
                  secureTextEntry={!showNewPassword}
                  placeholder="Mínimo 6 caracteres"
                  placeholderTextColor={colors.textMuted}
                />
                <TouchableOpacity onPress={() => setShowNewPassword(!showNewPassword)} style={{ padding: 4 }}>
                  <Icon name="ojo" size={22} color={showNewPassword ? colors.primary : colors.textMuted} />
                </TouchableOpacity>
              </View>
              {fieldErrors.newPassword ? <Text style={styles.fieldErrorText}>{fieldErrors.newPassword}</Text> : null}
            </View>

            {/* Repetir nueva contraseña con ícono Ojo oficial */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Repetir nueva contraseña</Text>
              <View style={[
                styles.inputContainer,
                focusedField === 'confirmPassword' && styles.inputFocusedBorder,
                fieldErrors.confirmPassword ? styles.inputErrorBorder : null,
              ]}>
                <TextInput
                  style={styles.input}
                  value={confirmPassword}
                  onChangeText={(t) => {
                    setConfirmPassword(t);
                    if (fieldErrors.confirmPassword) setFieldErrors((p) => ({ ...p, confirmPassword: '' }));
                  }}
                  onFocus={() => setFocusedField('confirmPassword')}
                  onBlur={() => setFocusedField(null)}
                  secureTextEntry={!showConfirmPassword}
                  placeholder="Repetí tu nueva contraseña"
                  placeholderTextColor={colors.textMuted}
                />
                <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={{ padding: 4 }}>
                  <Icon name="ojo" size={22} color={showConfirmPassword ? colors.primary : colors.textMuted} />
                </TouchableOpacity>
              </View>
              {fieldErrors.confirmPassword ? <Text style={styles.fieldErrorText}>{fieldErrors.confirmPassword}</Text> : null}
            </View>
          </ScrollView>

          <View style={styles.buttonsRow}>
            <View style={{ flex: 1 }}>
              <ActionButton
                title="Cancelar"
                variant="secondary"
                disabled={isSaving}
                onPress={onClose}
              />
            </View>
            <View style={{ flex: 1 }}>
              <ActionButton
                title="Guardar"
                variant="primary"
                loading={isSaving}
                disabled={isSaving}
                onPress={handleSave}
              />
            </View>
          </View>
        </View>
      </View>

      {/* Modal de Calendario para Fecha de Nacimiento */}
      <DatePickerModal
        visible={showDatePicker}
        initialDate={fechaNacimiento}
        onClose={() => setShowDatePicker(false)}
        onConfirm={(dateStr) => {
          setFechaNacimiento(dateStr);
          if (fieldErrors.fechaNacimiento) setFieldErrors((p) => ({ ...p, fechaNacimiento: '' }));
        }}
      />

      {/* Modal Estándar de Retroalimentación / Validación */}
      {feedbackModal && (
        <FeedbackModal
          visible={feedbackModal.visible}
          icon={feedbackModal.icon}
          imageSource={feedbackModal.imageSource}
          title={feedbackModal.title}
          message={feedbackModal.message}
          buttonText="Entendido"
          asOverlay={true}
          onClose={() => setFeedbackModal(null)}
        />
      )}
    </Modal>
  );
};
