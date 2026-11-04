// ==============================================================================
// Proyecto: BA Protege+
// Componente: Backend API
// Archivo: src/config/firebase.ts
// Descripción: Inicialización singleton del Firebase Admin SDK para autenticación,
//              mensajería (FCM) y otras funcionalidades de Firebase.
// ==============================================================================

import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getMessaging } from 'firebase-admin/messaging';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

const serviceAccountPath = join(process.cwd(), 'docs', 'firebase-service-account.json');

let app: App | undefined;

if (!getApps().length) {
  if (existsSync(serviceAccountPath)) {
    try {
      const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'));
      app = initializeApp({
        credential: cert(serviceAccount),
      });
      console.log('🔥 Firebase Admin SDK inicializado correctamente desde credenciales locales.');
    } catch (error) {
      console.error('❌ Error al cargar credenciales locales de Firebase:', error);
    }
  } else if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PRIVATE_KEY) {
    app = initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    });
    console.log('🔥 Firebase Admin SDK inicializado correctamente desde variables de entorno.');
  } else {
    console.warn(
      '⚠️ Firebase Admin SDK: No se detectaron credenciales. Notificaciones push desactivadas.',
    );
  }
} else {
  app = getApps()[0];
}

// Exportaciones de servicios Firebase
export const auth = app ? getAuth(app) : (null as any);
export const messaging = app ? getMessaging(app) : (null as any);
export default app;
