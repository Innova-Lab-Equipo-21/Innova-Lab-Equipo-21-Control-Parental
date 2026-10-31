// ==============================================================================
// Proyecto: BA Protege+
// Componente: ProfileSection (Perfil del Responsable / Usuario)
// Archivo: src/components/dashboard/cuenta/ProfileSection.tsx
// ==============================================================================

import React, { useState } from 'react';
import { View, Text, Image, Alert } from 'react-native';
import { ActionButton } from '../../ActionButton';
import { EditResponsibleModal } from './EditResponsibleModal';
import { styles } from './ProfileSection.styles';

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

  const nombre = currentUser?.firstName || currentUser?.fullName?.split(' ')[0] || 'Tutor';
  const apellido = currentUser?.lastName || currentUser?.fullName?.split(' ').slice(1).join(' ') || 'Responsable';
  const telefono = currentUser?.phone || '11 5544-3322';
  const email = currentUser?.email || 'tutor@baprotege.gob.ar';

  return (
    <View style={styles.profileCard}>
      <View style={styles.profileHeader}>
        {/* Avatar con Imagen Mock Beti y Color Específico (Azul para Responsable) */}
        <View style={[styles.profileAvatarContainer, { backgroundColor: userColor }]}>
          <Image
            source={require('../../../assets/icons/bot/beti.png')}
            style={styles.avatarImage}
            resizeMode="contain"
          />
        </View>

        <View style={styles.profileInfo}>
          <Text style={styles.profileName}>{`${nombre} ${apellido}`}</Text>
          <Text style={styles.profileEmail}>{email}</Text>
          <Text style={styles.profilePhone}>{telefono}</Text>
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

      {/* Acción del Responsable */}
      {isResponsible && (
        <View style={styles.actionsRow}>
          <View style={{ flex: 1 }}>
            <ActionButton
              title="Editar perfil"
              variant="primary"
              onPress={() => setIsEditing(true)}
            />
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
