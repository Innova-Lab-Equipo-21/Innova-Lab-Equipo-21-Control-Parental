# Panel de Analítica — React Native (Componentes Reutilizables)

Conversión del prototipo HTML [`panel_de_anal_tica_mvp.html`](../panel_de_anal_tica_mvp.html)
("Propuesta Superadora MVP") a **React Native + TypeScript** siguiendo las
convenciones del frontend de BA Protege+ (separación `.styles.ts`, componentes
`React.FC` con props tipadas, barrels de exports).

## Estructura

```
react-native/
└── components/
    └── analytics/
        ├── AnalyticsPanel.tsx        # Orquestador del panel completo
        ├── AnalyticsPanel.styles.ts
        ├── card.styles.ts            # Estilo de tarjeta base compartido
        ├── palette.ts                # Tokens de color (Alto Contraste Cognitivo)
        ├── types.ts                  # Tipos del dominio
        ├── data.ts                   # Datos de demostración (fieles al HTML)
        ├── index.ts                  # Barrel de exports
        │
        ├── blocks/                   # Bloques compuestos (dominio)
        │   ├── BrandHeader.tsx       # Cabecera de marca + sync de listas LOTBA
        │   ├── PanelHeader.tsx       # Título + selector de período
        │   ├── PeriodSelector.tsx    # Dropdown liviano (modal)
        │   ├── DeviceChipsRow.tsx    # Chips de dispositivos
        │   ├── HeartbeatBanner.tsx   # Alerta de salud operativa (#21)
        │   ├── TotalBlocksCard.tsx   # Bloqueos totales + uptime + desglose (#7, #5, #22)
        │   ├── BlocksBySourceCard.tsx# Bloqueos por fuente (#18)
        │   ├── ActivityChartCard.tsx # Gráfico Por día / Franja horaria
        │   └── AuditEventsCard.tsx   # Tabs: Últimos bloqueos / Anti-bypass (#10, #20)
        │
        ├── atomic/                   # Componentes atómicos reutilizables
        │   ├── PillChip.tsx
        │   ├── SegmentedTabs.tsx
        │   ├── SourceBadge.tsx
        │   └── StackedBarChart.tsx
        │
        └── hooks/
            └── useAnalyticsPanel.ts  # Estado + derivación de métricas
```

## Cómo usarlo

```tsx
import { AnalyticsPanel } from './components/analytics';

export function PantallaActividad() {
  return <AnalyticsPanel onBack={() => navigation.goBack()} />;
}
```

Sin props, el panel monta con los datos de demostración. Para conectar el
backend, pasá los datos reales:

```tsx
<AnalyticsPanel
  devices={devicesDelBackend}
  weekData={weekDataDelBackend}
  hourlyData={hourlyDataDelBackend}
  blockedAttempts={bloqueos}
  bypassEvents={eventosAntiBypass}
  blocklistVersion={version}
  allUptime={uptimeEquipo}
  onBack={goBack}
/>
```

## Mapeo de las 5 correcciones del prototipo

| # | Corrección | Componente |
|---|-----------|-----------|
| 1 | Contraste Azul `#0284C7` vs Ámbar `#F59E0B` | `palette.ts`, `BlocksBySourceCard`, `StackedBarChart` |
| 2 | Chips directos por dispositivo (sin "Familia Gómez") + heartbeat | `DeviceChipsRow`, `HeartbeatBanner` |
| 3 | Fuera el `% vs semana previa`; entra uptime (#5) y desglose (#22) | `TotalBlocksCard` |
| 4 | Filtro Por día / Franja horaria estilo Google Maps | `ActivityChartCard`, `StackedBarChart` |
| 5 | Tabs con Eventos Anti-bypass en lugar de "Ver todo" | `AuditEventsCard`, `SegmentedTabs` |

## Integración con el frontend existente


Los componentes son autocontenidos (usan su propia `palette.ts` y no dependen de
los servicios ni del tema global), por lo que se pueden montar tal cual.

Validación: `npx tsc --noEmit` desde `repositorio/frontend` una vez copiada la
carpeta a `src/`.
