// ==============================================================================
// Proyecto: BA Protege+
// Componente: AdultoActividadSection
// Archivo: src/components/dashboard/protected/adulto/AdultoActividadSection.tsx
// Descripción: Pestaña Actividad exclusiva del Modo Protegido Adulto mostrando
//              únicamente sus datos personales en 3 bloques siguiendo el estilo
//              del Modo Responsable:
//              1. Tiempo de uso de las aplicaciones
//              2. Historial de intentos de acceso a sitios y apps bloqueados
//                 (solamente subbloque Historial de toda la actividad)
//              3. Pasatiempos
// ==============================================================================

import React, { useMemo, useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { DeviceInfo } from '../../../../types';
import { BlockedAppsUsageSummary } from '../../../../utils/appUsageMetrics';
import {
  DailyPasatiemposRecord,
  buildResponsiblePasatiemposSummary,
} from '../../../../utils/pasatiemposMetrics';
import {
  FormattedBlockedAttempt,
  getDisplayTitleForBlockedAttempt,
} from '../../../../utils/activityMetrics';
import { getDeviceFirstName } from '../../../../utils/authValidation';
import { getDeviceHighlight } from '../../../../utils/deviceColors';
import { AppsUsageCard } from '../../actividad/blocks/AppsUsageCard';
import { AuditEventsCard } from '../../actividad/blocks/AuditEventsCard';
import { PasatiemposSummaryCard } from '../../actividad/blocks/PasatiemposSummaryCard';
import { AttemptEvent, AuditTab } from '../../actividad/types';
import { cardStyles } from '../../actividad/card.styles';
import { styles } from './AdultoActividadSection.styles';

export interface AdultoActividadSectionProps {
  appsUsageSummary: BlockedAppsUsageSummary;
  todayRecord: DailyPasatiemposRecord;
  streakDays: number;
  weeklyQuizAccuracyPct: number;
  blockedAttempts: FormattedBlockedAttempt[];
  bypassEvents?: AttemptEvent[];
  adultName?: string;
  deviceId?: string;
  onOpenQuiz?: () => void;
  /** Prop opcional preservada por compatibilidad */
  customBlockedItems?: string[];
}

export const AdultoActividadSection: React.FC<AdultoActividadSectionProps> = ({
  appsUsageSummary,
  todayRecord,
  streakDays,
  weeklyQuizAccuracyPct,
  blockedAttempts,
  bypassEvents = [],
  adultName,
  deviceId,
}) => {
  const [historyBlockExpanded, setHistoryBlockExpanded] = useState<boolean>(true);
  const [auditTab, setAuditTab] = useState<AuditTab>('urls');

  // Mapeo personal de intentos bloqueados para el subbloque "Historial de toda la actividad"
  const auditBlockedAttempts: AttemptEvent[] = useMemo(
    () =>
      blockedAttempts.map((attempt) => {
        const isLotba = attempt.sourceListType === 'LOTBA';
        return {
          id: attempt.id,
          title: getDisplayTitleForBlockedAttempt(
            attempt.attemptedDomain,
            attempt.sourceListType,
            attempt.itemType
          ),
          meta: attempt.formattedDateTime,
          formattedDateTime: attempt.formattedDateTime,
          itemType: attempt.itemType,
          source: isLotba ? 'lotba' : 'custom',
          badgeLabel: isLotba ? 'LOTBA' : 'Personalizada',
          deviceId: attempt.deviceId,
        };
      }),
    [blockedAttempts]
  );

  // Resumen personal de Pasatiempos (solo el adulto protegido actual)
  const personalPasatiemposSummary = useMemo(() => {
    const resolvedId = deviceId || todayRecord.deviceId || 'adult-self';
    const resolvedLabel = getDeviceFirstName(adultName || 'Mi perfil');
    const highlight = getDeviceHighlight(
      resolvedId,
      resolvedLabel,
      resolvedLabel,
      0
    );

    const personalDevice: DeviceInfo = {
      deviceId: resolvedId,
      deviceUuid: resolvedId,
      deviceName: resolvedLabel,
      childName: resolvedLabel,
      profileType: 'Adulto',
      status: 'ACTIVE',
      isProtected: true,
      blockedCount: blockedAttempts.length,
      blocklistVersion: 1,
    };

    return buildResponsiblePasatiemposSummary({
      devices: [personalDevice],
      recordsByDeviceId: { [resolvedId]: todayRecord },
      streakByDeviceId: { [resolvedId]: streakDays },
      weeklyQuizPctByDeviceId: { [resolvedId]: weeklyQuizAccuracyPct },
      colorByDeviceId: { [resolvedId]: highlight.color },
      selectedDeviceId: resolvedId,
    });
  }, [
    adultName,
    deviceId,
    todayRecord,
    streakDays,
    weeklyQuizAccuracyPct,
    blockedAttempts.length,
  ]);

  return (
    <View style={styles.container}>
      {/* 1. Tiempo de uso de las aplicaciones */}
      <AppsUsageCard
        summary={appsUsageSummary}
        variant="adult"
        title="Tiempo de uso de las aplicaciones"
      />

      {/* 2. Historial de intentos de acceso a sitios y apps bloqueados (solo subbloque Historial de toda la actividad) */}
      <View style={cardStyles.card}>
        <TouchableOpacity
          activeOpacity={0.75}
          onPress={() => setHistoryBlockExpanded((prev) => !prev)}
          accessibilityRole="button"
          accessibilityState={{ expanded: historyBlockExpanded }}
          style={[
            styles.accordionHeaderRow,
            !historyBlockExpanded && styles.accordionHeaderRowCollapsed,
          ]}
        >
          <Text style={styles.accordionTitle}>
            Historial de intentos de acceso a sitios y apps bloqueados
          </Text>
          <Text style={styles.accordionChevron}>
            {historyBlockExpanded ? '▲' : '▼'}
          </Text>
        </TouchableOpacity>

        {historyBlockExpanded ? (
          <View style={styles.subblocksStack}>
            <AuditEventsCard
              auditTab={auditTab}
              onChangeAuditTab={setAuditTab}
              blockedAttempts={auditBlockedAttempts}
              bypassEvents={bypassEvents}
              bypassCount={bypassEvents.length}
              embedded={true}
            />
          </View>
        ) : null}
      </View>

      {/* 3. Pasatiempos */}
      <PasatiemposSummaryCard summary={personalPasatiemposSummary} />
    </View>
  );
};
