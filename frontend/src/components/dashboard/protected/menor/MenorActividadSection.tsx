// ==============================================================================
// Proyecto: BA Protege+
// Componente: MenorActividadSection
// Archivo: src/components/dashboard/protected/menor/MenorActividadSection.tsx
// Descripción: Pestaña Actividad ("MI USO DIARIO") para el Modo Protegido Menor,
//              con desglose de tiempo de uso, barras de progreso, sitios
//              bloqueados y mensajes acompañados por Botito.
// ==============================================================================

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ImageSourcePropType,
} from 'react-native';
import { FeedbackModal } from '../../../FeedbackModal';
import { BOTITO_ASSETS } from '../botAssets';
import { styles } from './MenorActividadSection.styles';

interface MenorActividadSectionProps {
  onOpenPinModal: () => void;
  customBlockedItems?: string[];
}

export const MenorActividadSection: React.FC<MenorActividadSectionProps> = ({
  onOpenPinModal,
  customBlockedItems = ['casino-clandestino.net', 'red-social-peligrosa.org'],
}) => {
  const [modalState, setModalState] = useState<{
    visible: boolean;
    imageSource: ImageSourcePropType;
    title: string;
    message: string;
    requestPin?: boolean;
  }>({
    visible: false,
    imageSource: BOTITO_ASSETS.pensando,
    title: '',
    message: '',
    requestPin: false,
  });

  const handleAttemptUnlock = (itemName: string) => {
    setModalState({
      visible: true,
      imageSource: BOTITO_ASSETS.triste,
      title: 'PIN del tutor requerido',
      message: `No tenés permiso para desbloquear "${itemName}". Para realizar cambios en la lista de restricciones, pedile a tu responsable que ingrese su PIN oficial de 4 dígitos.`,
      requestPin: true,
    });
  };

  const handleShowUsageInfo = (title: string, message: string) => {
    setModalState({
      visible: true,
      imageSource: BOTITO_ASSETS.pensando,
      title,
      message,
      requestPin: false,
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerBanner}>
        <Text style={styles.headerBannerTitle}>MI USO DIARIO</Text>
        <TouchableOpacity
          onPress={() =>
            handleShowUsageInfo(
              'Control de tiempo diario',
              'Visualización transparente del tiempo de uso acumulado en el dispositivo y límites configurados por tu tutor.'
            )
          }
        >
          <Text style={styles.headerBannerLink}>Ver más ➔</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.statsRow}>
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

        <View style={styles.statCard}>
          <Image
            source={BOTITO_ASSETS.pensando}
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

      <View style={styles.appUsageContainer}>
        <TouchableOpacity
          style={styles.appItemRow}
          onPress={() =>
            handleShowUsageInfo(
              'Instagram',
              'Tiempo de pantalla usado hoy: 45 min. Límite diario: 1h 30m.'
            )
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

        <TouchableOpacity
          style={styles.appItemRow}
          onPress={() =>
            handleShowUsageInfo(
              'TikTok',
              'Tiempo de pantalla usado hoy: 30 min. Límite diario: 1h 00m.'
            )
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

        <TouchableOpacity
          style={styles.appItemRow}
          onPress={() =>
            handleShowUsageInfo(
              'YouTube',
              'Tiempo de pantalla usado hoy: 20 min. Límite diario: 1h 00m.'
            )
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

      <FeedbackModal
        visible={modalState.visible}
        imageSource={modalState.imageSource}
        title={modalState.title}
        message={modalState.message}
        buttonText={modalState.requestPin ? 'Ingresar PIN' : 'Entendido'}
        secondaryButtonText={modalState.requestPin ? 'Cancelar' : undefined}
        onSecondaryPress={() =>
          setModalState((prev) => ({ ...prev, visible: false }))
        }
        onConfirm={() => {
          const shouldOpenPin = modalState.requestPin;
          setModalState((prev) => ({ ...prev, visible: false }));
          if (shouldOpenPin) {
            onOpenPinModal();
          }
        }}
        onClose={() => setModalState((prev) => ({ ...prev, visible: false }))}
      />
    </View>
  );
};
