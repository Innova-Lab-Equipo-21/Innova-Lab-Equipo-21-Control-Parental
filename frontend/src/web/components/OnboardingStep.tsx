// ==============================================================================
// Proyecto: BA Protege+
// Componente: Web Simulator - OnboardingStep (Paso 1)
// Archivo: src/web/components/OnboardingStep.tsx
// Descripción: Paso 1 del flujo con reproductor de video tutorial simulado de 3 modos.
// ==============================================================================

import React from 'react';

export interface OnboardingVideo {
  mode: string;
  badge: string;
  badgeColor: string;
  title: string;
  duration: string;
  totalSec: number;
  emoji: string;
  bg: string;
  desc: string;
  highlights: string[];
  steps: { sec: number; title: string; desc: string }[];
}

interface OnboardingStepProps {
  onbVideos: OnboardingVideo[];
  onbIndex: number;
  onbPlaying: boolean;
  onbSeconds: number;
  onChangeVideoIndex: (index: number) => void;
  onTogglePlay: () => void;
  onNextStep: () => void;
}

export const OnboardingStep: React.FC<OnboardingStepProps> = ({
  onbVideos,
  onbIndex,
  onbPlaying,
  onbSeconds,
  onChangeVideoIndex,
  onTogglePlay,
  onNextStep,
}) => {
  const currentVideo = onbVideos[onbIndex];
  const videoPercent = Math.min(100, Math.round((onbSeconds / currentVideo.totalSec) * 100));
  const formatTime = (s: number) =>
    `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

  return (
    <div style={{ padding: '16px 14px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <span style={{ fontSize: '11px', fontWeight: '800', backgroundColor: '#E2E8F0', padding: '3px 8px', borderRadius: '6px', color: '#475569' }}>
          PASO 1 • ONBOARDING Y VIDEOS
        </span>
        <button
          style={{ background: 'none', border: 'none', color: '#007AFF', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}
          onClick={onNextStep}
        >
          Saltar a Selección ✕
        </button>
      </div>

      <div style={{ display: 'flex', gap: '6px', marginBottom: '14px' }}>
        {onbVideos.map((vid, idx) => (
          <button
            key={idx}
            style={{
              flex: 1,
              padding: '8px 4px',
              borderRadius: '10px',
              border: 'none',
              backgroundColor: onbIndex === idx ? vid.badgeColor : '#F1F5F9',
              color: onbIndex === idx ? '#FFF' : '#64748B',
              fontSize: '11px',
              fontWeight: '700',
              cursor: 'pointer',
            }}
            onClick={() => onChangeVideoIndex(idx)}
          >
            {vid.emoji} {vid.mode === 'PARENT' ? 'Tutor' : vid.mode === 'CHILD' ? 'Menor' : 'Adulto'}
          </button>
        ))}
      </div>

      <div style={{ backgroundColor: currentVideo.bg, borderRadius: '16px', padding: '16px', color: '#FFF', marginBottom: '14px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <span style={{ fontSize: '10px', fontWeight: '800', backgroundColor: 'rgba(255,255,255,0.2)', padding: '3px 8px', borderRadius: '6px' }}>
            {currentVideo.badge}
          </span>
          <span style={{ fontSize: '11px', fontWeight: '600' }}>⏱️ {currentVideo.duration}</span>
        </div>

        <div style={{ fontSize: '32px', textAlign: 'center', margin: '8px 0' }}>{currentVideo.emoji}</div>
        <h3 style={{ fontSize: '16px', fontWeight: '800', textAlign: 'center', marginBottom: '4px' }}>
          {currentVideo.title}
        </h3>
        <p style={{ fontSize: '12px', opacity: 0.9, textAlign: 'center', marginBottom: '14px', lineHeight: '1.3' }}>
          {currentVideo.desc}
        </p>

        <div style={{ backgroundColor: 'rgba(255,255,255,0.2)', height: '6px', borderRadius: '3px', marginBottom: '10px', overflow: 'hidden' }}>
          <div style={{ backgroundColor: '#FFF', height: '100%', width: `${videoPercent}%`, transition: 'width 0.3s' }}></div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button
            style={{ padding: '8px 16px', borderRadius: '20px', backgroundColor: '#FFF', color: currentVideo.bg, border: 'none', fontWeight: '800', fontSize: '12px', cursor: 'pointer' }}
            onClick={onTogglePlay}
          >
            {onbPlaying ? '⏸ Pausar Video' : '▶ Reproducción Simulada'}
          </button>
          <span style={{ fontSize: '11px', fontWeight: '700' }}>
            {formatTime(onbSeconds)} / {currentVideo.duration}
          </span>
        </div>
      </div>

      <button
        style={{ width: '100%', height: '46px', borderRadius: '12px', backgroundColor: '#007AFF', color: '#FFF', border: 'none', fontWeight: '800', fontSize: '14px', cursor: 'pointer' }}
        onClick={onNextStep}
      >
        Paso 2: Seleccionar Modo ➔
      </button>
    </div>
  );
};
