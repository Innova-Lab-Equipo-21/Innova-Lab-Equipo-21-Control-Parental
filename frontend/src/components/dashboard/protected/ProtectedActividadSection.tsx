// ==============================================================================
// Proyecto: BA Protege+
// Componente: ProtectedActividadSection
// Archivo: src/components/dashboard/protected/ProtectedActividadSection.tsx
// Descripción: Pestaña Actividad ("MI USO DIARIO") que refleja el desglose de tiempo
//              de uso, barras de progreso por app y sitios bloqueados con aviso de
//              restricción por parte del Responsable.
// ==============================================================================

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { styles } from './ProtectedActividadSection.styles';

interface ProtectedActividadSectionProps {
  onOpenPinModal: () => void;
  customBlockedItems?: string[];
}

export const ProtectedActividadSection: React.FC<ProtectedActividadSectionProps> = ({
  onOpenPinModal,
  customBlockedItems = ['casino-clandestino.net', 'red-social-peligrosa.org'],
}) => {
  const handleAttemptUnlock = (itemName: string) => {
    Alert.alert(
      '🔑 PIN del tutor requerido',
      `No tienes permiso para desbloquear "${itemName}". Para realizar cambios en la lista de restricciones, solicita a tu TUTOR RESPONSABLE que ingrese su PIN oficial de 4 dígitos.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Ingresar PIN del tutor',
          onPress: () => onOpenPinModal(),
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* HEADER BANNER AZUL "MI USO DIARIO" */}
      <View style={styles.headerBanner}>
        <Text style={styles.headerBannerTitle}>MI USO DIARIO</Text>
        <TouchableOpacity
          onPress={() =>
            Alert.alert(
              '⏱️ Control de tiempo diario',
              'Visualización transparente del tiempo de uso acumulado en el dispositivo y límites configurados por tu tutor.'
            )
          }
        >
          <Text style={styles.headerBannerLink}>Ver más ➔</Text>
        </TouchableOpacity>
      </View>

      {/* FILA DE 2 ESTADÍSTICAS SUPERIORES (SIDE BY SIDE) */}
      <View style={styles.statsRow}>
        {/* Caja 1: Reloj 3D */}
        <View style={styles.statCard}>
          <View style={styles.clockIconBox}>
            <Text style={styles.clockIconText}>🕒</Text>
          </View>
          <View style={styles.statTextColumn}>
            <Text style={styles.statLabel}>Tiempo de uso</Text>
            <Text style={styles.statValueText}>3:45</Text>
            <Text style={styles.statRestantText}>Restan 01:15hs</Text>
          </View>
        </View>

        {/* Caja 2: Beti Mascot */}
        <View style={styles.statCard}>
          <Image
            source={require('../../../assets/icons/bot/beti.png')}
            style={styles.mascotIconImage}
            resizeMode="contain"
          />
          <View style={styles.statTextColumn}>
            <Text style={styles.statLabel}>Tiempo de uso</Text>
            <Text style={styles.statValueText}>05 hs 00m</Text>
            <Text style={styles.statRestantText}>Restan 05:00hs</Text>
          </View>
        </View>
      </View>

      {/* BARRAS DE PROGRESO DE USO DE APLICACIONES */}
      <View style={styles.appUsageContainer}>
        {/* App 1: Instagram / Redes */}
        <TouchableOpacity
          style={styles.appItemRow}
          onPress={() =>
            Alert.alert('Instagram', 'Tiempo de pantalla usado hoy: 45 min. Límite diario: 1h 30m.')
          }
          activeOpacity={0.8}
        >
          <View style={styles.appIconCircle}>
            <Text style={styles.appIconText}>📸</Text>
          </View>
          <View style={styles.progressTrack}>
            <View style={[styles.progressBarFill, { width: '65%' }]} />
          </View>
          <Text style={styles.appTimeText}>00:45min ›</Text>
        </TouchableOpacity>

        {/* App 2: TikTok / Videos */}
        <TouchableOpacity
          style={styles.appItemRow}
          onPress={() =>
            Alert.alert('TikTok', 'Tiempo de pantalla usado hoy: 30 min. Límite diario: 1h 00m.')
          }
          activeOpacity={0.8}
        >
          <View style={styles.appIconCircle}>
            <Text style={styles.appIconText}>🎵</Text>
          </View>
          <View style={styles.progressTrack}>
            <View style={[styles.progressBarFill, { width: '45%' }]} />
          </View>
          <Text style={styles.appTimeText}>00:30min ›</Text>
        </TouchableOpacity>

        {/* App 3: YouTube / Entretenimiento */}
        <TouchableOpacity
          style={styles.appItemRow}
          onPress={() =>
            Alert.alert('YouTube', 'Tiempo de pantalla usado hoy: 20 min. Límite diario: 1h 00m.')
          }
          activeOpacity={0.8}
        >
          <View style={styles.appIconCircle}>
            <Text style={styles.appIconText}>▶️</Text>
          </View>
          <View style={styles.progressTrack}>
            <View style={[styles.progressBarFill, { width: '30%' }]} />
          </View>
          <Text style={styles.appTimeText}>00:20min ›</Text>
        </TouchableOpacity>
      </View>

      {/* SECCIÓN ELEMENTOS BLOQUEADOS CON CANDADO PERMANENTE */}
      <Text style={styles.blockedSectionTitle}>
        Sitios y apps bloqueadas en este dispositivo
      </Text>

      {customBlockedItems.map((item, index) => (
        <TouchableOpacity
          key={index}
          style={styles.blockedCard}
          onPress={() => handleAttemptUnlock(item)}
          activeOpacity={0.85}
        >
          <View style={styles.lockIconBox}>
            <Text style={styles.lockIconText}>🔒</Text>
          </View>

          <View style={styles.blockedTextColumn}>
            <Text style={styles.blockedDomainTitle}>{item}</Text>
            <Text style={styles.blockedBadgeText}>
              🔒 Bloqueado permanentemente por responsable
            </Text>
            <Text style={styles.protectedLockNotice}>
              No podés desbloquearlo. Tocá para solicitar PIN del tutor.
            </Text>
          </View>

          <Text style={{ fontSize: 18, color: '#94A3B8' }}>🔑</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};
