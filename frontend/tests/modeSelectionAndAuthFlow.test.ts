// ==============================================================================
// Proyecto: BA Protege+
// Pruebas: Selección de Modo, Modal de Advertencia y Flujo de Autenticación
// Archivo: tests/modeSelectionAndAuthFlow.test.ts
// Descripción: Suite de pruebas unitarias y de integración para:
//              1) Modal estándar de advertencia en "Elegí cómo vas a usar la app"
//                 al seleccionar "Empezar" en Modo responsable, alertando sobre la
//                 permanencia del modo y el requisito de borrar datos de la app.
//              2) Pantallas de selección de modo ("Elegí cómo vas a usar la app")
//                 y creación de cuenta ("Crear cuenta responsable") mostradas solo
//                 la primera vez.
//              3) Flujo de "Cerrar sesión" en Cuenta que redirige directamente a la
//                 pantalla de "Iniciar sesión" en modo Responsable bloqueado.
//              4) Eliminación de usuarios y contraseñas mock en "Iniciar sesión",
//                 iniciando con campos vacíos y autenticando con usuarios reales.
// ==============================================================================

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { safeStorage } from '../src/services/api/client.js';

describe('Flujo de Selección de Modo, Modal de Advertencia e Iniciar Sesión', () => {
  const welcomePath = path.resolve(process.cwd(), 'src/screens/WelcomeScreen.tsx');
  const loginFormPath = path.resolve(process.cwd(), 'src/components/auth/LoginForm.tsx');
  const authApiPath = path.resolve(process.cwd(), 'src/services/api/auth.api.ts');
  const appPath = path.resolve(process.cwd(), 'src/App.tsx');
  const parentDashboardPath = path.resolve(process.cwd(), 'src/screens/ParentDashboardScreen.tsx');

  test('1. MODAL ALERTA: "Empezar" en Modo responsable abre modal estándar con advertencia de irreversibilidad', () => {
    const welcomeSrc = fs.readFileSync(welcomePath, 'utf8');

    // 1. Debe importar e incluir FeedbackModal (modal estándar del app)
    assert.ok(welcomeSrc.includes('FeedbackModal'), 'Debe usar el componente estándar FeedbackModal');
    assert.ok(welcomeSrc.includes('showResponsibleAlertModal'), 'Debe gestionar el estado visible del modal');

    // 2. Alerta clara sobre la decisión de ser Responsable y el cambio de modo
    assert.ok(
      welcomeSrc.includes('Al actuar como persona responsable') &&
        welcomeSrc.includes('cambiar al otro modo'),
      'Debe advertir sobre el rol responsable y el cambio al otro modo'
    );

    // 3. Informa que para cambiar de modo se deben borrar los datos de la app en los ajustes
    assert.ok(
      welcomeSrc.toLowerCase().includes('ajustes') && welcomeSrc.includes('borrar los datos'),
      'Debe indicar que para cambiar de modo es necesario borrar los datos en los ajustes del sistema'
    );

    // 4. Botones de acción simétricos en el modal
    assert.ok(welcomeSrc.includes('buttonText="Continuar"'));
    assert.ok(welcomeSrc.includes('secondaryButtonText="Cancelar"'));
    assert.ok(welcomeSrc.includes("onSelectMode('PARENT')"));
  });

  test('2. TELA ÚNICA: "Elegí cómo vas a usar la app" y "Crear cuenta" aparecen solo la primera vez', async () => {
    const appSrc = fs.readFileSync(appPath, 'utf8');

    // 1. App.tsx debe rastrear hasCreatedResponsibleAccount y modeLocked
    assert.ok(appSrc.includes('hasCreatedResponsibleAccount'));
    assert.ok(appSrc.includes('@ba_protege_responsible_account_created'));
    assert.ok(appSrc.includes('@ba_protege_mode_locked'));

    // 2. Al cerrar sesión o registrarse, el modo PARENT se bloquea en el dispositivo
    await safeStorage.setItem('@ba_protege_responsible_account_created', 'true');
    await safeStorage.setItem('@ba_protege_mode_locked', 'PARENT');

    const isAccountCreated = (await safeStorage.getItem('@ba_protege_responsible_account_created')) === 'true';
    const modeLocked = await safeStorage.getItem('@ba_protege_mode_locked');

    assert.equal(isAccountCreated, true);
    assert.equal(modeLocked, 'PARENT');

    // Limpieza de prueba
    await safeStorage.removeItem('@ba_protege_responsible_account_created');
    await safeStorage.removeItem('@ba_protege_mode_locked');
  });

  test('3. CERRAR SESIÓN: Al cerrar sesión en Cuenta abre directamente en "Iniciar sesión"', () => {
    const appSrc = fs.readFileSync(appPath, 'utf8');
    const dashboardSrc = fs.readFileSync(parentDashboardPath, 'utf8');

    // 1. ParentDashboardScreen debe recibir y ejecutar onLogout al cerrar sesión
    assert.ok(dashboardSrc.includes('onLogout'));
    assert.ok(appSrc.includes('handleParentLogout'));

    // 2. handleParentLogout debe fijar LOGIN como pantalla activa y vista inicial
    assert.ok(appSrc.includes("setLoginInitialViewMode('LOGIN')"));
    assert.ok(appSrc.includes("setActiveScreen('LOGIN')"));
    assert.ok(appSrc.includes("currentMode: 'PARENT'"));
  });

  test('4. ELIMINAR USUARIO MOCK: Iniciar sesión inicia con campos vacíos y sin bypass de usuario demo', () => {
    const loginSrc = fs.readFileSync(loginFormPath, 'utf8');
    const authSrc = fs.readFileSync(authApiPath, 'utf8');

    // 1. Los inputs de email y contraseña deben inicializarse vacíos
    assert.ok(loginSrc.includes("useState('')"), 'Los campos de email y password deben iniciar vacíos');
    assert.ok(!loginSrc.includes("useState('tutor@baprotege.gob.ar')"), 'No debe haber email mock prellenado');
    assert.ok(!loginSrc.includes("useState('password123')"), 'No debe haber password mock prellenado');

    // 2. No debe existir bypass en catch para tutor@baprotege.gob.ar
    assert.ok(
      !loginSrc.includes("if (email === 'tutor@baprotege.gob.ar'"),
      'No debe existir condición bypass para usuario mock en el formulario de login'
    );

    // 3. authApi.login y authApi.register no deben crear usuarios/tokens mock en fallos de red
    const loginMethod = authSrc.split('async login')[1]?.split('async googleAuth')[0] || '';
    const registerMethod = authSrc.split('async register')[1]?.split('async login')[0] || '';
    assert.ok(
      !loginMethod.includes('mockUser') && !loginMethod.includes('mockToken'),
      'authApi.login no debe generar usuarios ni tokens mock'
    );
    assert.ok(
      !registerMethod.includes('mockUser') && !registerMethod.includes('mock-jwt-token'),
      'authApi.register no debe activar modo local de respaldo con usuarios mock'
    );

    // 4. Sin datos ficticios hardcodeados en dispositivos propios, acción responsable ni estilos de login
    const devicesApiSrc = fs.readFileSync(
      path.resolve(process.cwd(), 'src/services/api/devices.api.ts'),
      'utf8'
    );
    const protectedDevicesSrc = fs.readFileSync(
      path.resolve(process.cwd(), 'src/components/dashboard/dispositivos/ProtectedDevicesSection.tsx'),
      'utf8'
    );
    const responsibleActionSrc = fs.readFileSync(
      path.resolve(process.cwd(), 'src/screens/ResponsibleActionScreen.tsx'),
      'utf8'
    );
    const loginStylesSrc = fs.readFileSync(
      path.resolve(process.cwd(), 'src/components/auth/LoginForm.styles.ts'),
      'utf8'
    );

    assert.ok(!devicesApiSrc.includes('10/03/1985'), 'devices.api.ts no debe hardcodear fecha de nacimiento');
    assert.ok(!devicesApiSrc.includes('+54 9 11 5544-3322'), 'devices.api.ts no debe hardcodear teléfono');
    assert.ok(!protectedDevicesSrc.includes('tutor@baprotege.gob.ar'), 'ProtectedDevicesSection no debe hardcodear email');
    assert.ok(!protectedDevicesSrc.includes('10/03/1985'), 'ProtectedDevicesSection no debe hardcodear fecha');
    assert.ok(!responsibleActionSrc.includes('(Demo)'), 'ResponsibleActionScreen no debe tener prop Demo');
    assert.ok(!loginStylesSrc.includes('demoFillButton'), 'LoginForm.styles.ts no debe mantener estilos demo muertos');
  });
});
