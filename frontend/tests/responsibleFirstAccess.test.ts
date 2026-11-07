import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {
  AUTOPROTECCION_EMPTY_LIST_MESSAGE,
  getResponsibleFirstAccessKey,
  hasCompletedResponsibleFirstAccess,
  markResponsibleFirstAccessCompleted,
  resetResponsibleFirstAccess,
  shouldRedirectToHomeAfterSelfControlActivation,
  shouldShowAutoproteccionEmptyNotice,
} from '../src/utils/responsibleFirstAccess.js';
import { safeStorage } from '../src/services/api/client.js';
import { apiService } from '../src/services/api.service.js';

describe('Pantalla "Elegir protección" y flujo inicial del Responsable', () => {
  test('PRIMER ACCESO: "Elegir protección" aparece solo la primera vez por usuario Responsable', async () => {
    const user = { id: 'user-resp-1', email: 'Tutor.Test@BAProtege.gob.ar' };
    await resetResponsibleFirstAccess(user);

    assert.equal(await hasCompletedResponsibleFirstAccess(user), false);

    await markResponsibleFirstAccessCompleted(user);
    assert.equal(await hasCompletedResponsibleFirstAccess(user), true);

    // También debe coincidir aunque en modo offline solo venga el email en minúsculas sin id
    assert.equal(
      await hasCompletedResponsibleFirstAccess({ email: 'tutor.test@baprotege.gob.ar' }),
      true
    );

    // Otro usuario Responsable distinto conserva su propio estado de primer acceso
    const anotherUser = { email: 'otro.responsable@baprotege.gob.ar' };
    await resetResponsibleFirstAccess(anotherUser);
    assert.equal(await hasCompletedResponsibleFirstAccess(anotherUser), false);
    assert.notEqual(
      getResponsibleFirstAccessKey(user),
      getResponsibleFirstAccessKey(anotherUser)
    );
  });

  test('LISTA INICIAL VACÍA: La lista personalizada inicia vacía y muestra el aviso de Autoprotección', async () => {
    await safeStorage.removeItem('@ba_protege_custom_blocklist');
    const res = await apiService.getCustomBlocklist();
    assert.equal(res.success, true);
    assert.equal(res.data.domains.length, 0);
    assert.equal(res.data.apps?.length ?? 0, 0);

    // Con 0 sitios y 0 apps y autoprotección inactiva -> mostrar aviso
    assert.equal(shouldShowAutoproteccionEmptyNotice(0, 0, false), true);
    assert.ok(AUTOPROTECCION_EMPTY_LIST_MESSAGE.includes('al menos un sitio web o aplicación'));

    // Al agregar al menos 1 sitio o 1 app -> ocultar aviso
    assert.equal(shouldShowAutoproteccionEmptyNotice(1, 0, false), false);
    assert.equal(shouldShowAutoproteccionEmptyNotice(0, 1, false), false);

    // Si la autoprotección ya está activa -> ocultar aviso
    assert.equal(shouldShowAutoproteccionEmptyNotice(0, 0, true), false);
  });

  test('AUTOPROTECCIÓN -> HOME: Al activar Autoprotección redirige al usuario a Inicio (Home)', () => {
    assert.equal(shouldRedirectToHomeAfterSelfControlActivation('sitios', true), true);
    assert.equal(shouldRedirectToHomeAfterSelfControlActivation('sitios', false), true);
    assert.equal(shouldRedirectToHomeAfterSelfControlActivation('cuenta', true), true);
    assert.equal(shouldRedirectToHomeAfterSelfControlActivation('cuenta', false), false);
  });

  test('UI FLUJO Y HOME: Verifica modales, avisos y remoción del ícono dispositivos.png en Home', () => {
    const actionScreenPath = path.resolve(
      process.cwd(),
      'src/screens/ResponsibleActionScreen.tsx'
    );
    const dashboardPath = path.resolve(
      process.cwd(),
      'src/screens/ParentDashboardScreen.tsx'
    );
    const sitesSectionPath = path.resolve(
      process.cwd(),
      'src/components/dashboard/sitios/SitesAndAppsSection.tsx'
    );
    const parentInicioPath = path.resolve(
      process.cwd(),
      'src/components/dashboard/inicio/ParentInicioSection.tsx'
    );

    const actionScreenSrc = fs.readFileSync(actionScreenPath, 'utf8');
    const dashboardSrc = fs.readFileSync(dashboardPath, 'utf8');
    const sitesSectionSrc = fs.readFileSync(sitesSectionPath, 'utf8');
    const parentInicioSrc = fs.readFileSync(parentInicioPath, 'utf8');

    // 1. "Vincular dispositivo" abre PairingModal ("Vincular nuevo dispositivo") y al guardar va a Home ('SUPERVISE')
    assert.ok(actionScreenSrc.includes('<PairingModal'));
    assert.ok(actionScreenSrc.includes('setShowPairingModal(true)'));
    assert.ok(actionScreenSrc.includes("onSelectAction('SUPERVISE'"));

    // 2. "Configurar este dispositivo" lleva a 'sitios' y al activar Autoprotección vuelve a 'inicio'
    assert.ok(actionScreenSrc.includes("onSelectAction('SELF_CONTROL')"));
    assert.ok(dashboardSrc.includes("initialAction === 'SELF_CONTROL' ? 'sitios' : 'inicio'"));
    assert.ok(dashboardSrc.includes("setActiveTab('inicio')"));

    // 3. Aviso en Sitios y apps cuando la lista está vacía
    assert.ok(sitesSectionSrc.includes('AUTOPROTECCION_EMPTY_LIST_MESSAGE'));
    assert.ok(sitesSectionSrc.includes('autoprotectionEmptyNotice'));

    // 4. El bloque Dispositivos en la Home del Responsable NO incluye dispositivos.png
    assert.ok(!parentInicioSrc.includes('dispositivos.png'));
  });
});
