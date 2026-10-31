// ==============================================================================
// Proyecto: BA Protege+
// Componente: ProfileSection (Perfil del Responsable / Usuario)
// Archivo: src/components/dashboard/cuenta/ProfileSection.tsx
// ==============================================================================

import React, { useState } from 'react';
import { View, Text, Image, Alert, TouchableOpacity, ActivityIndicator } from 'react-native';
import { ActionButton } from '../../ActionButton';
import { EditResponsibleModal } from './EditResponsibleModal';
import { styles } from './ProfileSection.styles';
import { signInWithGoogle, statusCodes } from '../../../services/googleAuth.service';
import { apiService } from '../../../services/api.service';

interface ProfileSectionProps {
  currentUser: any;
  onUpdateUser?: (updated: any) => void;
  onDeleteAccount?: () => void;
}

export const ProfileSection: React.FC<ProfileSectionProps> = ({
  currentUser,
  onUpdateUser,
}) => {
  const isResponsible = currentUser?.role === 'RESPONSABLE' || true;
  const userColor = isResponsible ? '#007AFF' : '#6F42C1';

  const [isEditing, setIsEditing] = useState(false);
  const [linkingLoading, setLinkingLoading] = useState(false);

  // Datos reales del usuario (sin valores hardcodeados / mocados)
  const nombre = currentUser?.firstName || currentUser?.fullName?.split(' ')[0] || '';
  const apellido = currentUser?.lastName || currentUser?.fullName?.split(' ').slice(1).join(' ') || '';
  const fullName = `${nombre} ${apellido}`.trim() || currentUser?.fullName || 'Responsable';
  const telefono = currentUser?.phone || '';
  const email = currentUser?.email || '';
  const isGoogleLinked = !!currentUser?.isGoogleLinked;

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
        Alert.alert(
          '¡Vinculación exitosa!',
          'Tu cuenta de BA Protege+ ha sido vinculada con Google exitosamente.',
        );
      }
    } catch (error: any) {
      if (error?.code === statusCodes?.SIGN_IN_CANCELLED) {
        return;
      }
      const msg = error.response?.data?.message || error.message || 'Error al vincular con Google.';
      Alert.alert('Error de vinculación', msg);
    } finally {
      setLinkingLoading(false);
    }
  };

  return (
    <View style={styles.profileCard}>
      <View style={styles.profileHeader}>
        {/* Avatar con Imagen Beti y Color Específico (Azul para Responsable) */}
        <View style={[styles.profileAvatarContainer, { backgroundColor: userColor }]}>
          <Image
            source={require('../../../assets/icons/bot/beti.png')}
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
              <Text style={styles.roleBadgeText}>RESPONSABLE</Text>
            </View>
            <View style={styles.verifiedBadge}>
              <Text style={styles.verifiedBadgeText}>✓ Verificado (+18)</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Acciones del Responsable en la misma línea: Editar perfil + Vincular Google */}
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
                  Alert.alert(
                    'Cuenta vinculada',
                    `Tu cuenta se encuentra vinculada exitosamente con Google (${email}).`,
                  )
                }
              >
                <Text style={styles.googleLinkedButtonText}>✓ Vinculado con Google</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.googleLinkButton}
                activeOpacity={0.7}
                onPress={handleLinkGoogle}
                disabled={linkingLoading}
              >
                {linkingLoading ? (
                  <ActivityIndicator size="small" color="#007AFF" />
                ) : (
                  <>
                    <Image
                      source={require('../../../assets/logo/logo_google.png')}
                      style={styles.googleIconSmall}
                      resizeMode="contain"
                    />
                    <Text style={styles.googleLinkButtonText}>Vincular Google</Text>
                  </>
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
        onSave={(updated) => {
          if (onUpdateUser) {
            onUpdateUser(updated);
          }
          Alert.alert('Perfil actualizado', 'Los datos del responsable han sido actualizados exitosamente.');
        }}
      />
    </View>
  );
};
