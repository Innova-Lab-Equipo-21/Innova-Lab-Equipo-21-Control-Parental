// ==============================================================================
// Proyecto: BA Protege+
// Hook: useActivityDashboard (Estado y Derivación de Métricas de Actividad)
// Archivo: src/components/dashboard/actividad/hooks/useActivityDashboard.ts
// Descripción: Encapsula la carga de eventos bloqueados, opciones de filtrado
//              por dispositivo y período, cálculo reactivo de métricas y control
//              de los modales de selección y detalle completo.
// ==============================================================================

import { useEffect, useMemo, useState } from 'react';
import {
  CustomBlockedApp,
  CustomBlockedDomain,
  DeviceInfo,
} from '../../../../types';
import { apiService } from '../../../../services/api.service';
import { getDeviceHighlight } from '../../../../utils/deviceColors';
import {
  ActivityDeviceFilterOption,
  ActivityMetricsSnapshot,
  ActivityPeriod,
  BlockedAttemptRecord,
  HourlyAttemptBucket,
  buildActivityDataset,
  buildDeviceFilterOptions,
  computeActivityMetrics,
} from '../../../../utils/activityMetrics';

export interface UseActivityDashboardParams {
  devices?: DeviceInfo[];
  customSites?: CustomBlockedDomain[];
  customApps?: CustomBlockedApp[];
}

export interface UseActivityDashboardResult {
  selectedDeviceId: string;
  setSelectedDeviceId: (deviceId: string) => void;
  selectedPeriod: ActivityPeriod;
  setSelectedPeriod: (period: ActivityPeriod) => void;
  deviceOptions: ActivityDeviceFilterOption[];
  activeDeviceOption: ActivityDeviceFilterOption;
  activeDeviceColor: string;
  metrics: ActivityMetricsSnapshot;
  inspectedHour: number | null;
  inspectedBucket: HourlyAttemptBucket | null;
  toggleInspectedHour: (hour: number) => void;
  showDeviceModal: boolean;
  setShowDeviceModal: (visible: boolean) => void;
  showPeriodModal: boolean;
  setShowPeriodModal: (visible: boolean) => void;
  showAllAttemptsModal: boolean;
  setShowAllAttemptsModal: (visible: boolean) => void;
}

export function useActivityDashboard({
  devices = [],
  customSites = [],
  customApps = [],
}: UseActivityDashboardParams): UseActivityDashboardResult {
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('all');
  const [selectedPeriod, setSelectedPeriod] = useState<ActivityPeriod>('week');
  const [persistedEvents, setPersistedEvents] = useState<BlockedAttemptRecord[]>([]);
  const [localSites, setLocalSites] = useState<CustomBlockedDomain[]>(customSites);
  const [localApps, setLocalApps] = useState<CustomBlockedApp[]>(customApps);
  const [inspectedHour, setInspectedHour] = useState<number | null>(null);

  // Modales selectores y detalle completo
  const [showDeviceModal, setShowDeviceModal] = useState<boolean>(false);
  const [showPeriodModal, setShowPeriodModal] = useState<boolean>(false);
  const [showAllAttemptsModal, setShowAllAttemptsModal] = useState<boolean>(false);

  useEffect(() => {
    let mounted = true;
    apiService
      .getBlockedEvents()
      .then((events) => {
        if (mounted && Array.isArray(events)) {
          setPersistedEvents(events);
        }
      })
      .catch(() => {});

    if (customSites.length === 0 && customApps.length === 0) {
      apiService
        .getCustomBlocklist()
        .then((res) => {
          if (!mounted) return;
          if (res.data?.domains) setLocalSites(res.data.domains);
          if (res.data?.apps) setLocalApps(res.data.apps);
        })
        .catch(() => {});
    }

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (customSites.length > 0) setLocalSites(customSites);
    if (customApps.length > 0) setLocalApps(customApps);
  }, [customSites, customApps]);

  // Opciones del filtro de Dispositivos
  const deviceOptions = useMemo(
    () => buildDeviceFilterOptions(devices, true),
    [devices]
  );

  // Si el dispositivo filtrado fue desvinculado, volver a "Todos"
  useEffect(() => {
    const exists = deviceOptions.some((opt) => opt.id === selectedDeviceId);
    if (!exists) {
      setSelectedDeviceId('all');
    }
  }, [deviceOptions, selectedDeviceId]);

  // Limpiar hora inspeccionada al cambiar filtros
  useEffect(() => {
    setInspectedHour(null);
  }, [selectedDeviceId, selectedPeriod]);

  const activeDeviceOption = useMemo(
    () =>
      deviceOptions.find((opt) => opt.id === selectedDeviceId) ||
      deviceOptions[0],
    [deviceOptions, selectedDeviceId]
  );

  const activeDeviceColor = useMemo(() => {
    if (activeDeviceOption.isAll || activeDeviceOption.isSelf) {
      return '#007AFF';
    }
    return getDeviceHighlight(
      activeDeviceOption.id,
      activeDeviceOption.label,
      activeDeviceOption.label,
      activeDeviceOption.colorIndex ?? 0
    ).color;
  }, [activeDeviceOption]);

  // Dataset consolidado y cálculo de métricas en tiempo real
  const dataset = useMemo(
    () =>
      buildActivityDataset({
        devices,
        customSites: localSites,
        customApps: localApps,
        persistedEvents,
      }),
    [devices, localSites, localApps, persistedEvents]
  );

  const metrics = useMemo(
    () =>
      computeActivityMetrics(dataset, {
        deviceId: selectedDeviceId,
        period: selectedPeriod,
        recentLimit: 4,
      }),
    [dataset, selectedDeviceId, selectedPeriod]
  );

  const inspectedBucket =
    inspectedHour !== null ? metrics.hourly[inspectedHour] : null;

  const toggleInspectedHour = (hour: number) => {
    setInspectedHour((prev) => (prev === hour ? null : hour));
  };

  return {
    selectedDeviceId,
    setSelectedDeviceId,
    selectedPeriod,
    setSelectedPeriod,
    deviceOptions,
    activeDeviceOption,
    activeDeviceColor,
    metrics,
    inspectedHour,
    inspectedBucket,
    toggleInspectedHour,
    showDeviceModal,
    setShowDeviceModal,
    showPeriodModal,
    setShowPeriodModal,
    showAllAttemptsModal,
    setShowAllAttemptsModal,
  };
}
