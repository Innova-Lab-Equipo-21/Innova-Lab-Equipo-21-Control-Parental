// ==============================================================================
// Proyecto: BA Protege+
// Componente: Permission Definitions & Configs
// Archivo: src/components/permissions/permissionConfigs.ts
// Descripción: Configuración declarativa de textos, subtítulos y pasos pedagógicos
//              para los 6 permisos clave de la aplicación.
// ==============================================================================

import { PermissionDefinition } from './types';

export const PERMISSION_DEFINITIONS: PermissionDefinition[] = [
  {
    key: 'vpn',
    title: 'Servicio de filtrado VPN',
    subtitle: 'Bloqueo de sitios de apuestas y contenido no seguro',
    detailedText:
      'Crea un túnel local en el dispositivo para interceptar y bloquear solicitudes a casas de apuestas clandestinas de la lista oficial LOTBA, sin enviar tu tráfico a servidores externos.',
    steps: [
      'Activá el interruptor del permiso.',
      "En el diálogo del sistema 'Solicitud de conexión', confirmá tocando Aceptar.",
      'Verificá que aparezca el ícono de llave o escudo en la barra de notificaciones superior.',
    ],
    actionLabel: 'Autorizar filtrado VPN',
    loadingKey: 'vpn',
  },
  {
    key: 'accessibility',
    title: 'Servicio de accesibilidad',
    subtitle: 'Protección antidesinstalación y cierre forzado',
    detailedText:
      'Protección antidesinstalación: impide que el menor o un tercero cierre forzadamente la app, la suspenda o la elimine sin autorizar previamente el PIN del tutor responsable.',
    steps: [
      'Activá el interruptor para abrir Ajustes de Accesibilidad.',
      "Buscá y seleccioná 'BA Protege+' en la lista de aplicaciones instaladas.",
      "Activá el servicio y confirmá tocando 'Permitir' en la ventana de advertencia.",
    ],
    actionLabel: 'Activar servicio de accesibilidad',
    loadingKey: 'accessibility',
  },
  {
    key: 'notifications',
    title: 'Notificaciones del sistema',
    subtitle: 'Alertas inmediatas y estado de supervisión',
    detailedText:
      'Mantiene la notificación de servicio persistente de seguridad en la barra de estado y envía alertas instantáneas de intentos de bloqueo o límites alcanzados.',
    steps: [
      'Activá el interruptor para habilitar las notificaciones.',
      "En la ventana emergente de permisos de Android, seleccioná 'Permitir'.",
      'Comprobá que las alertas del sistema no queden silenciadas.',
    ],
    actionLabel: 'Permitir notificaciones',
    loadingKey: 'notifications',
  },
  {
    key: 'batteryOptimization',
    title: 'Optimización de batería',
    subtitle: 'Protección continua con pantalla apagada',
    detailedText:
      'Evita que el ahorro de energía de Android suspenda o detenga el motor de filtrado cuando el celular esté con pantalla apagada o en reposo prolongado.',
    steps: [
      'Activá el interruptor de exención de batería.',
      "En el aviso del sistema '¿Ignorar optimizaciones de batería?', elegí 'Permitir' (o Sin restricciones).",
      'La app quedará autorizada para operar ininterrumpidamente en segundo plano.',
    ],
    actionLabel: 'Conceder exención de batería',
    loadingKey: 'battery',
  },
  {
    key: 'location',
    title: 'Ubicación y geolocalización',
    subtitle: 'Registro de localización y seguridad familiar',
    detailedText:
      'Utiliza el sensor GPS del dispositivo para registrar la dirección exacta para el responsable. Si el permiso no es otorgado o no hay señal GPS satelital, el sistema obtiene la ubicación aproximada basada en la red IP.',
    steps: [
      'Activá el interruptor del permiso de ubicación.',
      "En el diálogo del sistema, seleccioná 'Mientras la app está en uso' o 'Siempre'.",
      'Asegurate de mantener activada la ubicación precisa del dispositivo.',
    ],
    actionLabel: 'Autorizar permiso de ubicación (GPS)',
    loadingKey: 'location',
  },
  {
    key: 'usageStats',
    title: 'Estadísticas de uso de aplicaciones',
    subtitle: 'Supervisión de tiempo en pantalla y límites',
    detailedText:
      'Necesario para supervisar el tiempo en primer plano de las aplicaciones y hacer cumplir los horarios y límites de tiempo diario configurados por el responsable.',
    steps: [
      "Activá el interruptor para abrir la sección 'Acceso de uso' en Ajustes.",
      "Localizá y seleccioná 'BA Protege+' en la lista de aplicaciones.",
      "Habilitá la opción 'Permitir seguimiento de uso' (o acceso a datos de uso).",
    ],
    actionLabel: 'Autorizar estadísticas de uso',
    loadingKey: 'usageStats',
  },
];
