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

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  LayoutChangeEvent,
} from 'react-native';
import { DeviceInfo, SelfControlState, MAX_PROTECTED_DEVICES } from '../../../types';
import { getDeviceHighlight } from '../../../utils/deviceColors';
import { styles } from './ParentInicioSection.styles';

export interface ParentInicioSectionProps {
  currentUser?: any;
  devices: DeviceInfo[];
  selfControl: SelfControlState;
  customSitesCount: number;
  blockedAppsCount: number;
  grantedCount?: number; // 0 a 6
  onNavigateToPermissions: () => void;
  onNavigateToDevices: () => void;
  onAddDevice?: () => void;
  onToggleSelfControl: () => void;
  onNavigateToSites: () => void;
  onNavigateToApps: () => void;
  onNavigateToActivity: () => void;
  onOpenFaq: () => void;
}

interface Point {
  x: number;
  y: number;
}

interface ChartPolylineProps {
  points: Point[];
  color: string;
  strokeWidth?: number;
}

/**
 * Renderizador matemático de polilíneas continuas en React Native puro
 * (sin dependencias nativas externas, 60fps).
 */
const ChartPolyline: React.FC<ChartPolylineProps> = ({
  points,
  color,
  strokeWidth = 2,
}) => {
  if (!points || points.length < 2) return null;

  return (
    <>
      {points.slice(0, -1).map((p1, idx) => {
        const p2 = points[idx + 1];
        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        const len = Math.hypot(dx, dy);
        if (len === 0) return null;
        const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
        const midX = (p1.x + p2.x) / 2;
        const midY = (p1.y + p2.y) / 2;

        return (
          <View
            key={`seg-${idx}`}
            style={{
              position: 'absolute',
              left: midX - len / 2,
              top: midY - strokeWidth / 2,
              width: len,
              height: strokeWidth,
              borderRadius: strokeWidth / 2,
              backgroundColor: color,
              transform: [{ rotate: `${angle}deg` }],
            }}
          />
        );
      })}
    </>
  );
};

export const ParentInicioSection: React.FC<ParentInicioSectionProps> = ({
  currentUser,
  devices,
  selfControl,
  customSitesCount,
  blockedAppsCount,
  grantedCount = 6,
  onNavigateToPermissions,
  onNavigateToDevices,
  onAddDevice,
  onNavigateToSites,
  onNavigateToApps,
  onNavigateToActivity,
  onOpenFaq,
}) => {
  const [chartWidth, setChartWidth] = useState<number>(320);

  // 1. Saludo conciso (solo primer nombre, sin apodos largos)
  const getGreeting = (name: string): string => {
    const hour = new Date().getHours();
    let prefix = 'Buenos días';
    if (hour >= 12 && hour < 20) {
      prefix = 'Buenas tardes';
    } else if (hour >= 20 || hour < 5) {
      prefix = 'Buenas noches';
    }
    return `${prefix}, ${name}`;
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

  // Curvas matemáticas del gráfico compacto
  const W = chartWidth > 0 ? chartWidth : 320;
  const H = 56;
  const baselineY = H - 4;

  const bluePoints: Point[] = [
    { x: 0, y: baselineY },
    { x: W * 0.05, y: baselineY },
    { x: W * 0.12, y: baselineY * 0.72 },
    { x: W * 0.16, y: baselineY * 0.18 },
    { x: W * 0.2, y: baselineY * 0.78 },
    { x: W * 0.24, y: baselineY },
    { x: W * 0.58, y: baselineY },
    { x: W * 0.62, y: baselineY * 0.7 },
    { x: W * 0.65, y: baselineY * 0.8 },
    { x: W * 0.68, y: baselineY },
    { x: W * 0.77, y: baselineY },
    { x: W * 0.82, y: baselineY * 0.12 },
    { x: W * 0.87, y: baselineY * 0.82 },
    { x: W * 0.9, y: baselineY },
    { x: W, y: baselineY },
  ];

  const magentaPoints: Point[] = [
    { x: 0, y: baselineY },
    { x: W * 0.38, y: baselineY },
    { x: W * 0.43, y: baselineY * 0.2 },
    { x: W * 0.46, y: baselineY * 0.82 },
    { x: W * 0.48, y: baselineY },
    { x: W, y: baselineY },
  ];

  const yellowPoints: Point[] = [
    { x: 0, y: baselineY },
    { x: W * 0.44, y: baselineY },
    { x: W * 0.47, y: baselineY * 0.18 },
    { x: W * 0.5, y: baselineY * 0.35 },
    { x: W * 0.53, y: baselineY * 0.88 },
    { x: W * 0.56, y: baselineY },
    { x: W, y: baselineY },
  ];

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
              !isProtected && { tintColor: '#D97706' },
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
              {isProtected ? 'ESTÁS PROTEGIDO' : 'DISPOSITIVO NO PROTEGIDO'}
            </Text>
            <Text
              style={[
                styles.statusSubtitle,
                !isProtected && styles.statusSubtitleAlert,
              ]}
              numberOfLines={2}
            >
              {isProtected
                ? 'Estás navegando de forma segura.\nEste dispositivo está vinculado.'
                : `${pendingCount} ${pendingCount === 1 ? 'permiso pendiente' : 'permisos pendientes'} por conceder.`}
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
            {customSitesCount > 1 ? 'Sitios' : 'Sitio'}
          </Text>
          <Text style={styles.metricNumber}>{customSitesCount}</Text>
          <Text style={styles.metricSubLabelLeft}>
            {customSitesCount > 1 ? 'bloqueados' : 'bloqueado'}
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
            {blockedAppsCount > 1 ? 'Apps' : 'App'}
          </Text>
          <Text style={styles.metricNumber}>{blockedAppsCount}</Text>
          <Text style={styles.metricSubLabelRight}>
            {blockedAppsCount > 1 ? 'bloqueadas' : 'bloqueada'}
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
      {/* SECCIÓN 4: GRÁFICO HISTÓRICO COMPACTO DE INTENTOS                      */}
      {/* ---------------------------------------------------------------------- */}
      <View style={styles.chartCard}>
        <View style={styles.chartHeaderRow}>
          <Text style={styles.chartTitle}>
            Historial de intentos a sitios bloqueados
          </Text>
        </View>

        {/* Lienzo del Gráfico */}
        <View
          style={styles.chartArea}
          onLayout={(e: LayoutChangeEvent) => {
            const { width } = e.nativeEvent.layout;
            if (width > 0) setChartWidth(width);
          }}
        >
          <View style={styles.chartBaseline} />
          {displayDevices.length > 0 ? (
            <>
              {displayDevices[2] && (
                <ChartPolyline points={magentaPoints} color={displayDevices[2].color} strokeWidth={2} />
              )}
              {displayDevices[1] && (
                <ChartPolyline points={yellowPoints} color={displayDevices[1].color} strokeWidth={2} />
              )}
              {displayDevices[0] && (
                <ChartPolyline points={bluePoints} color={displayDevices[0].color} strokeWidth={2} />
              )}
            </>
          ) : (
            <View style={styles.chartEmptyContainer}>
              <Text style={styles.chartEmptyText}>Sin intentos registrados</Text>
            </View>
          )}
        </View>

        {/* Fechas en el Eje X */}
        <View style={styles.chartDatesRow}>
          <Text style={styles.chartDateText}>10 SEP</Text>
          <Text style={styles.chartDateText}>10 OCT</Text>
          <Text style={styles.chartDateText}>27 OCT</Text>
        </View>

        {/* Pie del Gráfico con Leyenda y Botón Ver más */}
        <View style={styles.chartFooter}>
          <View style={styles.legendBadgesRow}>
            {displayDevices.length > 0 ? (
              displayDevices.map((dev) => (
                <View key={`leg-${dev.id}`} style={styles.legendItem}>
                  <View
                    style={[styles.legendDot, { backgroundColor: dev.color }]}
                  />
                  <Text style={styles.legendText}>{dev.name}</Text>
                </View>
              ))
            ) : (
              <Text style={styles.legendEmptyText}>Sin dispositivos vinculados</Text>
            )}
          </View>

          <TouchableOpacity
            style={styles.chartMoreBtn}
            onPress={onNavigateToActivity}
            activeOpacity={0.8}
          >
            <Text style={styles.chartMoreText}>Ver más</Text>
          </TouchableOpacity>
        </View>
      </View>

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
