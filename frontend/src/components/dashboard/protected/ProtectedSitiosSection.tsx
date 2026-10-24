// ==============================================================================
// Proyecto: BA Protege+
// Componente: ProtectedSitiosSection
// Archivo: src/components/dashboard/protected/ProtectedSitiosSection.tsx
// Descripción: Sección "Sitios y apps" para el usuario protegido. Muestra únicamente
//              los sitios y aplicaciones que ellos han bloqueado en su dispositivo,
//              advirtiendo que solo el tutor responsable puede autorizar el desbloqueo.
// ==============================================================================

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { styles } from './ProtectedSitiosSection.styles';

interface ProtectedSitiosSectionProps {
  customBlockedItems: string[];
  onOpenPinModal: () => void;
}

export const ProtectedSitiosSection: React.FC<ProtectedSitiosSectionProps> = ({
  customBlockedItems,
  onOpenPinModal,
}) => {
  const handleAttemptUnlock = (itemName: string) => {
    Alert.alert(
      '🔑 PIN del tutor requerido',
      `No tienes permiso para desbloquear "${itemName}". Solamente tu TUTOR RESPONSABLE podrá autorizar la remoción ingresando su PIN de 4 dígitos.`,
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
      {/* BANNER INFORMATIVO */}
      <View style={styles.infoBanner}>
        <Text style={styles.infoBannerTitle}>🌐 Mis sitios y apps restringidas</Text>
        <Text style={styles.infoBannerText}>
          En esta sección se listan los sitios web y aplicaciones que bloqueaste en este dispositivo.
        </Text>
      </View>

      <Text style={styles.sectionTitle}>
        Listado de elementos bloqueados ({customBlockedItems.length})
      </Text>

      {customBlockedItems.length > 0 ? (
        customBlockedItems.map((item, index) => {
          const isApp = item.endsWith('.app');
          const displayTitle = isApp ? item.replace('.app', '') : item;

          return (
            <TouchableOpacity
              key={index}
              style={styles.blockedCard}
              onPress={() => handleAttemptUnlock(displayTitle)}
              activeOpacity={0.85}
            >
              <View style={styles.iconBox}>
                <Text style={styles.iconText}>{isApp ? '📱' : '🌐'}</Text>
              </View>

              <View style={styles.blockedTextColumn}>
                <Text style={styles.blockedDomainTitle}>{displayTitle}</Text>
                <Text style={styles.blockedBadgeText}>
                  🔒 Bloqueado permanentemente por responsable
                </Text>
                <Text style={styles.protectedLockNotice}>
                  No podés desbloquearlo. Tocá para solicitar PIN del tutor.
                </Text>
              </View>

              <Text style={{ fontSize: 18, color: '#94A3B8' }}>🔑</Text>
            </TouchableOpacity>
          );
        })
      ) : (
        /* ESTADO VACÍO CUANDO AÚN NO HA BLOQUEADO NADA */
        <View style={styles.emptyCard}>
          <Text style={styles.emptyIconText}>🌐</Text>
          <Text style={styles.emptyTitle}>Sin sitios o apps bloqueadas</Text>
          <Text style={styles.emptySubtitle}>
            Aún no has agregado elementos a tu lista de restricciones. Toca el botón flotante (+) para restringir una dirección web o aplicación.
          </Text>
        </View>
      )}
    </View>
  );
};
