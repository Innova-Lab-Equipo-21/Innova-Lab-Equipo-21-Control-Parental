// ==============================================================================
// Proyecto: BA Protege+
// Componente: Web Simulator - AuthStep (Paso 3A)
// Archivo: src/web/components/AuthStep.tsx
// Descripción: Paso 3A del flujo con pestañas de Login, Recuperación y Registro Completo.
// ==============================================================================

import React from 'react';
import { Logo } from '../../components/Logo';

type AuthTab = 'LOGIN' | 'RECOVERY' | 'REGISTER';
type GenderOption = 'Masculino' | 'Femenino' | 'Otro' | 'No informado';

interface AuthStepProps {
  authTab: AuthTab;
  authError: string | null;
  authSuccess: string | null;
  loginEmail: string;
  loginPassword: string;
  recoveryEmail: string;
  regNombre: string;
  regApellido: string;
  regGenero: GenderOption;
  regFechaNacimiento: string;
  regTelefono: string;
  regEmail: string;
  regPassword: string;
  regConfirmPassword: string;
  regErrors: Record<string, string>;
  onTabChange: (tab: AuthTab) => void;
  onLoginEmailChange: (v: string) => void;
  onLoginPasswordChange: (v: string) => void;
  onRecoveryEmailChange: (v: string) => void;
  onRegNombreChange: (v: string) => void;
  onRegApellidoChange: (v: string) => void;
  onRegGeneroChange: (v: GenderOption) => void;
  onRegFechaNacimientoChange: (v: string) => void;
  onRegTelefonoChange: (v: string) => void;
  onRegEmailChange: (v: string) => void;
  onRegPasswordChange: (v: string) => void;
  onRegConfirmPasswordChange: (v: string) => void;
  onLoginSubmit: () => void;
  onRecoverySubmit: () => void;
  onRegisterSubmit: () => void;
  onFillDemo: () => void;
  onBack?: () => void;
}

export const AuthStep: React.FC<AuthStepProps> = ({
  authTab,
  authError,
  authSuccess,
  onBack,
  loginEmail,
  loginPassword,
  recoveryEmail,
  regNombre,
  regApellido,
  regGenero,
  regFechaNacimiento,
  regTelefono,
  regEmail,
  regPassword,
  regConfirmPassword,
  regErrors,
  onTabChange,
  onLoginEmailChange,
  onLoginPasswordChange,
  onRecoveryEmailChange,
  onRegNombreChange,
  onRegApellidoChange,
  onRegGeneroChange,
  onRegFechaNacimientoChange,
  onRegTelefonoChange,
  onRegEmailChange,
  onRegPasswordChange,
  onRegConfirmPasswordChange,
  onLoginSubmit,
  onRecoverySubmit,
  onRegisterSubmit,
  onFillDemo,
}) => {
  const nativeDateRef = React.useRef<HTMLInputElement>(null);
  const [showTermsModal, setShowTermsModal] = React.useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = React.useState(false);

  return (
    <div style={{ padding: '16px 14px' }}>
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
        <Logo variant="complete" size="md" align="center" />
      </div>

      {authError && (
        <div style={{ backgroundColor: '#F8D7DA', border: '1px solid #F5C2C7', color: '#842029', borderRadius: '10px', padding: '10px', fontSize: '12px', marginBottom: '14px' }}>
          ⚠️ {authError}
        </div>
      )}

      {authSuccess && (
        <div style={{ backgroundColor: '#D1E7DD', border: '1px solid #BADBCC', color: '#0F5132', borderRadius: '10px', padding: '10px', fontSize: '12px', marginBottom: '14px' }}>
          ✅ {authSuccess}
        </div>
      )}

      {/* VISTA 1: INICIAR SESIÓN */}
      {authTab === 'LOGIN' && (
        <div>
          <div style={{ textAlign: 'center', marginBottom: '14px' }}>
            <span style={{ fontSize: '10px', fontWeight: '800', backgroundColor: '#E7F1FF', color: '#0056B3', padding: '3px 8px', borderRadius: '6px' }}>
              PASO 3A • AUTENTICACIÓN
            </span>
            <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#1C1C1E', marginTop: '6px' }}>Acceso Responsables</h2>
          </div>

          <div style={{ backgroundColor: '#FFF', padding: '4px 0' }}>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ fontSize: '12px', fontWeight: '700', color: '#1C1C1E', display: 'block', marginBottom: '4px' }}>
                Correo Electrónico<span style={{ color: '#DC3545', fontWeight: '700' }}>*</span>
              </label>
              <input
                style={{ width: '100%', height: '40px', borderRadius: '8px', border: '1px solid #DEE2E6', padding: '0 10px', fontSize: '13px' }}
                value={loginEmail}
                onChange={(e) => onLoginEmailChange(e.target.value)}
                placeholder="ejemplo@baprotege.gob.ar"
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '12px', fontWeight: '700', color: '#1C1C1E', display: 'block', marginBottom: '4px' }}>
                Contraseña<span style={{ color: '#DC3545', fontWeight: '700' }}>*</span>
              </label>
              <input
                type="password"
                style={{ width: '100%', height: '40px', borderRadius: '8px', border: '1px solid #DEE2E6', padding: '0 10px', fontSize: '13px' }}
                value={loginPassword}
                onChange={(e) => onLoginPasswordChange(e.target.value)}
                placeholder="••••••••"
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '6px' }}>
                <button
                  type="button"
                  style={{ background: 'none', border: 'none', color: '#007AFF', fontSize: '11px', fontWeight: '700', cursor: 'pointer', padding: 0 }}
                  onClick={() => onTabChange('RECOVERY')}
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>
            </div>

            <button
              style={{ width: '100%', height: '44px', borderRadius: '10px', backgroundColor: '#007AFF', color: '#FFF', border: 'none', fontWeight: '700', cursor: 'pointer', marginBottom: '10px' }}
              onClick={onLoginSubmit}
            >
              Iniciar Sesión ➔ Paso 4: Permisos
            </button>

            <div style={{ textAlign: 'center', marginBottom: '10px' }}>
              <button
                type="button"
                style={{ background: 'none', border: 'none', color: '#8E8E93', fontSize: '12px', cursor: 'pointer' }}
                onClick={() => onTabChange('REGISTER')}
              >
                ¿No tienes una cuenta? <strong style={{ color: '#007AFF' }}>Crear cuenta</strong>
              </button>
            </div>

            {/* Divisor "o" */}
            <div style={{ display: 'flex', alignItems: 'center', margin: '12px 0' }}>
              <div style={{ flex: 1, height: '1px', backgroundColor: '#E9ECEF' }} />
              <span style={{ padding: '0 10px', fontSize: '13px', color: '#8E8E93', fontWeight: '500' }}>o</span>
              <div style={{ flex: 1, height: '1px', backgroundColor: '#E9ECEF' }} />
            </div>

            {/* Botón de Google */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px' }}>
              <button
                type="button"
                onClick={onLoginSubmit}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  cursor: 'pointer',
                }}
                title="Acceder con Google"
              >
                <img
                  src="/src/assets/logo/logo_google.png"
                  alt="Google"
                  style={{ width: '200px', height: '44px', objectFit: 'contain' }}
                />
              </button>
            </div>

            {/* Texto Legal: Políticas de Privacidad y Términos y condiciones */}
            <div style={{ textAlign: 'center', marginBottom: '12px', fontSize: '13px', color: '#1C1C1E', lineHeight: '1.4' }}>
              Este sitio está sujeto a{' '}
              <span
                onClick={() => setShowPrivacyModal(true)}
                style={{ color: '#007AFF', fontWeight: '600', cursor: 'pointer' }}
              >
                Políticas de Privacidad
              </span>
              {' y '}
              <span
                onClick={() => setShowTermsModal(true)}
                style={{ color: '#007AFF', fontWeight: '600', cursor: 'pointer' }}
              >
                Términos y condiciones
              </span>
            </div>
          </div>
        </div>
      )}

      {/* VISTA 2: RECUPERAR CONTRASEÑA */}
      {authTab === 'RECOVERY' && (
        <div>
          <div style={{ textAlign: 'center', marginBottom: '14px' }}>
            <span style={{ fontSize: '10px', fontWeight: '800', backgroundColor: '#E7F1FF', color: '#0056B3', padding: '3px 8px', borderRadius: '6px' }}>
              PASO 3A • RECUPERACIÓN
            </span>
            <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#1C1C1E', marginTop: '6px' }}>Recuperar Contraseña</h2>
          </div>

          <div style={{ backgroundColor: '#FFF', padding: '4px 0' }}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '12px', fontWeight: '700', color: '#1C1C1E', display: 'block', marginBottom: '4px' }}>Correo Electrónico Registrado</label>
              <input
                style={{ width: '100%', height: '40px', borderRadius: '8px', border: '1px solid #DEE2E6', padding: '0 10px', fontSize: '13px' }}
                value={recoveryEmail}
                onChange={(e) => onRecoveryEmailChange(e.target.value)}
                placeholder="ejemplo@baprotege.gob.ar"
              />
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
              <button
                type="button"
                style={{
                  flex: 1,
                  height: '48px',
                  borderRadius: '12px',
                  backgroundColor: '#FFFFFF',
                  color: '#007AFF',
                  border: '1.5px solid #007AFF',
                  fontWeight: '700',
                  fontSize: '15px',
                  cursor: 'pointer',
                }}
                onClick={() => onTabChange('LOGIN')}
              >
                Volver
              </button>

              <button
                type="button"
                style={{
                  flex: 1,
                  height: '48px',
                  borderRadius: '12px',
                  backgroundColor: '#007AFF',
                  color: '#FFFFFF',
                  border: 'none',
                  fontWeight: '700',
                  fontSize: '14px',
                  cursor: 'pointer',
                  boxShadow: '0 2px 6px rgba(0, 122, 255, 0.25)',
                }}
                onClick={onRecoverySubmit}
              >
                Recuperar contraseña
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VISTA 3: CREAR CUENTA (REGISTRO COMPLETO) */}
      {authTab === 'REGISTER' && (
        <div>
          <div style={{ marginBottom: '16px' }}>
            <div style={{ textAlign: 'center', marginBottom: '10px' }}>
              <span style={{ fontSize: '10px', fontWeight: '800', backgroundColor: '#E7F1FF', color: '#0056B3', padding: '3px 8px', borderRadius: '6px' }}>
                PASO 3A • REGISTRO DE CUENTA
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '6px' }}>
              <button
                type="button"
                onClick={onBack || (() => onTabChange('LOGIN'))}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px',
                  marginRight: '8px',
                  display: 'flex',
                  alignItems: 'center',
                }}
                title="Volver"
              >
                <img
                  src="/assets/icons/volver.png"
                  alt="Volver"
                  style={{ width: '22px', height: '22px', objectFit: 'contain' }}
                />
              </button>
              <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#1C1C1E', margin: 0, textAlign: 'left' }}>
                Crear Cuenta Responsable
              </h2>
            </div>
            <p style={{ fontSize: '13px', color: '#1C1C1E', margin: '0 0 0 4px', lineHeight: '18px', textAlign: 'left' }}>
              Registra tus datos para administrar la protección digital de tus hijos
            </p>
          </div>

          <div style={{ backgroundColor: '#FFF', padding: '4px 0' }}>
            {/* Campo 1: Nombre */}
            <div style={{ marginBottom: '10px' }}>
              <label style={{ fontSize: '11px', fontWeight: '700', color: '#1C1C1E', display: 'block', marginBottom: '3px' }}>
                Nombre<span style={{ color: '#DC3545', fontWeight: '700' }}>*</span>
              </label>
              <input
                style={{ width: '100%', height: '38px', borderRadius: '8px', border: '1px solid #DEE2E6', padding: '0 10px', fontSize: '12px' }}
                value={regNombre}
                onChange={(e) => onRegNombreChange(e.target.value)}
                placeholder="Ej. Juan"
              />
              {regErrors.nombre && <span style={{ color: '#DC3545', fontSize: '10px' }}>{regErrors.nombre}</span>}
            </div>

            {/* Campo 2: Apellido */}
            <div style={{ marginBottom: '10px' }}>
              <label style={{ fontSize: '11px', fontWeight: '700', color: '#1C1C1E', display: 'block', marginBottom: '3px' }}>
                Apellido<span style={{ color: '#DC3545', fontWeight: '700' }}>*</span>
              </label>
              <input
                style={{ width: '100%', height: '38px', borderRadius: '8px', border: '1px solid #DEE2E6', padding: '0 10px', fontSize: '12px' }}
                value={regApellido}
                onChange={(e) => onRegApellidoChange(e.target.value)}
                placeholder="Ej. Pérez"
              />
              {regErrors.apellido && <span style={{ color: '#DC3545', fontSize: '10px' }}>{regErrors.apellido}</span>}
            </div>

            {/* Campo 3: Fecha de Nacimiento */}
            <div style={{ marginBottom: '10px' }}>
              <label style={{ fontSize: '11px', fontWeight: '700', color: '#1C1C1E', display: 'block', marginBottom: '3px' }}>
                Fecha de Nacimiento<span style={{ color: '#DC3545', fontWeight: '700' }}>*</span>
              </label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <input
                  style={{
                    width: '100%',
                    height: '38px',
                    borderRadius: '8px',
                    border: regErrors.fechaNacimiento ? '1.5px solid #DC3545' : '1px solid #DEE2E6',
                    backgroundColor: regErrors.fechaNacimiento ? '#FFF8F8' : '#FFFFFF',
                    padding: '0 38px 0 10px',
                    fontSize: '12px',
                  }}
                  value={regFechaNacimiento}
                  onChange={(e) => onRegFechaNacimientoChange(e.target.value)}
                  placeholder="DD/MM/AAAA"
                  maxLength={10}
                />
                <input
                  ref={nativeDateRef}
                  type="date"
                  style={{ position: 'absolute', opacity: 0, pointerEvents: 'none', width: 0, height: 0 }}
                  onChange={(e) => {
                    if (e.target.value) {
                      const [year, month, day] = e.target.value.split('-');
                      onRegFechaNacimientoChange(`${day}/${month}/${year}`);
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={() => {
                    const el = nativeDateRef.current;
                    if (el) {
                      if (typeof (el as any).showPicker === 'function') {
                        (el as any).showPicker();
                      } else {
                        el.focus();
                      }
                    }
                  }}
                  style={{
                    position: 'absolute',
                    right: '8px',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 0,
                    display: 'flex',
                    alignItems: 'center',
                  }}
                  title="Abrir calendario"
                >
                  <img
                    src="/assets/icons/calendario.png"
                    alt="Calendario"
                    style={{ width: '22px', height: '22px', objectFit: 'contain' }}
                  />
                </button>
              </div>
              {regErrors.fechaNacimiento && (
                <span style={{ color: '#DC3545', fontSize: '10px', display: 'block', marginTop: '3px', fontWeight: '600' }}>
                  {regErrors.fechaNacimiento}
                </span>
              )}
            </div>

            {/* Campo 4: Género (Dropdown) */}
            <div style={{ marginBottom: '10px' }}>
              <label style={{ fontSize: '11px', fontWeight: '700', color: '#1C1C1E', display: 'block', marginBottom: '3px' }}>
                Género
              </label>
              <select
                value={regGenero}
                onChange={(e) => onRegGeneroChange(e.target.value as GenderOption)}
                style={{
                  width: '100%',
                  height: '38px',
                  borderRadius: '8px',
                  border: '1px solid #DEE2E6',
                  backgroundColor: '#FFFFFF',
                  padding: '0 10px',
                  fontSize: '12px',
                  color: '#1C1C1E',
                  cursor: 'pointer',
                }}
              >
                <option value="Masculino">Masculino</option>
                <option value="Femenino">Femenino</option>
                <option value="Otro">Otro</option>
                <option value="No informado">No informado</option>
              </select>
            </div>

            {/* Campo 5: Teléfono */}
            <div style={{ marginBottom: '10px' }}>
              <label style={{ fontSize: '11px', fontWeight: '700', color: '#1C1C1E', display: 'block', marginBottom: '3px' }}>
                Teléfono
              </label>
              <input
                style={{ width: '100%', height: '38px', borderRadius: '8px', border: '1px solid #DEE2E6', padding: '0 10px', fontSize: '12px' }}
                value={regTelefono}
                onChange={(e) => onRegTelefonoChange(e.target.value)}
                placeholder="11 2345-6789"
                maxLength={13}
              />
            </div>

            {/* Campo 6: Correo Electrónico */}
            <div style={{ marginBottom: '10px' }}>
              <label style={{ fontSize: '11px', fontWeight: '700', color: '#1C1C1E', display: 'block', marginBottom: '3px' }}>
                Correo Electrónico<span style={{ color: '#DC3545', fontWeight: '700' }}>*</span>
              </label>
              <input
                style={{ width: '100%', height: '38px', borderRadius: '8px', border: '1px solid #DEE2E6', padding: '0 10px', fontSize: '12px' }}
                value={regEmail}
                onChange={(e) => onRegEmailChange(e.target.value)}
                placeholder="tutor@ejemplo.com"
              />
              {regErrors.email && <span style={{ color: '#DC3545', fontSize: '10px' }}>{regErrors.email}</span>}
            </div>

            {/* Campo 7: Contraseña */}
            <div style={{ marginBottom: '10px' }}>
              <label style={{ fontSize: '11px', fontWeight: '700', color: '#1C1C1E', display: 'block', marginBottom: '3px' }}>
                Contraseña (mínimo 6 caracteres)<span style={{ color: '#DC3545', fontWeight: '700' }}>*</span>
              </label>
              <input
                type="password"
                style={{ width: '100%', height: '38px', borderRadius: '8px', border: '1px solid #DEE2E6', padding: '0 10px', fontSize: '12px' }}
                value={regPassword}
                onChange={(e) => onRegPasswordChange(e.target.value)}
                placeholder="Mínimo 6 caracteres"
              />
              {regErrors.password && <span style={{ color: '#DC3545', fontSize: '10px' }}>{regErrors.password}</span>}
            </div>

            {/* Campo 8: Confirmar Contraseña */}
            <div style={{ marginBottom: '14px' }}>
              <label style={{ fontSize: '11px', fontWeight: '700', color: '#1C1C1E', display: 'block', marginBottom: '3px' }}>
                Confirmar Contraseña<span style={{ color: '#DC3545', fontWeight: '700' }}>*</span>
              </label>
              <input
                type="password"
                style={{ width: '100%', height: '38px', borderRadius: '8px', border: '1px solid #DEE2E6', padding: '0 10px', fontSize: '12px' }}
                value={regConfirmPassword}
                onChange={(e) => onRegConfirmPasswordChange(e.target.value)}
                placeholder="Repite tu contraseña"
              />
              {regErrors.confirmPassword && <span style={{ color: '#DC3545', fontSize: '10px' }}>{regErrors.confirmPassword}</span>}
            </div>

            <button
              style={{ width: '100%', height: '44px', borderRadius: '10px', backgroundColor: '#007AFF', color: '#FFF', border: 'none', fontWeight: '700', cursor: 'pointer', marginBottom: '10px' }}
              onClick={onRegisterSubmit}
            >
              Crear Cuenta e Ingresar ➔ Paso 4
            </button>

            {/* Divisor "o" */}
            <div style={{ display: 'flex', alignItems: 'center', margin: '12px 0' }}>
              <div style={{ flex: 1, height: '1px', backgroundColor: '#E9ECEF' }} />
              <span style={{ padding: '0 10px', fontSize: '13px', color: '#8E8E93', fontWeight: '500' }}>o</span>
              <div style={{ flex: 1, height: '1px', backgroundColor: '#E9ECEF' }} />
            </div>

            {/* Botón de Google */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px' }}>
              <button
                type="button"
                onClick={onRegisterSubmit}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  cursor: 'pointer',
                }}
                title="Registrarse con Google"
              >
                <img
                  src="/src/assets/logo/logo_google.png"
                  alt="Google"
                  style={{ width: '200px', height: '44px', objectFit: 'contain' }}
                />
              </button>
            </div>

            <div style={{ textAlign: 'center', paddingTop: '8px' }}>
              <button
                style={{ background: 'none', border: 'none', color: '#8E8E93', fontSize: '12px', cursor: 'pointer' }}
                onClick={() => onTabChange('LOGIN')}
              >
                ¿Ya tienes una cuenta? <strong style={{ color: '#007AFF' }}>Iniciar Sesión</strong>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Sheet Modal: Términos y Condiciones */}
      {showTermsModal && (
        <div
          onClick={() => setShowTermsModal(false)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.55)',
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: '#FFFFFF',
              borderTopLeftRadius: '24px',
              borderTopRightRadius: '24px',
              padding: '16px 20px 24px',
              maxHeight: '82vh',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 -4px 20px rgba(0,0,0,0.2)',
              animation: 'slideUp 0.3s ease-out',
            }}
          >
            <div style={{ width: '44px', height: '5px', backgroundColor: '#D1D5DB', borderRadius: '3px', margin: '0 auto 12px' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
              <h3 style={{ margin: 0, fontSize: '17px', fontWeight: '800', color: '#1C1C1E' }}>📜 Términos y Condiciones</h3>
              <button
                onClick={() => setShowTermsModal(false)}
                style={{ background: 'none', border: 'none', fontSize: '18px', fontWeight: '700', color: '#8E8E93', cursor: 'pointer', padding: '4px' }}
              >
                ✕
              </button>
            </div>
            <span style={{ fontSize: '12px', fontWeight: '600', color: '#007AFF', marginBottom: '10px' }}>
              BA Protege+ • Lotería de la Ciudad de Buenos Aires (LOTBA)
            </span>
            <div style={{ overflowY: 'auto', maxHeight: '55vh', fontSize: '12.5px', color: '#48484A', lineHeight: '1.45', paddingRight: '6px' }}>
              <h4 style={{ margin: '10px 0 4px', fontSize: '13px', color: '#1C1C1E' }}>1. Aceptación del Servicio</h4>
              <p style={{ margin: '0 0 8px' }}>Al crear una cuenta en BA Protege+, aceptas cumplir íntegramente con los presentes Términos y Condiciones. Esta plataforma es provista por el Gobierno de la Ciudad Autónoma de Buenos Aires a través de LOTBA S.E. para la prevención del juego ilegal y la protección de menores.</p>
              <h4 style={{ margin: '10px 0 4px', fontSize: '13px', color: '#1C1C1E' }}>2. Requisito de Mayoría de Edad</h4>
              <p style={{ margin: '0 0 8px' }}>El registro en el Modo Responsable está reservado exclusivamente a padres, madres, tutores legales o adultos responsables mayores de 18 años. Queda estrictamente prohibida la creación de cuentas por menores de edad.</p>
              <h4 style={{ margin: '10px 0 4px', fontSize: '13px', color: '#1C1C1E' }}>3. Uso del Servicio de Filtrado VPN</h4>
              <p style={{ margin: '0 0 8px' }}>La aplicación instala un túnel de filtrado local (VPN) en el dispositivo para bloquear automáticamente solicitudes hacia plataformas de apuestas no autorizadas o clandestinas enumeradas en la lista oficial de LOTBA.</p>
              <h4 style={{ margin: '10px 0 4px', fontSize: '13px', color: '#1C1C1E' }}>4. Protección Anti-Desinstalación</h4>
              <p style={{ margin: '0 0 8px' }}>Con el fin de asegurar la efectividad del control parental, el sistema utiliza permisos de Accesibilidad de Android para prevenir el cierre o desinstalación no autorizada de la aplicación sin la clave PIN del tutor.</p>
              <h4 style={{ margin: '10px 0 4px', fontSize: '13px', color: '#1C1C1E' }}>5. Modificaciones y Actualizaciones</h4>
              <p style={{ margin: '0 0 8px' }}>LOTBA se reserva el derecho de actualizar la lista de dominios bloqueados y las funcionalidades del sistema en cualquier momento para mantener la protección activa.</p>
            </div>
            <button
              onClick={() => setShowTermsModal(false)}
              style={{ marginTop: '14px', width: '100%', height: '44px', borderRadius: '12px', backgroundColor: '#007AFF', color: '#FFF', border: 'none', fontWeight: '700', fontSize: '14px', cursor: 'pointer' }}
            >
              Entendido
            </button>
          </div>
        </div>
      )}

      {/* Bottom Sheet Modal: Políticas de Privacidad */}
      {showPrivacyModal && (
        <div
          onClick={() => setShowPrivacyModal(false)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.55)',
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: '#FFFFFF',
              borderTopLeftRadius: '24px',
              borderTopRightRadius: '24px',
              padding: '16px 20px 24px',
              maxHeight: '82vh',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 -4px 20px rgba(0,0,0,0.2)',
              animation: 'slideUp 0.3s ease-out',
            }}
          >
            <div style={{ width: '44px', height: '5px', backgroundColor: '#D1D5DB', borderRadius: '3px', margin: '0 auto 12px' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
              <h3 style={{ margin: 0, fontSize: '17px', fontWeight: '800', color: '#1C1C1E' }}>🛡️ Políticas de Privacidad</h3>
              <button
                onClick={() => setShowPrivacyModal(false)}
                style={{ background: 'none', border: 'none', fontSize: '18px', fontWeight: '700', color: '#8E8E93', cursor: 'pointer', padding: '4px' }}
              >
                ✕
              </button>
            </div>
            <span style={{ fontSize: '12px', fontWeight: '600', color: '#007AFF', marginBottom: '10px' }}>
              Protección de Datos Personales • Ley N° 25.326
            </span>
            <div style={{ overflowY: 'auto', maxHeight: '55vh', fontSize: '12.5px', color: '#48484A', lineHeight: '1.45', paddingRight: '6px' }}>
              <h4 style={{ margin: '10px 0 4px', fontSize: '13px', color: '#1C1C1E' }}>1. Compromiso de Privacidad</h4>
              <p style={{ margin: '0 0 8px' }}>BA Protege+ garantiza el tratamiento confidencial y seguro de todos los datos personales de acuerdo con la Ley N° 25.326 de Protección de Datos Personales de la República Argentina.</p>
              <h4 style={{ margin: '10px 0 4px', fontSize: '13px', color: '#1C1C1E' }}>2. Información Recolectada</h4>
              <p style={{ margin: '0 0 8px' }}>Recolectamos datos mínimos e indispensables: nombre, apellido, correo electrónico, teléfono, fecha de nacimiento, identificador de dispositivo y registros de intentos de acceso a sitios bloqueados.</p>
              <h4 style={{ margin: '10px 0 4px', fontSize: '13px', color: '#1C1C1E' }}>3. Uso de Datos y Geolocalización</h4>
              <p style={{ margin: '0 0 8px' }}>La información de geolocalización e IP se utiliza únicamente para auditar la seguridad del dispositivo y la vinculación de cuentas. Nunca comercializamos, vendemos ni compartimos datos con anunciantes ni terceros.</p>
              <h4 style={{ margin: '10px 0 4px', fontSize: '13px', color: '#1C1C1E' }}>4. Seguridad e Inmutabilidad</h4>
              <p style={{ margin: '0 0 8px' }}>Toda la comunicación entre el dispositivo y nuestros servidores viaja cifrada con protocolo TLS 1.3/HTTPS. Los registros de auditoría de seguridad se guardan de forma inmutable.</p>
              <h4 style={{ margin: '10px 0 4px', fontSize: '13px', color: '#1C1C1E' }}>5. Derechos del Usuario</h4>
              <p style={{ margin: '0 0 8px' }}>Como titular de los datos, tienes derecho a rectificar, actualizar o solicitar la supresión de tu información personal en cualquier momento escribiendo al soporte oficial de BA Protege+.</p>
            </div>
            <button
              onClick={() => setShowPrivacyModal(false)}
              style={{ marginTop: '14px', width: '100%', height: '44px', borderRadius: '12px', backgroundColor: '#007AFF', color: '#FFF', border: 'none', fontWeight: '700', fontSize: '14px', cursor: 'pointer' }}
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
