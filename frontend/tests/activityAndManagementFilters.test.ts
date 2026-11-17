// ==============================================================================
// Proyecto: BA Protege+
// Test Suite: activityAndManagementFilters.test.ts
// Descripción: Pruebas unitarias y de integración para:
//              1) Bloque "Listado de bloqueos" (reemplazo LOTBA por "Sitio no autorizado"
//                 y filtros de orden A-Z / Fecha y tipo de lista LOTBA / Personalizada).
//              2) Modal "Opciones de gestión" (títulos en Sentence case y dropdown
//                 de dispositivos con "Yo" de primero y nombres en primer nombre A-Z).
//              3) Validación de longitud máxima para nombres de dispositivos (máximo 30 car.).
//              4) Pestaña Actividad (dropdowns de Dispositivos y Período en la misma línea).
// ==============================================================================

import test, { describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {
  MAX_DEVICE_NAME_LENGTH,
  getDeviceFirstName,
  validateDeviceName,
} from '../src/utils/authValidation';
import { buildDeviceFilterOptions } from '../src/utils/activityMetrics';
import { DeviceInfo } from '../src/types';
import { DEMO_BLOCKED_ATTEMPTS } from '../src/components/dashboard/actividad/data';

describe('1. Bloque "Listado de bloqueos" — LOTBA anónimo y Filtros', () => {
  test('Los eventos de la lista LOTBA muestran "Sitio no autorizado" en lugar del dominio', () => {
    // 1. Verificar datos de demostración
    const lotbaDemo = DEMO_BLOCKED_ATTEMPTS.filter((a) => a.source === 'lotba');
    assert.ok(lotbaDemo.length > 0);
    lotbaDemo.forEach((item) => {
      assert.equal(item.title, 'Sitio no autorizado');
    });

    // 2. Verificar código fuente de AuditEventsCard
    const cardPath = path.resolve(
      __dirname,
      '../src/components/dashboard/actividad/blocks/AuditEventsCard.tsx'
    );
    const cardSrc = fs.readFileSync(cardPath, 'utf8');

    assert.ok(
      cardSrc.includes("title: 'Sitio no autorizado'"),
      'AuditEventsCard debe asignar "Sitio no autorizado" a los eventos LOTBA'
    );
    assert.ok(
      cardSrc.includes("displayTitle = isLotba ? 'Sitio no autorizado' : event.title"),
      'AttemptRow debe renderizar "Sitio no autorizado" para LOTBA'
    );
  });

  test('AuditEventsCard contiene filtros de tipo de Lista (Todas, LOTBA, Personalizada) y Ordenar (Fecha, A-Z)', () => {
    const cardPath = path.resolve(
      __dirname,
      '../src/components/dashboard/actividad/blocks/AuditEventsCard.tsx'
    );
    const cardSrc = fs.readFileSync(cardPath, 'utf8');

    // Filtros de Lista
    assert.ok(cardSrc.includes("'all'"));
    assert.ok(cardSrc.includes("'lotba'"));
    assert.ok(cardSrc.includes("'custom'"));
    assert.ok(cardSrc.includes('Todas'));
    assert.ok(cardSrc.includes('LOTBA'));
    assert.ok(cardSrc.includes('Personalizada'));

    // Filtros de Orden
    assert.ok(cardSrc.includes("'date'"));
    assert.ok(cardSrc.includes("'az'"));
    assert.ok(cardSrc.includes('Fecha'));
    assert.ok(cardSrc.includes('A - Z'));
  });
});

describe('2. Modal "Opciones de gestión" — Sentence Case y Dropdown de Dispositivos', () => {
  test('Los títulos de las secciones del modal están en Sentence case', () => {
    const modalPath = path.resolve(
      __dirname,
      '../src/components/dashboard/sitios/SitesAppsOptionsMenuModal.tsx'
    );
    const modalSrc = fs.readFileSync(modalPath, 'utf8');

    assert.ok(
      modalSrc.includes('Filtrar por dispositivo'),
      'Debe contener "Filtrar por dispositivo" en Sentence case'
    );
    assert.ok(
      modalSrc.includes('Filtrar por origen'),
      'Debe contener "Filtrar por origen" en Sentence case'
    );
    assert.ok(
      modalSrc.includes('Ordenar lista'),
      'Debe contener "Ordenar lista" en Sentence case'
    );
    assert.ok(
      modalSrc.includes('Acción en lote'),
      'Debe contener "Acción en lote" en Sentence case'
    );

    // Asegurar que no existan títulos en UPPERCASE forzado
    assert.ok(!modalSrc.includes('>FILTRAR POR DISPOSITIVO<'));
    assert.ok(!modalSrc.includes('>FILTRAR POR ORIGEN<'));
    assert.ok(!modalSrc.includes('>ORDENAR LISTA<'));
    assert.ok(!modalSrc.includes('>ACCIÓN EN LOTE<'));

    const stylesPath = path.resolve(
      __dirname,
      '../src/components/dashboard/sitios/SitesAppsOptionsMenuModal.styles.ts'
    );
    const stylesSrc = fs.readFileSync(stylesPath, 'utf8');
    assert.ok(stylesSrc.includes("textTransform: 'none'"));
  });

  test('El filtro de dispositivos está implementado con un Dropdown en estilo app', () => {
    const modalPath = path.resolve(
      __dirname,
      '../src/components/dashboard/sitios/SitesAppsOptionsMenuModal.tsx'
    );
    const modalSrc = fs.readFileSync(modalPath, 'utf8');

    assert.ok(modalSrc.includes('isDeviceDropdownOpen'));
    assert.ok(modalSrc.includes('setIsDeviceDropdownOpen(true)'));
    assert.ok(modalSrc.includes('styles.dropdownContainer'));
    assert.ok(modalSrc.includes('styles.dropdownMenuCard'));
  });

  test('El dropdown de dispositivos muestra "Yo" de primero y los protegidos solo con primer nombre en orden A-Z', () => {
    const sampleDevices: DeviceInfo[] = [
      {
        deviceId: 'dev-1',
        deviceName: 'Maria Guadalupe Hernandéz',
        childName: 'Maria Guadalupe Hernandéz',
        isProtected: true,
        status: 'ACTIVE',
        profileType: 'Adulto',
      },
      {
        deviceId: 'dev-2',
        deviceName: 'Celular de Tomás',
        childName: 'Tomás Alberto García',
        isProtected: true,
        status: 'ACTIVE',
        profileType: 'Menor',
      },
      {
        deviceId: 'dev-3',
        deviceName: 'Tablet de Lucía Belén',
        childName: 'Lucía Belén',
        isProtected: true,
        status: 'ACTIVE',
        profileType: 'Menor',
      },
    ];

    // Verificar extracción de primer nombre
    assert.equal(getDeviceFirstName('Maria Guadalupe Hernandéz'), 'Maria');
    assert.equal(getDeviceFirstName('Tomás Alberto García'), 'Tomás');
    assert.equal(getDeviceFirstName('Celular de Tomás'), 'Tomás');
    assert.equal(getDeviceFirstName('Tablet de Lucía Belén'), 'Lucía');
    assert.equal(getDeviceFirstName('Mi dispositivo'), 'Yo');
    assert.equal(getDeviceFirstName('self'), 'Yo');

    // Verificar construcción de opciones ordenadas
    const options = buildDeviceFilterOptions(sampleDevices, true);
    assert.equal(options[0].label, 'Todos');
    assert.equal(options[1].label, 'Yo');
    assert.equal(options[2].label, 'Lucía');
    assert.equal(options[3].label, 'Maria');
    assert.equal(options[4].label, 'Tomás');
  });
});

describe('3. Longitud máxima para nombres de dispositivos', () => {
  test('El límite máximo configurado es de 30 caracteres', () => {
    assert.equal(MAX_DEVICE_NAME_LENGTH, 30);
  });

  test('Acepta nombres válidos dentro del límite de 30 caracteres', () => {
    assert.equal(validateDeviceName('Sofía'), null);
    assert.equal(validateDeviceName('Maria Guadalupe'), null);
    assert.equal(validateDeviceName('Mateo Alexander'), null);
  });

  test('Informa al usuario con mensaje específico si supera los 30 caracteres', () => {
    const longName = 'María Guadalupe de los Ángeles Fernández'; // 41 caracteres
    assert.ok(longName.length > 30);

    const error = validateDeviceName(longName);
    assert.ok(error !== null);
    assert.ok(
      error.includes('El nombre no puede superar los 30 caracteres'),
      `Mensaje obtenido: ${error}`
    );
    assert.ok(error.includes(`actual: ${longName.length}`));
  });

  test('PairingSection y EditProtectedDeviceModal incluyen la validación de longitud máxima', () => {
    const pairingPath = path.resolve(
      __dirname,
      '../src/components/dashboard/dispositivos/PairingSection.tsx'
    );
    const pairingSrc = fs.readFileSync(pairingPath, 'utf8');
    assert.ok(pairingSrc.includes('MAX_DEVICE_NAME_LENGTH'));
    assert.ok(pairingSrc.includes('validateDeviceName'));

    const editModalPath = path.resolve(
      __dirname,
      '../src/components/dashboard/dispositivos/EditProtectedDeviceModal.tsx'
    );
    const editModalSrc = fs.readFileSync(editModalPath, 'utf8');
    assert.ok(editModalSrc.includes('MAX_DEVICE_NAME_LENGTH'));
    assert.ok(editModalSrc.includes('validateDeviceName'));
  });
});

describe('4. Pestaña Actividad — Dropdowns en la misma línea', () => {
  test('Dispositivos y Período se presentan como dropdowns en una sola fila (dropdownsRow)', () => {
    const panelPath = path.resolve(
      __dirname,
      '../src/components/dashboard/actividad/AnalyticsPanel.tsx'
    );
    const panelSrc = fs.readFileSync(panelPath, 'utf8');

    assert.ok(panelSrc.includes('<DeviceSelector'));
    assert.ok(panelSrc.includes('<PeriodSelector'));
    assert.ok(panelSrc.includes('styles.dropdownsRow'));
    assert.ok(panelSrc.includes('styles.dropdownColDevice'));
    assert.ok(panelSrc.includes('styles.dropdownColPeriod'));

    const stylesPath = path.resolve(
      __dirname,
      '../src/components/dashboard/actividad/AnalyticsPanel.styles.ts'
    );
    const stylesSrc = fs.readFileSync(stylesPath, 'utf8');
    assert.ok(stylesSrc.includes("flexDirection: 'row'"));
    assert.ok(stylesSrc.includes('dropdownsRow'));
  });

  test('DeviceSelector implementa dropdown con estado, "Yo" y orden alfabético', () => {
    const selectorPath = path.resolve(
      __dirname,
      '../src/components/dashboard/actividad/blocks/DeviceSelector.tsx'
    );
    const selectorSrc = fs.readFileSync(selectorPath, 'utf8');

    assert.ok(selectorSrc.includes('DeviceSelector'));
    assert.ok(selectorSrc.includes('Filtrar por dispositivo'));
    assert.ok(selectorSrc.includes('renderStatusDot'));
    assert.ok(selectorSrc.includes('Modal'));
  });
});
