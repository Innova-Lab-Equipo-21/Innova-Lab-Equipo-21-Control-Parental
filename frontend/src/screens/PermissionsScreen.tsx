// ==============================================================================
// Proyecto: BA Protege+
// Componente: Frontend Mobile (Pantalla de Solicitud de Permisos del Dispositivo)
// Archivo: src/screens/PermissionsScreen.tsx
// Descripción: Pantalla principal de solicitud y explicación pedagógica de los 6
//              permisos esenciales, modularizada con componentes específicos.
// ==============================================================================

import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  AppState,
  Platform,
  PermissionsAndroid,
  ImageSourcePropType,
} from 'react-native';
import { styles } from './PermissionsScreen.styles';
import { FeedbackModal } from '../components/FeedbackModal';
import { protectionService } from '../services/protection.service';
import { apiService } from '../services/api.service';
import {
  canToggleDevicePermission,
  checkRealDevicePermissions,
  requestAndVerifyAccessibilityPermission,
  requestAndVerifyBatteryOptimization,
  requestAndVerifyLocationPermission,
  requestAndVerifyNotificationPermission,
  requestAndVerifyUsageStatsPermission,
  requestAndVerifyVpnPermission,
  saveDevicePermissions,
} from '../utils/permissionChecker';
import { saveNavigationState } from '../utils/navigationSession';
import { BOTITO_ASSETS, getBotMascotImage } from '../components/dashboard/protected/botAssets';
import { BotMood } from '../utils/botMascots';
import {
  PermissionItemState,
  PermissionCardItem,
  FeedbackModalState,
  PERMISSION_DEFINITIONS,
  PermissionsHeader,
  PermissionsInfoBox,
  PermissionCard,
  PermissionsFooter,
} from '../components/permissions';

export type { PermissionItemState };

const DEACTIVATION_CONFIRMATION_MODALS: Record<
  keyof PermissionItemState,
  {
    title: string;
    message: string;
    mood: BotMood;
    buttonText: string;
  }
> = {
  vpn: {
    title: 'Filtro desactivado',
    message:
      'Sin este filtro el dispositivo queda expuesto a sitios y apps de juegos y apuestas ilegales. Podés volver a activarlo cuando quieras desde la configuración.',
    mood: 'nervioso',
    buttonText: 'Entendido',
  },
  accessibility: {
    title: 'Antidesinstalación desactivada',
    message:
      'Sin esta protección, la aplicación podría cerrarse o eliminarse por error. Podés volver a activarla cuando quieras desde la configuración.',
    mood: 'nervioso',
    buttonText: 'Entendido',
  },
  notifications: {
    title: 'Notificaciones desactivadas',
    message:
      'Sin estos avisos, no vas a enterarte al instante de las alertas de seguridad. Podés volver a activarlas cuando quieras desde la configuración.',
    mood: 'nervioso',
    buttonText: 'Entendido',
  },
  batteryOptimization: {
    title: 'Protección continua desactivada',
    message:
      'Para mantener activa la protección contra sitios y apps de juegos y apuestas ilegales las 24 horas, podés activar la protección cuando quieras desde la configuración.',
    mood: 'nervioso',
    buttonText: 'Entendido',
  },
  location: {
    title: 'Ubicación desactivada',
    message:
      'Sin este permiso, la aplicación no puede garantizar que te lleguen en todo momento las alertas de seguridad. Podés volver a activarlo cuando quieras desde la configuración.',
    mood: 'nervioso',
    buttonText: 'Entendido',
  },
  usageStats: {
    title: 'Estadísticas desactivadas',
    message:
      'Sin este permiso, no podremos informarte sobre el tiempo que pasaste en las aplicaciones. Podés volver a activarlo cuando quieras desde la configuración.',
    mood: 'nervioso',
    buttonText: 'Entendido',
  },
};

interface PermissionsScreenProps {
  onPermissionsComplete: () => void;
  onBack?: () => void;
  flowSource?: 'PARENT_LOGIN' | 'DEVICE_PAIRING';
  allowDisablePermissions?: boolean;
  protectedProfile?: 'CHILD' | 'ADULT';
  userId?: string;
}

export const PermissionsScreen: React.FC<PermissionsScreenProps> = ({
  onPermissionsComplete,
  onBack,
  flowSource = 'DEVICE_PAIRING',
  allowDisablePermissions,
  protectedProfile = 'CHILD',
  userId,
}) => {
  const canDisablePermissions =
    allowDisablePermissions ?? flowSource === 'PARENT_LOGIN';

  const [feedbackModal, setFeedbackModal] = useState<FeedbackModalState>({
    visible: false,
    title: '',
    message: '',
  });

  const showFeedback = (options: {
    title: string;
    message: string;
    mood?: BotMood;
    imageSource?: ImageSourcePropType;
    buttonText?: string;
    secondaryButtonText?: string;
    onConfirm?: () => void;
    onSecondaryPress?: () => void;
  }) => {
    setFeedbackModal({
      visible: true,
      imageSource:
        options.imageSource ??
        getBotMascotImage(protectedProfile || 'ADULT', options.mood || 'feliz'),
      title: options.title,
      message: options.message,
      buttonText: options.buttonText || 'Entendido',
      secondaryButtonText: options.secondaryButtonText,
      onConfirm: options.onConfirm,
      onSecondaryPress: options.onSecondaryPress,
    });
  };

  // Inicialización de permisos (se sincroniza con el estado real del sistema para este usuario)
  const [permissions, setPermissions] = useState<PermissionItemState>({
    vpn: false,
    accessibility: false,
    notifications: false,
    batteryOptimization: false,
    location: false,
    usageStats: false,
  });

  const isRequestingVpnRef = useRef<boolean>(false);
  const isRequestingAccessibilityRef = useRef<boolean>(false);
  const isRequestingNotificationsRef = useRef<boolean>(false);
  const isRequestingBatteryRef = useRef<boolean>(false);
  const isRequestingLocationRef = useRef<boolean>(false);
  const isRequestingUsageStatsRef = useRef<boolean>(false);
  const appStateRef = useRef(AppState.currentState);
  const permissionsRef = useRef<PermissionItemState>(permissions);
  const pendingDisableConfirmationRef = useRef<keyof PermissionItemState | null>(null);

  useEffect(() => {
    permissionsRef.current = permissions;
  }, [permissions]);

  // Sincroniza el estado real de los 6 permisos con PostgreSQL cuando corresponde a un dispositivo protegido
  const syncProtectedHeartbeatIfNeeded = () => {
    if (
      flowSource === 'DEVICE_PAIRING' &&
      userId &&
      userId !== 'self' &&
      userId !== 'local' &&
      userId !== 'dev-local-default' &&
      userId !== 'dev-adult-default'
    ) {
      protectionService.sendRealDeviceHeartbeat(userId).catch(() => {});
    }
  };

  // Consultar permisos reales nativos al montar
  useEffect(() => {
    checkRealDevicePermissions(userId).then((real) => {
      const initial: PermissionItemState = {
        vpn: real.vpn,
        accessibility: real.accessibility,
        notifications: real.notifications,
        batteryOptimization: real.batteryOptimization,
        location: real.location,
        usageStats: real.usageStats,
      };
      permissionsRef.current = initial;
      setPermissions(initial);
      syncProtectedHeartbeatIfNeeded();
    });
    saveNavigationState({ activeScreen: 'PERMISSIONS' }).catch(() => {});
  }, [userId]);

  // Sincronizar estado real de permisos en el dispositivo al volver desde ajustes del sistema
  useEffect(() => {
    if (Platform.OS !== 'android') {
      return;
    }

    const subscription = AppState.addEventListener('change', async (nextState) => {
      const prevState = appStateRef.current;
      appStateRef.current = nextState;

      if (prevState !== 'active' && nextState === 'active') {
        try {
          const [
            isPrepared,
            isAccEnabled,
            isNotifEnabled,
            isBatteryIgnored,
            isLocGranted,
            isLocEnabled,
            isUsageStatsGranted,
            isVpnActive,
          ] = await Promise.all([
            !isRequestingVpnRef.current
              ? protectionService.isVpnPrepared()
              : Promise.resolve(null),
            !isRequestingAccessibilityRef.current
              ? protectionService.isAccessibilityEnabled()
              : Promise.resolve(null),
            !isRequestingNotificationsRef.current
              ? protectionService.isNotificationsEnabled()
              : Promise.resolve(null),
            !isRequestingBatteryRef.current
              ? protectionService.isBatteryOptimizationIgnored()
              : Promise.resolve(null),
            !isRequestingLocationRef.current
              ? protectionService.isLocationPermissionGranted()
              : Promise.resolve(null),
            !isRequestingLocationRef.current
              ? protectionService.isLocationEnabled().catch(() => true)
              : Promise.resolve(null),
            !isRequestingUsageStatsRef.current
              ? protectionService.isUsageStatsPermissionGranted()
              : Promise.resolve(null),
            protectionService.isProtectionActive().catch(() => false),
          ]);

          const prev = permissionsRef.current;
          let nextVpn = prev.vpn;
          if (isPrepared === false) {
            nextVpn = false;
          } else if (isVpnActive) {
            nextVpn = true;
          }

          const nextAcc = isAccEnabled !== null ? isAccEnabled : prev.accessibility;
          const nextNotif = isNotifEnabled !== null ? isNotifEnabled : prev.notifications;
          const nextBattery = isBatteryIgnored !== null ? isBatteryIgnored : prev.batteryOptimization;
          const nextUsage = isUsageStatsGranted !== null ? isUsageStatsGranted : prev.usageStats;
          let nextLoc = prev.location;
          if (isLocGranted !== null) {
            nextLoc = Boolean(isLocGranted && (isLocEnabled ?? true));
          }

          const pendingDisableKey = pendingDisableConfirmationRef.current;
          pendingDisableConfirmationRef.current = null;

          let deactivatedKey: keyof PermissionItemState | null = null;
          if ((prev.vpn && nextVpn === false) || (pendingDisableKey === 'vpn' && !nextVpn)) {
            deactivatedKey = 'vpn';
          } else if (prev.accessibility && nextAcc === false) {
            deactivatedKey = 'accessibility';
          } else if (prev.notifications && nextNotif === false) {
            deactivatedKey = 'notifications';
          } else if (prev.batteryOptimization && nextBattery === false) {
            deactivatedKey = 'batteryOptimization';
          } else if ((prev.location && nextLoc === false) || (pendingDisableKey === 'location' && !nextLoc)) {
            deactivatedKey = 'location';
          } else if (prev.usageStats && nextUsage === false) {
            deactivatedKey = 'usageStats';
          }

          if (
            prev.vpn !== nextVpn ||
            prev.accessibility !== nextAcc ||
            prev.notifications !== nextNotif ||
            prev.batteryOptimization !== nextBattery ||
            prev.location !== nextLoc ||
            prev.usageStats !== nextUsage
          ) {
            const next: PermissionItemState = {
              ...prev,
              vpn: nextVpn,
              accessibility: nextAcc,
              notifications: nextNotif,
              batteryOptimization: nextBattery,
              location: nextLoc,
              usageStats: nextUsage,
            };
            permissionsRef.current = next;
            setPermissions(next);
            saveDevicePermissions(next, userId);
            syncProtectedHeartbeatIfNeeded();
          }

          if (deactivatedKey) {
            showFeedback(DEACTIVATION_CONFIRMATION_MODALS[deactivatedKey]);
          }
        } catch {
          // Mantener estado actual si falla la verificación nativa
        }
      }
    });

    return () => {
      subscription.remove();
    };
  }, [userId, protectedProfile]);

  // Helper para actualizar y persistir el estado real de permisos (y reportar heartbeat al servidor)
  const updatePermission = (key: keyof PermissionItemState, value: boolean) => {
    const next: PermissionItemState = { ...permissionsRef.current, [key]: value };
    permissionsRef.current = next;
    setPermissions(next);
    saveDevicePermissions(next, userId);
    syncProtectedHeartbeatIfNeeded();
  };

  // Solo un card puede estar abierto a la vez (los demás se cierran automáticamente)
  const [expandedKey, setExpandedKey] = useState<string | null>(null);
  const [loadingKey, setLoadingKey] = useState<string | null>(null);

  const toggleExpand = (key: string) => {
    setExpandedKey((prev) => (prev === key ? null : key));
  };

  const handleBackToLogin = () => {
    if (onBack) {
      onBack();
    }
  };

  const handleRequestVpn = async () => {
    if (isRequestingVpnRef.current) {
      return;
    }

    isRequestingVpnRef.current = true;
    setLoadingKey('vpn');
    try {
      const result = await requestAndVerifyVpnPermission();

      if (result.granted) {
        updatePermission('vpn', true);
        showFeedback({
          title: '¡Filtro activado con éxito!',
          message:
            'Ya está funcionando en tu celular la protección contra sitios y apps de juegos y apuestas ilegales. Tus datos siguen seguros y privados.',
          mood: 'feliz',
        });
      } else {
        updatePermission('vpn', false);
        showFeedback({
          title: 'El filtro sigue desactivado',
          message:
            'Para mantener la protección activa, recordá confirmar la solicitud en la ventana de tu celular cuando vuelvas a intentarlo.',
          mood: 'nervioso',
        });
      }
    } finally {
      isRequestingVpnRef.current = false;
      setLoadingKey(null);
    }
  };

  const handleRequestAccessibility = async () => {
    if (isRequestingAccessibilityRef.current) {
      return;
    }

    isRequestingAccessibilityRef.current = true;
    setLoadingKey('accessibility');
    try {
      const result = await requestAndVerifyAccessibilityPermission();

      if (result.granted) {
        updatePermission('accessibility', true);
        showFeedback({
          imageSource: BOTITO_ASSETS.feliz,
          title: '¡Antidesinstalación activada con éxito!',
          message:
            'Ya está funcionando en tu celular la protección para que la aplicación no se cierre o se elimine por error.',
        });
      } else {
        updatePermission('accessibility', false);
        showFeedback({
          imageSource: BOTITO_ASSETS.pensando,
          title: 'La antidesinstalación sigue desactivada',
          message:
            'Sin esta protección, la aplicación podría cerrarse o eliminarse por error. Podés activarla cuando quieras desde los ajustes del sistema.',
        });
      }
    } finally {
      isRequestingAccessibilityRef.current = false;
      setLoadingKey(null);
    }
  };

  const handleRequestNotifications = async () => {
    if (isRequestingNotificationsRef.current) {
      return;
    }

    isRequestingNotificationsRef.current = true;
    setLoadingKey('notifications');
    try {
      const result = await requestAndVerifyNotificationPermission();

      if (result.granted) {
        updatePermission('notifications', true);
        showFeedback({
          title: '¡Notificaciones activadas con éxito!',
          message:
            'Vas a recibir avisos en tiempo real para mantener activa la protección contra sitios y apps de juegos y apuestas ilegales.',
          mood: 'feliz',
        });
      } else {
        updatePermission('notifications', false);
        showFeedback({
          title: 'Las notificaciones siguen desactivadas',
          message:
            'Para recibir avisos sobre tu actividad digital y la de tu entorno podés activarlas cuando quieras desde la configuración.',
          mood: 'nervioso',
        });
      }
    } finally {
      isRequestingNotificationsRef.current = false;
      setLoadingKey(null);
    }
  };

  const handleRequestBattery = async () => {
    if (isRequestingBatteryRef.current) {
      return;
    }

    isRequestingBatteryRef.current = true;
    setLoadingKey('battery');
    try {
      const result = await requestAndVerifyBatteryOptimization();

      if (result.granted) {
        updatePermission('batteryOptimization', true);
        showFeedback({
          title: '¡Protección continua activada con éxito!',
          message:
            'El bloqueo de sitios y apps de juegos y apuestas ilegales va a seguir funcionando las 24 horas.',
          mood: 'feliz',
        });
      } else {
        updatePermission('batteryOptimization', false);
        showFeedback({
          title: 'Protección continua desactivada',
          message:
            'Para mantener activa la protección contra sitios y apps de juegos y apuestas ilegales las 24 horas, podés activar la protección cuando quieras desde la configuración.',
          mood: 'nervioso',
        });
      }
    } finally {
      isRequestingBatteryRef.current = false;
      setLoadingKey(null);
    }
  };

  const handleRequestUsageStats = async () => {
    if (isRequestingUsageStatsRef.current) {
      return;
    }
    isRequestingUsageStatsRef.current = true;
    setLoadingKey('usageStats');

    try {
      const result = await requestAndVerifyUsageStatsPermission(protectionService);
      if (result.granted) {
        updatePermission('usageStats', true);
        showFeedback({
          title: '¡Estadísticas activadas con éxito!',
          message:
            'Ahora podremos acompañarte en la gestión del tiempo en las aplicaciones y cuidar tu bienestar digital.',
          mood: 'feliz',
        });
      } else {
        updatePermission('usageStats', false);
        showFeedback({
          title: 'Las estadísticas siguen desactivadas',
          message:
            'Para que puedas ver el tiempo en las aplicaciones y cumplir con los límites diarios que estipules, podés activar este permiso cuando quieras desde la configuración.',
          mood: 'nervioso',
        });
      }
    } finally {
      isRequestingUsageStatsRef.current = false;
      setLoadingKey(null);
    }
  };

  /** Solicita permiso de ubicación GPS con geocodificación inversa o fallback por IP */
  const recordLocationData = async () => {
    let lat: number | null = null;
    let lon: number | null = null;
    let addressText = '';

    // 1. Intentar obtener la última ubicación nativa conocida (GPS / Red)
    try {
      if (protectionService && typeof protectionService.getLastKnownLocation === 'function') {
        const nativeLoc = await protectionService.getLastKnownLocation();
        if (nativeLoc && typeof nativeLoc.latitude === 'number') {
          lat = nativeLoc.latitude;
          lon = nativeLoc.longitude;
        }
      }
    } catch {
      // Continuar con navigator.geolocation si falla la lectura nativa directa
    }

    // 2. Si no hubo coordenadas nativas inmediatas, consultar navigator.geolocation
    if (lat === null && typeof navigator !== 'undefined' && navigator.geolocation) {
      try {
        await new Promise<void>((resolve) => {
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              lat = pos.coords.latitude;
              lon = pos.coords.longitude;
              resolve();
            },
            () => resolve(),
            { enableHighAccuracy: true, timeout: 6000 }
          );
        });
      } catch {
        // Continuar a fallback de geolocalización
      }
    }

    if (lat !== null && lon !== null) {
      addressText = `Lat: ${lat.toFixed(4)}, Lon: ${lon.toFixed(4)}`;
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`,
          { headers: { 'User-Agent': 'BAProtegeApp/1.0' } }
        );
        const data = await res.json();
        if (data && data.display_name) {
          addressText = data.display_name;
        }
      } catch {
        // Usa coordenadas formateadas si el servicio de nombres no responde
      }

      updatePermission('location', true);

      await apiService.saveUserLocation({
        latitude: lat,
        longitude: lon,
        address: addressText,
        source: 'GPS',
      });

      showFeedback({
        title: '¡Ubicación activada con éxito!',
        message:
          'Ahora la aplicación podrá garantizar el funcionamiento de las alertas para mantener una navegación segura.',
        mood: 'feliz',
      });
    } else {
      // Coordenadas satelitales aún sin fijar, pero permiso concedido: aproximar por red/IP
      await fallbackIpLocation(true);
    }
  };

  /** Fallback: Obtiene la ubicación aproximada basada en la red IP (solo si el permiso fue concedido) */
  const fallbackIpLocation = async (permissionGranted: boolean = false) => {
    if (!permissionGranted) {
      updatePermission('location', false);
      return;
    }

    try {
      const res = await fetch('https://ipapi.co/json/');
      const data = await res.json();
      const ipAddress = `${data.city || 'Buenos Aires'}, ${data.region || 'CABA'}, ${data.country_name || 'Argentina'} (Aproximada por red)`;

      updatePermission('location', true);

      await apiService.saveUserLocation({
        address: ipAddress,
        city: data.city,
        country: data.country_name,
        source: 'IP',
      });

      showFeedback({
        title: '¡Ubicación activada con éxito!',
        message:
          'Ahora la aplicación podrá garantizar el funcionamiento de las alertas para mantener una navegación segura.',
        mood: 'feliz',
      });
    } catch {
      const defaultLoc = 'Buenos Aires, Argentina (Ubicación de referencia)';
      updatePermission('location', true);

      await apiService.saveUserLocation({ address: defaultLoc, source: 'IP' });

      showFeedback({
        title: '¡Ubicación activada con éxito!',
        message:
          'Ahora la aplicación podrá garantizar el funcionamiento de las alertas para mantener una navegación segura.',
        mood: 'feliz',
      });
    }
  };

  /** Solicita el permiso nativo real de ubicación GPS y valida la autorización en el dispositivo */
  const handleRequestLocation = async () => {
    if (isRequestingLocationRef.current) {
      return;
    }
    isRequestingLocationRef.current = true;
    setLoadingKey('location');

    try {
      const result = await requestAndVerifyLocationPermission(
        protectionService,
        PermissionsAndroid
      );

      if (!result.granted) {
        updatePermission('location', false);
        showFeedback({
          title: 'La ubicación sigue desactivada',
          message:
            'Para garantizar que siempre te lleguen las alertas de seguridad, podés activar la ubicación cuando quieras desde la configuración.',
          mood: 'nervioso',
        });
        return;
      }

      // El permiso fue otorgado por el usuario. Verificar si el hardware GPS está activado.
      if (!result.locationEnabled && typeof protectionService.isLocationEnabled === 'function') {
        const isLocEnabled = await protectionService.isLocationEnabled();
        if (!isLocEnabled) {
          showFeedback({
            title: 'La ubicación sigue desactivada',
            message:
              'Para garantizar que siempre te lleguen las alertas de seguridad, podés activar la ubicación cuando quieras desde la configuración.',
            mood: 'pensando',
            buttonText: 'Configurar',
            secondaryButtonText: 'Cancelar',
            onConfirm: async () => {
              setFeedbackModal((prev) => ({ ...prev, visible: false }));
              await protectionService.openLocationSettings();
              recordLocationData().catch(() => {});
            },
            onSecondaryPress: () => {
              setFeedbackModal((prev) => ({ ...prev, visible: false }));
            },
          });
          return;
        }
      }

      await recordLocationData();
    } catch (error) {
      console.warn('[PermissionsScreen] Error al solicitar permiso de ubicación:', error);
      updatePermission('location', false);
    } finally {
      isRequestingLocationRef.current = false;
      setLoadingKey(null);
    }
  };

  const showProtectedPermissionNotice = () => {
    showFeedback({
      title: 'Permiso protegido',
      message: 'Una vez activado, este permiso no puede desactivarse desde un dispositivo protegido.',
      mood: 'nervioso',
    });
  };

  const handleDisablePermission = async (key: keyof PermissionItemState) => {
    switch (key) {
      case 'vpn': {
        showFeedback({
          title: '¿Querés desactivar el filtro?',
          message:
            'Sin este filtro el dispositivo queda expuesto a sitios y apps de juegos y apuestas ilegales. Podés volver a activarlo cuando quieras desde la configuración.',
          mood: 'pensando',
          buttonText: 'Configurar',
          secondaryButtonText: 'Cancelar',
          onConfirm: async () => {
            setFeedbackModal((prev) => ({ ...prev, visible: false }));
            try {
              await protectionService.stopProtection();
            } catch (err) {
              console.warn('[PermissionsScreen] Error al detener VPN:', err);
            }
            updatePermission('vpn', false);
            pendingDisableConfirmationRef.current = 'vpn';
            try {
              await protectionService.openVpnSettings();
            } catch {
              pendingDisableConfirmationRef.current = null;
              showFeedback(DEACTIVATION_CONFIRMATION_MODALS.vpn);
            }
          },
          onSecondaryPress: () => {
            setFeedbackModal((prev) => ({ ...prev, visible: false }));
          },
        });
        break;
      }
      case 'accessibility': {
        showFeedback({
          title: '¿Querés desactivar la antidesinstalación?',
          message:
            'Sin esta protección, la aplicación podría cerrarse o eliminarse por error. Podés volver a activarla cuando quieras desde la configuración.',
          mood: 'pensando',
          buttonText: 'Configurar',
          secondaryButtonText: 'Cancelar',
          onConfirm: async () => {
            setFeedbackModal((prev) => ({ ...prev, visible: false }));
            try {
              await protectionService.openAccessibilitySettings();
            } catch (err) {
              console.warn('[PermissionsScreen] Error al abrir accesibilidad:', err);
            }
          },
          onSecondaryPress: () => {
            setFeedbackModal((prev) => ({ ...prev, visible: false }));
          },
        });
        break;
      }
      case 'notifications': {
        showFeedback({
          title: '¿Querés desactivar las notificaciones?',
          message:
            'Sin estos avisos, no vas a enterarte al instante de las alertas de seguridad. Para avanzar, debés cambiar la configuración desde tu celular.',
          mood: 'pensando',
          buttonText: 'Configurar',
          secondaryButtonText: 'Cancelar',
          onConfirm: async () => {
            setFeedbackModal((prev) => ({ ...prev, visible: false }));
            try {
              await protectionService.openNotificationSettings();
            } catch (err) {
              console.warn('[PermissionsScreen] Error al abrir notificaciones:', err);
            }
          },
          onSecondaryPress: () => {
            setFeedbackModal((prev) => ({ ...prev, visible: false }));
          },
        });
        break;
      }
      case 'batteryOptimization': {
        showFeedback({
          title: '¿Querés desactivar la protección continua?',
          message:
            'Sin este permiso, la aplicación no podrá mantener la protección contra sitios y apps de juegos y apuestas ilegales las 24 horas. Para avanzar, debés cambiar la configuración desde tu celular.',
          mood: 'pensando',
          buttonText: 'Configurar',
          secondaryButtonText: 'Cancelar',
          onConfirm: async () => {
            setFeedbackModal((prev) => ({ ...prev, visible: false }));
            try {
              await protectionService.openBatterySettings();
            } catch (err) {
              console.warn('[PermissionsScreen] Error al abrir batería:', err);
            }
          },
          onSecondaryPress: () => {
            setFeedbackModal((prev) => ({ ...prev, visible: false }));
          },
        });
        break;
      }
      case 'location': {
        showFeedback({
          title: '¿Querés desactivar la ubicación?',
          message:
            'Sin este permiso, la aplicación no puede garantizar que te lleguen en todo momento las alertas de seguridad. Podés volver a activarlo cuando quieras desde la configuración.',
          mood: 'pensando',
          buttonText: 'Configurar',
          secondaryButtonText: 'Cancelar',
          onConfirm: async () => {
            setFeedbackModal((prev) => ({ ...prev, visible: false }));
            updatePermission('location', false);
            pendingDisableConfirmationRef.current = 'location';
            try {
              await protectionService.openLocationSettings();
            } catch (err) {
              console.warn('[PermissionsScreen] Error al abrir ubicación:', err);
              pendingDisableConfirmationRef.current = null;
              showFeedback(DEACTIVATION_CONFIRMATION_MODALS.location);
            }
          },
          onSecondaryPress: () => {
            setFeedbackModal((prev) => ({ ...prev, visible: false }));
          },
        });
        break;
      }
      case 'usageStats': {
        showFeedback({
          title: '¿Querés desactivar las estadísticas?',
          message:
            'Sin este permiso, no podremos informarte sobre el tiempo que pasaste en las aplicaciones. Para avanzar, debés cambiar la configuración desde tu celular.',
          mood: 'pensando',
          buttonText: 'Configurar',
          secondaryButtonText: 'Cancelar',
          onConfirm: async () => {
            setFeedbackModal((prev) => ({ ...prev, visible: false }));
            try {
              await protectionService.openUsageStatsSettings();
            } catch (err) {
              console.warn('[PermissionsScreen] Error al abrir acceso de uso:', err);
            }
          },
          onSecondaryPress: () => {
            setFeedbackModal((prev) => ({ ...prev, visible: false }));
          },
        });
        break;
      }
    }
  };

  const handleTogglePermission = (key: keyof PermissionItemState) => {
    if (!canToggleDevicePermission(permissions[key], canDisablePermissions)) {
      showProtectedPermissionNotice();
      return;
    }

    if (permissions[key]) {
      handleDisablePermission(key);
    } else {
      // Activar permiso mediante su flujo específico
      switch (key) {
        case 'vpn':
          handleRequestVpn();
          break;
        case 'accessibility':
          handleRequestAccessibility();
          break;
        case 'notifications':
          handleRequestNotifications();
          break;
        case 'batteryOptimization':
          handleRequestBattery();
          break;
        case 'location':
          handleRequestLocation();
          break;
        case 'usageStats':
          handleRequestUsageStats();
          break;
      }
    }
  };

  const actionHandlers = useMemo(
    () => ({
      vpn: handleRequestVpn,
      accessibility: handleRequestAccessibility,
      notifications: handleRequestNotifications,
      batteryOptimization: handleRequestBattery,
      location: handleRequestLocation,
      usageStats: handleRequestUsageStats,
    }),
    []
  );

  const permissionItems: PermissionCardItem[] = useMemo(() => {
    return PERMISSION_DEFINITIONS.map((def) => ({
      ...def,
      onAction: actionHandlers[def.key],
    }));
  }, [actionHandlers]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <PermissionsHeader onBack={handleBackToLogin} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <PermissionsInfoBox />

        {/* Contenedor distribuido de tarjetas de permisos */}
        <View style={styles.cardsContainer}>
          {permissionItems.map((item) => {
            const isGranted = permissions[item.key];
            const isExpanded = expandedKey === item.key;
            const isLoading = loadingKey === item.loadingKey;

            return (
              <PermissionCard
                key={item.key}
                item={item}
                isGranted={isGranted}
                isExpanded={isExpanded}
                isLoading={isLoading}
                canDisablePermissions={canDisablePermissions}
                onToggleExpand={() => toggleExpand(item.key)}
                onTogglePermission={() => handleTogglePermission(item.key)}
                onDisablePermission={() => handleDisablePermission(item.key)}
                onDisabledPress={showProtectedPermissionNotice}
              />
            );
          })}
        </View>

        <PermissionsFooter
          onBack={handleBackToLogin}
          onContinue={onPermissionsComplete}
        />
      </ScrollView>

      <FeedbackModal
        visible={feedbackModal.visible}
        imageSource={feedbackModal.imageSource}
        title={feedbackModal.title}
        message={feedbackModal.message}
        buttonText={feedbackModal.buttonText}
        secondaryButtonText={feedbackModal.secondaryButtonText}
        onConfirm={feedbackModal.onConfirm}
        onSecondaryPress={feedbackModal.onSecondaryPress}
        onClose={() => setFeedbackModal((prev) => ({ ...prev, visible: false }))}
      />
    </SafeAreaView>
  );
};
