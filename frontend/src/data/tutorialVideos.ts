// ==============================================================================
// Proyecto: BA Protege+
// Componente: Datos de Tutoriales y Video Único de Onboarding
// Archivo: src/data/tutorialVideos.ts
// Descripción: Contenido audiovisual y estructura del video explicativo único de
//              Onboarding para BA Protege+.
// ==============================================================================

export interface VideoTutorialStep {
  second: number;
  title: string;
  description: string;
}

export interface VideoTutorial {
  id: string;
  mode: 'PARENT' | 'CHILD' | 'ADULT' | 'ALL';
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

export const SINGLE_ONBOARDING_VIDEO: VideoTutorial = {
  id: 'video-onboarding-unico',
  mode: 'ALL',
  badge: 'TUTORIAL OFICIAL (35 SEG)',
  badgeColor: '#007AFF',
  title: 'Guía Completa de Protección y Configuración',
  duration: '00:35',
  durationSeconds: 35,
  description:
    'Video explicativo de 35 segundos que enseña la creación de cuenta responsable (+18), la vinculación instantánea por código QR o PIN y la activación del escudo de seguridad.',
  thumbnailEmoji: '🛡️',
  thumbnailBg: '#0A3871',
  highlights: [
    'Creación de cuenta del tutor responsable con verificación de edad (+18)',
    'Vinculación instantánea mediante código QR o PIN de 6 dígitos',
    'Escudo de filtrado de red local en tiempo real contra sitios de apuestas ilegales',
    'Garantía total de privacidad: no lee ni accede a fotos, chats ni mensajes',
  ],
  steps: [
    {
      second: 0,
      title: 'Paso 1: Creación de cuenta del tutor (+18)',
      description: 'Registrate de manera segura como tutor responsable para administrar la protección.',
    },
    {
      second: 12,
      title: 'Paso 2: Vinculación por código QR o PIN',
      description: 'Generá un código QR o PIN de 6 dígitos para enlazar el teléfono del menor en segundos.',
    },
    {
      second: 24,
      title: 'Paso 3: Protección activa y línea de ayuda 24hs',
      description: 'Filtrado de red VPN en tiempo real contra casas de apuestas y recursos de ayuda 24hs.',
    },
  ],
};

/** Lista con el único video explicativo oficial de onboarding */
export const TUTORIAL_VIDEOS: VideoTutorial[] = [SINGLE_ONBOARDING_VIDEO];

// ==============================================================================
// Estructura de las 3 Pantallas Wizard de Onboarding
// ==============================================================================

export interface WizardStepInfo {
  stepNumber: number; // 1, 2, 3
  stepTag: string;
  title: string;
  subtitle: string;
}

export const ONBOARDING_WIZARD_STEPS: WizardStepInfo[] = [
  {
    stepNumber: 1,
    stepTag: 'Paso 1 de 3 • Introducción y Confianza',
    title: 'Protección Integral y Cuidado Digital Familiar',
    subtitle:
      'Iniciativa oficial de LOTBA para prevenir el acceso de menores a sitios de apuestas online ilegales, con total garantía de privacidad sin lectura de chats ni fotos.',
  },
  {
    stepNumber: 2,
    stepTag: 'Paso 2 de 3 • Modalidades de Uso',
    title: 'Modalidades de Uso de la App',
    subtitle:
      'Conocé las modalidades disponibles: Modo Responsable (Tutor) para administrar reglas, y Modo Protegido para recibir seguridad en el dispositivo.',
  },
  {
    stepNumber: 3,
    stepTag: 'Paso 3 de 3 • Video Explicativo Oficial',
    title: 'Video Explicativo de Onboarding',
    subtitle:
      'Video tutorial de 35 segundos que sintetiza de manera dinámica y clara cómo funciona la app y cómo vincular tus dispositivos.',
  },
];

export interface WizardVideoStep {
  second: number;
  profile: 'RESPONSABLE' | 'MENOR' | 'ADULTO';
  profileLabel: string;
  title: string;
  description: string;
  emoji: string;
  badgeColor: string;
}

export interface OnboardingWizardVideo {
  id: string;
  title: string;
  badge: string;
  duration: string;
  durationSeconds: number;
  isOptional: boolean;
  description: string;
  steps: WizardVideoStep[];
}

export const ONBOARDING_WIZARD_VIDEO: OnboardingWizardVideo = {
  id: 'onboarding-wizard-video',
  title: 'Video Tutorial Oficial de Onboarding',
  badge: 'VIDEO TUTORIAL (35 SEG)',
  duration: '00:35',
  durationSeconds: 35,
  isOptional: true,
  description:
    'Video explicativo de 35 segundos que enseña la creación de cuenta responsable, vinculación por QR y protección activa.',
  steps: [
    {
      second: 0,
      profile: 'RESPONSABLE',
      profileLabel: 'Perfil Responsable',
      title: '👨‍👩‍👧‍👦 Modo Responsable (Tutor)',
      description:
        'Creación de cuenta (+18), vinculación por QR o PIN en 1 minuto, monitoreo del escudo y alertas inmediatas.',
      emoji: '👨‍👩‍👧‍👦',
      badgeColor: '#007AFF',
    },
    {
      second: 12,
      profile: 'MENOR',
      profileLabel: 'Dispositivo Menor',
      title: '📱 Modo Dispositivo Menor',
      description:
        'Escudo local LOTBA sin lentitud ni fuga de datos, bloqueo de sitios de apuestas y mensajes pedagógicos.',
      emoji: '📱',
      badgeColor: '#F59E0B',
    },
    {
      second: 24,
      profile: 'ADULTO',
      profileLabel: 'Dispositivo Adulto',
      title: '💜 Modo Dispositivo Adulto',
      description:
        'Prevención voluntaria para adultos, bloqueo consciente y acceso directo y confidencial a la línea de ayuda 0800 oficial.',
      emoji: '💜',
      badgeColor: '#8B5CF6',
    },
  ],
};
