// ==============================================================================
// Proyecto: BA Protege+
// Componente: Frontend Mobile (Pantalla del Dispositivo Protegido)
// Archivo: src/screens/ProtectedDeviceScreen.tsx
// Descripción: Orquestador modular del usuario protegido:
//              - Hooks especializados (protected/hooks): datos/actividad,
//                pasatiempos y antidesinstalación OTP.
//              - Vistas por perfil: Menor (protected/menor) y Adulto (protected/adulto).
//              - Modales compartidos: juegos, FAQ, permisos y antidesinstalación.
// ==============================================================================

import React, { useEffect, useRef, useState } from 'react';
import { Image, SafeAreaView, ScrollView, View } from 'react-native';
import {
  AdultoActividadSection,
  AdultoCuentaSection,
  AdultoInicioSection,
  AdultoNavbar,
  AdultoSitiosSection,
  MenorActividadSection,
  MenorCuentaSection,
  MenorInicioSection,
  MenorNavbar,
  MenorPasatiemposSection,
  ProtectedGameModals,
  useAntiUninstallProtection,
  useProtectedDeviceData,
  useProtectedPasatiempos,
} from '../components/dashboard/protected';
import { Header } from '../components/Header';
import { FabWithTooltip } from '../components/FabWithTooltip';
import { FeedbackModal } from '../components/FeedbackModal';
import { FaqModal } from '../components/dashboard/cuenta/FaqModal';
import { AntiUninstallCodeModal } from '../components/dashboard/cuenta/AntiUninstallCodeModal';
import { OnboardingScreen } from './OnboardingScreen';
import { PermissionsScreen, PermissionItemState } from './PermissionsScreen';
import {
  ProtectedTab,
  canPlayPasatiempoGame,
  normalizeProtectedTabForMode,
} from '../utils/pasatiempos';
import { saveNavigationState } from '../utils/navigationSession';
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
  const [adultoSitiosSubTab, setAdultoSitiosSubTab] = useState<'sites' | 'apps'>('sites');
  const [adultoInitialSubTab, setAdultoInitialSubTab] = useState<'sites' | 'apps'>('sites');
  const [showPermissionsModal, setShowPermissionsModal] = useState<boolean>(false);
  const [showFaqModal, setShowFaqModal] = useState<boolean>(false);
  const [showOnboardingFlow, setShowOnboardingFlow] = useState<boolean>(false);

  const adultoAddHandlerRef = useRef<(() => void) | null>(null);
  const syncAntiUninstallRef = useRef<(() => void) | null>(null);

  // 1. Datos del dispositivo, listas bloqueadas, permisos y métricas de Actividad
  const deviceData = useProtectedDeviceData({
    deviceUuid,
    mode,
    onForegroundResume: () => syncAntiUninstallRef.current?.(),
  });

  // 2. Estado, persistencia diaria, Racha y handlers de Pasatiempos
  const pasatiempos = useProtectedPasatiempos({ deviceUuid, mode });
  const { completedGames } = pasatiempos;

  // 3. Reglas globales de Antidesinstalación (accesibilidad + OTP de 6 dígitos)
  const {
    ruleUninstallProtection,
    showAntiUninstallModal,
    maskedTutorEmail,
    antiUninstallError,
    loadingAntiUninstall,
    feedbackModal,
    closeFeedbackModal,
    syncAntiUninstallState,
    handleOpenAntiUninstallModal,
    handleCloseAntiUninstallModal,
    handleConfirmAntiUninstallCode,
    handleToggleUninstallProtection,
  } = useAntiUninstallProtection({
    deviceUuid,
    mode,
    onPermissionsChanged: deviceData.refreshPermissions,
  });

  syncAntiUninstallRef.current = syncAntiUninstallState;

  useEffect(() => {
    setActiveTab((prev) => normalizeProtectedTabForMode(prev, mode));
  }, [mode]);

  useEffect(() => {
    if (activeTab === 'actividad') {
      pasatiempos.loadPasatiemposHistory();
      deviceData.loadActivityUsageAndBlocks();
    }
  }, [activeTab, pasatiempos.loadPasatiemposHistory, deviceData.loadActivityUsageAndBlocks]);

  // El adulto protegido tampoco puede repetir el Quiz una vez completado
  const handleOpenAdultQuiz = () => {
    if (!canPlayPasatiempoGame(completedGames, 'quiz')) {
      return;
    }
    pasatiempos.setActiveGameModal('quiz');
  };

  const handleOpenPermissions = () => {
    saveNavigationState({ activeScreen: 'PERMISSIONS' }).catch(() => {});
    setShowPermissionsModal(true);
  };

  const handleClosePermissions = () => {
    saveNavigationState({ activeScreen: 'PROTECTED_DEVICE' }).catch(() => {});
    setShowPermissionsModal(false);
    deviceData.refreshPermissions();
  };

  if (showPermissionsModal) {
    return (
      <PermissionsScreen
        flowSource="DEVICE_PAIRING"
        allowDisablePermissions={false}
        protectedProfile={mode}
        userId={deviceUuid}
        onPermissionsComplete={handleClosePermissions}
        onBack={handleClosePermissions}
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
      {/* 1. TOP HEADER INSTITUCIONAL (#EAF3FF) CON LOGO */}
      <View style={styles.topHeaderBar}>
        <View style={styles.topHeaderLeft}>
          <Image
            source={require('../assets/logo/logo_baprotege_texto.png')}
            style={styles.topHeaderLogo}
            resizeMode="contain"
            accessibilityLabel="BA Protege +"
          />
        </View>
      </View>

      {/* Subheaders contextuales por pestaña */}
      {mode === 'CHILD' && activeTab === 'pasatiempos' && (
        <Header
          showTopLogo={false}
          title="Pasatiempos"
          onBack={() => setActiveTab('inicio')}
        />
      )}

      {mode === 'ADULT' && activeTab === 'sitios' && (
        <Header
          showTopLogo={false}
          title="Gestión de sitios y apps"
          onBack={() => setActiveTab('inicio')}
        />
      )}

      {activeTab === 'actividad' && (
        <Header
          showTopLogo={false}
          title="Actividad"
          onBack={() => setActiveTab('inicio')}
        />
      )}

      {activeTab === 'cuenta' && (
        <Header
          showTopLogo={false}
          title={mode === 'CHILD' ? 'Mi cuenta' : 'Perfil y cuenta'}
          onBack={() => setActiveTab('inicio')}
        />
      )}

      {/* 2. CONTENIDO PRINCIPAL + FAB */}
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
                  childName={deviceData.resolvedChildName}
                  tutorName={deviceData.resolvedTutorName}
                  grantedCount={deviceData.grantedPermsCount}
                  completedGames={completedGames}
                  appsUsageSummary={deviceData.appsUsageSummary}
                  onOpenGame={pasatiempos.handleOpenChildGame}
                  onNavigateToPermissions={handleOpenPermissions}
                  onNavigateToPasatiempos={() => setActiveTab('pasatiempos')}
                  onNavigateToActivity={() => setActiveTab('actividad')}
                  onOpenFaq={() => setShowFaqModal(true)}
                />
              )}

              {activeTab === 'pasatiempos' && (
                <MenorPasatiemposSection
                  completedGames={completedGames}
                  completedGamesOrder={pasatiempos.completedGamesOrder}
                  onSelectGame={pasatiempos.handleOpenChildGame}
                />
              )}

              {activeTab === 'actividad' && (
                <MenorActividadSection
                  appsUsageSummary={deviceData.appsUsageSummary}
                  todayRecord={pasatiempos.todayRecord}
                  streakDays={pasatiempos.streakDays}
                  onOpenGame={pasatiempos.handleOpenChildGame}
                  customBlockedItems={deviceData.customBlockedItems}
                />
              )}

              {activeTab === 'cuenta' && (
                <MenorCuentaSection
                  deviceUuid={deviceUuid}
                  childName={deviceData.resolvedChildName}
                  childPhone={deviceData.resolvedChildPhone}
                  tutorName={deviceData.resolvedTutorName}
                  ruleUninstallProtection={ruleUninstallProtection}
                  onToggleUninstallProtection={handleToggleUninstallProtection}
                  onOpenPermissions={handleOpenPermissions}
                  onOpenOnboarding={() => setShowOnboardingFlow(true)}
                  onExitMode={onExitMode}
                />
              )}
            </>
          ) : (
            <>
              {activeTab === 'inicio' && (
                <AdultoInicioSection
                  adultName={deviceData.resolvedAdultName}
                  tutorName={deviceData.resolvedTutorName}
                  grantedCount={deviceData.grantedPermsCount}
                  customSitesCount={deviceData.adultVisibleSites.length}
                  blockedAppsCount={deviceData.adultVisibleApps.length}
                  quizCompleted={completedGames.quiz}
                  quizScore={pasatiempos.quizScore}
                  appsUsageSummary={deviceData.appsUsageSummary}
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
                  customSites={deviceData.customSites}
                  customApps={deviceData.customApps}
                  onRefreshList={deviceData.loadCustomBlockedList}
                  sourceDeviceId={deviceData.resolvedAdultDeviceId}
                  adultName={deviceData.resolvedAdultName}
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
                  appsUsageSummary={deviceData.appsUsageSummary}
                  todayRecord={pasatiempos.todayRecord}
                  streakDays={pasatiempos.streakDays}
                  weeklyQuizAccuracyPct={pasatiempos.weeklyQuizAccuracyPct}
                  blockedAttempts={deviceData.deviceBlockedAttempts}
                  bypassEvents={deviceData.deviceBypassEvents}
                  adultName={deviceData.resolvedAdultName}
                  deviceId={deviceData.resolvedAdultDeviceId}
                  onOpenQuiz={handleOpenAdultQuiz}
                  customBlockedItems={deviceData.customBlockedItems}
                />
              )}

              {activeTab === 'cuenta' && (
                <AdultoCuentaSection
                  deviceUuid={deviceUuid}
                  adultName={deviceData.resolvedAdultName}
                  adultPhone={deviceData.resolvedAdultPhone}
                  tutorName={deviceData.resolvedTutorName}
                  ruleUninstallProtection={ruleUninstallProtection}
                  onToggleUninstallProtection={handleToggleUninstallProtection}
                  onOpenPermissions={handleOpenPermissions}
                  onOpenOnboarding={() => setShowOnboardingFlow(true)}
                  onExitMode={onExitMode}
                />
              )}
            </>
          )}
        </ScrollView>

        {/* 3. FAB (+) EXCLUSIVO DE "SITIOS Y APPS" EN MODO ADULTO */}
        {mode === 'ADULT' && activeTab === 'sitios' && (
          <FabWithTooltip
            label={adultoSitiosSubTab === 'sites' ? 'Bloquear sitio' : 'Bloquear app'}
            onPress={() => adultoAddHandlerRef.current?.()}
          />
        )}
      </View>

      {/* 4. NAVBAR INFERIOR SEGÚN PERFIL */}
      {mode === 'CHILD' ? (
        <MenorNavbar
          activeTab={activeTab === 'sitios' ? 'inicio' : activeTab}
          onSelectTab={setActiveTab}
        />
      ) : (
        <AdultoNavbar
          activeTab={activeTab === 'pasatiempos' ? 'inicio' : activeTab}
          onSelectTab={setActiveTab}
        />
      )}

      {/* 5. MODALES INTERACTIVOS COMPARTIDOS */}
      <ProtectedGameModals
        activeGameModal={pasatiempos.activeGameModal}
        mode={mode}
        initialWordSearchFoundByBoard={pasatiempos.initialWordSearchFoundByBoard}
        initialMemoryAttempts={pasatiempos.todayRecord.memory.attempts}
        onClose={() => pasatiempos.setActiveGameModal(null)}
        onProgressQuiz={pasatiempos.handleProgressQuiz}
        onCompleteQuiz={pasatiempos.handleCompleteQuiz}
        onProgressWordSearch={pasatiempos.handleProgressWordSearch}
        onCompleteWordSearch={pasatiempos.handleCompleteWordSearch}
        onProgressMemory={pasatiempos.handleProgressMemory}
        onCompleteMemory={pasatiempos.handleCompleteMemory}
      />

      <FaqModal
        visible={showFaqModal}
        onClose={() => setShowFaqModal(false)}
      />

      <AntiUninstallCodeModal
        visible={showAntiUninstallModal}
        maskedEmail={maskedTutorEmail}
        profileType={mode}
        loading={loadingAntiUninstall}
        errorMessage={antiUninstallError}
        onClose={handleCloseAntiUninstallModal}
        onConfirm={handleConfirmAntiUninstallCode}
        onResendCode={handleOpenAntiUninstallModal}
      />

      <FeedbackModal
        visible={feedbackModal.visible}
        imageSource={feedbackModal.imageSource}
        title={feedbackModal.title}
        message={feedbackModal.message}
        buttonText={feedbackModal.buttonText}
        secondaryButtonText={feedbackModal.secondaryButtonText}
        onConfirm={feedbackModal.onConfirm}
        onSecondaryPress={feedbackModal.onSecondaryPress}
        onClose={closeFeedbackModal}
      />
    </SafeAreaView>
  );
};
