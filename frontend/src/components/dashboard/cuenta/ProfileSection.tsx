// ==============================================================================
// Proyecto: BA Protege+
// Componente: ProfileSection (Perfil del Responsable / Usuario)
// Archivo: src/components/dashboard/cuenta/ProfileSection.tsx
// Descripción: Muestra la tarjeta con la información personal del responsable,
//              estado de verificación (+18), avatar oficial Beti, acciones para
//              editar perfil y vinculación directa con cuentas Google.
// ==============================================================================

import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { ActionButton } from '../../ActionButton';
import { EditResponsibleModal } from './EditResponsibleModal';
import { FeedbackModal } from '../../FeedbackModal';
import { BOTITO_ASSETS } from '../protected/botAssets';
import { styles } from './ProfileSection.styles';
import { signInWithGoogle, statusCodes } from '../../../services/googleAuth.service';
import { apiService } from '../../../services/api.service';

/**
 * Propiedades del componente ProfileSection.
 *
 * @property currentUser - Objeto que contiene los datos del usuario autenticado actual.
 * @property onUpdateUser - Callback opcional ejecutado al guardar cambios del perfil en la API.
 * @property onDeleteAccount - Callback opcional para solicitar la eliminación permanente de la cuenta.
 */
interface ProfileSectionProps {
  currentUser: any;
  onUpdateUser?: (updated: any) => void;
  onDeleteAccount?: () => void;
}

/**
 * Componente que renderiza la sección de Perfil dentro de la pestaña Cuenta.
 * Muestra el estado del tutor responsable, permite la edición mediante un modal institucional,
 * e integra el flujo de vinculación con la cuenta de Google mediante SSO.
 */
export const ProfileSection: React.FC<ProfileSectionProps> = ({
  currentUser,
  onUpdateUser,
}) => {
  const isResponsible = currentUser?.role === 'RESPONSABLE' || true;
  const userColor = isResponsible ? '#007AFF' : '#6F42C1';

  const [isEditing, setIsEditing] = useState(false);
  const [linkingLoading, setLinkingLoading] = useState(false);
  const [feedbackModal, setFeedbackModal] = useState<{
    visible: boolean;
    icon?: string;
    imageSource?: any;
    title: string;
    message: string;
  }>({
    visible: false,
    title: '',
    message: '',
  });

  /** Muestra un modal emergente de retroalimentación en la interfaz */
  const showFeedback = (config: {
    icon?: string;
    imageSource?: any;
    title: string;
    message: string;
  }) => {
    setFeedbackModal({
      visible: true,
      icon: undefined,
      imageSource: undefined,
      ...config,
    });
  };

  // Datos reales del usuario (sin valores hardcodeados / mocados)
  const nombre = currentUser?.firstName || currentUser?.fullName?.split(' ')[0] || '';
  const apellido = currentUser?.lastName || currentUser?.fullName?.split(' ').slice(1).join(' ') || '';
  const fullName = `${nombre} ${apellido}`.trim() || currentUser?.fullName || 'Responsable';
  const telefono = currentUser?.phone || '';
  const email = currentUser?.email || '';
  const isGoogleLinked = !!currentUser?.isGoogleLinked;

  /** Maneja la autenticación y vinculación con la cuenta de Google */
  const handleLinkGoogle = async () => {
    setLinkingLoading(true);
    try {
      const googleUser = await signInWithGoogle();
      if (!googleUser) {
        return;
      }

      const res = await apiService.googleLink({
        idToken: googleUser.idToken || undefined,
        email: googleUser.user.email,
        fullName: googleUser.user.name || undefined,
        photoUrl: googleUser.user.photo || undefined,
      });

      if (res?.data?.user) {
        if (onUpdateUser) {
          onUpdateUser({
            ...currentUser,
            ...res.data.user,
            isGoogleLinked: true,
          });
        }
        showFeedback({
          imageSource: BOTITO_ASSETS.feliz,
          title: '¡Cuenta de Google vinculada con éxito!',
          message: 'A partir de ahora, podés ingresar a BA Protege + usando tu cuenta de Google.',
        });
      }
    } catch (error: any) {
      if (error?.code === statusCodes?.SIGN_IN_CANCELLED) {
        return;
      }
      showFeedback({
        imageSource: BOTITO_ASSETS.pensando,
        title: 'No pudimos realizar la vinculación',
        message: 'No se pudo conectar tu cuenta de Google en este momento. Podés probar de nuevo en unos minutos.',
      });
    } finally {
      setLinkingLoading(false);
    }
  };

  return (
    <View style={styles.profileCard}>
      <View style={styles.profileHeader}>
        {/* Avatar con Imagen Botito y Color Específico (Azul para Responsable) */}
        <View style={[styles.profileAvatarContainer, { backgroundColor: userColor }]}>
          <Image
            source={require('../../../assets/icons/bot/menor/botito_feliz.png')}
            style={styles.avatarImage}
            resizeMode="contain"
          />
        </View>

        <View style={styles.profileInfo}>
          <Text style={styles.profileName}>{fullName}</Text>
          {email ? <Text style={styles.profileEmail}>{email}</Text> : null}
          {telefono ? <Text style={styles.profilePhone}>{telefono}</Text> : null}
          <View style={styles.roleBadgeContainer}>
            <View style={[styles.roleBadge, { backgroundColor: userColor }]}>
              <Text style={styles.roleBadgeText}>Persona responsable</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Acciones del Responsable en la misma línea: Editar perfil + Vincular con Google */}
      {isResponsible && (
        <View style={styles.actionsRow}>
          <View style={{ flex: 1 }}>
            <ActionButton
              title="Editar perfil"
              variant="primary"
              onPress={() => setIsEditing(true)}
            />
          </View>
          <View style={{ flex: 1 }}>
            {isGoogleLinked ? (
              <TouchableOpacity
                style={styles.googleLinkedButton}
                activeOpacity={0.8}
                onPress={() =>
                  showFeedback({
                    imageSource: BOTITO_ASSETS.feliz,
                    title: 'Cuenta vinculada',
                    message: `Tu cuenta se encuentra vinculada exitosamente con Google (${email}).`,
                  })
                }
              >
                <Text style={styles.googleLinkedButtonText}>Vinculado con Google</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.googleLinkButton}
                activeOpacity={0.7}
                onPress={handleLinkGoogle}
                disabled={linkingLoading}
                accessibilityLabel="Vincular con Google"
              >
                {linkingLoading ? (
                  <ActivityIndicator size="small" color="#007AFF" />
                ) : (
                  <Image
                    source={require('../../../assets/logo/logo_google.png')}
                    style={styles.googleLogoOnly}
                    resizeMode="contain"
                  />
                )}
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}

      {/* Modal Institucional de Edición de Perfil */}
      <EditResponsibleModal
        visible={isEditing}
        currentUser={currentUser}
        onClose={() => setIsEditing(false)}
        onSave={async (updated) => {
          try {
            const payload: any = {
              fullName: updated.fullName,
              firstName: updated.firstName,
              lastName: updated.lastName,
              gender: updated.gender,
              birthDate: updated.birthDate,
              phone: updated.phone,
            };
            if (updated.password) {
              payload.currentPassword = updated.currentPassword;
              payload.password = updated.password;
            }
            const res = await apiService.updateProfile(payload);
            const savedUser: any = res?.data
              ? {
                  ...updated,
                  ...res.data,
                  firstName: updated.firstName,
                  lastName: updated.lastName,
                  birthDate: updated.birthDate,
                  gender: updated.gender,
                  phone: updated.phone,
                }
              : { ...updated };
            delete savedUser.currentPassword;
            delete savedUser.password;
            if (onUpdateUser) {
              onUpdateUser(savedUser);
            }
            showFeedback({
              imageSource: BOTITO_ASSETS.feliz,
              title: '¡Tu perfil se actualizó con éxito!',
              message: 'Guardamos los cambios que realizaste.',
            });
          } catch (err: any) {
            throw err;
          }
        }}
      />

      {/* Modal Estándar de Retroalimentación del App */}
      <FeedbackModal
        visible={feedbackModal.visible}
        icon={feedbackModal.icon}
        imageSource={feedbackModal.imageSource}
        title={feedbackModal.title}
        message={feedbackModal.message}
        buttonText="Entendido"
        onClose={() => setFeedbackModal((prev) => ({ ...prev, visible: false }))}
      />
    </View>
  );
};
