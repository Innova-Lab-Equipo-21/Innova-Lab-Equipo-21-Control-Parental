// ==============================================================================
// Proyecto: BA Protege+
// Componente: AuditEventsCard (Auditoría: bloqueos y Anti-bypass)
// Archivo: components/analytics/AuditEventsCard.tsx
// Descripción: CORRECCIÓN 5 del prototipo: reemplaza el "Ver todo" por pestañas
//              "Últimos bloqueos" y "Eventos Anti-bypass" (#10 y #20).
// ==============================================================================

import React from 'react';
import { Text, View } from 'react-native';
import { SegmentedTabs } from '../atomic/SegmentedTabs';
import { SourceBadge } from '../atomic/SourceBadge';
import { AttemptEvent, AuditTab } from '../types';
import { cardStyles } from '../card.styles';
import { styles } from './AuditEventsCard.styles';

export interface AuditEventsCardProps {
  auditTab: AuditTab;
  onChangeAuditTab: (tab: AuditTab) => void;
  blockedAttempts: AttemptEvent[];
  bypassEvents: AttemptEvent[];
  bypassCount?: number;
}

const AttemptRow: React.FC<{ event: AttemptEvent }> = ({ event }) => (
  <View style={styles.attemptItem}>
    <View style={styles.attemptInfo}>
      <Text style={styles.attemptTitle}>{event.title}</Text>
      <Text style={styles.attemptMeta}>{event.meta}</Text>
    </View>
    <SourceBadge source={event.source} label={event.badgeLabel} />
  </View>
);

export const AuditEventsCard: React.FC<AuditEventsCardProps> = ({
  auditTab,
  onChangeAuditTab,
  blockedAttempts,
  bypassEvents,
  bypassCount,
}) => {
  const events = auditTab === 'urls' ? blockedAttempts : bypassEvents;

  return (
    <View style={cardStyles.card}>
      <View style={styles.tabsWrap}>
        <SegmentedTabs
          tabs={[
            { key: 'urls', label: 'Últimos bloqueos' },
            {
              key: 'bypass',
              label: 'Eventos Anti-bypass',
              badgeCount: bypassCount ?? bypassEvents.length,
            },
          ]}
          activeKey={auditTab}
          onChange={(key) => onChangeAuditTab(key as AuditTab)}
        />
      </View>

      <View style={styles.list}>
        {events.map((event) => (
          <AttemptRow key={event.id} event={event} />
        ))}
      </View>
    </View>
  );
};
