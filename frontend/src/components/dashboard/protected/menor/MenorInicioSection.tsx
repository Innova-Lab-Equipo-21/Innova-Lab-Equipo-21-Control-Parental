// ==============================================================================
// Proyecto: BA Protege+
// Componente: MenorInicioSection
// Archivo: src/components/dashboard/protected/menor/MenorInicioSection.tsx
// Descripción: Pestaña Inicio del Modo Protegido Menor que replica la estructura
//              de Inicio adaptada al perfil menor:
//              1) Saludo dinámico según horario
//              2) Bloque "DISPOSITIVO NO PROTEGIDO" / "ESTÁS PROTEGIDO" (verifica permisos)
//              3) Bloque dinámico de juegos (Quiz, Sopa de letras y Juego de la memoria)
//              4) Bloque "SI SOS MENOR NO PODES INGRESAR."
//              5) Bloque "Tiempo de uso de mis apps" con CTA hacia Actividad
//              6) Enlace "Ver preguntas frecuentes" al final
// ==============================================================================

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
} from 'react-native';
import {
  CompletedGamesState,
  INITIAL_COMPLETED_GAMES,
  PasatiempoGameId,
  SCREEN_FREE_SUGGESTION,
  getCompletedGamesCount,
  getNextAvailableGame,
} from '../../../../utils/pasatiempos';
import { FeedbackModal } from '../../../FeedbackModal';
import { BOTITO_ASSETS } from '../botAssets';
import { styles } from './MenorInicioSection.styles';

export interface MenorUsagePreviewItem {
  id: string;
  appName: string;
  minutes: number;
  fillPercent: number;
  barColor: string;
}

const DEFAULT_MENOR_USAGE_PREVIEW: MenorUsagePreviewItem[] = [
  { id: 'u1', appName: 'Instagram', minutes: 45, fillPercent: 65, barColor: '#0072CE' },
  { id: 'u2', appName: 'TikTok', minutes: 30, fillPercent: 45, barColor: '#3B82F6' },
  { id: 'u3', appName: 'YouTube', minutes: 20, fillPercent: 30, barColor: '#60A5FA' },
];

export interface MenorInicioSectionProps {
  childName?: string;
  tutorName?: string;
  grantedCount?: number; // 0 a 6 permisos concedidos
  completedGames?: CompletedGamesState;
  usagePreview?: MenorUsagePreviewItem[];
  onOpenGame: (gameId: PasatiempoGameId) => void;
  onNavigateToPermissions: () => void;
  onNavigateToPasatiempos?: () => void;
  onNavigateToActivity: () => void;
  onOpenFaq: () => void;
}

export const MenorInicioSection: React.FC<MenorInicioSectionProps> = ({
  childName,
  tutorName = 'Ana',
  grantedCount = 6,
  completedGames = INITIAL_COMPLETED_GAMES,
  usagePreview = DEFAULT_MENOR_USAGE_PREVIEW,
  onOpenGame,
  onNavigateToPermissions,
  onNavigateToPasatiempos,
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

  const greeting = getGreeting(childName);

  // 2. Estado de permisos del dispositivo (6/6 para estar protegido)
  const isProtected = grantedCount >= 6;
  const pendingCount = Math.max(0, 6 - grantedCount);

  // 3. Juego dinámico disponible (Quiz -> Sopa de letras -> Juego de la memoria)
  const nextChildGame = getNextAvailableGame(completedGames);
  const completedCount = getCompletedGamesCount(completedGames);

  // 4. Suma total de minutos de uso mostrados en el resumen
  const totalMinutes = usagePreview.reduce((acc, item) => acc + item.minutes, 0);
  const totalHoursPart = Math.floor(totalMinutes / 60);
  const totalMinsPart = totalMinutes % 60;
  const formattedTotalUsage =
    totalHoursPart > 0
      ? `${totalHoursPart}h ${totalMinsPart > 0 ? `${totalMinsPart}m` : ''}`.trim()
      : `${totalMinsPart} min`;

  const [showLearnMoreModal, setShowLearnMoreModal] = useState(false);

  const handleLearnMore = () => {
    setShowLearnMoreModal(true);
  };

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
      {/* SECCIÓN 2: BLOQUE DINÁMICO DE JUEGOS (QUIZ / SOPA DE LETRAS / MEMORIA) */}
      {/* ---------------------------------------------------------------------- */}
      {nextChildGame ? (
        <View
          style={[
            styles.gameCard,
            { backgroundColor: nextChildGame.bgColor },
          ]}
        >
          <View style={styles.gameContentRow}>
            <Image
              source={BOTITO_ASSETS.pensando}
              style={styles.gameMascot}
              resizeMode="contain"
            />
            <View style={styles.gameTextColumn}>
              {completedCount > 0 && (
                <View style={styles.gameProgressBadge}>
                  <Text style={styles.gameProgressBadgeText}>
                    {completedCount} de 3 pasatiempos completados
                  </Text>
                </View>
              )}
              <Text style={styles.gameTitle}>
                {nextChildGame.homeBannerTitle}
              </Text>
              <Text
                style={[
                  styles.gameSubtitle,
                  { color: nextChildGame.lightTextColor },
                ]}
              >
                {nextChildGame.homeBannerSubtitle}
              </Text>
              <View style={styles.gameActionsRow}>
                <TouchableOpacity
                  style={styles.gameStartButton}
                  onPress={() => onOpenGame(nextChildGame.id)}
                  activeOpacity={0.85}
                >
                  <Text
                    style={[
                      styles.gameStartButtonText,
                      { color: nextChildGame.accentTextColor },
                    ]}
                  >
                    Comenzar ➔
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      ) : (
        <View style={styles.allCompletedCard}>
          <View style={styles.allCompletedHeaderRow}>
            <Image
              source={BOTITO_ASSETS.feliz}
              style={styles.completedMascotSmall}
              resizeMode="contain"
            />
            <Text style={styles.allCompletedTitle}>
              {SCREEN_FREE_SUGGESTION.title}
            </Text>
          </View>

          <Text style={styles.completedSummaryText}>
            {SCREEN_FREE_SUGGESTION.subtitle}
          </Text>

          <View style={styles.outdoorPromptBox}>
            <Text style={styles.outdoorPromptTitle}>
              {SCREEN_FREE_SUGGESTION.tipTitle}
            </Text>
            <Text style={styles.outdoorPromptText}>
              {SCREEN_FREE_SUGGESTION.tipBody}
            </Text>

            <View style={styles.offlineTagsRow}>
              <View style={styles.offlineTagPill}>
                <Text style={styles.offlineTagText}>
                  🚶 Salir a pasear con amigos
                </Text>
              </View>
              <View style={styles.offlineTagPill}>
                <Text style={styles.offlineTagText}>
                  🎨 Tareas sin usar pantallas
                </Text>
              </View>
            </View>
          </View>

          {onNavigateToPasatiempos && (
            <TouchableOpacity
              style={styles.secondaryPasatiemposLink}
              onPress={onNavigateToPasatiempos}
              activeOpacity={0.8}
            >
              <Text style={styles.secondaryPasatiemposLinkText}>
                Ver pasatiempos ➔
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* ---------------------------------------------------------------------- */}
      {/* SECCIÓN 3: BLOQUE EDUCATIVO "SI SOS MENOR NO PODES INGRESAR."          */}
      {/* ---------------------------------------------------------------------- */}
      <View style={styles.warningBannerCard}>
        <View style={styles.warningTopHeader}>
          <Text style={styles.warningTopHeaderText}>
            SI SOS MENOR NO PODES INGRESAR.
          </Text>
        </View>

        <View style={styles.warningBodyRow}>
          <Image
            source={BOTITO_ASSETS.nervioso}
            style={styles.warningMascot}
            resizeMode="contain"
          />
          <View style={styles.warningTextColumn}>
            <Text style={styles.warningTitle}>¡CUIDADO!</Text>
            <Text style={styles.warningDescription}>
              Si sos menor no podes ingresar a sitios de adultos. Esta protección te ayudará a navegar de forma más segura y adecuada a tu edad.
            </Text>
            <TouchableOpacity
              style={styles.learnMoreButton}
              onPress={handleLearnMore}
              activeOpacity={0.85}
            >
              <Text style={styles.learnMoreButtonText}>Saber más ➔</Text>
            </TouchableOpacity>
          </View>
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

      <FeedbackModal
        visible={showLearnMoreModal}
        imageSource={BOTITO_ASSETS.pensando}
        title="Protección de navegación segura"
        message="Por normativa oficial de la Ciudad, el acceso a casinos y sitios de apuestas online está restringido para menores de 18 años para cuidar tu bienestar. Si tenés dudas, conversalo con tu responsable."
        onClose={() => setShowLearnMoreModal(false)}
      />
    </View>
  );
};
