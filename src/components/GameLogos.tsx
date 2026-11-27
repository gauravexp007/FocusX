import React, { useId } from 'react';

export type BrainGameId =
  | 'mathSprint'
  | 'math24'
  | 'knights'
  | 'syllogism'
  | 'stroop'
  | 'memory';

interface GameLogoProps {
  gameId: BrainGameId;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
}

const SIZE_MAP = {
  xs: 'w-5 h-5',
  sm: 'w-8 h-8',
  md: 'w-11 h-11',
  lg: 'w-14 h-14',
};

/**
 * Distinct, bespoke geometric SVG emblems for every single Mind & Logic Game
 * so each game has an unmistakable visual identity across tabs, catalog cards, and arenas.
 */
export const GameLogo: React.FC<GameLogoProps> = ({ gameId, size = 'md', className = '' }) => {
  const uid = useId();
  const dim = SIZE_MAP[size];
  const gradId = `logo-grad-${gameId}-${uid}`;

  switch (gameId) {
    // 1. 60s Math Sprint: Emerald/Amber Stopwatch + Four-Quadrant Arithmetic Emblem (+ − × ÷)
    case 'mathSprint':
      return (
        <svg viewBox="0 0 48 48" fill="none" aria-hidden="true" className={`${dim} shrink-0 ${className}`}>
          <defs>
            <linearGradient id={gradId} x1="4" y1="4" x2="44" y2="44" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#059669" />
              <stop offset="100%" stopColor="#064E3B" />
            </linearGradient>
          </defs>
          <rect x="3" y="3" width="42" height="42" rx="12" fill={`url(#${gradId})`} />
          <rect x="5" y="5" width="38" height="38" rx="10" stroke="#6EE7B7" strokeOpacity="0.32" strokeWidth="1.2" />
          {/* Subtle quadrant dividers */}
          <path d="M24 10V38M10 24H38" stroke="#A7F3D0" strokeOpacity="0.24" strokeWidth="1.2" strokeLinecap="round" />
          {/* Top-left: + */}
          <path d="M15.5 13V19M12.5 16H18.5" stroke="#ECFDF5" strokeWidth="2.3" strokeLinecap="round" />
          {/* Top-right: − */}
          <path d="M29.5 16H35.5" stroke="#FDE68A" strokeWidth="2.3" strokeLinecap="round" />
          {/* Bottom-left: × */}
          <path d="M13.2 29.7L17.8 34.3M17.8 29.7L13.2 34.3" stroke="#A7F3D0" strokeWidth="2.2" strokeLinecap="round" />
          {/* Bottom-right: ÷ */}
          <path d="M29.5 32H35.5" stroke="#ECFDF5" strokeWidth="2.2" strokeLinecap="round" />
          <circle cx="32.5" cy="29" r="1.25" fill="#FDE68A" />
          <circle cx="32.5" cy="35" r="1.25" fill="#FDE68A" />
          {/* Stopwatch crown accent */}
          <rect x="20" y="1" width="8" height="3" rx="1.5" fill="#F59E0B" />
        </svg>
      );

    // 2. 24-Math Blitz: Rose & Gold Faceted Target Prism Emblem with "24"
    case 'math24':
      return (
        <svg viewBox="0 0 48 48" fill="none" aria-hidden="true" className={`${dim} shrink-0 ${className}`}>
          <defs>
            <linearGradient id={gradId} x1="4" y1="4" x2="44" y2="44" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#BE185D" />
              <stop offset="100%" stopColor="#701A75" />
            </linearGradient>
          </defs>
          <rect x="3" y="3" width="42" height="42" rx="12" fill={`url(#${gradId})`} />
          {/* Target diamond frame */}
          <path d="M24 7L41 24L24 41L7 24L24 7Z" stroke="#FFB9F9" strokeOpacity="0.45" strokeWidth="1.4" fill="#FFFFFF" fillOpacity="0.06" />
          {/* Orbital precision corner ticks */}
          <circle cx="11" cy="11" r="1.6" fill="#FDE047" />
          <circle cx="37" cy="11" r="1.6" fill="#FFB9F9" />
          <circle cx="11" cy="37" r="1.6" fill="#FFB9F9" />
          <circle cx="37" cy="37" r="1.6" fill="#FDE047" />
          {/* Crisp geometric 24 */}
          <text
            x="24"
            y="29.5"
            textAnchor="middle"
            fill="#FFFFFF"
            fontSize="16"
            fontWeight="800"
            fontFamily="Lexend, system-ui, sans-serif"
            letterSpacing="-0.5"
          >
            24
          </text>
        </svg>
      );

    // 3. Knights & Knaves: Royal Cobalt & Silver Split Heraldic Truth/Lie Shield
    case 'knights':
      return (
        <svg viewBox="0 0 48 48" fill="none" aria-hidden="true" className={`${dim} shrink-0 ${className}`}>
          <defs>
            <linearGradient id={gradId} x1="4" y1="4" x2="44" y2="44" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#1D4ED8" />
              <stop offset="100%" stopColor="#1E293B" />
            </linearGradient>
          </defs>
          <rect x="3" y="3" width="42" height="42" rx="12" fill={`url(#${gradId})`} />
          {/* Heraldic Shield split down the middle */}
          <path d="M24 9L36 13.5V23.5C36 31.2 30.8 36.8 24 39.5C17.2 36.8 12 31.2 12 23.5V13.5L24 9Z" fill="#0F172A" stroke="#93C5FD" strokeWidth="1.6" />
          {/* Left half (Knight - luminous Truth) */}
          <path d="M24 9.8V38.6C17.8 36 12.8 30.7 12.8 23.5V14.1L24 9.8Z" fill="#EFF6FF" fillOpacity="0.92" />
          {/* Truth check star on left */}
          <circle cx="18.6" cy="21.5" r="2.6" fill="#1D4ED8" />
          {/* Knave crescent on right */}
          <path d="M30.8 18.8C29.1 19 27.8 20.5 27.8 22.3C27.8 24.1 29.1 25.6 30.8 25.8C29.4 26.7 27.5 26.2 26.7 24.6C25.9 23 26.3 21 27.7 19.9C28.6 19.1 29.7 18.8 30.8 18.8Z" fill="#FBBF24" />
        </svg>
      );

    // 4. Syllogism Verifier: Indigo & Violet Interlocking Triple Venn Rings
    case 'syllogism':
      return (
        <svg viewBox="0 0 48 48" fill="none" aria-hidden="true" className={`${dim} shrink-0 ${className}`}>
          <defs>
            <linearGradient id={gradId} x1="4" y1="4" x2="44" y2="44" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#6D28D9" />
              <stop offset="100%" stopColor="#312E81" />
            </linearGradient>
          </defs>
          <rect x="3" y="3" width="42" height="42" rx="12" fill={`url(#${gradId})`} />
          {/* Triple overlapping Venn rings */}
          <circle cx="24" cy="18.5" r="8.5" stroke="#DDD6FE" strokeWidth="2" fill="#C4B5FD" fillOpacity="0.16" />
          <circle cx="18" cy="28.5" r="8.5" stroke="#93C5FD" strokeWidth="2" fill="#60A5FA" fillOpacity="0.16" />
          <circle cx="30" cy="28.5" r="8.5" stroke="#F9A8D4" strokeWidth="2" fill="#F472B6" fillOpacity="0.16" />
          {/* Central verified intersection node */}
          <circle cx="24" cy="25" r="3.4" fill="#6EE7B7" />
        </svg>
      );

    // 5. Stroop Color Reflex: 4-Spectrum Chromatic Iris Aperture
    case 'stroop':
      return (
        <svg viewBox="0 0 48 48" fill="none" aria-hidden="true" className={`${dim} shrink-0 ${className}`}>
          <rect x="3" y="3" width="42" height="42" rx="12" fill="#18141F" />
          <rect x="4" y="4" width="40" height="40" rx="11" stroke="#FFFFFF" strokeOpacity="0.14" strokeWidth="1.2" />
          {/* Four vivid Stroop chromatic arcs */}
          <path d="M24 9A15 15 0 0 1 39 24H31A7 7 0 0 0 24 17V9Z" fill="#EF4444" />
          <path d="M39 24A15 15 0 0 1 24 39V31A7 7 0 0 0 31 24H39Z" fill="#3B82F6" />
          <path d="M24 39A15 15 0 0 1 9 24H17A7 7 0 0 0 24 31V39Z" fill="#10B981" />
          <path d="M9 24A15 15 0 0 1 24 9V17A7 7 0 0 0 17 24H9Z" fill="#F59E0B" />
          {/* Crisp central reflex pupil */}
          <circle cx="24" cy="24" r="4.2" fill="#FFFFFF" />
        </svg>
      );

    // 6. Pattern Matrix Recall: Teal & Magenta Illuminated 3x3 Memory Grid with Path
    case 'memory':
      return (
        <svg viewBox="0 0 48 48" fill="none" aria-hidden="true" className={`${dim} shrink-0 ${className}`}>
          <defs>
            <linearGradient id={gradId} x1="4" y1="4" x2="44" y2="44" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#0F766E" />
              <stop offset="100%" stopColor="#134E4A" />
            </linearGradient>
          </defs>
          <rect x="3" y="3" width="42" height="42" rx="12" fill={`url(#${gradId})`} />
          {/* 3x3 Memory Tiles */}
          <rect x="10" y="10" width="7.5" height="7.5" rx="2" fill="#5EEAD4" fillOpacity="0.25" />
          <rect x="20.25" y="10" width="7.5" height="7.5" rx="2" fill="#F472B6" />
          <rect x="30.5" y="10" width="7.5" height="7.5" rx="2" fill="#5EEAD4" fillOpacity="0.25" />

          <rect x="10" y="20.25" width="7.5" height="7.5" rx="2" fill="#5EEAD4" />
          <rect x="20.25" y="20.25" width="7.5" height="7.5" rx="2" fill="#F9A8D4" />
          <rect x="30.5" y="20.25" width="7.5" height="7.5" rx="2" fill="#5EEAD4" fillOpacity="0.25" />

          <rect x="10" y="30.5" width="7.5" height="7.5" rx="2" fill="#5EEAD4" fillOpacity="0.25" />
          <rect x="20.25" y="30.5" width="7.5" height="7.5" rx="2" fill="#5EEAD4" fillOpacity="0.25" />
          <rect x="30.5" y="30.5" width="7.5" height="7.5" rx="2" fill="#F472B6" />

          {/* Connecting memory path line */}
          <path d="M13.75 24L24 24L24 13.75M24 24L34.25 34.25" stroke="#FFFFFF" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.85" />
        </svg>
      );
  }
};

// Gentle Web Audio API game feedback chimes (zero external files, fails silently if audio blocked)
let sharedAudioCtx: AudioContext | null = null;

function getAudioCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!sharedAudioCtx) {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (AudioCtx) {
      sharedAudioCtx = new AudioCtx();
    }
  }
  if (sharedAudioCtx && sharedAudioCtx.state === 'suspended') {
    sharedAudioCtx.resume().catch(() => {});
  }
  return sharedAudioCtx;
}

export function playGameTone(
  kind: 'correct' | 'wrong' | 'finish' | 'tile',
  muted: boolean,
  tileIndex = 0
) {
  if (muted) return;
  const ctx = getAudioCtx();
  if (!ctx) return;

  const now = ctx.currentTime;
  const playNote = (freq: number, start: number, dur: number, vol = 0.06, type: OscillatorType = 'sine') => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, start);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(vol, start + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + dur);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(start);
    osc.stop(start + dur + 0.02);
  };

  if (kind === 'correct') {
    playNote(587.33, now, 0.11, 0.055, 'triangle');
    playNote(880, now + 0.06, 0.14, 0.05, 'sine');
  } else if (kind === 'wrong') {
    playNote(210, now, 0.16, 0.06, 'sawtooth');
  } else if (kind === 'finish') {
    playNote(523.25, now, 0.14, 0.06, 'triangle');
    playNote(659.25, now + 0.09, 0.14, 0.06, 'triangle');
    playNote(783.99, now + 0.18, 0.24, 0.065, 'triangle');
  } else if (kind === 'tile') {
    const scale = [330, 392, 440, 523.25, 587.33, 659.25, 783.99, 880];
    playNote(scale[tileIndex % scale.length], now, 0.15, 0.05, 'sine');
  }
}
