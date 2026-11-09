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
import { getBotMascotImage } from '../components/dashboard/protected/botAssets';
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
    buttonText?: string;
    secondaryButtonText?: string;
    onConfirm?: () => void;
    onSecondaryPress?: () => void;
  }) => {
    setFeedbackModal({
      visible: true,
      imageSource: getBotMascotImage(protectedProfile || 'ADULT', options.mood || 'feliz'),
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

  // Consultar permisos reales nativos al montar
  useEffect(() => {
    checkRealDevicePermissions(userId).then((real) => {
      setPermissions({
        vpn: real.vpn,
        accessibility: real.accessibility,
        notifications: real.notifications,
        batteryOptimization: real.batteryOptimization,
        location: real.location,
        usageStats: real.usageStats,
      });
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
            !isRequestingUsageStatsRef.current
              ? protectionService.isUsageStatsPermissionGranted()
              : Promise.resolve(null),
            protectionService.isProtectionActive().catch(() => false),
          ]);

          let feedbackToShow: {
            title: string;
            message: string;
            mood: 'feliz' | 'pensando' | 'triste' | 'festejando' | 'nervioso';
            buttonText: string;
          } | null = null;

          setPermissions((prev) => {
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
            if (isLocGranted === false) {
              nextLoc = false;
            }

            if (prev.batteryOptimization && nextBattery === false) {
              feedbackToShow = {
                title: 'Optimización de batería desactivada',
                message:
                  'El permiso de optimización de batería fue deshabilitado correctamente.',
                mood: 'feliz',
                buttonText: 'Entendido',
              };
            } else if (prev.accessibility && nextAcc === false) {
              feedbackToShow = {
                title: 'Accesibilidad desactivada',
                message:
                  'El servicio de accesibilidad fue deshabilitado correctamente.',
                mood: 'feliz',
                buttonText: 'Entendido',
              };
            } else if (prev.notifications && nextNotif === false) {
              feedbackToShow = {
                title: 'Notificaciones desactivadas',
                message:
                  'Las notificaciones del sistema fueron deshabilitadas correctamente.',
                mood: 'feliz',
                buttonText: 'Entendido',
              };
            } else if (prev.usageStats && nextUsage === false) {
              feedbackToShow = {
                title: 'Estadísticas de uso desactivadas',
                message:
                  'El acceso a estadísticas de uso fue deshabilitado correctamente.',
                mood: 'feliz',
                buttonText: 'Entendido',
              };
            }

            if (
              prev.vpn === nextVpn &&
              prev.accessibility === nextAcc &&
              prev.notifications === nextNotif &&
              prev.batteryOptimization === nextBattery &&
              prev.location === nextLoc &&
              prev.usageStats === nextUsage
            ) {
              return prev;
            }
            const next = {
              ...prev,
              vpn: nextVpn,
              accessibility: nextAcc,
              notifications: nextNotif,
              batteryOptimization: nextBattery,
              location: nextLoc,
              usageStats: nextUsage,
            };
            saveDevicePermissions(next, userId);
            return next;
          });

          if (feedbackToShow) {
            showFeedback(feedbackToShow);
          }
        } catch {
          // Mantener estado actual si falla la verificación nativa
        }
      }
    });

    return () => {
      subscription.remove();
    };
  }, [userId]);

  // Helper para actualizar y persistir el estado real de permisos
  const updatePermission = (key: keyof PermissionItemState, value: boolean) => {
    setPermissions((prev) => {
      const next = { ...prev, [key]: value };
      saveDevicePermissions(next, userId);
      return next;
    });
  };

  // Solo un card puede estar abierto a la vez (los demás se cierran automáticamente)
  const [expandedKey, setExpandedKey] = useState<string | null>(null);
  const [locationAddress, setLocationAddress] = useState<string | null>(null);
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
          title: 'Permiso VPN concedido',
          message: 'El servicio de filtrado local VPN ha sido autorizado en la configuración del dispositivo.',
          mood: 'feliz',
        });
      } else {
        updatePermission('vpn', false);
        showFeedback({
          title: 'Permiso VPN no activado',
          message: result.cancelled
            ? 'Cancelaste la solicitud de conexión VPN. Para activar la protección, confirmá el permiso en el diálogo del sistema.'
            : 'No se pudo verificar la activación del permiso VPN en la configuración del dispositivo.',
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
          title: 'Servicio de accesibilidad activado',
          message: 'Se activó la protección antidesinstalación en la configuración del dispositivo.',
          mood: 'feliz',
        });
      } else {
        updatePermission('accessibility', false);
        showFeedback({
          title: 'Servicio de accesibilidad no activado',
          message: 'No se detectó la activación de "BA Protege+" en Accesibilidad. En Ajustes de Accesibilidad, seleccioná "BA Protege+" y activá el servicio.',
          mood: 'nervioso',
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
          title: 'Notificaciones habilitadas',
          message: 'Las notificaciones del sistema están activas. Recibirás alertas en tiempo real y avisos de supervisión.',
          mood: 'feliz',
        });
      } else {
        updatePermission('notifications', false);
        showFeedback({
          title: 'Notificaciones no activadas',
          message: result.denied
            ? 'No se otorgó el permiso de notificaciones en el dispositivo. Habilitá las notificaciones para recibir alertas de protección.'
            : 'No se pudo verificar la activación de notificaciones en el dispositivo.',
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
          title: 'Exención de batería concedida',
          message: 'La app quedó autorizada para operar ininterrumpidamente en segundo plano.',
          mood: 'feliz',
        });
      } else {
        updatePermission('batteryOptimization', false);
        showFeedback({
          title: 'Exención de batería no activada',
          message: result.denied
            ? 'No se concedió la exención de ahorro de batería. Para evitar interrupciones en la protección, permití la ejecución sin restricciones.'
            : 'No se pudo verificar la exención de batería en la configuración del dispositivo.',
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
          title: 'Estadísticas de uso autorizadas',
          message: 'Permiso concedido para supervisar tiempo de pantalla y límites diarios de aplicaciones.',
          mood: 'feliz',
        });
      } else {
        updatePermission('usageStats', false);
        showFeedback({
          title: 'Permiso de acceso al uso no concedido',
          message: result.denied
            ? 'No se activó el acceso a estadísticas de uso. Para hacer cumplir los límites de tiempo de pantalla, habilitá BA Protege+ en Ajustes.'
            : 'No se pudo verificar el acceso a estadísticas de uso en la configuración del dispositivo.',
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

      setLocationAddress(addressText);
      updatePermission('location', true);

      await apiService.saveUserLocation({
        latitude: lat,
        longitude: lon,
        address: addressText,
        source: 'GPS',
      });

      showFeedback({
        title: 'Ubicación GPS registrada',
        message: `Dirección obtenida exitosamente por GPS:\n${addressText}`,
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
      setLocationAddress(null);
      return;
    }

    try {
      const res = await fetch('https://ipapi.co/json/');
      const data = await res.json();
      const ipAddress = `${data.city || 'Buenos Aires'}, ${data.region || 'CABA'}, ${data.country_name || 'Argentina'} (Aproximada por red)`;

      setLocationAddress(ipAddress);
      updatePermission('location', true);

      await apiService.saveUserLocation({
        address: ipAddress,
        city: data.city,
        country: data.country_name,
        source: 'IP',
      });

      showFeedback({
        title: 'Ubicación registrada',
        message: `Permiso de ubicación autorizado. Se sincronizó la posición de referencia:\n${ipAddress}`,
        mood: 'feliz',
      });
    } catch {
      const defaultLoc = 'Buenos Aires, Argentina (Ubicación de referencia)';
      setLocationAddress(defaultLoc);
      updatePermission('location', true);

      await apiService.saveUserLocation({ address: defaultLoc, source: 'IP' });

      showFeedback({
        title: 'Ubicación registrada',
        message: `Permiso de ubicación autorizado:\n${defaultLoc}`,
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
        setLocationAddress(null);
        showFeedback({
          title: 'Permiso de ubicación no concedido',
          message: 'Para supervisar la geolocalización y seguridad familiar, debés aceptar el permiso de ubicación en el dispositivo.',
          mood: 'nervioso',
        });
        return;
      }

      // El permiso fue otorgado por el usuario. Verificar si el hardware GPS está activado.
      if (!result.locationEnabled && typeof protectionService.isLocationEnabled === 'function') {
        const isLocEnabled = await protectionService.isLocationEnabled();
        if (!isLocEnabled) {
          showFeedback({
            title: 'Ubicación desactivada',
            message: 'El permiso de ubicación fue concedido, pero la ubicación del dispositivo está desactivada. ¿Deseás activarla en Ajustes?',
            mood: 'pensando',
            buttonText: 'Abrir ajustes',
            secondaryButtonText: 'Cancelar',
            onConfirm: async () => {
              setFeedbackModal((prev) => ({ ...prev, visible: false }));
              await protectionService.openLocationSettings();
              recordLocationData().catch(() => {});
            },
            onSecondaryPress: () => {
              setFeedbackModal((prev) => ({ ...prev, visible: false }));
              recordLocationData().catch(() => {});
            },
          });
          return;
        }
      }

      await recordLocationData();
    } catch (error) {
      console.warn('[PermissionsScreen] Error al solicitar permiso de ubicación:', error);
      updatePermission('location', false);
      setLocationAddress(null);
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
        try {
          await protectionService.stopProtection();
        } catch (err) {
          console.warn('[PermissionsScreen] Error al detener VPN:', err);
        }
        updatePermission('vpn', false);
        showFeedback({
          title: 'Filtrado VPN desactivado',
          message:
            'Se detuvo el servicio de filtrado y protección VPN en el dispositivo. Si deseás desconectar o administrar la conexión en el sistema, podés abrir Ajustes.',
          mood: 'feliz',
          buttonText: 'Abrir ajustes',
          secondaryButtonText: 'Cancelar',
          onConfirm: () => {
            setFeedbackModal((prev) => ({ ...prev, visible: false }));
            protectionService.openVpnSettings().catch(() => {});
          },
          onSecondaryPress: () => {
            setFeedbackModal((prev) => ({ ...prev, visible: false }));
          },
        });
        break;
      }
      case 'accessibility': {
        showFeedback({
          title: 'Desactivar accesibilidad',
          message:
            'Para desactivar la protección antidesinstalación, Android requiere que apagues el servicio en los Ajustes de accesibilidad del sistema. ¿Deseás abrir Ajustes ahora?',
          mood: 'pensando',
          buttonText: 'Abrir ajustes',
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
          title: 'Desactivar notificaciones',
          message:
            'Para desactivar las alertas y notificaciones del sistema, debés deshabilitarlas en los Ajustes de la aplicación. ¿Deseás abrir Ajustes ahora?',
          mood: 'pensando',
          buttonText: 'Abrir ajustes',
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
          title: 'Optimización de batería',
          message:
            'Para reactivar la optimización de batería (ahorro de energía de Android), podés modificarlo en los Ajustes del sistema. ¿Deseás abrir Ajustes ahora?',
          mood: 'pensando',
          buttonText: 'Abrir ajustes',
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
        updatePermission('location', false);
        setLocationAddress(null);
        showFeedback({
          title: 'Ubicación desactivada',
          message:
            'Se desactivó el registro de ubicación en la aplicación. Si deseás revocar el permiso GPS del sistema, podés hacerlo en los Ajustes.',
          mood: 'feliz',
          buttonText: 'Abrir ajustes',
          secondaryButtonText: 'Cancelar',
          onConfirm: async () => {
            setFeedbackModal((prev) => ({ ...prev, visible: false }));
            try {
              await protectionService.openLocationSettings();
            } catch (err) {
              console.warn('[PermissionsScreen] Error al abrir ubicación:', err);
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
          title: 'Desactivar estadísticas de uso',
          message:
            'Para desactivar la supervisión del tiempo de uso de aplicaciones, Android requiere que apagues el acceso en los Ajustes del sistema. ¿Deseás abrir Ajustes ahora?',
          mood: 'pensando',
          buttonText: 'Abrir ajustes',
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
                locationAddress={locationAddress}
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
