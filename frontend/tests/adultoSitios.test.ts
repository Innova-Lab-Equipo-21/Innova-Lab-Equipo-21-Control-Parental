// ==============================================================================
// Proyecto: BA Protege+
// Componente: Tests Automatizados — Sitios y apps en Modo Protegido Adulto
// Archivo: tests/adultoSitios.test.ts
// Descripción: Verifica las reglas de negocio y UI de la sección "Sitios y apps"
//              en Modo Protegido Adulto:
//              - Sin Autoprotección.
//              - Permite incluir sitios y apps, pero NO editar, desactivar ni eliminar.
//              - Informa que solo el responsable puede desactivar o eliminar.
//              - Opciones de gestión limitadas a Buscar y Ordenar (fecha / A-Z).
// ==============================================================================

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  ADULTO_APP_ADDED_FEEDBACK,
  ADULTO_APP_MODAL_WARNING,
  ADULTO_CARD_LOCK_NOTICE,
  ADULTO_SITE_ADDED_FEEDBACK,
  ADULTO_SITE_MODAL_WARNING,
  filterAndSortAdultoApps,
  filterAndSortAdultoSites,
  formatBlockCardDeviceScope,
  getProtectedAdultOriginLabel,
  isItemVisibleForAdultoDevice,
  matchesBlockOriginFilter,
} from '../src/utils/adultoSitios.js';
import { apiService } from '../src/services/api.service.js';
import type {
  CustomBlockedApp,
  CustomBlockedDomain,
  DeviceInfo,
} from '../src/types/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sampleSites: CustomBlockedDomain[] = [
  {
    id: 'site-1',
    domain: 'zeta-apuestas.bet',
    category: 'Apuestas',
    isActive: true,
    applyToAll: true,
    deviceIds: [],
    createdAt: '2026-10-10T10:00:00.000Z',
  },
  {
    id: 'site-2',
    domain: 'alfa-casino.com',
    category: 'Apuestas',
    isActive: true,
    applyToAll: true,
    deviceIds: [],
    createdAt: '2026-10-01T12:00:00.000Z',
  },
  {
    id: 'site-3',
    domain: 'medio-poker.net',
    category: 'Apuestas',
    isActive: true,
    applyToAll: true,
    deviceIds: [],
    createdAt: '2026-10-05T08:00:00.000Z',
  },
];

const sampleApps: CustomBlockedApp[] = [
  {
    id: 'app-1',
    appName: 'WhatsApp',
    packageName: 'com.whatsapp',
    category: 'Comunicación',
    isActive: true,
    applyToAll: true,
    deviceIds: [],
    createdAt: '2026-10-12T10:00:00.000Z',
  },
  {
    id: 'app-2',
    appName: 'Bet365',
    packageName: 'com.bet365.mobile',
    category: 'Apuestas',
    isActive: true,
    applyToAll: true,
    deviceIds: [],
    createdAt: '2026-10-02T15:00:00.000Z',
  },
  {
    id: 'app-3',
    appName: 'Instagram',
    packageName: 'com.instagram.android',
    category: 'Redes sociales',
    isActive: true,
    applyToAll: true,
    deviceIds: [],
    createdAt: '2026-10-07T09:00:00.000Z',
  },
];

describe('Modo Protegido Adulto — Buscar y Ordenar en Sitios y apps', () => {
  test('Ordena sitios web por fecha reciente (date) y alfabéticamente (az)', () => {
    const byDate = filterAndSortAdultoSites(sampleSites, '', 'date');
    assert.deepEqual(
      byDate.map((s) => s.domain),
      ['zeta-apuestas.bet', 'medio-poker.net', 'alfa-casino.com']
    );

    const byAz = filterAndSortAdultoSites(sampleSites, '', 'az');
    assert.deepEqual(
      byAz.map((s) => s.domain),
      ['alfa-casino.com', 'medio-poker.net', 'zeta-apuestas.bet']
    );
  });

  test('Filtra sitios web por búsqueda parcial sin importar mayúsculas/espacios', () => {
    const filtered = filterAndSortAdultoSites(sampleSites, '  POKER ', 'date');
    assert.equal(filtered.length, 1);
    assert.equal(filtered[0].domain, 'medio-poker.net');
  });

  test('Ordena aplicaciones por fecha reciente (date) y alfabéticamente (az)', () => {
    const byDate = filterAndSortAdultoApps(sampleApps, '', 'date');
    assert.deepEqual(
      byDate.map((a) => a.appName),
      ['WhatsApp', 'Instagram', 'Bet365']
    );

    const byAz = filterAndSortAdultoApps(sampleApps, '', 'az');
    assert.deepEqual(
      byAz.map((a) => a.appName),
      ['Bet365', 'Instagram', 'WhatsApp']
    );
  });

  test('Filtra aplicaciones por nombre manteniendo el orden elegido', () => {
    const filtered = filterAndSortAdultoApps(sampleApps, 'a', 'az');
    // Instagram y WhatsApp contienen "a" ("Bet365" no)
    assert.deepEqual(
      filtered.map((a) => a.appName),
      ['Instagram', 'WhatsApp']
    );
  });
});

describe('Modo Protegido Adulto — Restricciones y avisos al incluir sitios/apps', () => {
  test('Los textos de advertencia informan que solo el responsable puede desactivar o eliminar', () => {
    assert.match(ADULTO_CARD_LOCK_NOTICE, /solo el responsable puede desactivar o eliminar/i);
    assert.match(ADULTO_SITE_MODAL_WARNING, /solo el responsable podr[aá] desactivarlo o eliminarlo/i);
    assert.match(ADULTO_APP_MODAL_WARNING, /solo el responsable podr[aá] desactivarla o eliminarla/i);
    assert.match(ADULTO_SITE_ADDED_FEEDBACK.message, /responsable puede desactivarlo o eliminarlo/i);
    assert.match(ADULTO_APP_ADDED_FEEDBACK.message, /responsable puede desactivarla o eliminarla/i);
  });

  test('AdultoSitiosSection no incluye Autoprotección ni botones de editar o eliminar', () => {
    const sectionSource = fs.readFileSync(
      path.resolve(
        __dirname,
        '../src/components/dashboard/protected/adulto/AdultoSitiosSection.tsx'
      ),
      'utf8'
    );

    assert.equal(sectionSource.includes('ToggleSwitch'), false);
    assert.equal(sectionSource.includes('name="editar"'), false);
    assert.equal(sectionSource.includes('name="eliminar"'), false);
    assert.equal(sectionSource.includes('<Text style={styles.autoprotectionText}>'), false);
    assert.equal(sectionSource.includes('Lista oficial LOTBA activa'), true);
  });

  test('AdultoSitiosOptionsModal ofrece únicamente Buscar y Ordenar (sin dispositivo ni lote)', () => {
    const modalSource = fs.readFileSync(
      path.resolve(
        __dirname,
        '../src/components/dashboard/protected/adulto/AdultoSitiosOptionsModal.tsx'
      ),
      'utf8'
    );

    assert.equal(modalSource.includes('Buscar por dominio o aplicación...'), true);
    assert.equal(modalSource.includes('ORDENAR LISTA'), true);
    assert.equal(modalSource.includes('Por fecha (Recientes)'), true);
    assert.equal(modalSource.includes('Alfabético (A - Z)'), true);
    assert.equal(modalSource.includes('FILTRAR POR DISPOSITIVO'), false);
    assert.equal(modalSource.includes('ACCIÓN EN LOTE'), false);
    assert.equal(modalSource.includes('Selección múltiple'), false);
  });
});

describe('Identificación de Origen (Adulto Protegido -> Panel del Responsable)', () => {
  test('Persiste metadatos de origen (ADULTO_PROTEGIDO) al bloquear sitios y apps', async () => {
    const uniqueDomain = `auto-bloqueo-adulto-${Date.now()}.bet`;
    const siteRes = await apiService.addCustomBlockedSite(
      uniqueDomain,
      'Personalizado',
      false,
      ['dev-adult-1'],
      {
        createdBy: 'ADULTO_PROTEGIDO',
        createdByName: 'Carlos',
        sourceDeviceId: 'dev-adult-1',
      }
    );

    assert.equal(siteRes.success, true);
    assert.equal(siteRes.data.createdBy, 'ADULTO_PROTEGIDO');
    assert.equal(siteRes.data.createdByName, 'Carlos');
    assert.equal(siteRes.data.sourceDeviceId, 'dev-adult-1');
    assert.equal(siteRes.data.applyToAll, false);
    assert.deepEqual(siteRes.data.deviceIds, ['dev-adult-1']);

    const appRes = await apiService.addCustomBlockedApp(
      `Casino App ${Date.now()}`,
      'com.casino.adulto',
      'Apuestas',
      false,
      ['dev-adult-1'],
      undefined,
      undefined,
      {
        createdBy: 'ADULTO_PROTEGIDO',
        createdByName: 'Carlos',
        sourceDeviceId: 'dev-adult-1',
      }
    );

    assert.equal(appRes.success, true);
    assert.equal(appRes.data.createdBy, 'ADULTO_PROTEGIDO');
    assert.equal(appRes.data.createdByName, 'Carlos');
    assert.equal(appRes.data.sourceDeviceId, 'dev-adult-1');

    // Al consultar la lista del Responsable, ambos elementos aparecen con sus metadatos intactos
    const listRes = await apiService.getCustomBlocklist();
    const savedSite = listRes.data.domains.find((d) => d.id === siteRes.data.id);
    const savedApp = listRes.data.apps?.find((a) => a.id === appRes.data.id);

    assert.ok(savedSite);
    assert.equal(savedSite.createdBy, 'ADULTO_PROTEGIDO');
    assert.equal(savedSite.createdByName, 'Carlos');

    assert.ok(savedApp);
    assert.equal(savedApp.createdBy, 'ADULTO_PROTEGIDO');
    assert.equal(savedApp.createdByName, 'Carlos');

    // Preserva createdBy tras pausar/reactivar desde el panel del Responsable
    const toggledSite = await apiService.updateCustomBlockedSite(siteRes.data.id, {
      isActive: false,
    });
    assert.equal(toggledSite.data.isActive, false);
    assert.equal(toggledSite.data.createdBy, 'ADULTO_PROTEGIDO');
  });

  test('Genera etiquetas visuales claras y filtra por origen (all / responsable / adulto_protegido)', () => {
    const responsableItem = { createdBy: undefined };
    const genericAdultItem = { createdBy: 'ADULTO_PROTEGIDO' as const };
    const namedAdultItem = {
      createdBy: 'ADULTO_PROTEGIDO' as const,
      createdByName: 'Carlos',
    };

    assert.equal(getProtectedAdultOriginLabel(responsableItem), null);
    assert.equal(
      getProtectedAdultOriginLabel(genericAdultItem),
      'Bloqueado por adulto protegido'
    );
    assert.equal(
      getProtectedAdultOriginLabel(namedAdultItem),
      'Bloqueado por Carlos (protegido)'
    );

    // Filtro por origen
    assert.equal(matchesBlockOriginFilter(responsableItem, 'all'), true);
    assert.equal(matchesBlockOriginFilter(namedAdultItem, 'all'), true);

    assert.equal(matchesBlockOriginFilter(responsableItem, 'responsable'), true);
    assert.equal(matchesBlockOriginFilter(namedAdultItem, 'responsable'), false);

    assert.equal(matchesBlockOriginFilter(responsableItem, 'adulto_protegido'), false);
    assert.equal(matchesBlockOriginFilter(namedAdultItem, 'adulto_protegido'), true);
  });

  test('Formatea el alcance de dispositivos y visibilidad para Adulto Protegido', () => {
    const mockDevices: DeviceInfo[] = [
      {
        deviceId: 'dev-adult-1',
        deviceUuid: 'uuid-adult-1',
        deviceName: 'Moto G84',
        childName: 'Carlos',
        profileType: 'Adulto',
        isProtected: true,
        status: 'ACTIVE',
        blockedCount: 3,
        blocklistVersion: 1,
      },
    ];

    assert.equal(
      formatBlockCardDeviceScope(
        {
          applyToAll: false,
          deviceIds: ['dev-adult-1'],
          createdBy: 'ADULTO_PROTEGIDO',
          sourceDeviceId: 'dev-adult-1',
        },
        mockDevices
      ),
      'Dispositivo: Carlos'
    );

    assert.equal(
      formatBlockCardDeviceScope(
        {
          applyToAll: false,
          deviceIds: ['dev-adult-default'],
          createdBy: 'ADULTO_PROTEGIDO',
          sourceDeviceId: 'dev-adult-default',
        },
        mockDevices
      ),
      'Dispositivo adulto protegido'
    );

    // Visibilidad en AdultoSitiosSection: oculta reglas exclusivas de 'self', muestra globales y propias
    assert.equal(
      isItemVisibleForAdultoDevice(
        { isActive: true, applyToAll: false, deviceIds: ['self'] },
        'dev-adult-1'
      ),
      false
    );
    assert.equal(
      isItemVisibleForAdultoDevice(
        {
          isActive: true,
          applyToAll: false,
          deviceIds: ['dev-adult-1'],
          createdBy: 'ADULTO_PROTEGIDO',
          sourceDeviceId: 'dev-adult-1',
        },
        'dev-adult-1'
      ),
      true
    );
  });

  test('Tarjetas del Responsable y menú de opciones incluyen el identificador y filtro por origen', () => {
    const sitesTabSource = fs.readFileSync(
      path.resolve(
        __dirname,
        '../src/components/dashboard/sitios/SitesTab.tsx'
      ),
      'utf8'
    );
    const appsTabSource = fs.readFileSync(
      path.resolve(
        __dirname,
        '../src/components/dashboard/sitios/AppsTab.tsx'
      ),
      'utf8'
    );
    const optionsModalSource = fs.readFileSync(
      path.resolve(
        __dirname,
        '../src/components/dashboard/sitios/SitesAppsOptionsMenuModal.tsx'
      ),
      'utf8'
    );

    assert.equal(sitesTabSource.includes('getProtectedAdultOriginLabel'), true);
    assert.equal(sitesTabSource.includes('styles.originBadge'), true);
    assert.equal(appsTabSource.includes('getProtectedAdultOriginLabel'), true);
    assert.equal(appsTabSource.includes('styles.originBadge'), true);

    assert.equal(optionsModalSource.includes('FILTRAR POR ORIGEN'), true);
    assert.equal(optionsModalSource.includes('Responsable'), true);
    assert.equal(optionsModalSource.includes('Adulto protegido'), true);
  });
});

describe('Modo Protegido Adulto — Pantalla de Inicio (réplica adaptada de Responsable)', () => {
  test('Incluye saludo, estado de permisos, Quiz sin repetición, Sitios/Apps, Tiempo de uso y FAQ', () => {
    const inicioSource = fs.readFileSync(
      path.resolve(
        __dirname,
        '../src/components/dashboard/protected/adulto/AdultoInicioSection.tsx'
      ),
      'utf8'
    );
    const screenSource = fs.readFileSync(
      path.resolve(__dirname, '../src/screens/ProtectedDeviceScreen.tsx'),
      'utf8'
    );

    // 1. Saludo dinámico
    assert.equal(inicioSource.includes('Buenos días'), true);
    assert.equal(inicioSource.includes('Buenas tardes'), true);
    assert.equal(inicioSource.includes('Buenas noches'), true);

    // 2. Bloque "DISPOSITIVO NO PROTEGIDO" verificando permisos
    assert.equal(inicioSource.includes('DISPOSITIVO NO PROTEGIDO'), true);
    assert.equal(inicioSource.includes('ESTÁS PROTEGIDO'), true);
    assert.equal(inicioSource.includes('permiso pendiente'), true);
    assert.equal(inicioSource.includes('permisos pendientes'), true);

    // 3. NO incluye "Dispositivos protegidos"; en su lugar incluye el Quiz sin opción de repetir
    assert.equal(inicioSource.includes('Dispositivos protegidos'), false);
    assert.equal(inicioSource.includes('¿HACEMOS UN QUIZ?'), true);
    assert.equal(inicioSource.includes('Volver a hacer el quiz'), false);
    assert.equal(
      screenSource.includes("canPlayPasatiempoGame(completedGames, 'quiz')"),
      true
    );

    // 4. Incluye los bloques Sitios y Apps respetando plurales
    assert.equal(inicioSource.includes("'Sitio' : 'Sitios'"), true);
    assert.equal(inicioSource.includes("'bloqueado' : 'bloqueados'"), true);
    assert.equal(inicioSource.includes("'App' : 'Apps'"), true);
    assert.equal(inicioSource.includes("'bloqueada' : 'bloqueadas'"), true);

    // 5. Reemplaza Historial de intentos por Tiempo de uso de mis apps con CTA a Actividad
    assert.equal(inicioSource.includes('Historial de intentos'), false);
    assert.equal(inicioSource.includes('Tiempo de uso de mis apps'), true);
    assert.equal(inicioSource.includes('onNavigateToActivity'), true);
    assert.equal(inicioSource.includes('Ver más'), true);

    // 6. Incluye Ver preguntas frecuentes conectado a FaqModal
    assert.equal(inicioSource.includes('Ver preguntas frecuentes'), true);
    assert.equal(screenSource.includes('<FaqModal'), true);
  });
});
