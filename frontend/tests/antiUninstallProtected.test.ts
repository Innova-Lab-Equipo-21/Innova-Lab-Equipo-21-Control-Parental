// ==============================================================================
// Proyecto: BA Protege+
// Componente: Tests Automatizados — Reglas Globales y Desactivación de Antidesinstalación
// Archivo: tests/antiUninstallProtected.test.ts
// Descripción: Suite de tests que valida la replicación de Reglas de protección global
//              en Cuenta de Menor y Adulto, exclusión de Autoprotección, acoplamiento
//              obligatorio de Antidesinstalación cuando Autoprotección está activa, y el flujo
//              estricto de seguridad para desactivar Antidesinstalación mediante código OTP.
// ==============================================================================

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import path from 'path';
import { apiService } from '../src/services/api.service';

describe('Reglas de protección global en Modos Protegidos (Menor y Adulto)', () => {
  const menorCuentaPath = path.resolve(
    __dirname,
    '../src/components/dashboard/protected/menor/MenorCuentaSection.tsx'
  );
  const adultoCuentaPath = path.resolve(
    __dirname,
    '../src/components/dashboard/protected/adulto/AdultoCuentaSection.tsx'
  );
  const globalRulesPath = path.resolve(
    __dirname,
    '../src/components/dashboard/cuenta/GlobalRulesSection.tsx'
  );
  const modalPath = path.resolve(
    __dirname,
    '../src/components/dashboard/cuenta/AntiUninstallCodeModal.tsx'
  );
  const protectedScreenPath = path.resolve(
    __dirname,
    '../src/screens/ProtectedDeviceScreen.tsx'
  );
  const parentDashboardPath = path.resolve(
    __dirname,
    '../src/screens/ParentDashboardScreen.tsx'
  );

  test('MenorCuentaSection y AdultoCuentaSection replican GlobalRulesSection con showAutoproteccion={false}', () => {
    const menorSource = fs.readFileSync(menorCuentaPath, 'utf8');
    const adultoSource = fs.readFileSync(adultoCuentaPath, 'utf8');

    for (const source of [menorSource, adultoSource]) {
      // 1. Debe incluir GlobalRulesSection
      assert.equal(source.includes('GlobalRulesSection'), true);

      // 2. No debe incluir la opción Autoprotección
      assert.equal(source.includes('showAutoproteccion={false}'), true);

      // 3. Debe recibir los manejadores para Antidesinstalación y Permisos
      assert.equal(source.includes('ruleUninstallProtection'), true);
      assert.equal(source.includes('onToggleUninstallProtection'), true);
      assert.equal(source.includes('onOpenPermissions'), true);
    }
  });

  test('GlobalRulesSection omite el switch de Autoprotección cuando showAutoproteccion es false', () => {
    const rulesSource = fs.readFileSync(globalRulesPath, 'utf8');

    // Autoprotección debe estar condicionada a showAutoproteccion
    assert.equal(rulesSource.includes('{showAutoproteccion && ('), true);

    // Bloqueo sitios LotBA debe ser inmutable y mostrar FeedbackModal
    assert.equal(rulesSource.includes('Bloqueo sitios LotBA'), true);
    assert.equal(rulesSource.includes('Protección obligatoria'), true);

    // Antidesinstalación debe estar disponible
    assert.equal(rulesSource.includes('Antidesinstalación'), true);
  });

  test('GlobalRulesSection bloquea la desactivación de Antidesinstalación cuando Autoprotección está activa', () => {
    const rulesSource = fs.readFileSync(globalRulesPath, 'utf8');

    // Muestra valor true forzado si isAutoproteccionActive es true
    assert.equal(rulesSource.includes('value={isAutoproteccionActive ? true : ruleUninstallProtection}'), true);

    // Deshabilita el switch de Antidesinstalación si isAutoproteccionActive es true
    assert.equal(rulesSource.includes('disabled={isAutoproteccionActive}'), true);

    // Muestra el modal de aviso de Antidesinstalación protegida
    assert.equal(rulesSource.includes('Antidesinstalación protegida'), true);
    assert.equal(
      rulesSource.includes('La protección antidesinstalación no puede desactivarse mientras la Autoprotección de 24 horas esté activa.'),
      true
    );
  });

  test('ParentDashboardScreen activa automáticamente Antidesinstalación al habilitar Autoprotección y rechaza su desactivación', () => {
    const parentSource = fs.readFileSync(parentDashboardPath, 'utf8');

    // 1. Al activar autoprotección, activa automáticamente antidesinstalación
    assert.equal(parentSource.includes('setRuleUninstallProtection(true)'), true);
    assert.equal(parentSource.includes('protectionService.setAntiUninstallEnabled(true)'), true);

    // 2. Al intentar desactivar antidesinstalación con autoprotección activa, lo rechaza e informa
    assert.equal(parentSource.includes('if (isAutoproteccionActive && !val)'), true);
    assert.equal(parentSource.includes('Antidesinstalación protegida'), true);
  });

  test('ProtectedDeviceScreen integra AntiUninstallCodeModal y controla la desactivación protegida', () => {
    const screenSource = fs.readFileSync(protectedScreenPath, 'utf8');

    // Debe importar e instanciar AntiUninstallCodeModal
    assert.equal(screenSource.includes('AntiUninstallCodeModal'), true);
    assert.equal(screenSource.includes('handleToggleUninstallProtection'), true);
    assert.equal(screenSource.includes('handleOpenAntiUninstallModal'), true);
    assert.equal(screenSource.includes('handleCloseAntiUninstallModal'), true);
    assert.equal(screenSource.includes('handleConfirmAntiUninstallCode'), true);
  });
});

describe('Flujo de Desactivación de Antidesinstalación con Código OTP de 6 Dígitos', () => {
  const testDeviceUuid = `device-test-antiuninstall-${Date.now()}`;

  test('1. Al solicitar desactivar, genera un código de 6 dígitos y retorna el correo enmascarado del responsable', async () => {
    const res = await apiService.requestAntiUninstallCode(testDeviceUuid);

    assert.equal(res.success, true);
    assert.ok(res.code, 'Debe generar un código');
    assert.equal(res.code?.length, 6, 'El código debe tener exactamente 6 dígitos');
    assert.match(res.code!, /^\d{6}$/, 'El código debe ser numérico');
    assert.ok(res.maskedEmail, 'Debe retornar el correo enmascarado del responsable');
    assert.match(res.maskedEmail, /^.+@.+\..+$/, 'El correo enmascarado debe tener formato de email');
  });

  test('2. Verifica exitosamente cuando se ingresa el código correcto de 6 dígitos', async () => {
    const res = await apiService.requestAntiUninstallCode(testDeviceUuid);
    const generatedCode = res.code!;

    const verifyRes = await apiService.verifyAntiUninstallCode(testDeviceUuid, generatedCode);
    assert.equal(verifyRes.success, true);
  });

  test('3. Rechaza la verificación cuando se ingresa un código erróneo', async () => {
    await apiService.requestAntiUninstallCode(testDeviceUuid);

    await assert.rejects(
      async () => {
        await apiService.verifyAntiUninstallCode(testDeviceUuid, '000000');
      },
      /incorrecto/i
    );
  });

  test('4. Al cerrar el modal, el código activo es invalidado', async () => {
    const res = await apiService.requestAntiUninstallCode(testDeviceUuid);
    const validCode = res.code!;

    // Usuario cierra el modal
    await apiService.invalidateAntiUninstallCode(testDeviceUuid);

    // Intentar verificar el código previo debe fallar porque ya fue invalidado
    await assert.rejects(
      async () => {
        await apiService.verifyAntiUninstallCode(testDeviceUuid, validCode);
      },
      /no hay un código activo|invalidado|expirado/i
    );
  });

  test('5. Si el usuario vuelve a abrir el modal, se genera un código nuevo y el código anterior queda invalidado', async () => {
    // Primera apertura del modal
    const firstRequest = await apiService.requestAntiUninstallCode(testDeviceUuid);
    const firstCode = firstRequest.code!;

    // Segunda apertura del modal (ej. cerró y reabrió)
    const secondRequest = await apiService.requestAntiUninstallCode(testDeviceUuid);
    const secondCode = secondRequest.code!;

    // El primer código debe ser rechazado
    await assert.rejects(
      async () => {
        await apiService.verifyAntiUninstallCode(testDeviceUuid, firstCode);
      },
      /incorrecto/i
    );

    // El segundo código debe ser aceptado
    const verifySecond = await apiService.verifyAntiUninstallCode(testDeviceUuid, secondCode);
    assert.equal(verifySecond.success, true);
  });
});
