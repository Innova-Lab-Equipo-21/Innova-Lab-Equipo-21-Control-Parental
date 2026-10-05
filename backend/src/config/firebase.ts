// ==============================================================================
// Proyecto: BA Protege+
// Componente: Backend API
// Archivo: src/config/firebase.ts
// Descripción: Inicialización singleton del Firebase Admin SDK para autenticación,
//              mensajería (FCM) y otras funcionalidades de Firebase.
// ==============================================================================

import * as admin from 'firebase-admin';
import { getAuth } from 'firebase-admin/auth';
import { getMessaging } from 'firebase-admin/messaging';
import { readFileSync } from 'fs';
import { join } from 'path';

// Declaración global para evitar múltiples instancias en desarrollo con hot-reload
declare global {
  // eslint-disable-next-line no-var
  var firebaseAppInstance: admin.App | undefined;
}

// Inicializa Firebase Admin SDK una sola vez
function initializeFirebaseApp(): admin.App {
  if (global.firebaseAppInstance) {
    return global.firebaseAppInstance;
  }

  const serviceAccountPath = join(process.cwd(), 'firebase-service-account.json');

  let serviceAccount: admin.ServiceAccount;
  try {
    const fileContent = readFileSync(serviceAccountPath, 'utf-8');
    serviceAccount = JSON.parse(fileContent);
  } catch (error) {
    console.error('❌ Error crítico: No se pudo leer firebase-service-account.json');
    console.error(`   Ruta esperada: ${serviceAccountPath}`);
    console.error(`   Error: ${error instanceof Error ? error.message : String(error)}`);
    process.exit(1);
  }

  const app = admin.initializeApp({
    credential: admin.cert(serviceAccount),
  });

  global.firebaseAppInstance = app;

  console.log('✅ Firebase Admin SDK inicializado correctamente');
  console.log(`   Proyecto: ${serviceAccount.projectId}`);

  return app;
}

// Inicialización inmediata (singleton)
const firebaseApp = initializeFirebaseApp();

// Exportaciones de servicios Firebase
// Firebase Authentication
export const auth = getAuth(firebaseApp);
// Firebase Cloud Messaging
export const messaging = getMessaging(firebaseApp);
export default firebaseApp;
