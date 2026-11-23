import React from 'react';
import { BookItem, StudyNote } from '../types';

export const BookCoverArt: React.FC<{
  variant: BookItem['coverVariant'];
  title: string;
  author: string;
  className?: string;
}> = ({ variant, title, author, className = 'w-24 h-36' }) => {
  const palettes: Record<
    BookItem['coverVariant'],
    { bg: string; accent: string; secondary: string; text: string }
  > = {
    kahneman: { bg: '#1E293B', accent: '#F59E0B', secondary: '#38BDF8', text: '#F8FAFC' },
    kleppmann: { bg: '#172554', accent: '#60A5FA', secondary: '#34D399', text: '#F8FAFC' },
    newport: { bg: '#064E3B', accent: '#6EE7B7', secondary: '#FDE68A', text: '#ECFDF5' },
    neuro: { bg: '#4A1D4B', accent: '#F472B6', secondary: '#C084FC', text: '#FDF4FF' },
    algorithms: { bg: '#1F2937', accent: '#A78BFA', secondary: '#2DD4BF', text: '#F9FAFB' },
    macro: { bg: '#7C2D12', accent: '#FDBA74', secondary: '#FDE047', text: '#FFF7ED' },
    atomic: { bg: '#134E4A', accent: '#5EEAD4', secondary: '#F9A8D4', text: '#F0FDFA' },
    design: { bg: '#312E81', accent: '#F43F5E', secondary: '#FBBF24', text: '#EEF2FF' },
  };

  const p = palettes[variant];

  return (
    <div
      className={`relative rounded-lg overflow-hidden shadow-sm shrink-0 select-none flex flex-col justify-between p-2.5 ${className}`}
      style={{ backgroundColor: p.bg, color: p.text }}
      aria-label={`Book cover for ${title}`}
    >
      {/* Subtle spine crease */}
      <div className="absolute left-0 top-0 bottom-0 w-2 bg-black/20 pointer-events-none" />
      <svg
        className="absolute inset-0 w-full h-full opacity-25 pointer-events-none"
        viewBox="0 0 120 170"
        fill="none"
      >
        {variant === 'kahneman' && (
          <>
            <circle cx="88" cy="48" r="34" stroke={p.accent} strokeWidth="2.5" />
            <circle cx="52" cy="108" r="42" stroke={p.secondary} strokeWidth="2" strokeDasharray="4 4" />
          </>
        )}
        {variant === 'kleppmann' && (
          <>
            <rect x="24" y="28" width="76" height="24" rx="4" stroke={p.accent} strokeWidth="2" />
            <rect x="24" y="68" width="76" height="24" rx="4" stroke={p.secondary} strokeWidth="2" />
            <rect x="24" y="108" width="76" height="24" rx="4" stroke={p.accent} strokeWidth="2" />
            <path d="M62 52V68M62 92V108" stroke={p.secondary} strokeWidth="2" />
          </>
        )}
        {variant === 'newport' && (
          <>
            <path d="M20 135 Q 60 35 100 135" stroke={p.accent} strokeWidth="3" fill="none" />
            <circle cx="60" cy="64" r="14" stroke={p.secondary} strokeWidth="2.5" />
          </>
        )}
        {variant !== 'kahneman' && variant !== 'kleppmann' && variant !== 'newport' && (
          <>
            <polygon points="60,24 102,94 18,94" stroke={p.accent} strokeWidth="2" />
            <circle cx="60" cy="116" r="28" stroke={p.secondary} strokeWidth="2" />
          </>
        )}
      </svg>

      <div className="relative z-10 pl-1.5">
        <div
          className="w-6 h-1 rounded-full mb-1.5"
          style={{ backgroundColor: p.accent }}
        />
        <p className="text-[11px] font-bold leading-tight line-clamp-3 tracking-tight">
          {title}
        </p>
      </div>
      <div className="relative z-10 pl-1.5">
        <p className="text-[9px] opacity-80 truncate font-medium">{author}</p>
      </div>
    </div>
  );
};

export const NotePreviewArt: React.FC<{
  variant: StudyNote['previewVariant'];
  title: string;
}> = ({ variant, title }) => {
  return (
    <div
      className="relative w-full h-40 overflow-hidden bg-[#FAF8F5] dark:bg-[#221E28] border-b border-[#EAE0E5] dark:border-[#312B3A] p-4 flex flex-col justify-between select-none"
      aria-label={`Visual preview of ${title}`}
    >
      {/* Subtle notebook ruling */}
      <div
        className="absolute inset-0 opacity-45 dark:opacity-15 pointer-events-none"
        style={{
          backgroundImage:
            'repeating-linear-gradient(to bottom, transparent 0px, transparent 19px, rgba(148,163,184,0.35) 20px)',
        }}
      />

      {variant === 'chem' && (
        <svg className="relative z-10 w-full h-full" viewBox="0 0 280 120" fill="none">
          <polygon points="48,30 74,45 74,75 48,90 22,75 22,45" stroke="#006948" strokeWidth="2.2" className="dark:stroke-emerald-400" />
          <circle cx="48" cy="60" r="14" stroke="#006948" strokeWidth="1.5" strokeDasharray="3 3" className="dark:stroke-emerald-400" />
          <path d="M84 60 H134" stroke="#A3265B" strokeWidth="2" className="dark:stroke-pink-400" />
          <path d="M126 54 L136 60 L126 66" stroke="#A3265B" strokeWidth="2" className="dark:stroke-pink-400" />
          <text x="90" y="50" fill="#A3265B" fontSize="10" fontWeight="600" className="dark:fill-pink-300">LDA, -78°C</text>
          <polygon points="178,30 204,45 204,75 178,90 152,75 152,45" stroke="#006782" strokeWidth="2.2" className="dark:stroke-sky-400" />
          <line x1="204" y1="45" x2="232" y2="30" stroke="#006782" strokeWidth="2" className="dark:stroke-sky-400" />
          <text x="236" y="34" fill="#006782" fontSize="12" fontWeight="700" className="dark:fill-sky-300">OH</text>
          <rect x="20" y="100" width="120" height="5" rx="2.5" fill="rgba(0,105,72,0.2)" />
        </svg>
      )}

      {variant === 'algo' && (
        <svg className="relative z-10 w-full h-full" viewBox="0 0 280 120" fill="none">
          <line x1="24" y1="100" x2="256" y2="100" stroke="#64748B" strokeWidth="1.5" />
          <line x1="24" y1="16" x2="24" y2="100" stroke="#64748B" strokeWidth="1.5" />
          <path d="M24 98 Q 100 94 248 22" stroke="#A3265B" strokeWidth="2.4" className="dark:stroke-pink-400" />
          <path d="M24 98 Q 120 82 248 60" stroke="#006948" strokeWidth="2.2" className="dark:stroke-emerald-400" />
          <path d="M24 98 L 248 88" stroke="#006782" strokeWidth="2" strokeDasharray="4 3" className="dark:stroke-sky-400" />
          <text x="188" y="28" fill="#A3265B" fontSize="11" fontWeight="700" className="dark:fill-pink-300">O(n²)</text>
          <text x="188" y="56" fill="#006948" fontSize="11" fontWeight="700" className="dark:fill-emerald-300">O(n log n)</text>
          <text x="196" y="83" fill="#006782" fontSize="11" fontWeight="700" className="dark:fill-sky-300">O(log n)</text>
        </svg>
      )}

      {variant === 'bio' && (
        <svg className="relative z-10 w-full h-full" viewBox="0 0 280 120" fill="none">
          <circle cx="140" cy="60" r="36" stroke="#006948" strokeWidth="2.2" strokeDasharray="6 3" className="dark:stroke-emerald-400" />
          <circle cx="140" cy="24" r="10" fill="#FFD9E1" stroke="#A3265B" strokeWidth="1.8" />
          <circle cx="176" cy="60" r="10" fill="#BAEAFM" stroke="#006782" strokeWidth="1.8" />
          <circle cx="140" cy="96" r="10" fill="#D1FAE5" stroke="#006948" strokeWidth="1.8" />
          <circle cx="104" cy="60" r="10" fill="#FEF3C7" stroke="#B45309" strokeWidth="1.8" />
          <text x="122" y="64" fill="#1F1A1E" fontSize="11" fontWeight="700" className="dark:fill-slate-100">KREBS</text>
          <text x="24" y="42" fill="#006948" fontSize="10" fontWeight="600" className="dark:fill-emerald-300">Pyruvate →</text>
          <text x="198" y="42" fill="#A3265B" fontSize="10" fontWeight="600" className="dark:fill-pink-300">→ 32 ATP</text>
        </svg>
      )}

      {variant === 'econ' && (
        <svg className="relative z-10 w-full h-full" viewBox="0 0 280 120" fill="none">
          <line x1="36" y1="100" x2="244" y2="100" stroke="#64748B" strokeWidth="1.5" />
          <line x1="36" y1="16" x2="36" y2="100" stroke="#64748B" strokeWidth="1.5" />
          <line x1="56" y1="26" x2="220" y2="90" stroke="#A3265B" strokeWidth="2.4" className="dark:stroke-pink-400" />
          <line x1="56" y1="88" x2="220" y2="24" stroke="#006782" strokeWidth="2.4" className="dark:stroke-sky-400" />
          <circle cx="138" cy="57" r="5" fill="#006948" className="dark:fill-emerald-400" />
          <text x="200" y="34" fill="#006782" fontSize="11" fontWeight="700" className="dark:fill-sky-300">LM</text>
          <text x="202" y="82" fill="#A3265B" fontSize="11" fontWeight="700" className="dark:fill-pink-300">IS</text>
          <text x="148" y="54" fill="#006948" fontSize="10" fontWeight="700" className="dark:fill-emerald-300">E* (Y*, r*)</text>
        </svg>
      )}

      {variant === 'neuro' && (
        <svg className="relative z-10 w-full h-full" viewBox="0 0 280 120" fill="none">
          <line x1="20" y1="78" x2="260" y2="78" stroke="#94A3B8" strokeWidth="1" strokeDasharray="3 3" />
          <path
            d="M20 82 L80 82 Q96 80 106 62 L124 18 Q132 10 138 22 L156 96 Q172 104 196 82 L260 82"
            stroke="#1E3A8A"
            strokeWidth="2.5"
            strokeLinecap="round"
            className="dark:stroke-sky-400"
          />
          <circle cx="128" cy="18" r="4" fill="#A3265B" className="dark:fill-pink-400" />
          <text x="140" y="24" fill="#A3265B" fontSize="10" fontWeight="700" className="dark:fill-pink-300">+30 mV Peak</text>
          <text x="26" y="72" fill="#64748B" fontSize="10" className="dark:fill-slate-400">-55 mV Threshold</text>
        </svg>
      )}

      {variant === 'calc' && (
        <svg className="relative z-10 w-full h-full" viewBox="0 0 280 120" fill="none">
          <rect x="44" y="24" width="70" height="70" rx="6" stroke="#006782" strokeWidth="2" className="dark:stroke-sky-400" />
          <text x="58" y="53" fill="#006782" fontSize="14" fontWeight="700" className="dark:fill-sky-300">λ₁  0</text>
          <text x="58" y="79" fill="#006782" fontSize="14" fontWeight="700" className="dark:fill-sky-300">0  λ₂</text>
          <text x="134" y="64" fill="#A3265B" fontSize="15" fontWeight="700" className="dark:fill-pink-300">Av = λv</text>
          <line x1="134" y1="74" x2="218" y2="74" stroke="#A3265B" strokeWidth="2" className="dark:stroke-pink-400" />
        </svg>
      )}
    </div>
  );
};

export const ScholarAvatar: React.FC<{
  name: string;
  size?: 'sm' | 'md' | 'lg';
  tone?: 'rose' | 'emerald' | 'sky' | 'amber';
}> = ({ name, size = 'md', tone = 'rose' }) => {
  const initials = name
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const sizeClass =
    size === 'sm' ? 'w-7 h-7 text-[11px]' : size === 'lg' ? 'w-20 h-20 text-2xl' : 'w-9 h-9 text-xs';

  const toneClass = {
    rose: 'bg-[#FDE2EE] text-[#8C0A48] dark:bg-[#4A1C33] dark:text-[#FFB1C6]',
    emerald: 'bg-[#D1FAE5] text-[#065F46] dark:bg-[#133A2E] dark:text-[#6EE7B7]',
    sky: 'bg-[#E0F2FE] text-[#0369A1] dark:bg-[#103044] dark:text-[#7DD3FC]',
    amber: 'bg-[#FEF3C7] text-[#92400E] dark:bg-[#3F2B11] dark:text-[#FCD34D]',
  }[tone];

  return (
    <div
      className={`${sizeClass} ${toneClass} rounded-full font-semibold flex items-center justify-center shrink-0 select-none tracking-tight`}
      aria-label={name}
    >
      {initials}
    </div>
  );
};
