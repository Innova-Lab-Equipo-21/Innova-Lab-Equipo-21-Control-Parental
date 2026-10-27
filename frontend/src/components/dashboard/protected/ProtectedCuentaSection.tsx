// ==============================================================================
// Proyecto: BA Protege+
// Componente: ProtectedCuentaSection
// Archivo: src/components/dashboard/protected/ProtectedCuentaSection.tsx
// Descripción: Pestaña Cuenta del usuario protegido con información del dispositivo,
//              tutor vinculado, línea de orientación 24hs y controles de seguridad.
// ==============================================================================

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { styles } from './ProtectedCuentaSection.styles';

interface ProtectedCuentaSectionProps {
  deviceUuid: string;
  mode?: 'CHILD' | 'ADULT';
  tutorName?: string;
  onExitMode: () => void;
  onOpenPinModal: () => void;
}

export const ProtectedCuentaSection: React.FC<ProtectedCuentaSectionProps> = ({
  deviceUuid,
  mode = 'CHILD',
  tutorName = 'Ana',
  onExitMode,
  onOpenPinModal,
}) => {
  const handleCallHelpline = () => {
    Alert.alert(
      '📞 Línea de orientación 24hs',
      'Llamando a la Línea Gratuita de Asistencia y Prevención de Ludopatía: 0800-444-5682',
      [{ text: 'Aceptar', style: 'default' }]
    );
  };

  const handleAttemptPauseVpn = () => {
    Alert.alert(
      '🔑 PIN del tutor requerido',
      'Para pausar el motor de protección VPN, se requiere ingresar el PIN del tutor responsable.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Ingresar PIN', onPress: () => onOpenPinModal() },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* CARD DE PERFIL DEL DISPOSITIVO */}
      <View style={styles.profileCard}>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarText}>
            {mode === 'CHILD' ? '👦' : '👤'}
          </Text>
        </View>
        <View style={styles.profileTextColumn}>
          <Text style={styles.userName}>
            {mode === 'CHILD' ? 'Dispositivo menor' : 'Dispositivo adulto'}
          </Text>
          <Text style={styles.userRoleBadge}>
            ● Perfil protegido activo
          </Text>
          <Text style={styles.deviceUuidText} numberOfLines={1}>
            ID: {deviceUuid}
          </Text>
        </View>
      </View>

      {/* CARD TUTOR RESPONSABLE VINCULADO */}
      <View style={styles.tutorCard}>
        <Text style={styles.tutorTitle}>👤 Tutor responsable vinculado</Text>
        <Text style={styles.tutorDetail}>
          Responsable asignado: <Text style={{ fontWeight: '800' }}>{tutorName}</Text>
        </Text>
        <Text style={{ fontSize: 11, color: '#64748B', marginTop: 4 }}>
          Solo {tutorName} puede modificar límites de tiempo, agregar o desbloquear sitios y gestionar el PIN.
        </Text>
      </View>

      {/* CARD ASISTENCIA Y LÍNEA GRATUITA 0800-444-5682 */}
      <View style={styles.helpCard}>
        <Text style={styles.helpTitle}>💜 Línea de orientación 24hs</Text>
        <Text style={styles.helpText}>
          Atención gratuita, confidencial y especializada para consultas sobre seguridad digital, prevención de ludopatía y contención emocional.
        </Text>
        <TouchableOpacity
          style={styles.callButton}
          onPress={handleCallHelpline}
          activeOpacity={0.85}
        >
          <Text style={styles.callButtonText}>
            📞 Llamar gratis al 0800-444-5682 (24hs)
          </Text>
        </TouchableOpacity>
      </View>

      {/* CARD DE ESTADO Y AJUSTES */}
      <View style={styles.settingsCard}>
        <Text style={styles.settingsTitle}>Estado de protección del sistema</Text>

        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>Motor de filtrado VPN</Text>
          <TouchableOpacity onPress={handleAttemptPauseVpn}>
            <Text style={styles.settingValueText}>Activo 🔒</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>Protección antidesinstalación</Text>
          <Text style={styles.settingValueText}>Habilitada</Text>
        </View>

        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>Límite de tiempo diario</Text>
          <Text style={{ fontSize: 12.5, fontWeight: '800', color: '#007AFF' }}>
            3hs (1:30h rest.)
          </Text>
        </View>
      </View>

      {/* BOTÓN SALIR MODO OPERATIVO */}
      <TouchableOpacity
        style={styles.exitButton}
        onPress={onExitMode}
        activeOpacity={0.8}
      >
        <Text style={styles.exitButtonText}>Cambiar modo de operación ⚙️</Text>
      </TouchableOpacity>
    </View>
  );
};
