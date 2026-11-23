// ==============================================================================
// Proyecto: BA Protege+
// Componente: Autenticación con Google (Google Sign-In)
// Archivo: src/services/googleAuth.service.ts
// Descripción: Servicio de configuración y autenticación federada con Google OAuth.
// ==============================================================================

import { GoogleSignin, statusCodes, type SignInSuccessResponse } from '@react-native-google-signin/google-signin';

export type GoogleUser = SignInSuccessResponse['data'];

export const GOOGLE_WEB_CLIENT_ID = '578907185126-eiec0aq7fsmgpeaufmib9mo837c5or11.apps.googleusercontent.com';

let isConfigured = false;

export function configureGoogleSignIn(): void {
  if (isConfigured) return;
  try {
    GoogleSignin.configure({
      webClientId: GOOGLE_WEB_CLIENT_ID,
      offlineAccess: false,
    });
    isConfigured = true;
  } catch (err) {
    console.warn('[GoogleSignIn] Configuration error:', err);
  }
}

export async function signInWithGoogle(): Promise<GoogleUser | null> {
  configureGoogleSignIn();
  await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
  try {
    await GoogleSignin.signOut();
  } catch {
    // Ignorar si no había sesión previa de Google en el dispositivo
  }
  const response = await GoogleSignin.signIn();
  if (response.type === 'success') {
    return response.data;
  }
  return null;
}

export { statusCodes };
