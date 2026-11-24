// ==============================================================================
// Proyecto: BA Protege+
// Componente: AuditEventsCard (Sitios y apps bloqueados + Alertas de seguridad)
// Archivo: src/components/dashboard/actividad/blocks/AuditEventsCard.tsx
// Descripción: Pestañas "Últimos bloqueos" (con dropdowns inline de Lista y
//              Ordenar en la misma fila) y "Alertas de seguridad" (acciones de
//              dispositivos protegidos con conteo interactivo de no leídas).
// ==============================================================================

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiService } from '../../../../services/api.service';
import { AnchorRect, FloatingDropdownMenu } from '../atomic/FloatingDropdownMenu';
import { SegmentedTabs } from '../atomic/SegmentedTabs';
import { SourceBadge } from '../atomic/SourceBadge';
import { AttemptEvent, AuditTab } from '../types';
import { cardStyles } from '../card.styles';
import { styles } from './AuditEventsCard.styles';

const READ_ALERTS_STORAGE_KEY = '@ba_protege_read_security_alerts';

type ListTypeFilter = 'all' | 'lotba' | 'custom';
type SortOrder = 'date' | 'az';

const LIST_FILTER_OPTIONS: Array<{ value: ListTypeFilter; label: string; triggerLabel: string }> = [
  { value: 'all', label: 'Todas', triggerLabel: 'Lista: Todas' },
  { value: 'lotba', label: 'LOTBA', triggerLabel: 'Lista: LOTBA' },
  { value: 'custom', label: 'Personalizada', triggerLabel: 'Lista: Personalizada' },
];

const SORT_OPTIONS: Array<{ value: SortOrder; label: string; triggerLabel: string }> = [
  { value: 'date', label: 'Fecha', triggerLabel: 'Orden: Fecha' },
  { value: 'az', label: 'A - Z', triggerLabel: 'Orden: A - Z' },
];

export interface AuditEventsCardProps {
  auditTab: AuditTab;
  onChangeAuditTab: (tab: AuditTab) => void;
  blockedAttempts: AttemptEvent[];
  bypassEvents: AttemptEvent[];
  bypassCount?: number;
}

const isLotbaEvent = (event: AttemptEvent): boolean =>
  event.source === 'lotba' || event.badgeLabel === 'LOTBA';

const getLotbaDisplayTitle = (event: AttemptEvent): string =>
  event.itemType === 'app' ? 'App no autorizada' : 'Sitio no autorizado';

interface AttemptRowProps {
  event: AttemptEvent;
  isAlertTab?: boolean;
  isUnread?: boolean;
  onPressAlert?: (id: string) => void;
}

const AttemptRow: React.FC<AttemptRowProps> = ({
  event,
  isAlertTab = false,
  isUnread = false,
  onPressAlert,
}) => {
  const isLotba = isLotbaEvent(event);
  const displayTitle = isLotba ? getLotbaDisplayTitle(event) : event.title;
  const displayMeta = event.formattedDateTime
    ? event.meta.includes(event.formattedDateTime)
      ? event.meta
      : `${event.meta} · ${event.formattedDateTime}`
    : event.meta;

  const content = (
    <>
      <View style={styles.attemptInfo}>
        <View style={styles.attemptTitleRow}>
          {isAlertTab && isUnread ? <View style={styles.unreadDot} /> : null}
          <Text
            style={[
              styles.attemptTitle,
              isAlertTab && !isUnread && styles.attemptTitleRead,
            ]}
          >
            {displayTitle}
          </Text>
        </View>
        <Text style={styles.attemptMeta}>{displayMeta}</Text>
      </View>
      <SourceBadge source={event.source} label={event.badgeLabel} />
    </>
  );

  if (isAlertTab) {
    return (
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => onPressAlert?.(event.id)}
        style={[styles.attemptItem, isUnread && styles.attemptItemUnread]}
      >
        {content}
      </TouchableOpacity>
    );
  }

  return <View style={styles.attemptItem}>{content}</View>;
};

export const AuditEventsCard: React.FC<AuditEventsCardProps> = ({
  auditTab,
  onChangeAuditTab,
  blockedAttempts,
  bypassEvents,
}) => {
  const [listTypeFilter, setListTypeFilter] = useState<ListTypeFilter>('all');
  const [sortOrder, setSortOrder] = useState<SortOrder>('date');
  const [openDropdown, setOpenDropdown] = useState<'list' | 'sort' | null>(null);
  const [listAnchor, setListAnchor] = useState<AnchorRect | null>(null);
  const [sortAnchor, setSortAnchor] = useState<AnchorRect | null>(null);
  const listTriggerRef = useRef<View>(null);
  const sortTriggerRef = useRef<View>(null);
  const [readAlertIds, setReadAlertIds] = useState<string[]>([]);

  const toggleFilterDropdown = (target: 'list' | 'sort') => {
    if (openDropdown === target) {
      setOpenDropdown(null);
      return;
    }
    const targetRef = target === 'list' ? listTriggerRef : sortTriggerRef;
    const setTargetAnchor = target === 'list' ? setListAnchor : setSortAnchor;
    if (
      targetRef.current &&
      typeof targetRef.current.measureInWindow === 'function'
    ) {
      targetRef.current.measureInWindow((x, y, width, height) => {
        if (width > 0 && height > 0) {
          setTargetAnchor({ x, y, width, height });
        }
        setOpenDropdown(target);
      });
    } else {
      setOpenDropdown(target);
    }
  };

  useEffect(() => {
    let mounted = true;
    AsyncStorage.getItem(READ_ALERTS_STORAGE_KEY)
      .then((raw) => {
        if (!mounted || !raw) return;
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          setReadAlertIds(parsed.filter((id): id is string => typeof id === 'string'));
        }
      })
      .catch(() => {
        // Fallback silencioso si AsyncStorage no está disponible
      });
    return () => {
      mounted = false;
    };
  }, []);

  const readAlertSet = useMemo(() => new Set(readAlertIds), [readAlertIds]);

  const isAlertAlreadyRead = (ev: AttemptEvent): boolean =>
    Boolean(ev.readAt) || readAlertSet.has(ev.id);

  const markAlertAsRead = (alertId: string) => {
    const target = bypassEvents.find((ev) => ev.id === alertId);
    if ((target && target.readAt) || readAlertSet.has(alertId)) return;

    setReadAlertIds((prev) => {
      if (prev.includes(alertId)) return prev;
      const updated = [alertId, ...prev].slice(0, 200);
      AsyncStorage.setItem(READ_ALERTS_STORAGE_KEY, JSON.stringify(updated)).catch(
        () => {}
      );
      return updated;
    });

    if (!alertId.startsWith('sec-live-')) {
      apiService.markSecurityEventAsRead(alertId).catch(() => {});
    }
  };

  const unreadAlertCount = useMemo(
    () => bypassEvents.filter((ev) => !isAlertAlreadyRead(ev)).length,
    [bypassEvents, readAlertSet]
  );

  const rawEvents = auditTab === 'urls' ? blockedAttempts : bypassEvents;

  const events = useMemo(() => {
    let list = rawEvents.map((ev) => {
      if (isLotbaEvent(ev)) {
        return {
          ...ev,
          title: getLotbaDisplayTitle(ev),
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

  const selectedListOption =
    LIST_FILTER_OPTIONS.find((opt) => opt.value === listTypeFilter) ??
    LIST_FILTER_OPTIONS[0];
  const selectedSortOption =
    SORT_OPTIONS.find((opt) => opt.value === sortOrder) ?? SORT_OPTIONS[0];

  return (
    <View style={cardStyles.card}>
      <Text style={cardStyles.cardHeaderTitle}>Sitios y apps bloqueados</Text>
      <View style={styles.tabsWrap}>
        <SegmentedTabs
          tabs={[
            { key: 'urls', label: 'Últimos bloqueos' },
            {
              key: 'bypass',
              label: 'Alertas de seguridad',
              badgeCount: unreadAlertCount,
            },
          ]}
          activeKey={auditTab}
          onChange={(key) => {
            setOpenDropdown(null);
            onChangeAuditTab(key as AuditTab);
          }}
        />
      </View>

      {/* Filtros flotantes (dropdown estilo app) en una misma fila: Lista y Ordenar */}
      {auditTab === 'urls' && (
        <View style={styles.filtersRow}>
          {/* Dropdown Lista */}
          <View style={styles.dropdownColList}>
            <View ref={listTriggerRef} collapsable={false}>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => toggleFilterDropdown('list')}
                accessibilityRole="button"
                accessibilityLabel="Filtrar por lista"
                accessibilityState={{ expanded: openDropdown === 'list' }}
                style={[
                  styles.trigger,
                  openDropdown === 'list' && styles.triggerOpen,
                ]}
              >
                <Text
                  style={styles.triggerText}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {selectedListOption.triggerLabel}
                </Text>
                <Text style={styles.chevron}>
                  {openDropdown === 'list' ? '▲' : '▼'}
                </Text>
              </TouchableOpacity>
            </View>

            <FloatingDropdownMenu
              visible={openDropdown === 'list'}
              anchor={listAnchor}
              onClose={() => setOpenDropdown(null)}
              maxHeight={200}
              estimatedHeight={LIST_FILTER_OPTIONS.length * 42 + 4}
              menuStyle={styles.dropdownMenu}
            >
              {LIST_FILTER_OPTIONS.map((opt, idx) => {
                const active = opt.value === listTypeFilter;
                const isLast = idx === LIST_FILTER_OPTIONS.length - 1;
                return (
                  <TouchableOpacity
                    key={opt.value}
                    activeOpacity={0.7}
                    onPress={() => {
                      setListTypeFilter(opt.value);
                      setOpenDropdown(null);
                    }}
                    accessibilityRole="menuitem"
                    style={[
                      styles.menuItem,
                      active && styles.menuItemActive,
                      isLast && styles.menuItemLast,
                    ]}
                  >
                    <Text
                      style={[
                        styles.menuItemText,
                        active && styles.menuItemTextActive,
                      ]}
                      numberOfLines={1}
                    >
                      {opt.label}
                    </Text>
                    {active ? <Text style={styles.checkmark}>✓</Text> : null}
                  </TouchableOpacity>
                );
              })}
            </FloatingDropdownMenu>
          </View>

          {/* Dropdown Ordenar */}
          <View style={styles.dropdownColSort}>
            <View ref={sortTriggerRef} collapsable={false}>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => toggleFilterDropdown('sort')}
                accessibilityRole="button"
                accessibilityLabel="Ordenar bloqueos"
                accessibilityState={{ expanded: openDropdown === 'sort' }}
                style={[
                  styles.trigger,
                  openDropdown === 'sort' && styles.triggerOpen,
                ]}
              >
                <Text
                  style={styles.triggerText}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {selectedSortOption.triggerLabel}
                </Text>
                <Text style={styles.chevron}>
                  {openDropdown === 'sort' ? '▲' : '▼'}
                </Text>
              </TouchableOpacity>
            </View>

            <FloatingDropdownMenu
              visible={openDropdown === 'sort'}
              anchor={sortAnchor}
              onClose={() => setOpenDropdown(null)}
              maxHeight={160}
              estimatedHeight={SORT_OPTIONS.length * 42 + 4}
              menuStyle={styles.dropdownMenu}
            >
              {SORT_OPTIONS.map((opt, idx) => {
                const active = opt.value === sortOrder;
                const isLast = idx === SORT_OPTIONS.length - 1;
                return (
                  <TouchableOpacity
                    key={opt.value}
                    activeOpacity={0.7}
                    onPress={() => {
                      setSortOrder(opt.value);
                      setOpenDropdown(null);
                    }}
                    accessibilityRole="menuitem"
                    style={[
                      styles.menuItem,
                      active && styles.menuItemActive,
                      isLast && styles.menuItemLast,
                    ]}
                  >
                    <Text
                      style={[
                        styles.menuItemText,
                        active && styles.menuItemTextActive,
                      ]}
                      numberOfLines={1}
                    >
                      {opt.label}
                    </Text>
                    {active ? <Text style={styles.checkmark}>✓</Text> : null}
                  </TouchableOpacity>
                );
              })}
            </FloatingDropdownMenu>
          </View>
        </View>
      )}

      <View style={styles.list}>
        {events.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {auditTab === 'urls'
                ? 'No se registraron bloqueos para los filtros seleccionados'
                : 'No se registraron alertas de seguridad'}
            </Text>
          </View>
        ) : (
          events.map((event) => (
            <AttemptRow
              key={event.id}
              event={event}
              isAlertTab={auditTab === 'bypass'}
              isUnread={auditTab === 'bypass' && !isAlertAlreadyRead(event)}
              onPressAlert={markAlertAsRead}
            />
          ))
        )}
      </View>
    </View>
  );
};
