// ==============================================================================
// Proyecto: BA Protege+
// Utilidad: navigationSession (Persistencia de Sesión y Pantalla Activa)
// Archivo: src/utils/navigationSession.ts
// Descripción: Persiste el estado de navegación, modo de usuario y pantalla activa
//              en AsyncStorage para que el app no se reinicie al volver desde los
//              Ajustes de Android tras modificar o revocar permisos del sistema.
// ==============================================================================

import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppMode } from '../types';
import { ResponsibleInitialAction } from './responsibleFirstAccess';

export type ActiveScreenType =
  | 'ONBOARDING'
  | 'WELCOME'
  | 'LOGIN'
  | 'PAIRING'
  | 'PERMISSIONS'
  | 'ACTION_CHOICE'
  | 'DASHBOARD'
  | 'PROTECTED_DEVICE';

export interface AppNavigationState {
  onboardingCompleted: boolean;
  currentMode: AppMode;
  isParentLoggedIn: boolean;
  parentUser: any | null;
  parentToken: string | null;
  hasGrantedPermissions: boolean;
  hasSelectedResponsibleAction: boolean;
  responsibleActionType: ResponsibleInitialAction;
  isDevicePaired: boolean;
  deviceUuid: string | null;
  activeScreen: ActiveScreenType;
}

const NAV_SESSION_KEY = '@ba_protege_nav_session';

const memoryNavStorage = new Map<string, string>();

const defaultState: AppNavigationState = {
  onboardingCompleted: false,
  currentMode: 'UNSET',
  isParentLoggedIn: false,
  parentUser: null,
  parentToken: null,
  hasGrantedPermissions: false,
  hasSelectedResponsibleAction: false,
  responsibleActionType: 'NONE',
  isDevicePaired: false,
  deviceUuid: null,
  activeScreen: 'ONBOARDING',
};

export async function saveNavigationState(state: Partial<AppNavigationState>): Promise<void> {
  try {
    const current = await getNavigationState();
    const updated: AppNavigationState = {
      ...current,
      ...state,
    };
    const json = JSON.stringify(updated);
    memoryNavStorage.set(NAV_SESSION_KEY, json);
    await AsyncStorage.setItem(NAV_SESSION_KEY, json);
  } catch (e) {
    // Fallback en memoria
  }
}

export async function getNavigationState(): Promise<AppNavigationState> {
  try {
    let raw = await AsyncStorage.getItem(NAV_SESSION_KEY);
    if (!raw) {
      raw = memoryNavStorage.get(NAV_SESSION_KEY) || null;
    }
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        ...defaultState,
        ...parsed,
      };
    }
  } catch (e) {
    // Fallback a default
  }
  return { ...defaultState };
}

export async function clearNavigationSession(): Promise<void> {
  try {
    memoryNavStorage.delete(NAV_SESSION_KEY);
    const current = await getNavigationState();
    const cleared: AppNavigationState = {
      ...defaultState,
      onboardingCompleted: current.onboardingCompleted,
      activeScreen: current.onboardingCompleted ? 'WELCOME' : 'ONBOARDING',
    };
    await AsyncStorage.setItem(NAV_SESSION_KEY, JSON.stringify(cleared));
  } catch (e) {
    // Fallback
  }
}
