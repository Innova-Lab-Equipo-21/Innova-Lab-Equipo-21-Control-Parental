// ==============================================================================
// Proyecto: BA Protege+
// Componente: Permission Definitions & Configs
// Archivo: src/components/permissions/permissionConfigs.ts
// Descripción: Configuración declarativa de textos y pasos pedagógicos
//              para los 6 permisos clave de la aplicación.
// ==============================================================================

import { PermissionDefinition } from './types';

export const PERMISSION_DEFINITIONS: PermissionDefinition[] = [
  {
    key: 'vpn',
    title: 'Filtro para bloquear sitios y apps',
    detailedText:
      'Activá este filtro para bloquear sitios y apps poco fiables. Tus datos privados quedarán protegidos en tu celular.',
    steps: [
      'Hacé clic en el botón “Activar filtro seguro”.',
      'Cuando te aparezca la ventana de solicitud de conexión, hacé clic en “Aceptar”.',
      'Verificá que aparezca el ícono de llave o escudo en la barra de notificaciones superior.',
    ],
    actionLabel: 'Activar filtro seguro',
    loadingKey: 'vpn',
  },
  {
    key: 'accessibility',
    title: 'Protección antidesinstalación',
    detailedText:
      'Activá esta protección para que la aplicación no se cierre o se elimine por error. De esta forma, tu protección y la de los tuyos se mantendrá siempre activa.',
    steps: [
      'Hacé clic en el botón “Activar antidesinstalación”.',
      'Buscá y seleccioná “BA Protege +” en la lista de aplicaciones instaladas.',
      'Confirmá la protección tocando “Permitir” en la ventana de advertencia.',
    ],
    actionLabel: 'Activar antidesinstalación',
    loadingKey: 'accessibility',
  },
  {
    key: 'notifications',
    title: 'Notificaciones del sistema',
    detailedText:
      'Activá las notificaciones para recibir avisos de intentos de evasión de sitios y apps bloqueados y mensajes de advertencia cuando el tiempo en las aplicaciones alcanzó un límite establecido.',
    steps: [
      'Hacé clic en el botón “Activar notificaciones”.',
      'En la ventana emergente de permisos de Android seleccioná “Permitir”.',
      'Comprobá que las notificaciones no queden silenciadas.',
    ],
    actionLabel: 'Activar notificaciones',
    loadingKey: 'notifications',
  },
  {
    key: 'batteryOptimization',
    title: 'Protección con pantalla apagada',
    detailedText:
      'Este permiso mantiene activa la protección contra sitios y apps de juegos y apuestas ilegales las 24 horas, inclusive cuando el celular está en reposo o con el ahorro de energía activado.',
    steps: [
      'Hacé clic en el botón “Activar protección continua”.',
      'En la ventana emergente de permisos de Android seleccioná “Permitir”.',
    ],
    actionLabel: 'Activar protección continua',
    loadingKey: 'battery',
  },
  {
    key: 'location',
    title: 'Ubicación y geolocalización',
    detailedText:
      'Activá este permiso para que la aplicación reconozca la ubicación de tu celular y siempre te lleguen las alertas para mantener una navegación segura.',
    steps: [
      'Hacé clic en el botón “Activar ubicación”.',
      'En la ventana emergente de permisos de Android seleccioná “Mientras la app está en uso” o “Siempre”.',
      'Chequeá que tengas activada la localización precisa del celular.',
    ],
    actionLabel: 'Activar ubicación',
    loadingKey: 'location',
  },
  {
    key: 'usageStats',
    title: 'Estadísticas de uso de aplicaciones',
    detailedText:
      'Activá este permiso para que puedas ver el tiempo en las aplicaciones y cumplir con los límites diarios que establezcas para vos y tu entorno.',
    steps: [
      'Hacé clic en el botón “Activar estadísticas”.',
      'Localizá y seleccioná “BA Protege +” en la lista de aplicaciones.',
      'Habilitá la opción “Permitir seguimiento de uso” o “Permitir acceso a datos de uso”.',
    ],
    actionLabel: 'Activar estadísticas',
    loadingKey: 'usageStats',
  },
];
