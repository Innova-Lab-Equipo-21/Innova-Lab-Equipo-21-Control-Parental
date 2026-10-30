// ==============================================================================
// Proyecto: BA Protege+
// Componente: Web Simulator - ProtectedDeviceStep (Paso 5B)
// Archivo: src/web/components/ProtectedDeviceStep.tsx
// Descripción: Paso 5B del simulador web para la pantalla del dispositivo protegido
//              diferenciado para Menor y Adulto con 4 módulos (Actividad, Inicio,
//              Sitios y apps, Cuenta), Quiz diario interactivo, FAB (+) de bloqueo
//              presente exclusivamente en Sitios y apps (con tooltip auto-ocultable de 3s).
// ==============================================================================

import React, { useState, useEffect } from 'react';
import { WebPermissionsState } from './PermissionsStep';

interface ProtectedDeviceStepProps {
  webPermissions: WebPermissionsState;
  isVpnActive: boolean;
  testDomain: string;
  blockedAlert: string | null;
  mode?: 'CHILD' | 'ADULT';
  onExit: () => void;
  onOpenPermissions: () => void;
  onOpenPinModal: () => void;
  onTestDomainChange: (domain: string) => void;
  onSimulateAccess: () => void;
}

type TabType = 'actividad' | 'inicio' | 'sitios' | 'cuenta';

export const ProtectedDeviceStep: React.FC<ProtectedDeviceStepProps> = ({
  webPermissions,
  isVpnActive,
  testDomain,
  blockedAlert,
  mode = 'CHILD',
  onExit,
  onOpenPermissions,
  onOpenPinModal,
  onTestDomainChange,
  onSimulateAccess,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('inicio');
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [quizStep, setQuizStep] = useState(1);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [newBlockInput, setNewBlockInput] = useState('');
  const [showTooltip, setShowTooltip] = useState(true);

  useEffect(() => {
    setShowTooltip(true);
    const timer = setTimeout(() => setShowTooltip(false), 3000);
    return () => clearTimeout(timer);
  }, [activeTab]);

  const [blockedSites, setBlockedSites] = useState<string[]>([
    'casino-clandestino.net',
    'red-social-peligrosa.org',
  ]);

  const handleBlockSite = () => {
    if (!newBlockInput.trim()) return;
    const clean = newBlockInput.toLowerCase().trim().replace(/^(https?:\/\/)?(www\.)?/, '');
    setBlockedSites((prev) => [clean, ...prev.filter((s) => s !== clean)]);
    setNewBlockInput('');
    setShowBlockModal(false);
    alert(`🔒 Sitio/App "${clean}" bloqueado permanentemente. Únicamente tu TUTOR RESPONSABLE podrá autorizar el desbloqueo.`);
  };

  const handleAttemptUnlock = (site: string) => {
    alert(`🔑 No podés desbloquear "${site}". Solicitá a tu TUTOR RESPONSABLE que ingrese su PIN de 4 dígitos para autorizar el desbloqueo.`);
    onOpenPinModal();
  };

  const missingPermsList: string[] = [];
  if (!webPermissions.vpn) missingPermsList.push('Servicio VPN Local (Filtrado LOTBA)');
  if (!webPermissions.accessibility) missingPermsList.push('Servicio de Accesibilidad');
  if (!webPermissions.notifications) missingPermsList.push('Notificaciones');
  if (!webPermissions.batteryOptimization) missingPermsList.push('Exención de Batería');

  return (
    <div style={{ padding: '12px', paddingBottom: '70px', position: 'relative', minHeight: '520px' }}>
      {/* 1. TOP HEADER INSTITUCIONAL */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#EAF3FF', padding: '10px 12px', borderRadius: '12px', marginBottom: '12px', border: '1px solid #DBEAFE' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '15px', fontWeight: '900', color: '#007AFF' }}>BA Protege +</span>
        </div>
        <span style={{ fontSize: '10px', fontWeight: '800', backgroundColor: '#FFF', color: '#007AFF', padding: '3px 8px', borderRadius: '8px', border: '1px solid #BFDBFE' }}>
          {mode === 'CHILD' ? '👦 MENOR' : '👤 ADULTO'}
        </span>
      </div>

      {/* ALERTA PERMISOS PENDIENTES */}
      {missingPermsList.length > 0 && (
        <div style={{ backgroundColor: '#FFF3CD', border: '1.5px solid #FFC107', borderRadius: '14px', padding: '12px', marginBottom: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', fontWeight: '800', color: '#856404' }}>
              ⚠️ Permisos Pendientes ({4 - missingPermsList.length}/4)
            </span>
            <button
              style={{ padding: '2px 8px', backgroundColor: '#D97706', color: '#FFF', border: 'none', borderRadius: '6px', fontSize: '10px', fontWeight: '800', cursor: 'pointer' }}
              onClick={onOpenPermissions}
            >
              Configurar ⚙️
            </button>
          </div>
        </div>
      )}

      {/* 2. PESTAÑA INICIO */}
      {activeTab === 'inicio' && (
        <div>
          {/* Card Status: Estás protegido */}
          <div style={{ backgroundColor: '#FFF', borderRadius: '16px', padding: '14px', border: '2px solid #007AFF', marginBottom: '12px', boxShadow: '0 2px 6px rgba(0,122,255,0.1)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '12px', backgroundColor: '#007AFF', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: '900' }}>
                ✓
              </div>
              <div>
                <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#007AFF', margin: 0 }}>Estás protegido</h3>
                <p style={{ fontSize: '11px', color: '#475569', margin: 0 }}>Navegás de forma cuidada y más segura.</p>
              </div>
            </div>
            <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #F1F5F9', fontSize: '11px', color: '#64748B' }}>
              Dispositivo vinculado con responsable: <strong>Ana</strong>
            </div>
          </div>

          {/* Card Quiz Diario (con Beti) */}
          {!quizCompleted ? (
            <div style={{ backgroundColor: '#16A34A', borderRadius: '18px', padding: '14px', marginBottom: '12px', color: '#FFF' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '36px' }}>🤖</span>
                <div>
                  <h4 style={{ fontSize: '15px', fontWeight: '900', margin: '0 0 2px 0' }}>¿HACEMOS UN QUIZ?</h4>
                  <p style={{ fontSize: '11px', color: '#DCFCE7', margin: '0 0 8px 0', lineHeight: '1.3' }}>
                    Poné a prueba tus conocimientos sobre seguridad digital de forma divertida.
                  </p>
                  <button
                    style={{ backgroundColor: '#FFF', color: '#15803D', border: 'none', padding: '6px 14px', borderRadius: '14px', fontWeight: '800', fontSize: '12px', cursor: 'pointer' }}
                    onClick={() => { setQuizStep(1); setShowQuizModal(true); }}
                  >
                    Comenzar ➔
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ backgroundColor: '#ECFDF5', border: '2px solid #10B981', borderRadius: '18px', padding: '14px', marginBottom: '12px' }}>
              <h4 style={{ fontSize: '14px', fontWeight: '800', color: '#047857', margin: '0 0 4px 0' }}>¡Quiz diario completado hoy! 🎯</h4>
              <p style={{ fontSize: '12px', color: '#065F46', fontWeight: '700', margin: '0 0 8px 0' }}>Puntaje: 5/5 respuestas correctas.</p>
              <div style={{ backgroundColor: '#FFF', borderRadius: '12px', padding: '10px', border: '1px solid #A7F3D0', fontSize: '11px', color: '#047857' }}>
                💡 <strong>Consejo de Beti:</strong> ¡Excelente trabajo! Te sugerimos tomar un descanso de la pantalla, salir a pasear, tomar aire fresco y disfrutar del aire libre 🌳🚶☀️
              </div>
            </div>
          )}

          {/* Warning Red Card */}
          <div style={{ backgroundColor: '#FFF', border: '1.5px solid #EF4444', borderRadius: '18px', overflow: 'hidden', marginBottom: '12px' }}>
            <div style={{ backgroundColor: '#DC2626', color: '#FFF', fontSize: '11px', fontWeight: '900', padding: '6px', textAlign: 'center' }}>
              {mode === 'CHILD' ? 'SI SOS MENOR NO PODES INGRESAR.' : 'PROTECCIÓN ACTIVA Y SALUD DIGITAL'}
            </div>
            <div style={{ padding: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '32px' }}>🤖🛡️</span>
              <div>
                <h4 style={{ fontSize: '14px', fontWeight: '900', color: '#DC2626', margin: '0 0 2px 0' }}>¡CUIDADO!</h4>
                <p style={{ fontSize: '11px', color: '#475569', margin: '0 0 6px 0', lineHeight: '1.3' }}>
                  Si sos menor no podes ingresar a sitios de adultos. Esta protección te ayudará a navegar de forma segura.
                </p>
                <button
                  style={{ backgroundColor: '#007AFF', color: '#FFF', border: 'none', padding: '4px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: '800', cursor: 'pointer' }}
                  onClick={() => alert('Información oficial: El acceso a sitios de apuestas online está estrictamente prohibido para menores por ley.')}
                >
                  Saber más ➔
                </button>
              </div>
            </div>
          </div>

          {/* Actividad Reciente Box */}
          <div style={{ backgroundColor: '#007AFF', borderRadius: '18px', padding: '12px', color: '#FFF' }}>
            <h4 style={{ fontSize: '13px', fontWeight: '800', margin: '0 0 8px 0' }}>Actividad reciente</h4>
            <div style={{ backgroundColor: '#FFF', borderRadius: '12px', padding: '8px', color: '#0F172A' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }} onClick={() => setActiveTab('actividad')}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '18px' }}>📱</span>
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: '800' }}>Apps más usadas</div>
                    <div style={{ fontSize: '10px', color: '#64748B' }}>Podes llevar un control de apps frecuentes</div>
                  </div>
                </div>
                <span style={{ fontSize: '16px', color: '#94A3B8' }}>›</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. PESTAÑA ACTIVIDAD ("MI USO DIARIO") */}
      {activeTab === 'actividad' && (
        <div>
          <div style={{ backgroundColor: '#007AFF', color: '#FFF', borderRadius: '18px', padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '16px', fontWeight: '900' }}>MI USO DIARIO</span>
            <span style={{ fontSize: '11px', fontWeight: '700' }}>Ver más ›</span>
          </div>

          {/* Stats Boxes */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
            <div style={{ flex: 1, backgroundColor: '#FFF', border: '1.5px solid #007AFF', borderRadius: '14px', padding: '10px' }}>
              <div style={{ fontSize: '10px', color: '#007AFF', fontWeight: '800' }}>Tiempo de uso</div>
              <div style={{ fontSize: '20px', fontWeight: '900', color: '#007AFF' }}>3:45</div>
              <div style={{ fontSize: '10px', color: '#007AFF' }}>Restan 01:15hs</div>
            </div>
            <div style={{ flex: 1, backgroundColor: '#FFF', border: '1.5px solid #007AFF', borderRadius: '14px', padding: '10px' }}>
              <div style={{ fontSize: '10px', color: '#007AFF', fontWeight: '800' }}>Tiempo de uso</div>
              <div style={{ fontSize: '20px', fontWeight: '900', color: '#007AFF' }}>05 hs 00m</div>
              <div style={{ fontSize: '10px', color: '#007AFF' }}>Restan 05:00hs</div>
            </div>
          </div>

          {/* Apps Usage */}
          <div style={{ backgroundColor: '#FFF', border: '1.5px solid #007AFF', borderRadius: '16px', padding: '12px', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '12px', fontWeight: '800', color: '#0F172A' }}>📸 Instagram</span>
              <span style={{ fontSize: '12px', fontWeight: '800', color: '#007AFF' }}>00:45min ›</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '12px', fontWeight: '800', color: '#0F172A' }}>🎵 TikTok</span>
              <span style={{ fontSize: '12px', fontWeight: '800', color: '#007AFF' }}>00:30min ›</span>
            </div>
          </div>
        </div>
      )}

      {/* 4. PESTAÑA SITIOS Y APPS (EXCLUSIVA DE SUS ELEMENTOS BLOQUEADOS) */}
      {activeTab === 'sitios' && (
        <div>
          <div style={{ backgroundColor: '#007AFF', color: '#FFF', borderRadius: '16px', padding: '12px 14px', marginBottom: '12px' }}>
            <div style={{ fontSize: '14px', fontWeight: '800' }}>🌐 Mis sitios y apps restringidas</div>
            <div style={{ fontSize: '11px', color: '#E0EDFF', marginTop: '2px' }}>
              Muestra únicamente los elementos que bloqueaste en este dispositivo.
            </div>
          </div>

          <h4 style={{ fontSize: '12px', fontWeight: '800', color: '#0F172A', marginBottom: '6px' }}>Elementos bloqueados por ti ({blockedSites.length})</h4>
          {blockedSites.map((site, i) => (
            <div key={i} style={{ backgroundColor: '#FFF', borderRadius: '12px', padding: '10px', border: '1px solid #CBD5E1', marginBottom: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }} onClick={() => handleAttemptUnlock(site)}>
              <div>
                <div style={{ fontSize: '12px', fontWeight: '800', color: '#0F172A' }}>🔒 {site}</div>
                <div style={{ fontSize: '10px', color: '#DC2626', fontWeight: '700' }}>Bloqueado permanentemente por responsable</div>
              </div>
              <span style={{ fontSize: '14px' }}>🔑</span>
            </div>
          ))}
        </div>
      )}

      {/* 5. PESTAÑA CUENTA */}
      {activeTab === 'cuenta' && (
        <div>
          <div style={{ backgroundColor: '#FFF', borderRadius: '16px', padding: '14px', border: '1px solid #CBD5E1', marginBottom: '12px' }}>
            <div style={{ fontSize: '16px', fontWeight: '800', color: '#0F172A' }}>{mode === 'CHILD' ? 'Dispositivo menor' : 'Dispositivo adulto'}</div>
            <div style={{ fontSize: '11px', color: '#007AFF', fontWeight: '700' }}>● Perfil protegido activo</div>
            <div style={{ fontSize: '11px', color: '#64748B', marginTop: '4px' }}>Tutor vinculado: <strong>Ana</strong></div>
          </div>

          <div style={{ backgroundColor: '#FAF5FF', border: '1.5px solid #D8B4FE', borderRadius: '16px', padding: '14px', marginBottom: '12px' }}>
            <h4 style={{ fontSize: '13px', fontWeight: '800', color: '#7E22CE', margin: '0 0 4px 0' }}>💜 Línea de orientación 24hs</h4>
            <p style={{ fontSize: '11px', color: '#581C87', margin: '0 0 8px 0' }}>Llamada gratuita y confidencial para asistencia y contención.</p>
            <button style={{ width: '100%', height: '36px', borderRadius: '10px', backgroundColor: '#7E22CE', color: '#FFF', border: 'none', fontWeight: '800', fontSize: '11px', cursor: 'pointer' }} onClick={() => alert('📞 Llamando al 0800-444-5682...')}>
              📞 Llamar gratis al 0800-444-5682
            </button>
          </div>

          <button style={{ width: '100%', height: '40px', borderRadius: '12px', backgroundColor: '#F1F5F9', color: '#475569', border: '1px solid #CBD5E1', fontWeight: '800', fontSize: '12px', cursor: 'pointer' }} onClick={onExit}>
            Cambiar modo de operación ⚙️
          </button>
        </div>
      )}

      {/* BOTÓN FLOTANTE FAB (+) EXCLUSIVO EN LA PESTAÑA "SITIOS Y APPS" */}
      {activeTab === 'sitios' && (
        <div style={{ position: 'absolute', bottom: '62px', right: '12px', zIndex: 100, display: 'flex', alignItems: 'center' }}>
          {/* Bocadillo explicativo (Speech Bubble) visible por 3 segundos */}
          {showTooltip && (
            <>
              <div style={{ backgroundColor: '#FFFFFF', padding: '6px 12px', borderRadius: '12px', border: '1px solid #CBD5E1', boxShadow: '0 2px 6px rgba(0,0,0,0.12)', fontSize: '11.5px', fontWeight: '800', color: '#0F172A', whiteSpace: 'nowrap' }}>
                Bloquear sitio o app
              </div>
              <div style={{ width: 0, height: 0, borderTop: '5px solid transparent', borderBottom: '5px solid transparent', borderLeft: '7px solid #FFFFFF', marginLeft: '-1px' }} />
            </>
          )}

          {/* Botón circular FAB + */}
          <button
            style={{ width: '44px', height: '44px', borderRadius: '22px', backgroundColor: '#007AFF', color: '#FFF', border: 'none', fontWeight: '900', fontSize: '22px', cursor: 'pointer', boxShadow: '0 4px 10px rgba(0,122,255,0.35)', display: 'flex', justifyContent: 'center', alignItems: 'center', marginLeft: '6px' }}
            onClick={() => setShowBlockModal(true)}
          >
            +
          </button>
        </div>
      )}

      {/* NAVBAR INFERIOR DE 4 MÓDULOS (Inicio, Sitios y apps, Actividad, Cuenta) */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#FFF', borderTop: '1px solid #E9ECEF', display: 'flex', justifyContent: 'space-around', alignItems: 'center', height: '62px', padding: '0 4px' }}>
        <button
          style={{ flex: 1, height: '48px', maxWidth: '78px', borderRadius: '12px', border: 'none', backgroundColor: activeTab === 'inicio' ? '#E5F1FF' : 'transparent', color: activeTab === 'inicio' ? '#0056B3' : '#64748B', fontWeight: activeTab === 'inicio' ? '700' : '600', fontSize: '10px', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}
          onClick={() => setActiveTab('inicio')}
        >
          <span style={{ fontSize: '16px', marginBottom: '1px' }}>🏠</span> Inicio
        </button>
        <button
          style={{ flex: 1, height: '48px', maxWidth: '78px', borderRadius: '12px', border: 'none', backgroundColor: activeTab === 'sitios' ? '#E5F1FF' : 'transparent', color: activeTab === 'sitios' ? '#0056B3' : '#64748B', fontWeight: activeTab === 'sitios' ? '700' : '600', fontSize: '10px', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}
          onClick={() => setActiveTab('sitios')}
        >
          <span style={{ fontSize: '16px', marginBottom: '1px' }}>🌐</span> Sitios y apps
        </button>
        <button
          style={{ flex: 1, height: '48px', maxWidth: '78px', borderRadius: '12px', border: 'none', backgroundColor: activeTab === 'actividad' ? '#E5F1FF' : 'transparent', color: activeTab === 'actividad' ? '#0056B3' : '#64748B', fontWeight: activeTab === 'actividad' ? '700' : '600', fontSize: '10px', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}
          onClick={() => setActiveTab('actividad')}
        >
          <span style={{ fontSize: '16px', marginBottom: '1px' }}>📊</span> Actividad
        </button>
        <button
          style={{ flex: 1, height: '48px', maxWidth: '78px', borderRadius: '12px', border: 'none', backgroundColor: activeTab === 'cuenta' ? '#E5F1FF' : 'transparent', color: activeTab === 'cuenta' ? '#0056B3' : '#64748B', fontWeight: activeTab === 'cuenta' ? '700' : '600', fontSize: '10px', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}
          onClick={() => setActiveTab('cuenta')}
        >
          <span style={{ fontSize: '16px', marginBottom: '1px' }}>👤</span> Cuenta
        </button>
      </div>

      {/* MODAL QUIZ DIARIO */}
      {showQuizModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 999 }}>
          <div style={{ backgroundColor: quizStep === 1 ? '#E05297' : '#16A34A', width: '90%', maxWidth: '340px', borderRadius: '20px', padding: '20px', color: '#FFF' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ fontSize: '11px', fontWeight: '800' }}>PASO {quizStep} DE 5</span>
              <button style={{ background: 'none', border: 'none', color: '#FFF', fontSize: '14px', cursor: 'pointer' }} onClick={() => setShowQuizModal(false)}>✕</button>
            </div>
            <div style={{ backgroundColor: '#FFF', borderRadius: '14px', padding: '14px', color: '#1E293B', marginBottom: '12px' }}>
              <h4 style={{ fontSize: '13px', fontWeight: '800', margin: '0 0 4px 0' }}>¿Qué hacés si te escriben pidiendo tus datos?</h4>
              <p style={{ fontSize: '11px', color: '#64748B', margin: 0 }}>Navegar seguro es cuidar tu privacidad.</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <button style={{ backgroundColor: '#FFF', border: 'none', borderRadius: '10px', padding: '10px', fontSize: '11px', fontWeight: '700', cursor: 'pointer' }} onClick={() => { setQuizCompleted(true); setShowQuizModal(false); }}>
                B) Le aviso a mi tutor
              </button>
              <button style={{ backgroundColor: '#FFF', border: 'none', borderRadius: '10px', padding: '10px', fontSize: '11px', fontWeight: '700', cursor: 'pointer' }} onClick={() => { setQuizCompleted(true); setShowQuizModal(false); }}>
                A) Se los paso
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL FAB (+) BLOQUEAR SITIO/APP */}
      {showBlockModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 999 }}>
          <div style={{ backgroundColor: '#FFF', width: '90%', maxWidth: '340px', borderRadius: '20px', padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: '800', margin: 0, color: '#0F172A' }}>🔒 Bloquear Sitio o App</h3>
              <button style={{ background: 'none', border: 'none', fontSize: '16px', cursor: 'pointer' }} onClick={() => setShowBlockModal(false)}>✕</button>
            </div>
            <input
              style={{ width: '100%', height: '40px', borderRadius: '10px', border: '1px solid #CBD5E1', padding: '0 10px', fontSize: '12px', marginBottom: '12px' }}
              placeholder="Ingresá sitio o app (ej: casino.com)"
              value={newBlockInput}
              onChange={(e) => setNewBlockInput(e.target.value)}
            />
            <div style={{ backgroundColor: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: '10px', padding: '10px', fontSize: '11px', color: '#991B1B', marginBottom: '12px' }}>
              ⚠️ <strong>Atención:</strong> Una vez bloqueado, <strong>no podrás desbloquearlo</strong>. Solamente tu TUTOR RESPONSABLE podrá remover este bloqueo.
            </div>
            <button
              style={{ width: '100%', height: '40px', borderRadius: '10px', backgroundColor: '#DC2626', color: '#FFF', border: 'none', fontWeight: '800', fontSize: '12px', cursor: 'pointer' }}
              onClick={handleBlockSite}
            >
              🔒 Confirmar y Bloquear Permanente
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
