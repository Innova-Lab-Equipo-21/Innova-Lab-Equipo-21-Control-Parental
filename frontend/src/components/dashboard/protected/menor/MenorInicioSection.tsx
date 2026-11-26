// ==============================================================================
// Proyecto: BA Protege+
// Componente: MenorInicioSection
// Archivo: src/components/dashboard/protected/menor/MenorInicioSection.tsx
// Descripción: Pestaña Inicio del Modo Protegido Menor que replica la estructura
//              de Inicio adaptada al perfil menor:
//              1) Saludo dinámico según horario
//              2) Bloque "Dispositivo no protegido" / "Dispositivo protegido" (verifica permisos)
//              3) Bloque dinámico de juegos (Quiz, Sopa de letras y Juego de la memoria)
//              4) Bloque educativo "Cuidado con los sitios y apps de adultos"
//              5) Bloque "Mis apps hoy" (AppsUsageCard) con CTA "Ver más" hacia Actividad
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
  getNextAvailableGame,
} from '../../../../utils/pasatiempos';
import { BlockedAppsUsageSummary } from '../../../../utils/appUsageMetrics';
import { colors } from '../../../../theme/colors';
import { AppsUsageCard } from '../../actividad/blocks/AppsUsageCard';
import { FeedbackModal } from '../../../FeedbackModal';
import { BOTITO_ASSETS } from '../botAssets';
import { styles } from './MenorInicioSection.styles';

const EMPTY_MENOR_USAGE_SUMMARY: BlockedAppsUsageSummary = {
  items: [],
  appsCount: 0,
  totalUsedMinutes: 0,
  totalLimitMinutes: 0,
  totalRemainingMinutes: 0,
  hasAnyTimeLimit: false,
  totalProgressPct: 0,
  appNamesLabel: '',
};

export interface MenorInicioSectionProps {
  childName?: string;
  tutorName?: string;
  grantedCount?: number; // 0 a 6 permisos concedidos
  completedGames?: CompletedGamesState;
  appsUsageSummary?: BlockedAppsUsageSummary;
  onOpenGame: (gameId: PasatiempoGameId) => void;
  onNavigateToPermissions: () => void;
  onNavigateToPasatiempos?: () => void;
  onNavigateToActivity: () => void;
  onOpenFaq: () => void;
}

export const MenorInicioSection: React.FC<MenorInicioSectionProps> = ({
  childName,
  grantedCount = 6,
  completedGames = INITIAL_COMPLETED_GAMES,
  appsUsageSummary = EMPTY_MENOR_USAGE_SUMMARY,
  onOpenGame,
  onNavigateToPermissions,
  onNavigateToPasatiempos,
  onNavigateToActivity,
  onOpenFaq,
}) => {
  // 1. Saludo conciso (solo primer nombre, replicando Protegido Adulto / Responsable)
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

  const greeting = getGreeting(childName);

  // 2. Estado de permisos del dispositivo (6/6 para estar protegido)
  const isProtected = grantedCount >= 6;
  const pendingCount = Math.max(0, 6 - grantedCount);

  // 3. Juego dinámico disponible (Juego de preguntas -> Sopa de letras -> Juego de la memoria)
  const nextChildGame = getNextAvailableGame(completedGames);

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
      {/* SECCIÓN 1: BLOQUE DE ESTADO DE PERMISOS (RÉPLICA DE ADULTO/RESPONSABLE)*/}
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
                  <Text style={styles.gameStartButtonText}>Empezar</Text>
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
            <Text style={styles.outdoorPromptText}>
              {SCREEN_FREE_SUGGESTION.tipBody}
            </Text>
          </View>

          {onNavigateToPasatiempos && (
            <TouchableOpacity
              style={styles.secondaryPasatiemposLink}
              onPress={onNavigateToPasatiempos}
              activeOpacity={0.85}
            >
              <Text style={styles.secondaryPasatiemposLinkText}>
                Ver pasatiempos
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* ---------------------------------------------------------------------- */}
      {/* SECCIÓN 3: BLOQUE EDUCATIVO "Cuidado con los sitios y apps de adultos" */}
      {/* ---------------------------------------------------------------------- */}
      <View style={styles.warningBannerCard}>
        <View style={styles.warningBodyRow}>
          <Image
            source={BOTITO_ASSETS.nervioso}
            style={styles.warningMascot}
            resizeMode="contain"
          />
          <View style={styles.warningTextColumn}>
            <Text style={styles.warningTitle}>
              Cuidado con los sitios y apps de adultos
            </Text>
            <Text style={styles.warningDescription}>
              Recordá que si sos menor de edad, no podés entrar a sitios o aplicaciones de apuestas ni ver contenido para adultos. En cambio, podés hacer actividades al aire libre o charlar en casa sobre lo que te pase.
            </Text>
            <TouchableOpacity
              style={styles.learnMoreButton}
              onPress={handleLearnMore}
              activeOpacity={0.85}
            >
              <Text style={styles.learnMoreButtonText}>Saber más</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* ---------------------------------------------------------------------- */}
      {/* SECCIÓN 4: MIS APPS HOY (CON CTA A ACTIVIDAD)                          */}
      {/* ---------------------------------------------------------------------- */}
      <AppsUsageCard
        summary={appsUsageSummary}
        variant="child"
        title="Mis apps hoy"
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

      <FeedbackModal
        visible={showLearnMoreModal}
        imageSource={BOTITO_ASSETS.pensando}
        title="Protección de navegación segura"
        message="Los sitios y las aplicaciones de apuestas no están permitidos para menores de 18 años. Esto es para cuidar tu bienestar. Si tenés dudas, podés charlar en casa sobre el tema o con la persona responsable de tu cuenta."
        onClose={() => setShowLearnMoreModal(false)}
      />
    </View>
  );
};
