// ==============================================================================
// Proyecto: BA Protege+
// Componente: Datos de Tutoriales y Videos de Onboarding
// Archivo: src/data/tutorialVideos.ts
// Descripción: Contenido audiovisual y estructura paso a paso de los 3 videos
//              explicativos para los modos Responsable, Niños y Adultos.
// ==============================================================================

export interface VideoTutorialStep {
  second: number;
  title: string;
  description: string;
}

export interface VideoTutorial {
  id: string;
  mode: 'PARENT' | 'CHILD' | 'ADULT';
  badge: string;
  badgeColor: string;
  title: string;
  duration: string;
  durationSeconds: number;
  description: string;
  thumbnailEmoji: string;
  thumbnailBg: string;
  highlights: string[];
  steps: VideoTutorialStep[];
}

export const TUTORIAL_VIDEOS: VideoTutorial[] = [
  {
    id: 'video-parent',
    mode: 'PARENT',
    badge: 'MODO RESPONSABLE',
    badgeColor: '#0D6EFD',
    title: 'Guía para Familias y Tutores Responsables',
    duration: '01:45',
    durationSeconds: 105,
    description:
      'Aprendé a registrar tu cuenta, vincular los celulares de tus hijos en menos de un minuto mediante QR o PIN, supervisar el estado de protección en tiempo real y recibir alertas inmediatas.',
    thumbnailEmoji: '👨‍👩‍👧‍👦',
    thumbnailBg: '#0A3871',
    highlights: [
      'Vinculación instantánea por código QR o PIN de 6 dígitos',
      'Alertas en tiempo real ante intentos de ingreso a sitios de apuestas',
      'Configuración de límites diarios y pausas de pantalla',
      'Privacidad garantizada: no accede a chats ni fotos',
    ],
    steps: [
      {
        second: 0,
        title: 'Paso 1: Creación de cuenta del tutor',
        description: 'Registrate de manera segura con tu email para administrar los dispositivos.',
      },
      {
        second: 25,
        title: 'Paso 2: Generación del código de vinculación',
        description: 'Obtené un código QR o PIN de 6 dígitos para enlazar el teléfono del menor.',
      },
      {
        second: 55,
        title: 'Paso 3: Panel de control y monitoreo activo',
        description: 'Visualizá el escudo de seguridad y los reportes de intentos bloqueados.',
      },
      {
        second: 85,
        title: 'Paso 4: Configuración de límites y horarios',
        description: 'Establecé horarios saludables para el uso de pantallas y descanso escolar.',
      },
    ],
  },
  {
    id: 'video-child',
    mode: 'CHILD',
    badge: 'MODO DISPOSITIVO PROTEGIDO (NIÑOS)',
    badgeColor: '#F59E0B',
    title: 'Funcionamiento en el Teléfono del Menor',
    duration: '01:30',
    durationSeconds: 90,
    description:
      'Conocé cómo se activa el escudo en el celular de tus hijos, cómo actúa el filtrado de red oficial de LOTBA y cómo es la pantalla amigable que previene el acceso a plataformas no autorizadas.',
    thumbnailEmoji: '📱',
    thumbnailBg: '#78350F',
    highlights: [
      'Bloqueo silencioso contra más de 1.000 sitios de apuestas ilegales',
      'Sin ralentizar la conexión ni interferir con las tareas escolares',
      'Pantalla informativa y pedagógica: "Sos menor de edad"',
      'Mecanismos anti-desinstalación y aviso al responsable',
    ],
    steps: [
      {
        second: 0,
        title: 'Paso 1: Vinculación con un solo toque',
        description: 'El menor o el tutor ingresa el PIN proporcionado por el responsable.',
      },
      {
        second: 22,
        title: 'Paso 2: Activación del escudo local LOTBA',
        description: 'Se habilita la protección local por VPN sin intermediarios ni fuga de datos.',
      },
      {
        second: 50,
        title: 'Paso 3: Pantalla educativa preventiva',
        description: 'Al detectar un sitio de casino, se muestra un mensaje claro de protección.',
      },
      {
        second: 72,
        title: 'Paso 4: Telemetría segura en segundo plano',
        description: 'Se reporta el evento al responsable para fomentar el diálogo familiar.',
      },
    ],
  },
  {
    id: 'video-adult',
    mode: 'ADULT',
    badge: 'MODO PROTEGIDO (ADULTOS / AUTOCONTROL)',
    badgeColor: '#8B5CF6',
    title: 'Autoprotección y Prevención para Adultos',
    duration: '02:00',
    durationSeconds: 120,
    description:
      'Descubrí las herramientas de autoprotección voluntaria para personas que desean una barrera efectiva contra las apuestas online, gestión estricta de límites y acceso a líneas confidenciales de ayuda.',
    thumbnailEmoji: '💜',
    thumbnailBg: '#4C1D95',
    highlights: [
      'Activación voluntaria de bloqueo de sitios y apps de juego',
      'Límites estrictos de tiempo para evitar episodios de ludopatía',
      'Pantalla de contención: "Si tenés problemas con el juego, no estás solo"',
      'Acceso directo y gratuito a la línea oficial 0800 de orientación',
    ],
    steps: [
      {
        second: 0,
        title: 'Paso 1: Activación voluntaria del escudo',
        description: 'El adulto decide blindar su propio teléfono contra sitios de apuestas.',
      },
      {
        second: 30,
        title: 'Paso 2: Configuración de límites y bloqueos',
        description: 'Definí pausas y restricciones en aplicaciones de riesgo y horarios nocturnos.',
      },
      {
        second: 65,
        title: 'Paso 3: Mensajes reflexivos y contención',
        description: 'Frente a impulsos, la app presenta una pausa consciente y alternativa saludable.',
      },
      {
        second: 95,
        title: 'Paso 4: Recursos oficiales de autoayuda',
        description: 'Comunicate con especialistas de LOTBA mediante llamadas confidenciales 24/7.',
      },
    ],
  },
];
