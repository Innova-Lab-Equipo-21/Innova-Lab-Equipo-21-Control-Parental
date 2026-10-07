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
}

export const AuthStep: React.FC<AuthStepProps> = ({
  authTab,
  authError,
  authSuccess,
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

          <div style={{ backgroundColor: '#FFF', borderRadius: '16px', padding: '16px', border: '1px solid #E9ECEF' }}>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ fontSize: '12px', fontWeight: '700', color: '#1C1C1E', display: 'block', marginBottom: '4px' }}>Correo Electrónico</label>
              <input
                style={{ width: '100%', height: '40px', borderRadius: '8px', border: '1px solid #DEE2E6', padding: '0 10px', fontSize: '13px' }}
                value={loginEmail}
                onChange={(e) => onLoginEmailChange(e.target.value)}
                placeholder="ejemplo@baprotege.gob.ar"
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <label style={{ fontSize: '12px', fontWeight: '700', color: '#1C1C1E' }}>Contraseña</label>
                <button
                  style={{ background: 'none', border: 'none', color: '#007AFF', fontSize: '11px', fontWeight: '700', cursor: 'pointer' }}
                  onClick={() => onTabChange('RECOVERY')}
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>
              <input
                type="password"
                style={{ width: '100%', height: '40px', borderRadius: '8px', border: '1px solid #DEE2E6', padding: '0 10px', fontSize: '13px' }}
                value={loginPassword}
                onChange={(e) => onLoginPasswordChange(e.target.value)}
                placeholder="••••••••"
              />
            </div>

            <button
              style={{ width: '100%', height: '44px', borderRadius: '10px', backgroundColor: '#007AFF', color: '#FFF', border: 'none', fontWeight: '700', cursor: 'pointer', marginBottom: '10px' }}
              onClick={onLoginSubmit}
            >
              Iniciar Sesión ➔ Paso 4: Permisos
            </button>

            <button
              style={{ width: '100%', height: '36px', borderRadius: '8px', backgroundColor: '#E7F1FF', color: '#0056B3', border: 'none', fontSize: '11px', fontWeight: '700', cursor: 'pointer', marginBottom: '14px' }}
              onClick={onFillDemo}
            >
              ⚡ Cargar Credenciales Demo ➔ Paso 4
            </button>

            <div style={{ textAlign: 'center', paddingTop: '10px', borderTop: '1px solid #E9ECEF' }}>
              <button
                style={{ background: 'none', border: 'none', color: '#8E8E93', fontSize: '12px', cursor: 'pointer' }}
                onClick={() => onTabChange('REGISTER')}
              >
                ¿No tienes una cuenta? <strong style={{ color: '#007AFF' }}>Crear cuenta</strong>
              </button>
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

          <div style={{ backgroundColor: '#FFF', borderRadius: '16px', padding: '16px', border: '1px solid #E9ECEF' }}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '12px', fontWeight: '700', color: '#1C1C1E', display: 'block', marginBottom: '4px' }}>Correo Electrónico Registrado</label>
              <input
                style={{ width: '100%', height: '40px', borderRadius: '8px', border: '1px solid #DEE2E6', padding: '0 10px', fontSize: '13px' }}
                value={recoveryEmail}
                onChange={(e) => onRecoveryEmailChange(e.target.value)}
                placeholder="ejemplo@baprotege.gob.ar"
              />
            </div>

            <button
              style={{ width: '100%', height: '44px', borderRadius: '10px', backgroundColor: '#007AFF', color: '#FFF', border: 'none', fontWeight: '700', cursor: 'pointer', marginBottom: '10px' }}
              onClick={onRecoverySubmit}
            >
              Enviar Instrucciones ➔
            </button>

            <button
              style={{ width: '100%', height: '36px', borderRadius: '8px', backgroundColor: '#E2E3E5', color: '#6C757D', border: 'none', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}
              onClick={() => onTabChange('LOGIN')}
            >
              Volver a Iniciar Sesión
            </button>
          </div>
        </div>
      )}

      {/* VISTA 3: CREAR CUENTA (REGISTRO COMPLETO) */}
      {authTab === 'REGISTER' && (
        <div>
          <div style={{ textAlign: 'center', marginBottom: '14px' }}>
            <span style={{ fontSize: '10px', fontWeight: '800', backgroundColor: '#E7F1FF', color: '#0056B3', padding: '3px 8px', borderRadius: '6px' }}>
              PASO 3A • REGISTRO DE CUENTA
            </span>
            <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#1C1C1E', marginTop: '6px' }}>Crear Cuenta Responsable</h2>
          </div>

          <div style={{ backgroundColor: '#FFF', borderRadius: '16px', padding: '16px', border: '1px solid #E9ECEF' }}>
            <div style={{ marginBottom: '10px' }}>
              <label style={{ fontSize: '11px', fontWeight: '700', color: '#1C1C1E', display: 'block', marginBottom: '3px' }}>Nombre *</label>
              <input
                style={{ width: '100%', height: '38px', borderRadius: '8px', border: '1px solid #DEE2E6', padding: '0 10px', fontSize: '12px' }}
                value={regNombre}
                onChange={(e) => onRegNombreChange(e.target.value)}
                placeholder="Ej. Juan"
              />
              {regErrors.nombre && <span style={{ color: '#DC3545', fontSize: '10px' }}>{regErrors.nombre}</span>}
            </div>

            <div style={{ marginBottom: '10px' }}>
              <label style={{ fontSize: '11px', fontWeight: '700', color: '#1C1C1E', display: 'block', marginBottom: '3px' }}>Apellido *</label>
              <input
                style={{ width: '100%', height: '38px', borderRadius: '8px', border: '1px solid #DEE2E6', padding: '0 10px', fontSize: '12px' }}
                value={regApellido}
                onChange={(e) => onRegApellidoChange(e.target.value)}
                placeholder="Ej. Pérez"
              />
              {regErrors.apellido && <span style={{ color: '#DC3545', fontSize: '10px' }}>{regErrors.apellido}</span>}
            </div>

            <div style={{ marginBottom: '10px' }}>
              <label style={{ fontSize: '11px', fontWeight: '700', color: '#1C1C1E', display: 'block', marginBottom: '3px' }}>Género</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                {(['Masculino', 'Femenino', 'Otro', 'No informado'] as GenderOption[]).map((g) => (
                  <button
                    key={g}
                    type="button"
                    style={{
                      padding: '6px',
                      borderRadius: '6px',
                      border: '1px solid',
                      borderColor: regGenero === g ? '#007AFF' : '#DEE2E6',
                      backgroundColor: regGenero === g ? '#E7F1FF' : '#F8F9FA',
                      color: regGenero === g ? '#0056B3' : '#6C757D',
                      fontSize: '11px',
                      fontWeight: '600',
                      cursor: 'pointer',
                    }}
                    onClick={() => onRegGeneroChange(g)}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: '10px' }}>
              <label style={{ fontSize: '11px', fontWeight: '700', color: '#1C1C1E', display: 'block', marginBottom: '3px' }}>Fecha de Nacimiento</label>
              <input
                style={{
                  width: '100%',
                  height: '38px',
                  borderRadius: '8px',
                  border: regErrors.fechaNacimiento ? '1.5px solid #DC3545' : '1px solid #DEE2E6',
                  backgroundColor: regErrors.fechaNacimiento ? '#FFF8F8' : '#FFFFFF',
                  padding: '0 10px',
                  fontSize: '12px',
                }}
                value={regFechaNacimiento}
                onChange={(e) => onRegFechaNacimientoChange(e.target.value)}
                placeholder="DD/MM/AAAA"
                maxLength={10}
              />
              {regErrors.fechaNacimiento && (
                <span style={{ color: '#DC3545', fontSize: '10px', display: 'block', marginTop: '3px', fontWeight: '600' }}>
                  {regErrors.fechaNacimiento}
                </span>
              )}
            </div>

            <div style={{ marginBottom: '10px' }}>
              <label style={{ fontSize: '11px', fontWeight: '700', color: '#1C1C1E', display: 'block', marginBottom: '3px' }}>Teléfono</label>
              <input
                style={{ width: '100%', height: '38px', borderRadius: '8px', border: '1px solid #DEE2E6', padding: '0 10px', fontSize: '12px' }}
                value={regTelefono}
                onChange={(e) => onRegTelefonoChange(e.target.value)}
                placeholder="11 2345-6789"
                maxLength={13}
              />
            </div>

            <div style={{ marginBottom: '10px' }}>
              <label style={{ fontSize: '11px', fontWeight: '700', color: '#1C1C1E', display: 'block', marginBottom: '3px' }}>Correo Electrónico *</label>
              <input
                style={{ width: '100%', height: '38px', borderRadius: '8px', border: '1px solid #DEE2E6', padding: '0 10px', fontSize: '12px' }}
                value={regEmail}
                onChange={(e) => onRegEmailChange(e.target.value)}
                placeholder="tutor@ejemplo.com"
              />
              {regErrors.email && <span style={{ color: '#DC3545', fontSize: '10px' }}>{regErrors.email}</span>}
            </div>

            <div style={{ marginBottom: '10px' }}>
              <label style={{ fontSize: '11px', fontWeight: '700', color: '#1C1C1E', display: 'block', marginBottom: '3px' }}>Contraseña *</label>
              <input
                type="password"
                style={{ width: '100%', height: '38px', borderRadius: '8px', border: '1px solid #DEE2E6', padding: '0 10px', fontSize: '12px' }}
                value={regPassword}
                onChange={(e) => onRegPasswordChange(e.target.value)}
                placeholder="Mínimo 6 caracteres"
              />
              {regErrors.password && <span style={{ color: '#DC3545', fontSize: '10px' }}>{regErrors.password}</span>}
            </div>

            <div style={{ marginBottom: '14px' }}>
              <label style={{ fontSize: '11px', fontWeight: '700', color: '#1C1C1E', display: 'block', marginBottom: '3px' }}>Confirmar Contraseña *</label>
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

            <div style={{ textAlign: 'center', paddingTop: '8px', borderTop: '1px solid #E9ECEF' }}>
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
    </div>
  );
};
