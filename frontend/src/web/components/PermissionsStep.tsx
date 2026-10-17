// ==============================================================================
// Proyecto: BA Protege+
// Componente: Web Simulator - PermissionsStep (Paso 4)
// Archivo: src/web/components/PermissionsStep.tsx
// Descripción: Paso 4 del flujo para la solicitud y prueba interactiva de los 5 permisos de Android
//              alineado al nuevo modelo de diseño institucional con acordeón.
// ==============================================================================

import React, { useState } from 'react';

export interface WebPermissionsState {
  vpn: boolean;
  accessibility: boolean;
  notifications: boolean;
  batteryOptimization: boolean;
  location: boolean;
}

interface PermissionsStepProps {
  targetFlow: 'PARENT' | 'CHILD';
  webPermissions: WebPermissionsState;
  grantedPermsCount: number;
  onTogglePerm: (key: keyof WebPermissionsState) => void;
  onContinue: () => void;
  onBack?: () => void;
}

export const PermissionsStep: React.FC<PermissionsStepProps> = ({
  targetFlow,
  webPermissions,
  grantedPermsCount,
  onTogglePerm,
  onContinue,
  onBack,
}) => {
  const [expandedItems, setExpandedItems] = useState<{ [key: string]: boolean }>({
    batteryOptimization: true,
  });

  const toggleExpand = (key: string) => {
    setExpandedItems((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div style={{ backgroundColor: '#FFF', minHeight: '100%' }}>
      {/* 1. Header Superior Institucional con logo_baprotege_texto.png sobre fondo #EAF3FF */}
      <div
        style={{
          backgroundColor: '#EAF3FF',
          padding: '10px 16px',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <img
          src="/src/assets/logo/logo_baprotege_texto.png"
          alt="BA Protege +"
          style={{ width: '75px', height: '36px', objectFit: 'contain' }}
        />
      </div>

      {/* 2. Subheader con botón volver y título 'Permisos del Dispositivo' */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '14px 16px',
          borderBottom: '1px solid #F3F4F6',
          backgroundColor: '#FFF',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {onBack && (
            <button
              onClick={onBack}
              style={{
                background: 'none',
                border: 'none',
                padding: '4px',
                cursor: 'pointer',
                marginRight: '10px',
                display: 'flex',
                alignItems: 'center',
              }}
              title="Volver al inicio de sesión"
            >
              <img
                src="/src/assets/icons/volver.png"
                alt="Volver"
                style={{ width: '22px', height: '22px', objectFit: 'contain' }}
              />
            </button>
          )}
          <span style={{ fontSize: '22px', fontWeight: '800', color: '#000000', lineHeight: '28px', letterSpacing: '-0.3px' }}>
            Permisos de Aplicación
          </span>
        </div>
      </div>

      <div style={{ padding: '16px' }}>
        {/* Banner / Tarjeta de información azul (Estilo CARD 1 de WelcomeScreen) */}
        <div
          style={{
            border: '2px solid #007AFF',
            borderRadius: '18px',
            backgroundColor: '#F0F7FF',
            padding: '18px',
            marginBottom: '16px',
            boxShadow: '0 2px 4px rgba(0,122,255,0.1)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
            <img
              src="/src/assets/icons/escudo.png"
              alt="Escudo"
              style={{ width: '24px', height: '24px', marginRight: '10px', objectFit: 'contain' }}
            />
            <div style={{ fontSize: '18px', fontWeight: '700', color: '#007AFF' }}>
              Configurá tu dispositivo
            </div>
          </div>
          <div style={{ fontSize: '13.5px', lineHeight: '19px', color: '#1C1C1E', fontWeight: '400' }}>
            Toca cada permiso para desplegar su explicaión y autorizarlo. Serequieren los 5 permisos para garantizar protección continua y ubicación segura.
          </div>
        </div>

        {/* Permiso 1: Filtrado VPN */}
        <div
          style={{
            backgroundColor: '#FFF',
            borderRadius: '14px',
            padding: '16px',
            marginBottom: '12px',
            border: '1px solid #E5E7EB',
            boxShadow: '0 2px 5px rgba(0,0,0,0.06)',
          }}
        >
          <div
            onClick={() => toggleExpand('vpn')}
            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
          >
            <div style={{ flex: 1, marginRight: '12px' }}>
              <div style={{ fontSize: '14.5px', fontWeight: '700', color: '#111827', marginBottom: '4px' }}>
                Servicio de filtrado VPN
              </div>
              <div style={{ fontSize: '11px', color: '#8E8E93', lineHeight: '15px' }}>
                Para continuar ingresa el codigo numerico que  aparece en el dispositivo a vincular
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span
                style={{
                  padding: '6px 14px',
                  borderRadius: '16px',
                  fontSize: '12.5px',
                  fontWeight: '700',
                  backgroundColor: webPermissions.vpn ? '#D7F5DD' : '#F0F0F2',
                  color: webPermissions.vpn ? '#16A34A' : '#8E8E93',
                }}
              >
                {webPermissions.vpn ? 'Activo' : 'Inactivo'}
              </span>
              <span style={{ fontSize: '16px', color: '#007AFF', fontWeight: '700', marginLeft: '8px', width: '16px', textAlign: 'center' }}>
                {expandedItems.vpn ? '∧' : '∨'}
              </span>
            </div>
          </div>

          {expandedItems.vpn && (
            <div style={{ marginTop: '12px' }}>
              <div style={{ height: '1px', backgroundColor: '#E5E7EB', marginBottom: '12px' }} />
              <div style={{ fontSize: '11px', color: '#8E8E93', lineHeight: '15px', marginBottom: '8px' }}>
                Para continuar ingresa el codigo numerico que  aparece en el dispositivo a vincular
              </div>
              <div style={{ fontSize: '12px', color: '#4B5563', lineHeight: '17px', marginBottom: '12px' }}>
                Crea un túnel local en el dispositivo para interceptar y bloquear solicitudes a casas de apuestas clandestinas de la lista oficial LOTBA.
              </div>
              <button
                onClick={() => onTogglePerm('vpn')}
                style={{
                  width: '100%',
                  height: '44px',
                  borderRadius: '10px',
                  backgroundColor: webPermissions.vpn ? '#D7F5DD' : '#007AFF',
                  color: webPermissions.vpn ? '#16A34A' : '#FFF',
                  border: 'none',
                  fontWeight: '700',
                  fontSize: '13px',
                  cursor: 'pointer',
                }}
              >
                {webPermissions.vpn ? '✓ Autorizado' : 'Autorizar Filtrado VPN'}
              </button>
            </div>
          )}
        </div>

        {/* Permiso 2: Accesibilidad */}
        <div
          style={{
            backgroundColor: '#FFF',
            borderRadius: '14px',
            padding: '16px',
            marginBottom: '12px',
            border: '1px solid #E5E7EB',
            boxShadow: '0 2px 5px rgba(0,0,0,0.06)',
          }}
        >
          <div
            onClick={() => toggleExpand('accessibility')}
            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
          >
            <div style={{ flex: 1, marginRight: '12px' }}>
              <div style={{ fontSize: '14.5px', fontWeight: '700', color: '#111827', marginBottom: '4px' }}>
                Servicio de accesibilidad
              </div>
              <div style={{ fontSize: '11px', color: '#8E8E93', lineHeight: '15px' }}>
                Para continuar ingresa el codigo numerico que  aparece en el dispositivo a vincular
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span
                style={{
                  padding: '6px 14px',
                  borderRadius: '16px',
                  fontSize: '12.5px',
                  fontWeight: '700',
                  backgroundColor: webPermissions.accessibility ? '#D7F5DD' : '#F0F0F2',
                  color: webPermissions.accessibility ? '#16A34A' : '#8E8E93',
                }}
              >
                {webPermissions.accessibility ? 'Activo' : 'Inactivo'}
              </span>
              <span style={{ fontSize: '16px', color: '#007AFF', fontWeight: '700', marginLeft: '8px', width: '16px', textAlign: 'center' }}>
                {expandedItems.accessibility ? '∧' : '∨'}
              </span>
            </div>
          </div>

          {expandedItems.accessibility && (
            <div style={{ marginTop: '12px' }}>
              <div style={{ height: '1px', backgroundColor: '#E5E7EB', marginBottom: '12px' }} />
              <div style={{ fontSize: '11px', color: '#8E8E93', lineHeight: '15px', marginBottom: '8px' }}>
                Para continuar ingresa el codigo numerico que  aparece en el dispositivo a vincular
              </div>
              <div style={{ fontSize: '12px', color: '#4B5563', lineHeight: '17px', marginBottom: '12px' }}>
                Protección Antidesinstalación: Impide que el menor o un tercero cierre forzadamente la app o la elimine sin autorizar el PIN del tutor.
              </div>
              <button
                onClick={() => onTogglePerm('accessibility')}
                style={{
                  width: '100%',
                  height: '44px',
                  borderRadius: '10px',
                  backgroundColor: webPermissions.accessibility ? '#D7F5DD' : '#007AFF',
                  color: webPermissions.accessibility ? '#16A34A' : '#FFF',
                  border: 'none',
                  fontWeight: '700',
                  fontSize: '13px',
                  cursor: 'pointer',
                }}
              >
                {webPermissions.accessibility ? '✓ Activado' : 'Activar Servicio de Accesibilidad'}
              </button>
            </div>
          )}
        </div>

        {/* Permiso 3: Notificaciones */}
        <div
          style={{
            backgroundColor: '#FFF',
            borderRadius: '14px',
            padding: '16px',
            marginBottom: '12px',
            border: '1px solid #E5E7EB',
            boxShadow: '0 2px 5px rgba(0,0,0,0.06)',
          }}
        >
          <div
            onClick={() => toggleExpand('notifications')}
            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
          >
            <div style={{ flex: 1, marginRight: '12px' }}>
              <div style={{ fontSize: '14.5px', fontWeight: '700', color: '#111827', marginBottom: '4px' }}>
                Notificaciones del sistema
              </div>
              <div style={{ fontSize: '11px', color: '#8E8E93', lineHeight: '15px' }}>
                Para continuar ingresa el codigo numerico que  aparece en el dispositivo a vincular
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span
                style={{
                  padding: '6px 14px',
                  borderRadius: '16px',
                  fontSize: '12.5px',
                  fontWeight: '700',
                  backgroundColor: webPermissions.notifications ? '#D7F5DD' : '#F0F0F2',
                  color: webPermissions.notifications ? '#16A34A' : '#8E8E93',
                }}
              >
                {webPermissions.notifications ? 'Activo' : 'Inactivo'}
              </span>
              <span style={{ fontSize: '16px', color: '#007AFF', fontWeight: '700', marginLeft: '8px', width: '16px', textAlign: 'center' }}>
                {expandedItems.notifications ? '∧' : '∨'}
              </span>
            </div>
          </div>

          {expandedItems.notifications && (
            <div style={{ marginTop: '12px' }}>
              <div style={{ height: '1px', backgroundColor: '#E5E7EB', marginBottom: '12px' }} />
              <div style={{ fontSize: '11px', color: '#8E8E93', lineHeight: '15px', marginBottom: '8px' }}>
                Para continuar ingresa el codigo numerico que  aparece en el dispositivo a vincular
              </div>
              <div style={{ fontSize: '12px', color: '#4B5563', lineHeight: '17px', marginBottom: '12px' }}>
                Mantiene la notificación de servicio persistente de seguridad en la barra de estado y envía alertas de intento de bloqueo.
              </div>
              <button
                onClick={() => onTogglePerm('notifications')}
                style={{
                  width: '100%',
                  height: '44px',
                  borderRadius: '10px',
                  backgroundColor: webPermissions.notifications ? '#D7F5DD' : '#007AFF',
                  color: webPermissions.notifications ? '#16A34A' : '#FFF',
                  border: 'none',
                  fontWeight: '700',
                  fontSize: '13px',
                  cursor: 'pointer',
                }}
              >
                {webPermissions.notifications ? '✓ Permitidas' : 'Permitir Notificaciones'}
              </button>
            </div>
          )}
        </div>

        {/* Permiso 4: Optimización de bateria (Inicia expandido como en el modelo) */}
        <div
          style={{
            backgroundColor: '#FFF',
            borderRadius: '14px',
            padding: '16px',
            marginBottom: '12px',
            border: '1px solid #E5E7EB',
            boxShadow: '0 2px 5px rgba(0,0,0,0.06)',
          }}
        >
          <div
            onClick={() => toggleExpand('batteryOptimization')}
            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
          >
            <div style={{ flex: 1, marginRight: '12px' }}>
              <div style={{ fontSize: '14.5px', fontWeight: '700', color: '#111827', marginBottom: '4px' }}>
                Optimización de bateria
              </div>
              <div style={{ fontSize: '11px', color: '#8E8E93', lineHeight: '15px' }}>
                Para continuar ingresa el codigo numerico que  aparece en el dispositivo a vincular
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span
                style={{
                  padding: '6px 14px',
                  borderRadius: '16px',
                  fontSize: '12.5px',
                  fontWeight: '700',
                  backgroundColor: webPermissions.batteryOptimization ? '#D7F5DD' : '#F0F0F2',
                  color: webPermissions.batteryOptimization ? '#16A34A' : '#8E8E93',
                }}
              >
                {webPermissions.batteryOptimization ? 'Activo' : 'Inactivo'}
              </span>
              <span style={{ fontSize: '16px', color: '#007AFF', fontWeight: '700', marginLeft: '8px', width: '16px', textAlign: 'center' }}>
                {expandedItems.batteryOptimization ? '∧' : '∨'}
              </span>
            </div>
          </div>

          {expandedItems.batteryOptimization && (
            <div style={{ marginTop: '12px' }}>
              <div style={{ height: '1px', backgroundColor: '#E5E7EB', marginBottom: '12px' }} />
              <div style={{ fontSize: '11px', color: '#8E8E93', lineHeight: '15px', marginBottom: '8px' }}>
                Para continuar ingresa el codigo numerico que  aparece en el dispositivo a vincular
              </div>
              <div style={{ fontSize: '12px', color: '#4B5563', lineHeight: '17px', marginBottom: '12px' }}>
                Evita que el ahorro de energía de Android suspenda o detenga el motor de filtrado cuando el celular esté con pantalla apagada.
              </div>
              <button
                onClick={() => onTogglePerm('batteryOptimization')}
                style={{
                  width: '100%',
                  height: '44px',
                  borderRadius: '10px',
                  backgroundColor: webPermissions.batteryOptimization ? '#D7F5DD' : '#007AFF',
                  color: webPermissions.batteryOptimization ? '#16A34A' : '#FFF',
                  border: 'none',
                  fontWeight: '700',
                  fontSize: '13px',
                  cursor: 'pointer',
                }}
              >
                {webPermissions.batteryOptimization ? '✓ Concedida' : 'Conceder Exención de Batería'}
              </button>
            </div>
          )}
        </div>

        {/* Permiso 5: Ubicación y Geolocalización */}
        <div
          style={{
            backgroundColor: '#FFF',
            borderRadius: '14px',
            padding: '16px',
            marginBottom: '16px',
            border: '1px solid #E5E7EB',
            boxShadow: '0 2px 5px rgba(0,0,0,0.06)',
          }}
        >
          <div
            onClick={() => toggleExpand('location')}
            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
          >
            <div style={{ flex: 1, marginRight: '12px' }}>
              <div style={{ fontSize: '14.5px', fontWeight: '700', color: '#111827', marginBottom: '4px' }}>
                Ubicación y Geolocalización
              </div>
              <div style={{ fontSize: '11px', color: '#8E8E93', lineHeight: '15px' }}>
                Para continuar ingresa el codigo numerico que  aparece en el dispositivo a vincular
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span
                style={{
                  padding: '6px 14px',
                  borderRadius: '16px',
                  fontSize: '12.5px',
                  fontWeight: '700',
                  backgroundColor: webPermissions.location ? '#D7F5DD' : '#F0F0F2',
                  color: webPermissions.location ? '#16A34A' : '#8E8E93',
                }}
              >
                {webPermissions.location ? 'Activo' : 'Inactivo'}
              </span>
              <span style={{ fontSize: '16px', color: '#007AFF', fontWeight: '700', marginLeft: '8px', width: '16px', textAlign: 'center' }}>
                {expandedItems.location ? '∧' : '∨'}
              </span>
            </div>
          </div>

          {expandedItems.location && (
            <div style={{ marginTop: '12px' }}>
              <div style={{ height: '1px', backgroundColor: '#E5E7EB', marginBottom: '12px' }} />
              <div style={{ fontSize: '11px', color: '#8E8E93', lineHeight: '15px', marginBottom: '8px' }}>
                Para continuar ingresa el codigo numerico que  aparece en el dispositivo a vincular
              </div>
              <div style={{ fontSize: '12px', color: '#4B5563', lineHeight: '17px', marginBottom: '12px' }}>
                Utiliza el sensor GPS del dispositivo para registrar la dirección exacta para el responsable. Si el permiso no es otorgado o no hay señal GPS, el sistema obtiene la ubicación aproximada basada en la red IP.
              </div>
              <button
                onClick={() => onTogglePerm('location')}
                style={{
                  width: '100%',
                  height: '44px',
                  borderRadius: '10px',
                  backgroundColor: webPermissions.location ? '#D7F5DD' : '#007AFF',
                  color: webPermissions.location ? '#16A34A' : '#FFF',
                  border: 'none',
                  fontWeight: '700',
                  fontSize: '13px',
                  cursor: 'pointer',
                }}
              >
                {webPermissions.location ? '✓ Ubicación Registrada' : 'Autorizar Permiso de Ubicación (GPS)'}
              </button>
            </div>
          )}
        </div>

        {/* Botón de Continuar */}
        <button
          style={{
            width: '100%',
            height: '50px',
            borderRadius: '12px',
            backgroundColor: '#007AFF',
            color: '#FFF',
            border: 'none',
            fontWeight: '700',
            fontSize: '15px',
            cursor: 'pointer',
            boxShadow: '0 4px 6px rgba(0,122,255,0.25)',
          }}
          onClick={onContinue}
        >
          Continuar a la Aplicación ➔
        </button>
      </div>
    </div>
  );
};
