// ==============================================================================
// Proyecto: BA Protege+
// Componente: Frontend Mobile (Pantalla del Dispositivo Protegido)
// Archivo: src/screens/ProtectedDeviceScreen.tsx
// Descripción: Panel del usuario protegido separado modularmente entre:
//              - Menor (protected/menor): Inicio, Pasatiempos, Actividad y Cuenta.
//              - Adulto (protected/adulto): Inicio, Sitios y apps (FAB +), Actividad y Cuenta.
//              - Juegos (protected/juegos): Quiz, Sopa de letras y Juego de la memoria.
// ==============================================================================

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  Image,
  ImageSourcePropType,
  Modal,
} from 'react-native';
import {
  MenorNavbar,
  MenorInicioSection,
  MenorPasatiemposSection,
  MenorActividadSection,
  MenorCuentaSection,
} from '../components/dashboard/protected/menor';
import {
  AdultoNavbar,
  AdultoInicioSection,
  AdultoSitiosSection,
  AdultoActividadSection,
  AdultoCuentaSection,
} from '../components/dashboard/protected/adulto';
import {
  QuizModal,
  WordSearchModal,
  MemoryGameModal,
} from '../components/dashboard/protected/juegos';
import { Header } from '../components/Header';
import { PinKeyboard } from '../components/PinKeyboard';
import { ActionButton } from '../components/ActionButton';
import { FabWithTooltip } from '../components/FabWithTooltip';
import { FeedbackModal } from '../components/FeedbackModal';
import { FaqModal } from '../components/dashboard/cuenta/FaqModal';
import { getBotMascotImage } from '../components/dashboard/protected/botAssets';
import { OnboardingScreen } from './OnboardingScreen';
import { PermissionsScreen, PermissionItemState } from './PermissionsScreen';
import { CustomBlockedApp, CustomBlockedDomain, DeviceInfo } from '../types';
import {
  CompletedGamesState,
  INITIAL_COMPLETED_GAMES,
  PasatiempoGameId,
  ProtectedTab,
  canPlayPasatiempoGame,
  getCompletedGamesCount,
  normalizeProtectedTabForMode,
} from '../utils/pasatiempos';
import { isItemVisibleForAdultoDevice } from '../utils/adultoSitios';
import { checkRealDevicePermissions } from '../utils/permissionChecker';
import { saveNavigationState } from '../utils/navigationSession';
import { protectionService } from '../services/protection.service';
import { apiService } from '../services/api.service';
import { styles } from './ProtectedDeviceScreen.styles';

interface ProtectedDeviceScreenProps {
  deviceUuid: string;
  onExitMode: () => void;
  mode?: 'CHILD' | 'ADULT';
  permissions?: PermissionItemState;
  onOpenPermissions?: () => void;
}

export const ProtectedDeviceScreen: React.FC<ProtectedDeviceScreenProps> = ({
  deviceUuid,
  onExitMode,
  mode = 'CHILD',
}) => {
  const [activeTab, setActiveTab] = useState<ProtectedTab>('inicio');

  // Estado compartido de juegos entre Inicio y Pasatiempos
  const [completedGames, setCompletedGames] = useState<CompletedGamesState>(
    INITIAL_COMPLETED_GAMES
  );
  const [completedGamesOrder, setCompletedGamesOrder] = useState<PasatiempoGameId[]>([]);
  const [activeGameModal, setActiveGameModal] = useState<PasatiempoGameId | null>(null);
  const [quizScore, setQuizScore] = useState<{ score: number; total: number }>({
    score: 0,
    total: 5,
  });

  // Listas reales de sitios y apps bloqueadas para Modo Protegido Adulto y Actividad
  const [customSites, setCustomSites] = useState<CustomBlockedDomain[]>([]);
  const [customApps, setCustomApps] = useState<CustomBlockedApp[]>([]);
  const [pairedDevices, setPairedDevices] = useState<DeviceInfo[]>([]);
  const [adultoSitiosSubTab, setAdultoSitiosSubTab] = useState<'sites' | 'apps'>('sites');
  const [adultoInitialSubTab, setAdultoInitialSubTab] = useState<'sites' | 'apps'>('sites');
  const adultoAddHandlerRef = useRef<(() => void) | null>(null);

  // Estado real de permisos (tanto Menor como Adulto pueden activar permisos, nunca desactivar)
  const [grantedPermsCount, setGrantedPermsCount] = useState<number>(6);
  const [showPermissionsModal, setShowPermissionsModal] = useState<boolean>(false);
  const [showFaqModal, setShowFaqModal] = useState<boolean>(false);
  const [showOnboardingFlow, setShowOnboardingFlow] = useState<boolean>(false);

  // Modal Teclado PIN para tutor y retroalimentación con Boti / Botito
  const [showPinModal, setShowPinModal] = useState<boolean>(false);
  const [enteredPin, setEnteredPin] = useState<string>('');
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);
  const [pinFeedback, setPinFeedback] = useState<{
    visible: boolean;
    imageSource?: ImageSourcePropType;
    title: string;
    message: string;
  }>({
    visible: false,
    title: '',
    message: '',
  });

  const refreshPermissions = useCallback(async () => {
    try {
      const real = await checkRealDevicePermissions(deviceUuid);
      setGrantedPermsCount(real.grantedCount);
    } catch (e) {
      // Mantener conteo actual si falla la lectura
    }
  }, [deviceUuid]);

  const loadCustomBlockedList = useCallback(async () => {
    try {
      const [res, devRes] = await Promise.all([
        apiService.getCustomBlocklist(),
        apiService.listDevices().catch(() => null),
      ]);
      setCustomSites(res.data?.domains || []);
      setCustomApps(res.data?.apps || []);
      if (devRes?.data && Array.isArray(devRes.data)) {
        setPairedDevices(devRes.data);
      }
    } catch (e) {
      // Mantener estado actual ante error de red
    }
  }, []);

  useEffect(() => {
    checkVpnStatus();
    loadCustomBlockedList();
    refreshPermissions();
  }, [loadCustomBlockedList, refreshPermissions]);

  useEffect(() => {
    setActiveTab((prev) => normalizeProtectedTabForMode(prev, mode));
  }, [mode]);

  const checkVpnStatus = async () => {
    try {
      await protectionService.isProtectionActive();
    } catch (e) {
      console.warn('Servicio VPN en modo emulador');
    }
  };

  const handleMarkGameCompleted = (gameId: PasatiempoGameId) => {
    setCompletedGames((prev) => ({
      ...prev,
      [gameId]: true,
    }));
    setCompletedGamesOrder((prev) =>
      prev.includes(gameId) ? prev : [...prev, gameId]
    );
  };

  const handleOpenChildGame = (gameId: PasatiempoGameId) => {
    if (!canPlayPasatiempoGame(completedGames, gameId)) {
      return;
    }
    setActiveGameModal(gameId);
  };

  // El adulto protegido tampoco puede repetir el Quiz una vez completado
  const handleOpenAdultQuiz = () => {
    if (!canPlayPasatiempoGame(completedGames, 'quiz')) {
      return;
    }
    setActiveGameModal('quiz');
  };

  const handleCompleteQuiz = (score: number, total: number) => {
    setQuizScore({ score, total });
    handleMarkGameCompleted('quiz');
    setActiveGameModal(null);
  };

  const handlePinKeyPress = (key: string) => {
    if (enteredPin.length < 4) {
      const newPin = enteredPin + key;
      setEnteredPin(newPin);
      if (newPin.length === 4) {
        if (newPin === '1234') {
          setShowPinModal(false);
          setEnteredPin('');
          if (pendingAction) {
            pendingAction();
            setPendingAction(null);
          } else {
            setPinFeedback({
              visible: true,
              imageSource: getBotMascotImage(mode, 'feliz'),
              title: 'PIN correcto',
              message: 'Acción de tutor autorizada exitosamente.',
            });
          }
        } else {
          setEnteredPin('');
          setPinFeedback({
            visible: true,
            imageSource: getBotMascotImage(mode, 'triste'),
            title: 'PIN incorrecto',
            message: 'El código de tutor es inválido (Demo: 1234). Intentá nuevamente.',
          });
        }
      }
    }
  };

  const handlePinDelete = () => {
    setEnteredPin((prev) => prev.slice(0, -1));
  };

  const triggerTutorPinAction = (action: () => void) => {
    setPendingAction(() => action);
    setEnteredPin('');
    setShowPinModal(true);
  };

  const openTutorPinAlert = (alertMessage: string) =>
    triggerTutorPinAction(() => {
      setPinFeedback({
        visible: true,
        imageSource: getBotMascotImage(mode, 'feliz'),
        title: 'Modificación autorizada',
        message: alertMessage,
      });
    });

  // Identificación del dispositivo protegido vinculado (Menor o Adulto)
  const matchedChildDevice =
    pairedDevices.find(
      (d) =>
        (d.deviceUuid === deviceUuid || d.deviceId === deviceUuid) &&
        d.profileType === 'Menor'
    ) || pairedDevices.find((d) => d.profileType === 'Menor');
  const resolvedChildName =
    matchedChildDevice?.childName || matchedChildDevice?.deviceName || undefined;
  const resolvedChildPhone = matchedChildDevice?.phone || undefined;

  const matchedAdultDevice =
    pairedDevices.find(
      (d) => d.deviceUuid === deviceUuid || d.deviceId === deviceUuid
    ) || pairedDevices.find((d) => d.profileType === 'Adulto');
  const resolvedAdultDeviceId = matchedAdultDevice?.deviceId || deviceUuid;
  const resolvedAdultName =
    matchedAdultDevice?.childName || matchedAdultDevice?.deviceName || undefined;
  const resolvedAdultPhone = matchedAdultDevice?.phone || undefined;

  const adultVisibleSites = customSites.filter((s) =>
    isItemVisibleForAdultoDevice(s, resolvedAdultDeviceId)
  );
  const adultVisibleApps = customApps.filter((a) =>
    isItemVisibleForAdultoDevice(a, resolvedAdultDeviceId)
  );

  // Lista combinada de nombres para las vistas de Actividad
  const customBlockedItems: string[] = [
    ...customSites.filter((s) => s.isActive !== false).map((s) => s.domain),
    ...customApps.filter((a) => a.isActive !== false).map((a) => a.appName),
  ];

  const completedCount = getCompletedGamesCount(completedGames);

  const handleOpenPermissions = () => {
    saveNavigationState({ activeScreen: 'PERMISSIONS' }).catch(() => {});
    setShowPermissionsModal(true);
  };

  if (showPermissionsModal) {
    return (
      <PermissionsScreen
        flowSource="DEVICE_PAIRING"
        allowDisablePermissions={false}
        protectedProfile={mode}
        userId={deviceUuid}
        onPermissionsComplete={() => {
          saveNavigationState({ activeScreen: 'PROTECTED_DEVICE' }).catch(() => {});
          setShowPermissionsModal(false);
          refreshPermissions();
        }}
        onBack={() => {
          saveNavigationState({ activeScreen: 'PROTECTED_DEVICE' }).catch(() => {});
          setShowPermissionsModal(false);
          refreshPermissions();
        }}
      />
    );
  }

  if (showOnboardingFlow) {
    return (
      <OnboardingScreen
        initialStep={1}
        completeButtonText="Cerrar"
        onComplete={() => setShowOnboardingFlow(false)}
      />
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* 1. TOP HEADER INSTITUCIONAL (#EAF3FF) CON LOGO Y BADGE DE MODO */}
      <View style={styles.topHeaderBar}>
        <View style={styles.topHeaderLeft}>
          <Image
            source={require('../assets/logo/logo_baprotege_texto.png')}
            style={styles.topHeaderLogo}
            resizeMode="contain"
            accessibilityLabel="BA Protege +"
          />
        </View>
        <View style={styles.modeBadge}>
          <Text style={styles.modeBadgeText}>
            {mode === 'CHILD' ? '👦 PERFIL MENOR' : '👤 PERFIL ADULTO'}
          </Text>
        </View>
      </View>

      {/* Subheader con botón volver a Inicio en Pasatiempos (Modo Menor) */}
      {mode === 'CHILD' && activeTab === 'pasatiempos' && (
        <Header
          showTopLogo={false}
          title="Pasatiempos"
          subtitle="Elegí uno de los tres juegos para aprender y divertirte"
          onBack={() => setActiveTab('inicio')}
          rightElement={
            <View style={styles.pasatiemposProgressPill}>
              <Text style={styles.pasatiemposProgressPillText}>
                {completedCount}/3 completados
              </Text>
            </View>
          }
        />
      )}

      {/* Subheader estilo Responsable cuando el Adulto Protegido entra a Sitios y apps */}
      {mode === 'ADULT' && activeTab === 'sitios' && (
        <Header
          showTopLogo={false}
          title="Gestión de sitios y apps"
          subtitle="Filtro oficial LOTBA, dominios y aplicaciones"
          onBack={() => setActiveTab('inicio')}
        />
      )}

      {/* Subheader estilo Responsable cuando Adulto o Menor entran a Cuenta */}
      {activeTab === 'cuenta' && (
        <Header
          showTopLogo={false}
          title="Perfil y cuenta"
          subtitle={
            mode === 'CHILD'
              ? 'Información del perfil menor y soporte'
              : 'Información del perfil adulto y soporte'
          }
          onBack={() => setActiveTab('inicio')}
        />
      )}

      {/* 2. CONTENIDO PRINCIPAL + FAB (encima de la navbar para no solaparla) */}
      <View style={{ flex: 1, position: 'relative' }}>
        <ScrollView
          style={styles.scrollBody}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {mode === 'CHILD' ? (
            <>
              {activeTab === 'inicio' && (
                <MenorInicioSection
                  childName={resolvedChildName}
                  tutorName="Ana"
                  grantedCount={grantedPermsCount}
                  completedGames={completedGames}
                  onOpenGame={handleOpenChildGame}
                  onNavigateToPermissions={handleOpenPermissions}
                  onNavigateToPasatiempos={() => setActiveTab('pasatiempos')}
                  onNavigateToActivity={() => setActiveTab('actividad')}
                  onOpenFaq={() => setShowFaqModal(true)}
                />
              )}

              {activeTab === 'pasatiempos' && (
                <MenorPasatiemposSection
                  completedGames={completedGames}
                  completedGamesOrder={completedGamesOrder}
                  onSelectGame={handleOpenChildGame}
                />
              )}

              {activeTab === 'actividad' && (
                <MenorActividadSection
                  customBlockedItems={customBlockedItems}
                  onOpenPinModal={() =>
                    openTutorPinAlert('Has ingresado el PIN del tutor.')
                  }
                />
              )}

              {activeTab === 'cuenta' && (
                <MenorCuentaSection
                  deviceUuid={deviceUuid}
                  childName={resolvedChildName}
                  childPhone={resolvedChildPhone}
                  tutorName="Ana"
                  onOpenOnboarding={() => setShowOnboardingFlow(true)}
                  onExitMode={onExitMode}
                />
              )}
            </>
          ) : (
            <>
              {activeTab === 'inicio' && (
                <AdultoInicioSection
                  adultName={resolvedAdultName}
                  tutorName="Ana"
                  grantedCount={grantedPermsCount}
                  customSitesCount={adultVisibleSites.length}
                  blockedAppsCount={adultVisibleApps.length}
                  quizCompleted={completedGames.quiz}
                  quizScore={quizScore}
                  onNavigateToPermissions={handleOpenPermissions}
                  onOpenQuiz={handleOpenAdultQuiz}
                  onNavigateToSites={() => {
                    setAdultoInitialSubTab('sites');
                    setAdultoSitiosSubTab('sites');
                    setActiveTab('sitios');
                  }}
                  onNavigateToApps={() => {
                    setAdultoInitialSubTab('apps');
                    setAdultoSitiosSubTab('apps');
                    setActiveTab('sitios');
                  }}
                  onNavigateToActivity={() => setActiveTab('actividad')}
                  onOpenFaq={() => setShowFaqModal(true)}
                />
              )}

              {activeTab === 'sitios' && (
                <AdultoSitiosSection
                  customSites={customSites}
                  customApps={customApps}
                  onRefreshList={loadCustomBlockedList}
                  sourceDeviceId={resolvedAdultDeviceId}
                  adultName={resolvedAdultName}
                  hideInternalFab={true}
                  initialSubTab={adultoInitialSubTab}
                  onSubTabChange={setAdultoSitiosSubTab}
                  onSetAddHandler={(handler) => {
                    adultoAddHandlerRef.current = handler;
                  }}
                />
              )}

              {activeTab === 'actividad' && (
                <AdultoActividadSection
                  customBlockedItems={customBlockedItems}
                  onOpenPinModal={() =>
                    openTutorPinAlert('Has ingresado el PIN del tutor.')
                  }
                />
              )}

              {activeTab === 'cuenta' && (
                <AdultoCuentaSection
                  deviceUuid={deviceUuid}
                  adultName={resolvedAdultName}
                  adultPhone={resolvedAdultPhone}
                  tutorName="Ana"
                  onOpenOnboarding={() => setShowOnboardingFlow(true)}
                  onExitMode={onExitMode}
                />
              )}
            </>
          )}
        </ScrollView>

        {/* 3. BOTÓN FLOTANTE FAB (+) EXCLUSIVO DE "SITIOS Y APPS" EN MODO ADULTO */}
        {mode === 'ADULT' && activeTab === 'sitios' && (
          <FabWithTooltip
            label={adultoSitiosSubTab === 'sites' ? 'Bloquear sitio' : 'Bloquear app'}
            onPress={() => {
              if (adultoAddHandlerRef.current) {
                adultoAddHandlerRef.current();
              }
            }}
          />
        )}
      </View>

      {/* 4. NAVBAR INFERIOR SEGÚN PERFIL */}
      {mode === 'CHILD' ? (
        <MenorNavbar
          activeTab={
            activeTab === 'sitios' ? 'inicio' : activeTab
          }
          onSelectTab={setActiveTab}
        />
      ) : (
        <AdultoNavbar
          activeTab={
            activeTab === 'pasatiempos' ? 'inicio' : activeTab
          }
          onSelectTab={setActiveTab}
        />
      )}

      {/* MODALES INTERACTIVOS DE JUEGOS (protected/juegos) */}
      <QuizModal
        visible={activeGameModal === 'quiz'}
        mode={mode}
        onClose={() => setActiveGameModal(null)}
        onCompleteQuiz={handleCompleteQuiz}
      />

      <WordSearchModal
        visible={activeGameModal === 'wordsearch'}
        onClose={() => setActiveGameModal(null)}
        onCompleteGame={() => handleMarkGameCompleted('wordsearch')}
      />

      <MemoryGameModal
        visible={activeGameModal === 'memory'}
        onClose={() => setActiveGameModal(null)}
        onCompleteGame={() => handleMarkGameCompleted('memory')}
      />

      {/* MODAL DE PREGUNTAS FRECUENTES (FAQ) */}
      <FaqModal
        visible={showFaqModal}
        onClose={() => setShowFaqModal(false)}
      />

      {/* MODAL TECLADO PIN PARA VALIDACIÓN DE TUTOR */}
      <Modal
        visible={showPinModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowPinModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Image
              source={getBotMascotImage(mode, 'nervioso')}
              style={styles.pinMascotImage}
              resizeMode="contain"
            />
            <Text style={styles.modalTitle}>PIN del tutor requerido</Text>
            <Text style={styles.modalSubtitle}>
              Ingresa el PIN de 4 dígitos para autorizar esta acción (Demo: 1234).
            </Text>

            <View style={styles.pinDotsRow}>
              {[0, 1, 2, 3].map((index) => (
                <View
                  key={index}
                  style={[
                    styles.pinDot,
                    enteredPin.length > index && styles.pinDotFilled,
                  ]}
                />
              ))}
            </View>

            <PinKeyboard
              onKeyPress={handlePinKeyPress}
              onDelete={handlePinDelete}
              onClear={() => setEnteredPin('')}
            />

            <ActionButton
              title="Cancelar"
              variant="secondary"
              onPress={() => {
                setShowPinModal(false);
                setPendingAction(null);
              }}
            />
          </View>
        </View>
      </Modal>

      <FeedbackModal
        visible={pinFeedback.visible}
        imageSource={pinFeedback.imageSource}
        title={pinFeedback.title}
        message={pinFeedback.message}
        onClose={() => setPinFeedback((prev) => ({ ...prev, visible: false }))}
      />
    </SafeAreaView>
  );
};
