// ==============================================================================
// Proyecto: BA Protege+
// Componente: Tests Automatizados — Persistencia Completa de Sitios y Apps
// Archivo: tests/sitesAndAppsPersistenceFull.test.ts
// Descripción: Suite de pruebas automatizadas que verifica la persistencia de datos
//              para las 10 funcionalidades clave de Sitios y Apps:
//              1. Autoprotección (Autocontrol del tutor)
//              2. Bloquear sitio web
//              3. Bloquear aplicación
//              4. Editar sitio bloqueado
//              5. Editar aplicación bloqueada
//              6. Límite de tiempo diario (Presets: 30m, 1h, 2h, 5h, personalizado y por dispositivo)
//              7. Eliminar sitio bloqueado
//              8. Eliminar aplicación bloqueada
//              9. Pausar y Activar bloqueo individual
//              10. Selección múltiple (Pausar y Eliminar en lote)
// ==============================================================================

import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { apiService } from '../src/services/api.service';
import { selfControlApi } from '../src/services/api/selfControl.api';
import { installBlocklistApiStub } from './helpers/blocklistApiStub.js';

describe('Pruebas de Persistencia — Sitios y Apps', () => {
  let stub: ReturnType<typeof installBlocklistApiStub>;

  before(async () => {
    stub = installBlocklistApiStub();
    await stub.reset();
  });

  after(() => {
    stub.restore();
  });

  const timestamp = Date.now();
  let createdSiteId: string = '';
  let createdAppId: string = '';

  // --------------------------------------------------------------------------
  // 1. Autoprotección (Autocontrol del Tutor)
  // --------------------------------------------------------------------------
  test('1. Autoprotección — Activa el temporizador de 24h, calcula tiempo y lo persiste', async () => {
    // Limpieza e inicio
    await selfControlApi.resetSelfControl();
    const initialStatus = await selfControlApi.getSelfControlStatus();
    assert.equal(initialStatus.active, false);
    assert.equal(initialStatus.status, 'INACTIVE');

    // Activar Autoprotección
    const activeStatus = await selfControlApi.enableSelfControl();
    assert.equal(activeStatus.active, true);
    assert.equal(activeStatus.status, 'ACTIVE_LOCKED');
    assert.equal(activeStatus.canDisable, false, 'No debe permitir desactivación antes de las 24h');
    assert.ok(activeStatus.remainingHours >= 23, 'Debe indicar aproximadamente 24 horas restantes');

    // Reconsultar estado persistido
    const rechecked = await selfControlApi.getSelfControlStatus();
    assert.equal(rechecked.active, true);
    assert.equal(rechecked.canDisable, false);

    // Reiniciar Autoprotección (estado servidor + caché local)
    const resetStatus = await selfControlApi.disableSelfControl();
    assert.equal(resetStatus.active, false);
    assert.equal(resetStatus.status, 'INACTIVE');
  });

  // --------------------------------------------------------------------------
  // 2. Bloquear Sitio Web
  // --------------------------------------------------------------------------
  test('2. Bloquear sitio web — Agrega un nuevo dominio web y lo persiste en la lista', async () => {
    const domainName = `casino-test-${timestamp}.bet`;
    const res = await apiService.addCustomBlockedSite(domainName, 'Apuestas', true, ['self']);

    assert.ok(res.success);
    const customList = await apiService.getCustomBlocklist();
    const found = customList.data.domains.find((s) => s.domain === domainName);
    assert.ok(found, 'El sitio web creado debe existir en la persistencia');
    assert.equal(found?.category, 'Apuestas');
    assert.equal(found?.applyToAll, true);
    assert.equal(found?.isActive, true);

    createdSiteId = found!.id;
  });

  // --------------------------------------------------------------------------
  // 3. Bloquear Aplicación
  // --------------------------------------------------------------------------
  test('3. Bloquear aplicación — Agrega una nueva app con package y límites por dispositivo', async () => {
    const appName = `Bet365 Test ${timestamp}`;
    const pkgName = `com.bet365.test${timestamp}`;
    const res = await apiService.addCustomBlockedApp(
      appName,
      pkgName,
      'Apuestas',
      true,
      ['self'],
      60,
      { self: 60 }
    );

    assert.ok(res.success);
    const customList = await apiService.getCustomBlocklist();
    const found = customList.data.apps.find((a) => a.packageName === pkgName || a.appName === appName);
    assert.ok(found, 'La aplicación creada debe existir en la persistencia');
    assert.equal(found?.appName, appName);
    assert.equal(found?.category, 'Apuestas');
    assert.equal(found?.isActive, true);

    createdAppId = found!.id;
  });

  // --------------------------------------------------------------------------
  // 4. Editar Sitio Bloqueado
  // --------------------------------------------------------------------------
  test('4. Editar sitio bloqueado — Modifica dominio, categoría y asignación de dispositivos', async () => {
    assert.ok(createdSiteId, 'Debe existir un sitio creado');

    const editedDomain = `casino-editado-${timestamp}.bet`;
    const editRes = await apiService.updateCustomBlockedSite(
      createdSiteId,
      {
        domain: editedDomain,
        category: 'Juegos',
        applyToAll: false,
        deviceIds: ['dev-1'],
      }
    );

    assert.ok(editRes.success);
    const customList = await apiService.getCustomBlocklist();
    const found = customList.data.domains.find((s) => s.id === createdSiteId);
    assert.ok(found);
    assert.equal(found?.domain, editedDomain);
    assert.equal(found?.category, 'Juegos');
    assert.equal(found?.applyToAll, false);
    assert.deepEqual(found?.deviceIds, ['dev-1']);
  });

  // --------------------------------------------------------------------------
  // 5. Editar Aplicación Bloqueada
  // --------------------------------------------------------------------------
  test('5. Editar aplicación bloqueada — Modifica nombre, categoría y límites diarios', async () => {
    assert.ok(createdAppId, 'Debe existir una app creada');

    const editedAppName = `Bet365 Editada ${timestamp}`;
    const editRes = await apiService.updateCustomBlockedApp(
      createdAppId,
      {
        appName: editedAppName,
        category: 'Juegos',
        applyToAll: false,
        deviceIds: ['dev-1'],
        dailyLimitMinutes: 120,
        deviceLimits: { 'dev-1': 120 },
      }
    );

    assert.ok(editRes.success);
    const customList = await apiService.getCustomBlocklist();
    const found = customList.data.apps.find((a) => a.id === createdAppId);
    assert.ok(found);
    assert.equal(found?.appName, editedAppName);
    assert.equal(found?.category, 'Juegos');
    assert.equal(found?.applyToAll, false);
    assert.deepEqual(found?.deviceIds, ['dev-1']);
  });

  // --------------------------------------------------------------------------
  // 6. Límite de Tiempo Diario (Presets: 30m, 1h, 2h, 5h, personalizado y por dispositivo)
  // --------------------------------------------------------------------------
  test('6. Límite de tiempo diario — Persiste presets (30 min, 1h, 2h, 5h, bloqueo total) y mapa por dispositivo', async () => {
    assert.ok(createdAppId, 'Debe existir una app creada');

    // 1. Probar preset 30 min (30 minutos)
    await apiService.updateCustomBlockedApp(createdAppId, {
      dailyLimitMinutes: 30,
    });
    let customList = await apiService.getCustomBlocklist();
    let app = customList.data.apps.find((a) => a.id === createdAppId);
    assert.equal(app?.dailyLimitMinutes, 30);

    // 2. Probar preset 2 horas (120 minutos)
    await apiService.updateCustomBlockedApp(createdAppId, {
      dailyLimitMinutes: 120,
    });
    customList = await apiService.getCustomBlocklist();
    app = customList.data.apps.find((a) => a.id === createdAppId);
    assert.equal(app?.dailyLimitMinutes, 120);

    // 3. Probar mapa de límites personalizados por dispositivo individual
    const customDeviceLimits = {
      self: 30, // Mi dispositivo: 30 min
      'dev-mateo': 60, // Samsung Mateo: 1 hora
      'dev-sofia': 120, // Motorola Sofía: 2 horas
    };
    await apiService.updateCustomBlockedApp(createdAppId, {
      deviceLimits: customDeviceLimits,
    });
    customList = await apiService.getCustomBlocklist();
    app = customList.data.apps.find((a) => a.id === createdAppId);
    assert.deepEqual(app?.deviceLimits, customDeviceLimits);
    assert.equal(app?.deviceLimits?.['self'], 30);
    assert.equal(app?.deviceLimits?.['dev-mateo'], 60);
    assert.equal(app?.deviceLimits?.['dev-sofia'], 120);

    // 4. Volver a Bloqueo Total (undefined)
    await apiService.updateCustomBlockedApp(createdAppId, {
      dailyLimitMinutes: undefined,
    });
    customList = await apiService.getCustomBlocklist();
    app = customList.data.apps.find((a) => a.id === createdAppId);
    assert.equal(app?.dailyLimitMinutes, undefined, 'Debe retornar a Bloqueo Total');
  });

  // --------------------------------------------------------------------------
  // 8. Pausar y Activar Bloqueo Individual
  // --------------------------------------------------------------------------
  test('8. Pausar y Activar — Alterna el estado isActive individual de sitios y apps', async () => {
    assert.ok(createdSiteId && createdAppId);

    // Pausar sitio
    await apiService.updateCustomBlockedSite(createdSiteId, { isActive: false });
    let customList = await apiService.getCustomBlocklist();
    let site = customList.data.domains.find((s) => s.id === createdSiteId);
    assert.equal(site?.isActive, false, 'El sitio debe quedar pausado');

    // Activar sitio
    await apiService.updateCustomBlockedSite(createdSiteId, { isActive: true });
    customList = await apiService.getCustomBlocklist();
    site = customList.data.domains.find((s) => s.id === createdSiteId);
    assert.equal(site?.isActive, true, 'El sitio debe quedar activo nuevamente');

    // Pausar app
    await apiService.updateCustomBlockedApp(createdAppId, { isActive: false });
    customList = await apiService.getCustomBlocklist();
    let app = customList.data.apps.find((a) => a.id === createdAppId);
    assert.equal(app?.isActive, false, 'La app debe quedar pausada');

    // Activar app
    await apiService.updateCustomBlockedApp(createdAppId, { isActive: true });
    customList = await apiService.getCustomBlocklist();
    app = customList.data.apps.find((a) => a.id === createdAppId);
    assert.equal(app?.isActive, true, 'La app debe quedar activa nuevamente');
  });

  // --------------------------------------------------------------------------
  // 7. Eliminar Sitio y Aplicación Bloqueada Individuales
  // --------------------------------------------------------------------------
  test('7. Eliminar sitio y app — Remueve individualmente los elementos de la persistencia', async () => {
    assert.ok(createdSiteId && createdAppId);

    // Eliminar sitio
    const delSiteRes = await apiService.deleteCustomBlockedSite(createdSiteId);
    assert.ok(delSiteRes.success);
    let customList = await apiService.getCustomBlocklist();
    assert.equal(customList.data.domains.some((s) => s.id === createdSiteId), false);

    // Eliminar app
    const delAppRes = await apiService.deleteCustomBlockedApp(createdAppId);
    assert.ok(delAppRes.success);
    customList = await apiService.getCustomBlocklist();
    assert.equal(customList.data.apps.some((a) => a.id === createdAppId), false);
  });

  // --------------------------------------------------------------------------
  // 9. Selección Múltiple (Pausar y Eliminar en Lote)
  // --------------------------------------------------------------------------
  test('9. Selección múltiple — Pausa y elimina en lote múltiples sitios y aplicaciones', async () => {
    // 1. Crear 2 sitios de prueba
    const domainA = `batch-a-${timestamp}.com`;
    const domainB = `batch-b-${timestamp}.com`;
    await apiService.addCustomBlockedSite(domainA, 'Apuestas', true, ['self']);
    await apiService.addCustomBlockedSite(domainB, 'Apuestas', true, ['self']);

    let customList = (await apiService.getCustomBlocklist()).data;
    const siteA = customList.domains.find((s) => s.domain === domainA)!;
    const siteB = customList.domains.find((s) => s.domain === domainB)!;
    assert.ok(siteA && siteB);

    // Pausa masiva de sitios
    await Promise.all([
      apiService.updateCustomBlockedSite(siteA.id, { isActive: false }),
      apiService.updateCustomBlockedSite(siteB.id, { isActive: false }),
    ]);
    customList = (await apiService.getCustomBlocklist()).data;
    assert.equal(customList.domains.find((s) => s.id === siteA.id)?.isActive, false);
    assert.equal(customList.domains.find((s) => s.id === siteB.id)?.isActive, false);

    // Eliminación masiva de sitios
    await Promise.all([
      apiService.deleteCustomBlockedSite(siteA.id),
      apiService.deleteCustomBlockedSite(siteB.id),
    ]);
    customList = (await apiService.getCustomBlocklist()).data;
    assert.equal(customList.domains.some((s) => s.id === siteA.id || s.id === siteB.id), false);

    // 2. Crear 2 apps de prueba
    const appA = `App Batch A ${timestamp}`;
    const appB = `App Batch B ${timestamp}`;
    await apiService.addCustomBlockedApp(appA, `pkg.a.${timestamp}`, 'Juegos', true, ['self']);
    await apiService.addCustomBlockedApp(appB, `pkg.b.${timestamp}`, 'Juegos', true, ['self']);

    customList = (await apiService.getCustomBlocklist()).data;
    const itemA = customList.apps.find((a) => a.appName === appA)!;
    const itemB = customList.apps.find((a) => a.appName === appB)!;
    assert.ok(itemA && itemB);

    // Pausa masiva de apps
    await Promise.all([
      apiService.updateCustomBlockedApp(itemA.id, { isActive: false }),
      apiService.updateCustomBlockedApp(itemB.id, { isActive: false }),
    ]);
    customList = (await apiService.getCustomBlocklist()).data;
    assert.equal(customList.apps.find((a) => a.id === itemA.id)?.isActive, false);
    assert.equal(customList.apps.find((a) => a.id === itemB.id)?.isActive, false);

    // Eliminación masiva de apps
    await Promise.all([
      apiService.deleteCustomBlockedApp(itemA.id),
      apiService.deleteCustomBlockedApp(itemB.id),
    ]);
    customList = (await apiService.getCustomBlocklist()).data;
    assert.equal(customList.apps.some((a) => a.id === itemA.id || a.id === itemB.id), false);
  });
});
