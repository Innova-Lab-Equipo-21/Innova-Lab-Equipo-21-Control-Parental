// ==============================================================================
// Proyecto: BA Protege+
// Hook: useAntiUninstallProtection
// Archivo: src/components/dashboard/protected/hooks/useAntiUninstallProtection.ts
// Descripción: Encapsula la sincronización del servicio de accesibilidad, el
//              flujo OTP de 6 dígitos para desactivar antidesinstalación y el
//              modal institucional de retroalimentación asociado.
// ==============================================================================

import { useCallback, useEffect, useState } from 'react';
import { ImageSourcePropType } from 'react-native';
import { getBotMascotImage } from '../botAssets';
import { protectionService } from '../../../../services/protection.service';
import { apiService } from '../../../../services/api.service';

export interface ProtectedFeedbackState {
  visible: boolean;
  imageSource?: ImageSourcePropType;
  title: string;
  message: string;
  buttonText?: string;
  secondaryButtonText?: string;
  onConfirm?: () => void;
  onSecondaryPress?: () => void;
}

export interface UseAntiUninstallProtectionParams {
  deviceUuid: string;
  mode: 'CHILD' | 'ADULT';
  onPermissionsChanged?: () => void;
}

export interface UseAntiUninstallProtectionResult {
  ruleUninstallProtection: boolean;
  showAntiUninstallModal: boolean;
  maskedTutorEmail: string;
  antiUninstallError: string | null;
  loadingAntiUninstall: boolean;
  feedbackModal: ProtectedFeedbackState;
  closeFeedbackModal: () => void;
  syncAntiUninstallState: () => Promise<void>;
  handleOpenAntiUninstallModal: () => Promise<void>;
  handleCloseAntiUninstallModal: () => Promise<void>;
  handleConfirmAntiUninstallCode: (enteredCode: string) => Promise<void>;
  handleToggleUninstallProtection: (val: boolean) => Promise<void>;
}

export function useAntiUninstallProtection({
  deviceUuid,
  mode,
  onPermissionsChanged,
}: UseAntiUninstallProtectionParams): UseAntiUninstallProtectionResult {
  const [ruleUninstallProtection, setRuleUninstallProtection] = useState<boolean>(true);
  const [showAntiUninstallModal, setShowAntiUninstallModal] = useState<boolean>(false);
  const [maskedTutorEmail, setMaskedTutorEmail] = useState<string>(
    't***r@baprotege.gob.ar'
  );
  const [antiUninstallError, setAntiUninstallError] = useState<string | null>(null);
  const [loadingAntiUninstall, setLoadingAntiUninstall] = useState<boolean>(false);
  const [feedbackModal, setFeedbackModal] = useState<ProtectedFeedbackState>({
    visible: false,
    title: '',
    message: '',
  });

  const closeFeedbackModal = useCallback(() => {
    setFeedbackModal((prev) => ({ ...prev, visible: false }));
  }, []);

  const syncAntiUninstallState = useCallback(async () => {
    try {
      const isA11yActive = await protectionService.isAccessibilityEnabled();
      const isEnabledInPrefs = await protectionService.isAntiUninstallEnabled();
      setRuleUninstallProtection(isA11yActive && isEnabledInPrefs);
    } catch {
      // Mantener estado actual
    }
  }, []);

  useEffect(() => {
    syncAntiUninstallState();
  }, [syncAntiUninstallState]);

  const handleOpenAntiUninstallModal = useCallback(async () => {
    setAntiUninstallError(null);
    setLoadingAntiUninstall(true);
    setShowAntiUninstallModal(true);
    try {
      const res = await apiService.requestAntiUninstallCode(deviceUuid);
      if (res?.maskedEmail) {
        setMaskedTutorEmail(res.maskedEmail);
      }
    } catch (err: any) {
      console.warn('Error al solicitar código:', err);
    } finally {
      setLoadingAntiUninstall(false);
    }
  }, [deviceUuid]);

  const handleCloseAntiUninstallModal = useCallback(async () => {
    setShowAntiUninstallModal(false);
    setAntiUninstallError(null);
    try {
      await apiService.invalidateAntiUninstallCode(deviceUuid);
    } catch {
      // Ignorar fallo de invalidación remota
    }
  }, [deviceUuid]);

  const handleConfirmAntiUninstallCode = useCallback(
    async (enteredCode: string) => {
      setLoadingAntiUninstall(true);
      setAntiUninstallError(null);
      try {
        await apiService.verifyAntiUninstallCode(deviceUuid, enteredCode);
        setShowAntiUninstallModal(false);
        setRuleUninstallProtection(false);
        await protectionService.setAntiUninstallEnabled(false);

        setFeedbackModal({
          visible: true,
          imageSource: getBotMascotImage(mode, 'feliz'),
          title: 'Antidesinstalación desactivada',
          message:
            'La protección antidesinstalación ha sido desactivada exitosamente en este dispositivo.',
          buttonText: 'Entendido',
          onConfirm: () => {
            setFeedbackModal((prev) => ({ ...prev, visible: false }));
          },
        });
      } catch (err: any) {
        setAntiUninstallError(
          err.message || 'Código incorrecto. Verificá el correo del responsable.'
        );
      } finally {
        setLoadingAntiUninstall(false);
      }
    },
    [deviceUuid, mode]
  );

  const handleToggleUninstallProtection = useCallback(
    async (val: boolean) => {
      if (val) {
        const isA11yActive = await protectionService.isAccessibilityEnabled();
        if (!isA11yActive) {
          setRuleUninstallProtection(false);
          setFeedbackModal({
            visible: true,
            imageSource: getBotMascotImage(mode, 'pensando'),
            title: 'Servicio de accesibilidad',
            message:
              'Para activar la protección antidesinstalación, es necesario habilitar el servicio de accesibilidad de BA Protege+ en los Ajustes del sistema. ¿Deseás abrir Ajustes ahora?',
            buttonText: 'Abrir ajustes',
            secondaryButtonText: 'Cancelar',
            onConfirm: async () => {
              setFeedbackModal((prev) => ({ ...prev, visible: false }));
              try {
                await protectionService.openAccessibilitySettings();
                const activeAfterSettings =
                  await protectionService.isAccessibilityEnabled();
                if (activeAfterSettings) {
                  setRuleUninstallProtection(true);
                  await protectionService.setAntiUninstallEnabled(true);
                  onPermissionsChanged?.();
                }
              } catch (err) {
                console.warn('[ProtectedDevice] Error al abrir accesibilidad:', err);
              }
            },
            onSecondaryPress: () => {
              setFeedbackModal((prev) => ({ ...prev, visible: false }));
            },
          });
          return;
        }
        setRuleUninstallProtection(true);
        await protectionService.setAntiUninstallEnabled(true);
      } else {
        await handleOpenAntiUninstallModal();
      }
    },
    [mode, onPermissionsChanged, handleOpenAntiUninstallModal]
  );

  return {
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
  };
}
