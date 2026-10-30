// ==============================================================================
// Proyecto: BA Protege+
// Componente: ActivitySection (Tiempo de Uso de Pantalla y Auditoría de Actividad)
// Archivo: src/components/dashboard/actividad/ActivitySection.tsx
// ==============================================================================

import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { colors } from '../../../theme/colors';
import { DeviceInfo, AppUsageItem } from '../../../types';
import { apiService } from '../../../services/api.service';
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

interface ActivitySectionProps {
  devices?: DeviceInfo[];
}

export const ActivitySection: React.FC<ActivitySectionProps> = ({ devices = [] }) => {
  const [activeTab, setActiveTab] = useState<'usage' | 'logs'>('usage');
  const [selectedDeviceFilter, setSelectedDeviceFilter] = useState<string>('all');
  const [usageStats, setUsageStats] = useState<AppUsageItem[]>([]);
  const [filter, setFilter] = useState<'ALL' | 'BLOCK' | 'ALERT' | 'SYSTEM'>('ALL');

  useEffect(() => {
    loadUsage();
  }, [selectedDeviceFilter]);

  const loadUsage = async () => {
    try {
      const stats = await apiService.getAppUsageStats(selectedDeviceFilter);
      setUsageStats(stats);
    } catch (e) {
      console.warn('Error al cargar tiempo de uso:', e);
    }
  };

  const totalUsageMinutes = usageStats.reduce((acc, curr) => acc + curr.timeInMinutes, 0);
  const totalHours = Math.floor(totalUsageMinutes / 60);
  const remainingMins = totalUsageMinutes % 60;
  const maxTimeMinutes = Math.max(...usageStats.map((u) => u.timeInMinutes), 1);

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
      <Text style={styles.title}>Actividad del sistema y uso de pantalla</Text>
      <Text style={styles.subtitle}>
        Monitoreo de tiempo en aplicaciones y registro de eventos de seguridad.
      </Text>

      {/* Subsecciones: Tiempo de uso vs Historial de logs */}
      <View style={styles.sectionTabRow}>
        <TouchableOpacity
          style={[styles.sectionTabBtn, activeTab === 'usage' && styles.sectionTabBtnActive]}
          onPress={() => setActiveTab('usage')}
        >
          <Text style={[styles.sectionTabText, activeTab === 'usage' && styles.sectionTabTextActive]}>
            📊 Tiempo de uso
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.sectionTabBtn, activeTab === 'logs' && styles.sectionTabBtnActive]}
          onPress={() => setActiveTab('logs')}
        >
          <Text style={[styles.sectionTabText, activeTab === 'logs' && styles.sectionTabTextActive]}>
            📋 Historial y auditoría
          </Text>
        </TouchableOpacity>
      </View>

      {/* VISTA 1: TIEMPO DE USO */}
      {activeTab === 'usage' && (
        <View>
          {/* Filtro por dispositivo */}
          <View style={styles.deviceFilterContainer}>
            <Text style={styles.deviceFilterTitle}>Filtrar por dispositivo:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <TouchableOpacity
                style={[
                  styles.filterChip,
                  selectedDeviceFilter === 'all' && styles.activeFilterChip,
                ]}
                onPress={() => setSelectedDeviceFilter('all')}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    selectedDeviceFilter === 'all' && styles.activeFilterChipText,
                  ]}
                >
                  🌎 Todos
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.filterChip,
                  selectedDeviceFilter === 'self' && styles.activeFilterChip,
                ]}
                onPress={() => setSelectedDeviceFilter('self')}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    selectedDeviceFilter === 'self' && styles.activeFilterChipText,
                  ]}
                >
                  📱 Mi dispositivo
                </Text>
              </TouchableOpacity>

              {devices.map((device) => (
                <TouchableOpacity
                  key={device.deviceId}
                  style={[
                    styles.filterChip,
                    selectedDeviceFilter === device.deviceId && styles.activeFilterChip,
                  ]}
                  onPress={() => setSelectedDeviceFilter(device.deviceId)}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      selectedDeviceFilter === device.deviceId && styles.activeFilterChipText,
                    ]}
                  >
                    📱 {device.childName || device.deviceName}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Tarjeta de Resumen de Tiempo */}
          <View style={styles.usageSummaryCard}>
            <Text style={styles.usageSummaryTitle}>⏱️ Tiempo total de pantalla hoy</Text>
            <Text style={styles.usageSummaryValue}>
              {totalHours > 0 ? `${totalHours}h ` : ''}
              {remainingMins}m
            </Text>
          </View>

          {/* Listado de aplicaciones con barras de progreso */}
          {usageStats.map((item) => {
            const percent = Math.min(100, Math.round((item.timeInMinutes / maxTimeMinutes) * 100));
            const itemHours = Math.floor(item.timeInMinutes / 60);
            const itemMins = item.timeInMinutes % 60;

            return (
              <View key={item.id} style={styles.usageAppCard}>
                <View style={styles.usageAppHeader}>
                  <View>
                    <Text style={styles.usageAppName}>📱 {item.appName}</Text>
                    <Text style={styles.usageAppCategory}>{item.category || 'Aplicación'}</Text>
                  </View>
                  <Text style={styles.usageAppTime}>
                    {itemHours > 0 ? `${itemHours}h ` : ''}
                    {itemMins}m
                  </Text>
                </View>

                <View style={styles.usageBarTrack}>
                  <View style={[styles.usageBarFill, { width: `${percent}%` }]} />
                </View>
              </View>
            );
          })}
        </View>
      )}

      {/* VISTA 2: HISTORIAL Y LOGS DE AUDITORÍA */}
      {activeTab === 'logs' && (
        <View>
          {/* Filtros de Logs */}
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
      )}
    </View>
  );
};
