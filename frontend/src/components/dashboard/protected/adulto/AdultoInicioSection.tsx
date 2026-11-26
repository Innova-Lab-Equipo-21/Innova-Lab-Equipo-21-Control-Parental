// ==============================================================================
// Proyecto: BA Protege+
// Componente: AdultoInicioSection
// Archivo: src/components/dashboard/protected/adulto/AdultoInicioSection.tsx
// Descripción: Pestaña Inicio del Modo Protegido Adulto que replica la estructura
//              de Inicio del Modo Responsable adaptada al perfil protegido:
//              1) Saludo dinámico según horario
//              2) Bloque "Dispositivo no protegido" / "Dispositivo protegido" (verifica permisos)
//              3) Bloque de Quiz diario (sin opción de repetir una vez completado)
//              4) Bloques de Sitios y Apps bloqueados (respetando plurales)
//              5) Bloque "Tiempo de uso de las aplicaciones" (AppsUsageCard) con CTA "Ver más" hacia Actividad
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
import { BlockedAppsUsageSummary } from '../../../../utils/appUsageMetrics';
import { colors } from '../../../../theme/colors';
import { AppsUsageCard } from '../../actividad/blocks/AppsUsageCard';
import { BOTI_ASSETS } from '../botAssets';
import { styles } from './AdultoInicioSection.styles';

const EMPTY_USAGE_SUMMARY: BlockedAppsUsageSummary = {
  items: [],
  appsCount: 0,
  totalUsedMinutes: 0,
  totalLimitMinutes: 0,
  totalRemainingMinutes: 0,
  hasAnyTimeLimit: false,
  totalProgressPct: 0,
  appNamesLabel: '',
};

export interface AdultoInicioSectionProps {
  adultName?: string;
  tutorName?: string;
  grantedCount?: number; // 0 a 6 permisos concedidos
  customSitesCount?: number;
  blockedAppsCount?: number;
  quizCompleted?: boolean;
  quizScore?: { score: number; total: number };
  appsUsageSummary?: BlockedAppsUsageSummary;
  onNavigateToPermissions: () => void;
  onOpenQuiz: () => void;
  onNavigateToSites: () => void;
  onNavigateToApps: () => void;
  onNavigateToActivity: () => void;
  onOpenFaq: () => void;
}

export const AdultoInicioSection: React.FC<AdultoInicioSectionProps> = ({
  adultName,
  grantedCount = 6,
  customSitesCount = 0,
  blockedAppsCount = 0,
  quizCompleted = false,
  quizScore = { score: 0, total: 5 },
  appsUsageSummary = EMPTY_USAGE_SUMMARY,
  onNavigateToPermissions,
  onOpenQuiz,
  onNavigateToSites,
  onNavigateToApps,
  onNavigateToActivity,
  onOpenFaq,
}) => {
  // 1. Saludo conciso (solo primer nombre, sin apodos largos, replicando Responsable)
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
    return firstName ? `¡${prefix}, ${firstName}!` : `¡${prefix}!`;
  };

  const greeting = getGreeting(adultName);

  // 2. Estado de permisos del dispositivo (6/6 para estar protegido)
  const isProtected = grantedCount >= 6;
  const pendingCount = Math.max(0, 6 - grantedCount);

  return (
    <View style={styles.container}>
      {/* Saludo dinámico */}
      <Text style={styles.greetingText} numberOfLines={1}>
        {greeting}
      </Text>

      {/* ---------------------------------------------------------------------- */}
      {/* SECCIÓN 1: BLOQUE DE ESTADO DE PERMISOS (RÉPLICA DE RESPONSABLE)       */}
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
              <Text style={styles.quizTitle}>¿Hacemos un juego de preguntas?</Text>
              <Text style={styles.quizSubtitle}>
                Poné a prueba tus conocimientos sobre los cuidados digitales de forma lúdica.
              </Text>
              <TouchableOpacity
                style={styles.quizStartButton}
                onPress={onOpenQuiz}
                activeOpacity={0.85}
              >
                <Text style={styles.quizStartButtonText}>Empezar</Text>
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
                ¡Juego de preguntas completado! 🎯
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
      {/* SECCIÓN 4: TIEMPO DE USO DE LAS APLICACIONES (CON CTA A ACTIVIDAD)     */}
      {/* ---------------------------------------------------------------------- */}
      <AppsUsageCard
        summary={appsUsageSummary}
        variant="adult"
        title="Tiempo de uso de las aplicaciones"
        actionLabel="Ver más"
        onActionPress={onNavigateToActivity}
      />

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
