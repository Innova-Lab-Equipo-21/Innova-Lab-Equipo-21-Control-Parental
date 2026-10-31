// ==============================================================================
// Proyecto: BA Protege+
// Componente: ParentInicioSection (Pestaña Principal / Home del Tutor Responsable)
// Archivo: src/components/dashboard/inicio/ParentInicioSection.tsx
// Descripción: Home institucional del modo Responsable compacta (sin scroll)
//              compuesta por las 5 secciones ajustadas a especificación y referencia:
//              1) Card dinámico de protección con escudo y engrenaje.png
//              2) Card de dispositivos en 2 secciones (Mi dispositivo con toggle +
//                 Dispositivos protegidos con badges y botón @dispositivos.png)
//              3) Dos cards métricas: Sitios y Apps con colores del app y botón circular (+)
//              4) Gráfico histórico compacto de intentos interceptados con CTA a Actividad
//              5) Enlace central a Preguntas frecuentes (FAQ)
// ==============================================================================

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Switch,
  LayoutChangeEvent,
} from 'react-native';
import { DeviceInfo, SelfControlState } from '../../../types';
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

const DEVICE_COLORS = ['#FACC15', '#D946EF', '#F97316', '#007AFF', '#8B5CF6'];

const DEFAULT_DEMO_DEVICES = [
  { id: 'demo-1', name: 'Ana', color: '#FACC15' },
  { id: 'demo-2', name: 'Mateo', color: '#D946EF' },
  { id: 'demo-3', name: 'Sofía', color: '#F97316' },
  { id: 'demo-4', name: 'Juan', color: '#007AFF' },
  { id: 'demo-5', name: 'Agustín', color: '#8B5CF6' },
];

export const ParentInicioSection: React.FC<ParentInicioSectionProps> = ({
  currentUser,
  devices,
  selfControl,
  customSitesCount,
  blockedAppsCount,
  grantedCount = 6,
  onNavigateToPermissions,
  onNavigateToDevices,
  onToggleSelfControl,
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
  const protectedList = devices.filter((d) => d.profileType !== 'Responsable');
  const displayDevices =
    protectedList.length > 0
      ? protectedList.slice(0, 5).map((d, idx) => ({
          id: d.deviceId || d.deviceUuid || `dev-${idx}`,
          name: d.childName || d.deviceName || `Disp. ${idx + 1}`,
          color: DEVICE_COLORS[idx % DEVICE_COLORS.length],
        }))
      : DEFAULT_DEMO_DEVICES;

  const isDeviceActive = (d: DeviceInfo) =>
    d.status === 'ACTIVE' || (d.status as any)?.effectiveStatus === 'ACTIVE' || d.isProtected;

  const countVinculados =
    protectedList.length > 0 ? protectedList.filter(isDeviceActive).length : displayDevices.length;
  const countInactivos =
    protectedList.length > 0 ? protectedList.filter((d) => !isDeviceActive(d)).length : 0;

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
      {/* Borde azul, fondo azul claro, escudo, texto en mayúscula y engrenaje  */}
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
      {/* SECCIÓN 2: CARD DE DISPOSITIVOS EN 2 SUB-SECCIONES                     */}
      {/* 1: Mi dispositivo: Autocontrol (con toggle)                            */}
      {/* 2: Dispositivos protegidos: total protegidos e inactivos + ícono       */}
      {/* ---------------------------------------------------------------------- */}
      <View style={styles.devicesCard}>
        {/* Subsección 1: Mi dispositivo */}
        <View style={styles.selfControlRow}>
          <View style={styles.selfControlLabelRow}>
            <Text style={styles.selfControlTitle}>Mi dispositivo:</Text>
          </View>

          <View style={styles.selfControlRight}>
            <Text style={styles.selfControlSubtitle}>Autocontrol</Text>
            <Switch
              value={selfControl.active}
              onValueChange={onToggleSelfControl}
              trackColor={{ false: '#D1D5DB', true: '#93C5FD' }}
              thumbColor={selfControl.active ? '#0072CE' : '#FFFFFF'}
            />
          </View>
        </View>

        <View style={styles.dividerLine} />

        {/* Subsección 2: Dispositivos protegidos */}
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
            <Image
              source={require('../../../assets/icons/navbar/dispositivos.png')}
              style={styles.devicesCtaIcon}
            />
          </TouchableOpacity>
        </View>

        {/* Fila de Avatares Circulares de Dispositivos (cada badge lleva a Dispositivos) */}
        <View style={styles.devicesRow}>
          {displayDevices.map((dev) => (
            <TouchableOpacity
              key={dev.id}
              style={styles.deviceBadgeItem}
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
        </View>
      </View>

      {/* ---------------------------------------------------------------------- */}
      {/* SECCIÓN 3: DOS CARDS (SITIOS Y APPS CON COLORES DEL APP Y BOTÓN (+))  */}
      {/* ---------------------------------------------------------------------- */}
      <View style={styles.metricsRow}>
        {/* Card: Sitios */}
        <View style={styles.metricCard}>
          <View style={styles.metricHeaderRow}>
            <Text style={styles.metricLabel}>Sitios</Text>
          </View>

          <View style={styles.metricBodyRow}>
            <View style={styles.metricNumberCol}>
              <Text style={styles.metricNumber}>{customSitesCount}</Text>
              <Text style={styles.metricSubLabel}>bloqueados</Text>
            </View>

            <TouchableOpacity
              style={styles.circularAddBtn}
              onPress={onNavigateToSites}
              activeOpacity={0.8}
              accessibilityLabel="Gestionar sitios"
            >
              <Text style={styles.circularAddBtnText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Card: Apps */}
        <View style={styles.metricCard}>
          <View style={styles.metricHeaderRow}>
            <Text style={styles.metricLabel}>Apps</Text>
          </View>

          <View style={styles.metricBodyRow}>
            <View style={styles.metricNumberCol}>
              <Text style={styles.metricNumber}>{blockedAppsCount}</Text>
              <Text style={styles.metricSubLabel}>bloqueadas</Text>
            </View>

            <TouchableOpacity
              style={styles.circularAddBtn}
              onPress={onNavigateToApps}
              activeOpacity={0.8}
              accessibilityLabel="Gestionar apps"
            >
              <Text style={styles.circularAddBtnText}>+</Text>
            </TouchableOpacity>
          </View>
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
          <ChartPolyline points={magentaPoints} color="#D946EF" strokeWidth={2} />
          <ChartPolyline points={yellowPoints} color="#FACC15" strokeWidth={2} />
          <ChartPolyline points={bluePoints} color="#007AFF" strokeWidth={2} />
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
            {displayDevices.map((dev) => (
              <View key={`leg-${dev.id}`} style={styles.legendItem}>
                <View
                  style={[styles.legendDot, { backgroundColor: dev.color }]}
                />
                <Text style={styles.legendText}>{dev.name}</Text>
              </View>
            ))}
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
