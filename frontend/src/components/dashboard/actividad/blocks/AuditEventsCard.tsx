// ==============================================================================
// Proyecto: BA Protege+
// Componente: AuditEventsCard (Auditoría: bloqueos y Anti-bypass)
// Archivo: src/components/dashboard/actividad/blocks/AuditEventsCard.tsx
// Descripción: CORRECCIÓN 5 del prototipo: reemplaza el "Ver todo" por pestañas
//              "Últimos bloqueos" y "Eventos Anti-bypass" (#10 y #20).
// ==============================================================================

import React, { useMemo, useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
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

const isLotbaEvent = (event: AttemptEvent): boolean =>
  event.source === 'lotba' || event.badgeLabel === 'LOTBA';

const AttemptRow: React.FC<{ event: AttemptEvent }> = ({ event }) => {
  const isLotba = isLotbaEvent(event);
  const displayTitle = isLotba ? 'Sitio no autorizado' : event.title;

  return (
    <View style={styles.attemptItem}>
      <View style={styles.attemptInfo}>
        <Text style={styles.attemptTitle}>{displayTitle}</Text>
        <Text style={styles.attemptMeta}>{event.meta}</Text>
      </View>
      <SourceBadge source={event.source} label={event.badgeLabel} />
    </View>
  );
};

export const AuditEventsCard: React.FC<AuditEventsCardProps> = ({
  auditTab,
  onChangeAuditTab,
  blockedAttempts,
  bypassEvents,
  bypassCount,
}) => {
  const [listTypeFilter, setListTypeFilter] = useState<'all' | 'lotba' | 'custom'>('all');
  const [sortOrder, setSortOrder] = useState<'date' | 'az'>('date');

  const rawEvents = auditTab === 'urls' ? blockedAttempts : bypassEvents;

  const events = useMemo(() => {
    let list = rawEvents.map((ev) => {
      if (isLotbaEvent(ev)) {
        return {
          ...ev,
          title: 'Sitio no autorizado',
        };
      }
      return ev;
    });

    if (auditTab === 'urls') {
      // 1. Filtrar por tipo de lista (LOTBA vs Personalizada)
      if (listTypeFilter === 'lotba') {
        list = list.filter(isLotbaEvent);
      } else if (listTypeFilter === 'custom') {
        list = list.filter((ev) => !isLotbaEvent(ev));
      }

      // 2. Ordenar por A-Z o Fecha (cronológico)
      if (sortOrder === 'az') {
        list = [...list].sort((a, b) =>
          a.title.localeCompare(b.title, 'es', { sensitivity: 'base' })
        );
      }
    }

    return list;
  }, [rawEvents, auditTab, listTypeFilter, sortOrder]);

  return (
    <View style={cardStyles.card}>
      <Text style={cardStyles.cardHeaderTitle}>Listado de bloqueos</Text>
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

      {/* Filtros de la pestaña Últimos bloqueos: Lista y Ordenar */}
      {auditTab === 'urls' && (
        <View style={styles.filtersWrap}>
          {/* Fila 1: Tipo de Lista (Todas, LOTBA, Personalizada) */}
          <View style={styles.filterRow}>
            <Text style={styles.filterLabel}>Lista:</Text>
            <View style={styles.chipGroup}>
              <TouchableOpacity
                style={[
                  styles.filterChip,
                  listTypeFilter === 'all' && styles.filterChipActive,
                ]}
                onPress={() => setListTypeFilter('all')}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    listTypeFilter === 'all' && styles.filterChipTextActive,
                  ]}
                >
                  Todas
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.filterChip,
                  listTypeFilter === 'lotba' && styles.filterChipActive,
                ]}
                onPress={() => setListTypeFilter('lotba')}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    listTypeFilter === 'lotba' && styles.filterChipTextActive,
                  ]}
                >
                  LOTBA
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.filterChip,
                  listTypeFilter === 'custom' && styles.filterChipActive,
                ]}
                onPress={() => setListTypeFilter('custom')}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    listTypeFilter === 'custom' && styles.filterChipTextActive,
                  ]}
                >
                  Personalizada
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Fila 2: Ordenar por Fecha o A-Z */}
          <View style={styles.filterRow}>
            <Text style={styles.filterLabel}>Ordenar:</Text>
            <View style={styles.chipGroup}>
              <TouchableOpacity
                style={[
                  styles.filterChip,
                  sortOrder === 'date' && styles.filterChipActive,
                ]}
                onPress={() => setSortOrder('date')}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    sortOrder === 'date' && styles.filterChipTextActive,
                  ]}
                >
                  Fecha
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.filterChip,
                  sortOrder === 'az' && styles.filterChipActive,
                ]}
                onPress={() => setSortOrder('az')}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    sortOrder === 'az' && styles.filterChipTextActive,
                  ]}
                >
                  A - Z
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      <View style={styles.list}>
        {events.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              No se registraron bloqueos para los filtros seleccionados
            </Text>
          </View>
        ) : (
          events.map((event) => <AttemptRow key={event.id} event={event} />)
        )}
      </View>
    </View>
  );
};
