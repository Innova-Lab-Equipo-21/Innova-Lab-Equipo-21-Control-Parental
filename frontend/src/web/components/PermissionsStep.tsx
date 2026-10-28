// ==============================================================================
// Proyecto: BA Protege+
// Componente: Web Simulator - PermissionsStep (Paso 4)
// Archivo: src/web/components/PermissionsStep.tsx
// Descripción: Paso compacto y moderno para la solicitud y prueba de los 6 permisos de Android
//              con selector toggle interactivo, paso a paso pedagógico, visible sin scroll,
//              común para Responsable y Protegido, y CTAs Volver y Continuar en la misma línea.
// ==============================================================================

import React, { useState } from 'react';

export interface WebPermissionsState {
  vpn: boolean;
  accessibility: boolean;
  notifications: boolean;
  batteryOptimization: boolean;
  location: boolean;
  usageStats?: boolean;
}

interface PermissionsStepProps {
  targetFlow: 'PARENT' | 'CHILD' | 'ADULT';
  webPermissions: WebPermissionsState;
  grantedPermsCount: number;
  onTogglePerm: (key: keyof WebPermissionsState) => void;
  onContinue: () => void;
  onBack?: () => void;
}

interface WebPermissionConfig {
  key: keyof WebPermissionsState;
  title: string;
  subtitle: string;
  detailedText: string;
  steps: string[];
  actionLabel: string;
}

export const PermissionsStep: React.FC<PermissionsStepProps> = ({
  targetFlow,
  webPermissions,
  grantedPermsCount,
  onTogglePerm,
  onContinue,
  onBack,
}) => {
  // Solo un card puede estar abierto a la vez (los demás se cierran automáticamente)
  const [expandedKey, setExpandedKey] = useState<string | null>(null);

  const toggleExpand = (key: string) => {
    setExpandedKey((prev) => (prev === key ? null : key));
  };

  const permissionConfigs: WebPermissionConfig[] = [
    {
      key: 'vpn',
      title: 'Servicio de filtrado VPN',
      subtitle: 'Bloqueo de sitios de apuestas y contenido no seguro',
      detailedText:
        'Crea un túnel local en el dispositivo para interceptar y bloquear solicitudes a casas de apuestas clandestinas de la lista oficial LOTBA, sin enviar tu tráfico a servidores externos.',
      steps: [
        'Activá el interruptor del permiso.',
        "En el diálogo del sistema 'Solicitud de conexión', confirmá tocando Aceptar.",
        'Verificá que aparezca el ícono de llave o escudo en la barra de notificaciones superior.',
      ],
      actionLabel: 'Autorizar filtrado VPN',
    },
    {
      key: 'accessibility',
      title: 'Servicio de accesibilidad',
      subtitle: 'Protección antidesinstalación y cierre forzado',
      detailedText:
        'Protección antidesinstalación: impide que el menor o un tercero cierre forzadamente la app, la suspenda o la elimine sin autorizar previamente el PIN del tutor responsable.',
      steps: [
        'Activá el interruptor para abrir Ajustes de Accesibilidad.',
        "Buscá y seleccioná 'BA Protege+' en la lista de aplicaciones instaladas.",
        "Activá el servicio y confirmá tocando 'Permitir' en la ventana de advertencia.",
      ],
      actionLabel: 'Activar servicio de accesibilidad',
    },
    {
      key: 'notifications',
      title: 'Notificaciones del sistema',
      subtitle: 'Alertas inmediatas y estado de supervisión',
      detailedText:
        'Mantiene la notificación de servicio persistente de seguridad en la barra de estado y envía alertas instantáneas de intentos de bloqueo o límites alcanzados.',
      steps: [
        'Activá el interruptor para habilitar las notificaciones.',
        "En la ventana emergente de permisos de Android, seleccioná 'Permitir'.",
        'Comprobá que las alertas del sistema no queden silenciadas.',
      ],
      actionLabel: 'Permitir notificaciones',
    },
    {
      key: 'batteryOptimization',
      title: 'Optimización de batería',
      subtitle: 'Protección continua con pantalla apagada',
      detailedText:
        'Evita que el ahorro de energía de Android suspenda o detenga el motor de filtrado cuando el celular esté con pantalla apagada o en reposo prolongado.',
      steps: [
        'Activá el interruptor de exención de batería.',
        "En el aviso del sistema '¿Ignorar optimizaciones de batería?', elegí 'Permitir' (o Sin restricciones).",
        'La app quedará autorizada para operar ininterrumpidamente en segundo plano.',
      ],
      actionLabel: 'Conceder exención de batería',
    },
    {
      key: 'location',
      title: 'Ubicación y geolocalización',
      subtitle: 'Registro de localización y seguridad familiar',
      detailedText:
        'Utiliza el sensor GPS del dispositivo para registrar la dirección exacta para el responsable. Si el permiso no es otorgado o no hay señal GPS satelital, el sistema obtiene la ubicación aproximada basada en la red IP.',
      steps: [
        'Activá el interruptor del permiso de ubicación.',
        "En el diálogo del sistema, seleccioná 'Mientras la app está en uso' o 'Siempre'.",
        'Asegurate de mantener activada la ubicación precisa del dispositivo.',
      ],
      actionLabel: 'Autorizar permiso de ubicación (GPS)',
    },
    {
      key: 'usageStats',
      title: 'Estadísticas de uso de aplicaciones',
      subtitle: 'Supervisión de tiempo en pantalla y límites',
      detailedText:
        'Necesario para supervisar el tiempo en primer plano de las aplicaciones y hacer cumplir los horarios y límites de tiempo diario configurados por el responsable.',
      steps: [
        "Activá el interruptor para abrir la sección 'Acceso de uso' en Ajustes.",
        "Localizá y seleccioná 'BA Protege+' en la lista de aplicaciones.",
        "Habilitá la opción 'Permitir seguimiento de uso' (o acceso a datos de uso).",
      ],
      actionLabel: 'Autorizar estadísticas de uso',
    },
  ];

  return (
    <div style={{ backgroundColor: '#FFF', minHeight: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* 1. Header Superior Institucional estándar (idéntico a Elegir protección) */}
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

      {/* 2. Subheader estándar con botón volver y título de 22px */}
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
              title="Volver a la pantalla anterior"
            >
              <img
                src="/src/assets/icons/volver.png"
                alt="Volver"
                style={{ width: '22px', height: '22px', objectFit: 'contain' }}
              />
            </button>
          )}
          <span style={{ fontSize: '22px', fontWeight: '800', color: '#000000', lineHeight: '28px', letterSpacing: '-0.3px' }}>
            Permisos de aplicación
          </span>
        </div>
      </div>

      <div style={{ padding: '10px 16px 16px 16px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        {/* Banner compacto de información azul institucional */}
        <div
          style={{
            border: '1.5px solid #007AFF',
            borderRadius: '12px',
            backgroundColor: '#F0F7FF',
            padding: '8px 12px',
            marginBottom: '8px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '2px' }}>
            <img
              src="/src/assets/icons/escudo.png"
              alt="Escudo"
              style={{ width: '18px', height: '18px', marginRight: '8px', objectFit: 'contain' }}
            />
            <div style={{ fontSize: '14px', fontWeight: '700', color: '#007AFF' }}>
              Configurá tu dispositivo
            </div>
          </div>
          <div style={{ fontSize: '12px', lineHeight: '16px', color: '#1C1C1E', fontWeight: '400' }}>
            Activá los 6 permisos para garantizar la protección continua y supervisión del dispositivo.
          </div>
        </div>

        {/* Listado distribuido de permisos */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', margin: '8px 0', gap: '8px' }}>
          {permissionConfigs.map((item) => {
            const isGranted = !!webPermissions[item.key];
            const isExpanded = expandedKey === item.key;

            return (
              <div
                key={item.key}
                style={{
                  backgroundColor: '#FFF',
                  borderRadius: '12px',
                  padding: '10px 14px',
                  border: '1px solid #E5E7EB',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                }}
              >
                <div
                  onClick={() => toggleExpand(item.key)}
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
                >
                  <div style={{ flex: 1, marginRight: '10px' }}>
                    <div style={{ fontSize: '14px', fontWeight: '700', color: '#111827', marginBottom: '2px' }}>
                      {item.title}
                    </div>
                    <div style={{ fontSize: '11px', color: '#8E8E93', lineHeight: '14px' }}>
                      {item.subtitle}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {/* Seletor Toggle Interactivo */}
                    <div
                      role="switch"
                      aria-checked={isGranted}
                      onClick={(e) => {
                        e.stopPropagation();
                        onTogglePerm(item.key);
                      }}
                      style={{
                        width: '44px',
                        height: '24px',
                        borderRadius: '12px',
                        backgroundColor: isGranted ? '#007AFF' : '#D1D5DB',
                        position: 'relative',
                        cursor: 'pointer',
                        transition: 'background-color 0.2s ease',
                        flexShrink: 0,
                      }}
                    >
                      <div
                        style={{
                          width: '20px',
                          height: '20px',
                          borderRadius: '50%',
                          backgroundColor: '#FFFFFF',
                          position: 'absolute',
                          top: '2px',
                          left: isGranted ? '22px' : '2px',
                          transition: 'left 0.2s ease',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.25)',
                        }}
                      />
                    </div>

                    <span style={{ fontSize: '16px', color: '#007AFF', fontWeight: '700', width: '14px', textAlign: 'center' }}>
                      {isExpanded ? '∧' : '∨'}
                    </span>
                  </div>
                </div>

                {isExpanded && (
                  <div style={{ marginTop: '10px' }}>
                    <div style={{ height: '1px', backgroundColor: '#E5E7EB', marginBottom: '10px' }} />
                    <div style={{ fontSize: '12px', color: '#4B5563', lineHeight: '17px', marginBottom: '10px' }}>
                      {item.detailedText}
                    </div>

                    {/* Paso a paso pedagógico */}
                    <div
                      style={{
                        backgroundColor: '#F8FAFC',
                        borderRadius: '8px',
                        border: '1px solid #E2E8F0',
                        padding: '10px',
                        marginBottom: '10px',
                      }}
                    >
                      <div
                        style={{
                          fontSize: '11.5px',
                          fontWeight: '700',
                          color: '#007AFF',
                          marginBottom: '6px',
                          letterSpacing: '0.3px',
                        }}
                      >
                        Pasos para activar:
                      </div>
                      {item.steps.map((step, idx) => (
                        <div
                          key={idx}
                          style={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            marginBottom: idx === item.steps.length - 1 ? '0' : '5px',
                          }}
                        >
                          <div
                            style={{
                              width: '16px',
                              height: '16px',
                              borderRadius: '8px',
                              backgroundColor: '#E7F1FF',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '10px',
                              fontWeight: '700',
                              color: '#007AFF',
                              marginRight: '6px',
                              marginTop: '1px',
                              flexShrink: 0,
                            }}
                          >
                            {idx + 1}
                          </div>
                          <div style={{ fontSize: '11.5px', color: '#334155', lineHeight: '16px' }}>
                            {step}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Acción dentro de la tarjeta expandida */}
                    {isGranted ? (
                      <div
                        style={{
                          padding: '8px 10px',
                          borderRadius: '8px',
                          backgroundColor: '#F0FDF4',
                          border: '1px solid #BBF7D0',
                          color: '#16A34A',
                          fontWeight: '600',
                          fontSize: '12px',
                          textAlign: 'center',
                        }}
                      >
                        ✓ Permiso concedido y en funcionamiento
                      </div>
                    ) : (
                      <button
                        onClick={() => onTogglePerm(item.key)}
                        style={{
                          width: '100%',
                          height: '40px',
                          borderRadius: '8px',
                          backgroundColor: '#007AFF',
                          color: '#FFF',
                          border: 'none',
                          fontWeight: '700',
                          fontSize: '13px',
                          cursor: 'pointer',
                        }}
                      >
                        {item.actionLabel}
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Botones de Acción Final: Volver y Continuar en la misma línea */}
        <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'row', gap: '10px', alignItems: 'center' }}>
          {onBack && (
            <button
              style={{
                flex: 1,
                height: '44px',
                borderRadius: '10px',
                backgroundColor: '#FFFFFF',
                color: '#007AFF',
                border: '1.5px solid #007AFF',
                fontWeight: '700',
                fontSize: '14px',
                cursor: 'pointer',
              }}
              onClick={onBack}
            >
              Volver
            </button>
          )}

          <button
            style={{
              flex: 1,
              height: '44px',
              borderRadius: '10px',
              backgroundColor: '#007AFF',
              color: '#FFF',
              border: 'none',
              fontWeight: '700',
              fontSize: '14px',
              cursor: 'pointer',
              boxShadow: '0 2px 4px rgba(0,122,255,0.2)',
            }}
            onClick={onContinue}
          >
            Continuar
          </button>
        </div>
      </div>
    </div>
  );
};
