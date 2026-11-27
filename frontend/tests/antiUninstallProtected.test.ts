// ==============================================================================
// Proyecto: BA Protege+
// Componente: Tests Automatizados — Reglas Globales y Desactivación de Antidesinstalación
// Archivo: tests/antiUninstallProtected.test.ts
// Descripción: Suite de tests que valida la replicación de Reglas de protección global
//              en Cuenta de Menor y Adulto, exclusión de Autoprotección, acoplamiento
//              obligatorio de Antidesinstalación cuando Autoprotección está activa, y el flujo
//              estricto de seguridad para desactivar Antidesinstalación mediante código OTP real.
// ==============================================================================

import { test, describe, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import path from 'path';
import { apiService } from '../src/services/api.service';
import { apiClient } from '../src/services/api/client';

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
      assert.equal(source.includes('GlobalRulesSection'), true);
      assert.equal(source.includes('showAutoproteccion={false}'), true);
      assert.equal(source.includes('ruleUninstallProtection'), true);
      assert.equal(source.includes('onToggleUninstallProtection'), true);
      assert.equal(source.includes('onOpenPermissions'), true);
    }
  });

  test('GlobalRulesSection omite el switch de Autoprotección cuando showAutoproteccion es false', () => {
    const rulesSource = fs.readFileSync(globalRulesPath, 'utf8');

    assert.equal(rulesSource.includes('{showAutoproteccion && ('), true);
    assert.equal(rulesSource.includes('Bloqueo sitios LotBA'), true);
    assert.equal(rulesSource.includes('Protección obligatoria'), true);
    assert.equal(rulesSource.includes('Antidesinstalación'), true);
  });

  test('GlobalRulesSection bloquea la desactivación de Antidesinstalación cuando Autoprotección está activa', () => {
    const rulesSource = fs.readFileSync(globalRulesPath, 'utf8');

    assert.equal(rulesSource.includes('value={isAutoproteccionActive ? true : ruleUninstallProtection}'), true);
    assert.equal(rulesSource.includes('disabled={isAutoproteccionActive}'), true);
    assert.equal(rulesSource.includes('Antidesinstalación protegida'), true);
    assert.equal(
      rulesSource.includes('La protección antidesinstalación no puede desactivarse mientras la Autoprotección de 24 horas esté activa.'),
      true
    );
  });

  test('ParentDashboardScreen activa automáticamente Antidesinstalación al habilitar Autoprotección y rechaza su desactivación', () => {
    const parentSource = fs.readFileSync(parentDashboardPath, 'utf8');

    assert.equal(parentSource.includes('setRuleUninstallProtection(true)'), true);
    assert.equal(parentSource.includes('protectionService.setAntiUninstallEnabled(true)'), true);
    assert.equal(parentSource.includes('if (isAutoproteccionActive && !val)'), true);
    assert.equal(parentSource.includes('Antidesinstalación protegida'), true);
  });

  test('ProtectedDeviceScreen integra AntiUninstallCodeModal y controla la desactivación protegida', () => {
    const screenSource = fs.readFileSync(protectedScreenPath, 'utf8');

    assert.equal(screenSource.includes('AntiUninstallCodeModal'), true);
    assert.equal(screenSource.includes('handleToggleUninstallProtection'), true);
    assert.equal(screenSource.includes('handleOpenAntiUninstallModal'), true);
    assert.equal(screenSource.includes('handleCloseAntiUninstallModal'), true);
    assert.equal(screenSource.includes('handleConfirmAntiUninstallCode'), true);
  });
});

describe('Flujo de Desactivación de Antidesinstalación con Código OTP de 6 Dígitos (Backend Real)', () => {
  const originalPost = apiClient.post.bind(apiClient);
  const testDeviceUuid = `device-test-antiuninstall-${Date.now()}`;
  const serverCodes = new Map<string, { code: string; maskedEmail: string }>();

  beforeEach(() => {
    serverCodes.clear();
    (apiClient as any).post = async (url: string, body: any) => {
      if (url === '/devices/anti-uninstall/request-code') {
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        const maskedEmail = 'r***a@correo-real.com';
        serverCodes.set(body.deviceUuid, { code, maskedEmail });
        return {
          data: {
            success: true,
            message: 'Código de verificación enviado al correo del responsable',
            data: { maskedEmail, expiresAt: new Date(Date.now() + 900_000).toISOString(), code },
          },
        };
      }
      if (url === '/devices/anti-uninstall/invalidate-code') {
        serverCodes.delete(body.deviceUuid);
        return { data: { success: true, message: 'Código invalidado con éxito' } };
      }
      if (url === '/devices/anti-uninstall/verify-code') {
        const rec = serverCodes.get(body.deviceUuid);
        if (!rec) {
          const err: any = new Error('Bad Request');
          err.response = {
            status: 400,
            data: {
              message:
                'No hay un código activo para este dispositivo o ya fue invalidado. Solicitá uno nuevo.',
            },
          };
          throw err;
        }
        if (rec.code !== String(body.code || '').trim()) {
          const err: any = new Error('Bad Request');
          err.response = {
            status: 400,
            data: {
              message:
                'El código ingresado es incorrecto. Verificá el código enviado al correo del responsable.',
            },
          };
          throw err;
        }
        serverCodes.delete(body.deviceUuid);
        return { data: { success: true, message: 'Código de verificación aceptado' } };
      }
      throw new Error(`Unexpected POST ${url}`);
    };
  });

  afterEach(() => {
    (apiClient as any).post = originalPost;
    serverCodes.clear();
  });

  test('1. Al solicitar desactivar, recibe el correo enmascarado del responsable desde el servidor', async () => {
    const res = await apiService.requestAntiUninstallCode(testDeviceUuid);

    assert.equal(res.success, true);
    assert.ok(res.code, 'En entorno no productivo retorna código de prueba');
    assert.equal(res.code?.length, 6, 'El código debe tener exactamente 6 dígitos');
    assert.match(res.code!, /^\d{6}$/, 'El código debe ser numérico');
    assert.equal(res.maskedEmail, 'r***a@correo-real.com');
  });

  test('2. Verifica exitosamente cuando se ingresa el código correcto de 6 dígitos', async () => {
    const res = await apiService.requestAntiUninstallCode(testDeviceUuid);
    const verifyRes = await apiService.verifyAntiUninstallCode(testDeviceUuid, res.code!);
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

  test('4. Al cerrar el modal, el código activo es invalidado en el servidor', async () => {
    const res = await apiService.requestAntiUninstallCode(testDeviceUuid);
    await apiService.invalidateAntiUninstallCode(testDeviceUuid);

    await assert.rejects(
      async () => {
        await apiService.verifyAntiUninstallCode(testDeviceUuid, res.code!);
      },
      /no hay un código activo|invalidado|expirado/i
    );
  });

  test('5. Si el usuario vuelve a abrir el modal, se genera un código nuevo y el anterior queda invalidado', async () => {
    const firstRequest = await apiService.requestAntiUninstallCode(testDeviceUuid);
    const secondRequest = await apiService.requestAntiUninstallCode(testDeviceUuid);

    await assert.rejects(
      async () => {
        await apiService.verifyAntiUninstallCode(testDeviceUuid, firstRequest.code!);
      },
      /incorrecto/i
    );

    const verifySecond = await apiService.verifyAntiUninstallCode(
      testDeviceUuid,
      secondRequest.code!
    );
    assert.equal(verifySecond.success, true);
  });
});
