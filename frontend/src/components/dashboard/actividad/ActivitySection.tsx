// ==============================================================================
// Proyecto: BA Protege+
// Componente: ActivitySection (Historial de Actividad y Auditoría)
// Archivo: src/components/dashboard/actividad/ActivitySection.tsx
// ==============================================================================

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { colors } from '../../../theme/colors';
import { styles } from './ActivitySection.styles';

export interface ActivityLogItem {
  id: string;
  type: 'BLOCK' | 'ALERT' | 'SYSTEM' | 'LOCATION';
  title: string;
  detail: string;
  device: string;
  timestamp: string;
}

const sampleLogs: ActivityLogItem[] = [
  {
    id: '1',
    type: 'BLOCK',
    title: 'Intento de acceso bloqueado',
    detail: 'Se interceptó el dominio clandestino casino-ilegal.bet',
    device: 'Celular Sofía (Modo Protegido)',
    timestamp: 'Hace 12 min',
  },
  {
    id: '2',
    type: 'SYSTEM',
    title: 'Sincronización VPN Local',
    detail: 'Lista oficial LOTBA actualizada con 450 dominios bloqueados',
    device: 'Dispositivo Responsable',
    timestamp: 'Hace 45 min',
  },
  {
    id: '3',
    type: 'LOCATION',
    title: 'Ubicación GPS registrada',
    detail: 'Av. Corrientes 1234, CABA, Argentina',
    device: 'Tablet Mateo (Modo Protegido)',
    timestamp: 'Hace 2 horas',
  },
  {
    id: '4',
    type: 'ALERT',
    title: 'Protección Antidesinstalación',
    detail: 'Intento de cierre de la app sin PIN del tutor bloqueado',
    device: 'Celular Sofía (Modo Protegido)',
    timestamp: 'Hace 3 horas',
  },
  {
    id: '5',
    type: 'BLOCK',
    title: 'Dominio personalizado restringido',
    detail: 'Acceso a tiktok.com bloqueado según regla configurada',
    device: 'Tablet Mateo (Modo Protegido)',
    timestamp: 'Ayer, 18:30 hs',
  },
];

export const ActivitySection: React.FC = () => {
  const [filter, setFilter] = useState<'ALL' | 'BLOCK' | 'ALERT' | 'SYSTEM'>('ALL');

  const filteredLogs = sampleLogs.filter((log) => {
    if (filter === 'ALL') return true;
    return log.type === filter;
  });

  const getBadgeStyle = (type: ActivityLogItem['type']) => {
    switch (type) {
      case 'BLOCK':
        return { bg: colors.statusDangerBg, text: colors.statusDanger, icon: '🚫', label: 'BLOQUEO' };
      case 'ALERT':
        return { bg: colors.statusWarningBg, text: '#856404', icon: '⚠️', label: 'ALERTA' };
      case 'LOCATION':
        return { bg: colors.primaryLight, text: colors.primaryDark, icon: '📍', label: 'UBICACIÓN' };
      case 'SYSTEM':
      default:
        return { bg: colors.statusActiveBg, text: colors.statusActive, icon: '🛡️', label: 'SISTEMA' };
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Historial de Actividad y Auditoría</Text>
      <Text style={styles.subtitle}>
        Eventos de seguridad y bloqueos en tiempo real de dispositivos vinculados.
      </Text>

      {/* Filtros */}
      <View style={styles.filterRow}>
        {(
          [
            { key: 'ALL', label: 'Todos' },
            { key: 'BLOCK', label: 'Bloqueos' },
            { key: 'ALERT', label: 'Alertas' },
            { key: 'SYSTEM', label: 'Sistema' },
          ] as const
        ).map((f) => (
          <TouchableOpacity
            key={f.key}
            style={[styles.filterChip, filter === f.key && styles.activeFilterChip]}
            onPress={() => setFilter(f.key)}
          >
            <Text
              style={[
                styles.filterChipText,
                filter === f.key && styles.activeFilterChipText,
              ]}
            >
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Lista de Registros */}
      <ScrollView style={styles.logList} nestedScrollEnabled showsVerticalScrollIndicator={false}>
        {filteredLogs.map((item) => {
          const badge = getBadgeStyle(item.type);

          return (
            <View key={item.id} style={styles.logCard}>
              <View style={styles.logHeader}>
                <View style={[styles.badge, { backgroundColor: badge.bg }]}>
                  <Text style={[styles.badgeText, { color: badge.text }]}>
                    {badge.icon} {badge.label}
                  </Text>
                </View>
                <Text style={styles.timestamp}>{item.timestamp}</Text>
              </View>

              <Text style={styles.logTitle}>{item.title}</Text>
              <Text style={styles.logDetail}>{item.detail}</Text>
              <Text style={styles.deviceText}>📱 {item.device}</Text>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
};
