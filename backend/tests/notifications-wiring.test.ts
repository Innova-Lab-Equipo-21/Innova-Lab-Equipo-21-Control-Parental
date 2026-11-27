process.env.USE_MOCK_DATA = 'true';

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mockDb } from '../src/config/mock-database.js';

const telemetryMod = await import('../src/services/telemetry.service.js');
const emailMod = await import('../src/services/email.service.js');
const notificationMod = await import('../src/services/notification.service.js');

const { telemetryService } = telemetryMod;
const { emailService } = emailMod;
const { notificationService } = notificationMod;

const MATEO_UUID = 'uuid-samsung-mateo-a54';
const ADULTO_DEVICE_UUID = 'uuid-adulto-test-001';
const LINK = 'baprotege://activity';

mockDb.devices.push({
  id: 'dev-mock-adulto-001',
  userId: 'usr-mock-tutor-001',
  deviceUuid: ADULTO_DEVICE_UUID,
  deviceName: 'Dispositivo Adulto Test',
  childName: 'Adulto Test',
  personType: 'ADULTO',
  model: 'Test',
  osVersion: 'Test',
  appVersion: '1.0.0',
  isActive: true,
  lastSeenAt: new Date(),
  createdAt: new Date(),
  status: {
    effectiveStatus: 'ACTIVE',
    vpnActive: true,
    permissionsOk: true,
    permissionsDetail: null,
    batteryLevel: 100,
    isCharging: false,
    blocklistVersion: 1,
    appVersion: '1.0.0',
    lastHeartbeatAt: new Date(),
  },
  config: {
    protectionEnabled: true,
    blockGambling: true,
    blockCustomList: true,
    notifyOnBlock: true,
    notifyOnSecurity: true,
    heartbeatIntervalSec: 30,
  },
});

type EmailCall = { to: string; subject: string; text: string; html?: string };
type PushCall = { userId: string; title: string; body: string; data: Record<string, string> };

const emailCalls: EmailCall[] = [];
const pushCalls: PushCall[] = [];

(emailService as any).sendEmail = async (...args: any[]) => {
  emailCalls.push({ to: args[0], subject: args[1], text: args[2], html: args[3] });
  return { success: true };
};

(notificationService as any).sendToUser = async (...args: any[]) => {
  pushCalls.push({ userId: args[0], title: args[1], body: args[2], data: args[3] ?? {} });
  return { success: true, results: [] };
};

function flush() {
  return new Promise<void>((resolve) => setTimeout(resolve, 30));
}

const noPlaceholder = (html: string) => assert.ok(!/%[A-Z_]+%/.test(html), 'html no debe contener placeholders sin reemplazar');

test('cableado de notificaciones y emails por tipo de evento (mock)', async () => {
  emailCalls.length = 0;
  pushCalls.length = 0;

  await telemetryService.recordBlockedEvent({ deviceUuid: MATEO_UUID, attemptedDomain: 'apuestas-online-ilegal.bet', sourceListType: 'LOTBA', itemType: 'SITE' });
  await telemetryService.recordBlockedEvent({ deviceUuid: MATEO_UUID, attemptedDomain: 'juegos-violentos-online.com', sourceListType: 'CUSTOM', itemType: 'SITE' });
  await telemetryService.recordBlockedEvent({ deviceUuid: MATEO_UUID, attemptedDomain: 'TikTok', sourceListType: 'CUSTOM', itemType: 'APP' });
  await telemetryService.recordBlockedEvent({ deviceUuid: ADULTO_DEVICE_UUID, attemptedDomain: 'apuestas-online-ilegal.bet', sourceListType: 'ADULTO_PROTEGIDO', itemType: 'SITE' });
  await telemetryService.recordBlockedEvent({ deviceUuid: ADULTO_DEVICE_UUID, attemptedDomain: 'TikTok', sourceListType: 'ADULTO_PROTEGIDO_APP', itemType: 'APP' });
  await telemetryService.recordSecurityEvent({ deviceUuid: MATEO_UUID, eventType: 'UNINSTALL_ATTEMPT', description: 'Intento de desinstalación' });

  await flush();

  // 1. Sitio no autorizado LOTBA (Mateo)
  const lotbaEmail = emailCalls.find((e) => e.subject === 'Se intentó acceder a un sitio no autorizado por LOTBA');
  assert.ok(lotbaEmail, 'email LOTBA bloqueado no enviado');
  assert.ok(lotbaEmail!.html.includes('Mateo (13 años)'));
  assert.ok(lotbaEmail!.html.includes(LINK));
  noPlaceholder(lotbaEmail!.html!);
  const lotbaPush = pushCalls.find((p) => p.data.type === 'lotba_blocked_site');
  assert.ok(lotbaPush, 'push LOTBA bloqueado no enviado');
  assert.ok(lotbaPush!.title.includes('Mateo (13 años)'));

  // 2. Sitio lista personalizada (Mateo)
  const customEmail = emailCalls.find((e) => e.subject === 'Se intentó acceder a un sitio de la lista personalizada');
  assert.ok(customEmail, 'email lista personalizada no enviado');
  assert.ok(customEmail!.html.includes('Mateo (13 años)'));
  noPlaceholder(customEmail!.html!);
  const customPush = pushCalls.find((p) => p.data.type === 'custom_blocked_site');
  assert.ok(customPush, 'push lista personalizada no enviado');

  // 3. App bloqueada (Mateo) - usa BLOCKED_APP_NAME
  const appEmail = emailCalls.find((e) => e.subject === 'Se intentó utilizar una app bloqueada');
  assert.ok(appEmail, 'email app bloqueada no enviado');
  assert.ok(appEmail!.html.includes('TikTok'));
  assert.ok(appEmail!.html.includes('Mateo (13 años)'));
  assert.ok(!appEmail!.html.includes('%BLOCKED_APP_NAME%'));
  noPlaceholder(appEmail!.html!);
  const appPush = pushCalls.find((p) => p.data.type === 'blocked_app_attempt');
  assert.ok(appPush, 'push app bloqueada no enviado');
  assert.ok(appPush!.title.includes('TikTok'));

  // 4. Adulto protegido - sitio (dispositivo adulto)
  const adultSiteEmail = emailCalls.find((e) => e.subject === 'Recordá que bloqueaste este sitio para tu bienestar' && e.html.includes('apuestas-online-ilegal.bet'));
  assert.ok(adultSiteEmail, 'email adulto protegido sitio no enviado');
  assert.ok(adultSiteEmail!.html.includes('Carlos Gutiérrez'));
  noPlaceholder(adultSiteEmail!.html!);
  const adultSitePush = pushCalls.find((p) => p.data.type === 'self_care_blocked_site');
  assert.ok(adultSitePush, 'push adulto protegido sitio no enviado');

  // 5. Adulto protegido - límite app (dispositivo adulto)
  const adultAppEmail = emailCalls.find((e) => e.subject === 'Estás por alcanzar el límite de tiempo en TikTok');
  assert.ok(adultAppEmail, 'email adulto protegido app límite no enviado');
  assert.ok(adultAppEmail!.html.includes('TikTok'));
  assert.ok(!adultAppEmail!.html.includes('%LIMITED_APP_NAME%'));
  noPlaceholder(adultAppEmail!.html!);
  const adultAppPush = pushCalls.find((p) => p.data.type === 'self_care_time_limit');
  assert.ok(adultAppPush, 'push adulto protegido app límite no enviado');

  // 6. Situación 5: intento de desinstalación -> email + push de template (no push genérico security_alert)
  const uninstallEmail = emailCalls.find((e) => e.subject === 'Se intentó desinstalar la app');
  assert.ok(uninstallEmail, 'situacion 5: email de desinstalacion no enviado');
  assert.ok(uninstallEmail!.html.includes('Mateo (13 años)'));
  assert.ok(uninstallEmail!.html.includes(LINK));
  noPlaceholder(uninstallEmail!.html!);
  const uninstallPush = pushCalls.find((p) => p.data.type === 'uninstall_attempt');
  assert.ok(uninstallPush, 'situacion 5: push de desinstalacion no enviado');
  const genericPush = pushCalls.find((p) => p.data.type === 'security_alert');
  assert.ok(!genericPush, 'situacion 5: no debe duplicarse el push generico de seguridad');

  assert.ok(emailCalls.length >= 6, 'se esperaban al menos 6 emails');
  assert.ok(pushCalls.length >= 6, 'se esperaban al menos 6 pushes');
});
