// ==============================================================================
// Proyecto: BA Protege+
// Componente: AdultoInicioSection
// Archivo: src/components/dashboard/protected/adulto/AdultoInicioSection.tsx
// Descripción: Pestaña Inicio del Modo Protegido Adulto que replica la estructura
//              de Inicio del Modo Responsable adaptada al perfil protegido:
//              1) Saludo dinámico según horario
//              2) Bloque "DISPOSITIVO NO PROTEGIDO" / "ESTÁS PROTEGIDO" (verifica permisos)
//              3) Bloque de Quiz diario (sin opción de repetir una vez completado)
//              4) Bloques de Sitios y Apps bloqueados (respetando plurales)
//              5) Bloque "Tiempo de uso de mis apps" con CTA hacia Actividad
//              6) Enlace "Ver preguntas frecuentes" al final
// ==============================================================================

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
} from 'react-native';
import { getQuizResultMood } from '../../../../utils/botMascots';
import { BOTI_ASSETS } from '../botAssets';
import { styles } from './AdultoInicioSection.styles';

export interface AdultoUsagePreviewItem {
  id: string;
  appName: string;
  minutes: number;
  fillPercent: number;
  barColor: string;
}

const DEFAULT_USAGE_PREVIEW: AdultoUsagePreviewItem[] = [
  { id: 'u1', appName: 'Instagram', minutes: 45, fillPercent: 65, barColor: '#0072CE' },
  { id: 'u2', appName: 'TikTok', minutes: 30, fillPercent: 45, barColor: '#3B82F6' },
  { id: 'u3', appName: 'YouTube', minutes: 20, fillPercent: 30, barColor: '#60A5FA' },
];

export interface AdultoInicioSectionProps {
  adultName?: string;
  tutorName?: string;
  grantedCount?: number; // 0 a 6 permisos concedidos
  customSitesCount?: number;
  blockedAppsCount?: number;
  quizCompleted?: boolean;
  quizScore?: { score: number; total: number };
  usagePreview?: AdultoUsagePreviewItem[];
  onNavigateToPermissions: () => void;
  onOpenQuiz: () => void;
  onNavigateToSites: () => void;
  onNavigateToApps: () => void;
  onNavigateToActivity: () => void;
  onOpenFaq: () => void;
}

export const AdultoInicioSection: React.FC<AdultoInicioSectionProps> = ({
  adultName,
  tutorName = 'Ana',
  grantedCount = 6,
  customSitesCount = 0,
  blockedAppsCount = 0,
  quizCompleted = false,
  quizScore = { score: 0, total: 5 },
  usagePreview = DEFAULT_USAGE_PREVIEW,
  onNavigateToPermissions,
  onOpenQuiz,
  onNavigateToSites,
  onNavigateToApps,
  onNavigateToActivity,
  onOpenFaq,
}) => {
  // 1. Saludo dinámico conciso según hora del día
  const getGreeting = (name?: string): string => {
    const hour = new Date().getHours();
    let prefix = 'Buenos días';
    if (hour >= 12 && hour < 20) {
      prefix = 'Buenas tardes';
    } else if (hour >= 20 || hour < 5) {
      prefix = 'Buenas noches';
    }
    const sanitized = (name || '').replace(/\(.*?\)/g, '').trim();
    const firstName = sanitized.split(' ')[0];
    return firstName ? `${prefix}, ${firstName}` : prefix;
  };

  const greeting = getGreeting(adultName);

  // 2. Estado de permisos del dispositivo (6/6 para estar protegido)
  const isProtected = grantedCount >= 6;
  const pendingCount = Math.max(0, 6 - grantedCount);

  // Suma total de minutos de uso mostrados en el resumen
  const totalMinutes = usagePreview.reduce((acc, item) => acc + item.minutes, 0);
  const totalHoursPart = Math.floor(totalMinutes / 60);
  const totalMinsPart = totalMinutes % 60;
  const formattedTotalUsage =
    totalHoursPart > 0
      ? `${totalHoursPart}h ${totalMinsPart > 0 ? `${totalMinsPart}m` : ''}`.trim()
      : `${totalMinsPart} min`;

  return (
    <View style={styles.container}>
      {/* Saludo dinámico */}
      <Text style={styles.greetingText} numberOfLines={1}>
        {greeting}
      </Text>

      {/* ---------------------------------------------------------------------- */}
      {/* SECCIÓN 1: BLOQUE DE ESTADO DE PERMISOS ("DISPOSITIVO NO PROTEGIDO")   */}
      {/* ---------------------------------------------------------------------- */}
      <View
        style={[
          styles.statusCard,
          !isProtected && styles.statusCardAlert,
        ]}
      >
        <View style={styles.statusLeftContent}>
          <Image
            source={require('../../../../assets/icons/escudo.png')}
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
                ? `Estás navegando de forma segura.\nVinculado con responsable: ${tutorName}`
                : `${pendingCount} ${pendingCount === 1 ? 'permiso pendiente' : 'permisos pendientes'} por conceder.`}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.gearBtn}
          onPress={onNavigateToPermissions}
          activeOpacity={0.7}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          accessibilityLabel="Configuración de permisos"
        >
          <Image
            source={require('../../../../assets/icons/engrenaje.png')}
            style={styles.gearIcon}
          />
        </TouchableOpacity>
      </View>

      {/* ---------------------------------------------------------------------- */}
      {/* SECCIÓN 2: QUIZ DIARIO                                                 */}
      {/* El adulto NO puede repetir el Quiz una vez completado                  */}
      {/* ---------------------------------------------------------------------- */}
      {!quizCompleted ? (
        <View style={styles.quizCard}>
          <View style={styles.quizContentRow}>
            <Image
              source={BOTI_ASSETS.pensando}
              style={styles.quizMascot}
              resizeMode="contain"
            />
            <View style={styles.quizTextColumn}>
              <Text style={styles.quizTitle}>¿HACEMOS UN QUIZ?</Text>
              <Text style={styles.quizSubtitle}>
                Cuestionario diario de salud digital y toma de conciencia.
              </Text>
              <TouchableOpacity
                style={styles.quizStartButton}
                onPress={onOpenQuiz}
                activeOpacity={0.85}
              >
                <Text style={styles.quizStartButtonText}>Comenzar ➔</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      ) : (
        <View style={styles.quizCompletedCard}>
          <View style={styles.quizCompletedHeaderRow}>
            <Image
              source={BOTI_ASSETS[getQuizResultMood(quizScore.score, quizScore.total)]}
              style={styles.completedMascotSmall}
              resizeMode="contain"
            />
            <View style={styles.quizCompletedTitleCol}>
              <Text style={styles.quizCompletedTitle}>
                ¡Quiz diario completado! 🎯
              </Text>
              <Text style={styles.completedSummaryText}>
                Puntaje: {quizScore.score} / {quizScore.total} respuestas correctas.
              </Text>
            </View>
            <View style={styles.completedStatusPill}>
              <Text style={styles.completedStatusPillText}>✓ Completado</Text>
            </View>
          </View>

          <View style={styles.outdoorPromptBox}>
            <Text style={styles.outdoorPromptTitle}>
              💡 Consejo de Boti para hoy:
            </Text>
            <Text style={styles.outdoorPromptText}>
              ¡Excelente trabajo! Te sugerimos tomar un descanso de las pantallas, salir a pasear, tomar aire fresco y disfrutar del aire libre.
            </Text>
          </View>
        </View>
      )}

      {/* ---------------------------------------------------------------------- */}
      {/* SECCIÓN 3: BLOQUES DE SITIOS Y APPS BLOQUEADOS                         */}
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
            style={styles.cardActionBtn}
            onPress={onNavigateToSites}
            activeOpacity={0.8}
            accessibilityLabel="Ver sitios bloqueados"
          >
            <Text style={styles.cardActionBtnText}>Ver</Text>
          </TouchableOpacity>
        </View>

        {/* Card 2: Apps Bloqueadas */}
        <View style={styles.metricCard}>
          <Text style={styles.metricLabelRight}>
            {blockedAppsCount === 1 ? 'App' : 'Apps'}
          </Text>
          <Text style={styles.metricNumber}>{blockedAppsCount}</Text>
          <Text style={styles.metricSubLabelRight}>
            {blockedAppsCount === 1 ? 'bloqueada' : 'bloqueadas'}
          </Text>
          <TouchableOpacity
            style={styles.cardActionBtn}
            onPress={onNavigateToApps}
            activeOpacity={0.8}
            accessibilityLabel="Ver aplicaciones bloqueadas"
          >
            <Text style={styles.cardActionBtnText}>Ver</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ---------------------------------------------------------------------- */}
      {/* SECCIÓN 4: TIEMPO DE USO DE MIS APPS (CON CTA A ACTIVIDAD)             */}
      {/* ---------------------------------------------------------------------- */}
      <View style={styles.usageCard}>
        <View style={styles.usageHeaderRow}>
          <Text style={styles.usageTitle}>Tiempo de uso de mis apps</Text>
        </View>

        <View style={styles.usageListContainer}>
          {usagePreview.map((item) => (
            <View key={item.id} style={styles.usageItemRow}>
              <Text style={styles.usageAppName} numberOfLines={1}>
                {item.appName}
              </Text>
              <View style={styles.usageProgressTrack}>
                <View
                  style={[
                    styles.usageProgressFill,
                    {
                      width: `${Math.min(100, Math.max(8, item.fillPercent))}%`,
                      backgroundColor: item.barColor,
                    },
                  ]}
                />
              </View>
              <Text style={styles.usageDurationText}>{item.minutes} min</Text>
            </View>
          ))}
        </View>

        <View style={styles.usageFooter}>
          <Text style={styles.usageSummaryText}>
            Hoy: {formattedTotalUsage} • Límite diario: 3h
          </Text>

          <TouchableOpacity
            style={styles.usageMoreBtn}
            onPress={onNavigateToActivity}
            activeOpacity={0.8}
            accessibilityLabel="Ver actividad y tiempo de uso"
          >
            <Text style={styles.usageMoreText}>Ver más</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ---------------------------------------------------------------------- */}
      {/* SECCIÓN 5: VER PREGUNTAS FRECUENTES                                    */}
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
