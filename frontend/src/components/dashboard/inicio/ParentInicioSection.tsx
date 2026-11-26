// ==============================================================================
// Proyecto: BA Protege+
// Componente: ParentInicioSection (Pestaña Principal / Home del Tutor Responsable)
// Archivo: src/components/dashboard/inicio/ParentInicioSection.tsx
// Descripción: Home institucional del modo Responsable compacta (sin scroll)
//              compuesta por las 5 secciones ajustadas a especificación y referencia:
//              1) Card dinámico de protección con escudo y engrenaje.png
//              2) Card de dispositivos protegidos (badges ordenados A-Z con "Yo" al final si está autoprotegido + CTA + condicional)
//              3) Cards de Sitios y Apps bloqueados con CTA Editar (Estilo imagen de referencia)
//              4) Gráfico histórico compacto de intentos interceptados con CTA a Actividad
//              5) Enlace central a Preguntas frecuentes (FAQ)
// ==============================================================================

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
} from 'react-native';
import { DeviceInfo, SelfControlState, MAX_PROTECTED_DEVICES } from '../../../types';
import { getDeviceHighlight } from '../../../utils/deviceColors';
import { BlockedAttemptRecord } from '../../../utils/activityMetrics';
import {
  AnalyticsDevice,
  TotalBlocksCard,
  useAnalyticsPanel,
} from '../actividad';
import { colors } from '../../../theme/colors';
import { styles } from './ParentInicioSection.styles';

export interface ParentInicioSectionProps {
  currentUser?: any;
  devices: DeviceInfo[];
  selfControl: SelfControlState;
  customSitesCount: number;
  blockedAppsCount: number;
  grantedCount?: number; // 0 a 6
  analyticsDevices?: AnalyticsDevice[];
  rawBlockedEvents?: BlockedAttemptRecord[];
  onNavigateToPermissions: () => void;
  onNavigateToDevices: () => void;
  onAddDevice?: () => void;
  onToggleSelfControl: () => void;
  onNavigateToSites: () => void;
  onNavigateToApps: () => void;
  onNavigateToActivity: () => void;
  onOpenFaq: () => void;
}

export const ParentInicioSection: React.FC<ParentInicioSectionProps> = ({
  currentUser,
  devices,
  selfControl,
  customSitesCount,
  blockedAppsCount,
  grantedCount = 6,
  analyticsDevices = [],
  rawBlockedEvents,
  onNavigateToPermissions,
  onNavigateToDevices,
  onAddDevice,
  onNavigateToSites,
  onNavigateToApps,
  onNavigateToActivity,
  onOpenFaq,
}) => {
  const homeAnalytics = useAnalyticsPanel({
    devices: analyticsDevices,
    rawBlockedEvents,
  });

  // 1. Saludo conciso (solo primer nombre, sin apodos largos)
  const getGreeting = (name: string): string => {
    const hour = new Date().getHours();
    let prefix = 'Buenos días';
    if (hour >= 12 && hour < 20) {
      prefix = 'Buenas tardes';
    } else if (hour >= 20 || hour < 5) {
      prefix = 'Buenas noches';
    }
    return `¡${prefix}, ${name}!`;
  };

  const rawName = currentUser?.fullName || currentUser?.name || 'Tutor';
  // Extrae solo el primer nombre y remueve paréntesis como (Robertinho)
  const sanitizedName = rawName.replace(/\(.*?\)/g, '').trim();
  const firstName = sanitizedName.split(' ')[0] || 'Tutor';
  const greeting = getGreeting(firstName);

  // Estado de protección del dispositivo responsable (6/6 concedidos)
  const isProtected = grantedCount >= 6;
  const pendingCount = Math.max(0, 6 - grantedCount);

  // Lista de dispositivos protegidos (excluyendo el propio del tutor)
  const protectedList = devices.filter((d) => d.profileType !== 'Responsable' && d.deviceId !== 'self');

  // Ordenamiento alfabético A-Z de dispositivos protegidos
  const sortedProtected = [...protectedList].sort((a, b) => {
    const nameA = (a.childName || a.deviceName || '').toLowerCase();
    const nameB = (b.childName || b.deviceName || '').toLowerCase();
    return nameA.localeCompare(nameB);
  });

  let displayDevices = sortedProtected
    .slice(0, MAX_PROTECTED_DEVICES)
    .map((d, idx) => {
      const id = d.deviceId || d.deviceUuid || `dev-${idx}`;
      const highlight = getDeviceHighlight(
        id,
        d.childName,
        d.deviceName,
        d.colorIndex ?? idx
      );
      return {
        id,
        name: d.childName || d.deviceName || `Disp. ${idx + 1}`,
        color: highlight.color,
        isSelf: false,
      };
    });

  // Cuando el responsable está autoprotegido, se añade su badge ("Yo") al FINAL de la lista
  const isSelfProtected = Boolean(
    selfControl?.active ||
    selfControl?.status === 'ACTIVE_LOCKED' ||
    selfControl?.status === 'DEACTIVATION_PENDING'
  );

  if (isSelfProtected) {
    displayDevices = [
      ...displayDevices,
      {
        id: 'self-protected-badge',
        name: 'Yo',
        color: '#007AFF',
        isSelf: true,
      },
    ];
  }

  const isDeviceActive = (d: DeviceInfo) =>
    d.status === 'ACTIVE' ||
    (d.status as any)?.effectiveStatus === 'ACTIVE' ||
    (Boolean(d.isProtected) && d.status !== 'INACTIVE');

  const countVinculados = protectedList.filter(isDeviceActive).length;
  const countInactivos = protectedList.filter((d) => !isDeviceActive(d)).length;

  const canAddMoreDevices = protectedList.length < MAX_PROTECTED_DEVICES;
  const totalBadgeItems = displayDevices.length + (canAddMoreDevices ? 1 : 0);
  const isCompactBadgesRow = totalBadgeItems >= 5;

  return (
    <View style={styles.container}>
      {/* Saludo dinámico conciso */}
      <Text style={styles.greetingText} numberOfLines={1}>
        {greeting}
      </Text>

      {/* ---------------------------------------------------------------------- */}
      {/* SECCIÓN 1: CARD DINÁMICO DE ESTADO (ESTILO FOTO DE REFERENCIA)         */}
      {/* Borde redondeado azul, fondo azul claro, escudo, textos y engrenaje  */}
      {/* ---------------------------------------------------------------------- */}
      <View
        style={[
          styles.statusCard,
          !isProtected && styles.statusCardAlert,
        ]}
      >
        <View style={styles.statusLeftContent}>
          <Image
            source={require('../../../assets/icons/escudo.png')}
            style={[
              styles.statusShieldIcon,
              { tintColor: isProtected ? colors.primaryDark : '#D97706' },
            ]}
          />
          <View style={styles.statusTextCol}>
            <Text
              style={[
                styles.statusTitle,
                !isProtected && styles.statusTitleAlert,
              ]}
              numberOfLines={1}
            >
              {isProtected ? 'Dispositivo protegido' : 'Dispositivo no protegido'}
            </Text>
            <Text
              style={[
                styles.statusSubtitle,
                !isProtected && styles.statusSubtitleAlert,
              ]}
            >
              {isProtected
                ? 'Bloqueamos de forma automática sitios y aplicaciones de apuestas ilegales no autorizados por LOTBA. Estás navegando de forma segura.'
                : `${pendingCount} ${pendingCount === 1 ? 'permiso pendiente' : 'permisos pendientes'} de activación.`}
            </Text>
          </View>
        </View>

        {/* CTA con ícono de engrenaje.png */}
        <TouchableOpacity
          style={styles.gearBtn}
          onPress={onNavigateToPermissions}
          activeOpacity={0.7}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          accessibilityLabel="Configuración de permisos"
        >
          <Image
            source={require('../../../assets/icons/engrenaje.png')}
            style={styles.gearIcon}
          />
        </TouchableOpacity>
      </View>

      {/* ---------------------------------------------------------------------- */}
      {/* SECCIÓN 2: CARD DE DISPOSITIVOS PROTEGIDOS                             */}
      {/* Dispositivos protegidos (badges) + CTA (+) condicional                 */}
      {/* ---------------------------------------------------------------------- */}
      <View style={styles.devicesCard}>
        {/* Encabezado: Dispositivos protegidos */}
        <View style={styles.devicesHeaderRow}>
          <Text style={styles.devicesHeaderTitle}>Dispositivos protegidos:</Text>

          <TouchableOpacity
            style={styles.devicesCtaBtn}
            onPress={onNavigateToDevices}
            activeOpacity={0.7}
            accessibilityLabel="Ver dispositivos"
          >
            <Text style={styles.devicesCountSummary}>
              {countVinculados} {countVinculados === 1 ? 'protegido' : 'protegidos'} • {countInactivos} {countInactivos === 1 ? 'inactivo' : 'inactivos'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Fila de Avatares Circulares de Dispositivos (Ordenados A-Z, con 'Yo' al final si está autoprotegido) + CTA (+) si < 5 */}
        <View
          style={[
            styles.devicesRow,
            !isCompactBadgesRow && styles.devicesRowSparse,
          ]}
        >
          {displayDevices.map((dev) => (
            <TouchableOpacity
              key={dev.id}
              style={[
                styles.deviceBadgeItem,
                !isCompactBadgesRow && styles.deviceBadgeItemSparse,
              ]}
              onPress={onNavigateToDevices}
              activeOpacity={0.7}
              accessibilityLabel={`Ver dispositivo ${dev.name}`}
            >
              <View
                style={[
                  styles.deviceBadgeCircle,
                  { backgroundColor: dev.color },
                ]}
              >
                <Text style={styles.deviceBadgeLetter}>
                  {dev.name.charAt(0).toUpperCase()}
                </Text>
              </View>
              <Text style={styles.deviceBadgeName} numberOfLines={1}>
                {dev.name}
              </Text>
            </TouchableOpacity>
          ))}

          {/* CTA (+) para añadir dispositivo (Solo visible si aún no se alcanzó el límite de 5 protegidos) */}
          {canAddMoreDevices && (
            <TouchableOpacity
              style={[
                styles.deviceBadgeItem,
                !isCompactBadgesRow && styles.deviceBadgeItemSparse,
              ]}
              onPress={onAddDevice || onNavigateToDevices}
              activeOpacity={0.7}
              accessibilityLabel="Añadir dispositivo"
            >
              <View style={[styles.deviceBadgeCircle, styles.addDeviceBadgeCircle]}>
                <Text style={styles.addDeviceBadgePlus}>+</Text>
              </View>
              <Text style={styles.deviceBadgeName} numberOfLines={1}>
                Nuevo dispositivo
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* ---------------------------------------------------------------------- */}
      {/* SECCIÓN 3: CARDS DE SITIOS Y APPS BLOQUEADOS CON CTA EDITAR           */}
      {/* ---------------------------------------------------------------------- */}
      <View style={styles.metricsRow}>
        {/* Card 1: Sitios Bloqueados */}
        <View style={styles.metricCard}>
          <Text style={styles.metricLabelLeft}>
            {customSitesCount === 1 ? 'Sitio' : 'Sitios'}
          </Text>
          <Text style={styles.metricNumber}>{customSitesCount}</Text>
          <Text style={styles.metricSubLabelLeft}>
            {customSitesCount === 1 ? 'bloqueado' : 'bloqueados'}
          </Text>
          <TouchableOpacity
            style={styles.cardEditBtn}
            onPress={onNavigateToSites}
            activeOpacity={0.8}
            accessibilityLabel="Editar sitios bloqueados"
          >
            <Text style={styles.cardEditBtnText}>Editar</Text>
          </TouchableOpacity>
        </View>

        {/* Card 2: Apps Bloqueadas */}
        <View style={styles.metricCard}>
          <Text style={styles.metricLabelRight}>
            {blockedAppsCount === 1 ? 'App' : 'Aplicaciones'}
          </Text>
          <Text style={styles.metricNumber}>{blockedAppsCount}</Text>
          <Text style={styles.metricSubLabelRight}>
            {blockedAppsCount === 1 ? 'bloqueada' : 'bloqueadas'}
          </Text>
          <TouchableOpacity
            style={styles.cardEditBtn}
            onPress={onNavigateToApps}
            activeOpacity={0.8}
            accessibilityLabel="Editar aplicaciones bloqueadas"
          >
            <Text style={styles.cardEditBtnText}>Editar</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ---------------------------------------------------------------------- */}
      {/* SECCIÓN 4: SUBBLOQUE 1A REAL (CANTIDAD DE INTENTOS TOTALES + VER MÁS)  */}
      {/* ---------------------------------------------------------------------- */}
      <TotalBlocksCard
        totalBlocks={homeAnalytics.totalBlocks}
        historySeries={homeAnalytics.historySeries}
        historyDateLabels={homeAnalytics.historyDateLabels}
        collapsible={false}
        initialExpanded={true}
        compact={true}
        actionLabel="Ver más"
        onActionPress={onNavigateToActivity}
      />

      {/* ---------------------------------------------------------------------- */}
      {/* SECCIÓN 5: ENLACE A PREGUNTAS FRECUENTES (FAQ)                         */}
      {/* ---------------------------------------------------------------------- */}
      <TouchableOpacity
        style={styles.faqLinkBtn}
        onPress={onOpenFaq}
        activeOpacity={0.7}
      >
        <Text style={styles.faqLinkText}>Ver preguntas frecuentes</Text>
      </TouchableOpacity>
    </View>
  );
};
