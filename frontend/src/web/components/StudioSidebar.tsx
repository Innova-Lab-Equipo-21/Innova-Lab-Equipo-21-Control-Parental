// ==============================================================================
// Proyecto: BA Protege+
// Componente: Web Simulator - StudioSidebar
// Archivo: src/web/components/StudioSidebar.tsx
// Descripción: Panel lateral interactivo con indicador de API, botones de flujo de 5 pasos,
//              resumen de parámetros y consola de registros HTTP en tiempo real.
// ==============================================================================

import React from 'react';

export interface LogEntry {
  id: string;
  time: string;
  method: 'GET' | 'POST' | 'BLOCK' | 'INFO';
  message: string;
}

export type SimulatorAppMode = 'ONBOARDING' | 'WELCOME' | 'LOGIN' | 'PAIRING' | 'PERMISSIONS' | 'PARENT' | 'CHILD';

interface StudioSidebarProps {
  apiConnected: boolean;
  apiBase: string;
  appMode: SimulatorAppMode;
  targetFlow: 'PARENT' | 'CHILD' | 'ADULT';
  grantedPermsCount: number;
  devicesCount: number;
  maxDevices: number;
  selfControlActive: boolean;
  logs: LogEntry[];
  onSelectMode: (mode: SimulatorAppMode, flow?: 'PARENT' | 'CHILD' | 'ADULT') => void;
  onClearLogs: () => void;
}

export const StudioSidebar: React.FC<StudioSidebarProps> = ({
  apiConnected,
  apiBase,
  appMode,
  targetFlow,
  grantedPermsCount,
  devicesCount,
  maxDevices,
  selfControlActive,
  logs,
  onSelectMode,
  onClearLogs,
}) => {
  return (
    <aside className="studio-sidebar">
      <div className="studio-header">
        <div className="studio-badge">
          <span className="pulse-dot"></span>
          {apiConnected ? 'API BACKEND CONECTADA' : 'MODO STANDALONE'}
        </div>
        <div className="studio-title">
          <span>🛡️</span> BA Protege+ Studio
        </div>
        <div className="studio-subtitle">
          Flujo de 5 pasos: Onboarding ➔ Modo ➔ Auth/Pairing ➔ Permisos ➔ Dashboard
        </div>
      </div>

      <div className="section-box">
        <div className="section-title">Flujo Ordenado de 5 Pasos</div>
        <div className="scenario-btn-group">
          <button
            className={`scenario-btn ${appMode === 'ONBOARDING' ? 'active' : ''}`}
            onClick={() => onSelectMode('ONBOARDING')}
          >
            <span>1. 🌟 Onboarding para todos</span>
            <span>→</span>
          </button>
          <button
            className={`scenario-btn ${appMode === 'WELCOME' ? 'active' : ''}`}
            onClick={() => onSelectMode('WELCOME')}
          >
            <span>2. 🚪 Selección de Modo</span>
            <span>→</span>
          </button>
          <button
            className={`scenario-btn ${appMode === 'LOGIN' ? 'active' : ''}`}
            onClick={() => onSelectMode('LOGIN', 'PARENT')}
          >
            <span>3A. 🔐 Login / Registro / Recover</span>
            <span>→</span>
          </button>
          <button
            className={`scenario-btn ${appMode === 'PAIRING' ? 'active' : ''}`}
            onClick={() => onSelectMode('PAIRING', 'CHILD')}
          >
            <span>3B. 🔗 Emparejamiento (Protegido)</span>
            <span>→</span>
          </button>
          <button
            className={`scenario-btn ${appMode === 'PERMISSIONS' ? 'active' : ''}`}
            onClick={() => onSelectMode('PERMISSIONS')}
          >
            <span>4. 🛡️ Permisos ({grantedPermsCount}/4)</span>
            <span>→</span>
          </button>
          <button
            className={`scenario-btn ${appMode === 'PARENT' ? 'active' : ''}`}
            onClick={() => onSelectMode('PARENT')}
          >
            <span>5A. 👨‍👩‍👧‍👦 Dashboard Responsable</span>
            <span>→</span>
          </button>
          <button
            className={`scenario-btn ${appMode === 'CHILD' ? 'active' : ''}`}
            onClick={() => onSelectMode('CHILD')}
          >
            <span>5B. 📱 Dispositivo Protegido</span>
            <span>→</span>
          </button>
        </div>
      </div>

      <div className="section-box">
        <div className="section-title">Parámetros del Sistema</div>
        <div style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.6' }}>
          <div>• <strong>Flujo Destino:</strong> {targetFlow === 'PARENT' ? '👨‍👩‍👧‍👦 Responsable' : '📱 Protegido'}</div>
          <div>• <strong>API Host:</strong> <code>{apiBase}</code></div>
          <div>• <strong>Permisos Concedidos:</strong> {grantedPermsCount} / 4</div>
          <div>• <strong>Límite Dispositivos:</strong> {devicesCount} / {maxDevices}</div>
        </div>
      </div>

      {/* Consola de Registros HTTP / Telemetría */}
      <div className="network-log-container">
        <div className="section-title" style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>Telemetría y Registro HTTP</span>
          <button
            style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: '11px' }}
            onClick={onClearLogs}
          >
            Limpiar
          </button>
        </div>
        <div className="network-log-box">
          {logs.length === 0 ? (
            <div style={{ color: '#4b5563', textAlign: 'center', marginTop: '40px' }}>
              Sin eventos de red registrados aún.
            </div>
          ) : (
            logs.map((log) => (
              <div key={log.id} className={`log-entry ${log.method}`}>
                <span style={{ color: '#6b7280' }}>[{log.time}]</span> <strong>{log.method}</strong>: {log.message}
              </div>
            ))
          )}
        </div>
      </div>
    </aside>
  );
};
