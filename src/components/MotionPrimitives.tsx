import React, { useEffect } from 'react';
import { AnimatePresence, motion, Variants } from 'motion/react';

export const FLOW_EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

export const FLOW_SPRING = {
  type: 'spring' as const,
  stiffness: 420,
  damping: 32,
  mass: 0.72,
};

export const SOFT_SPRING = {
  type: 'spring' as const,
  stiffness: 300,
  damping: 28,
  mass: 0.85,
};

export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.045,
      delayChildren: 0.02,
    },
  },
};

export const flowItem: Variants = {
  hidden: { opacity: 0, y: 12 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.32,
      ease: FLOW_EASE,
    },
  },
};

export const FocusXMark: React.FC<{ className?: string }> = ({ className = 'w-7 h-7' }) => (
  <svg
    viewBox="0 0 36 36"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden="true"
  >
    <rect width="36" height="36" rx="10" className="fill-[#006948] dark:fill-[#58CD9B]" />
    <path
      d="M11 11.5H23.5M11 18H19.5M11 11.5V25"
      stroke="currentColor"
      strokeWidth="2.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-white dark:text-[#072116]"
    />
    <path
      d="M19.5 18.5L25.5 25M25.5 18.5L19.5 25"
      stroke="currentColor"
      strokeWidth="2.8"
      strokeLinecap="round"
      className="text-[#FFB9F9] dark:text-[#1A0814]"
    />
  </svg>
);

export const AudioWaveBars: React.FC<{ active: boolean; className?: string }> = ({
  active,
  className = '',
}) => {
  if (!active) return null;
  return (
    <span className={`inline-flex items-end gap-[2.5px] h-3.5 ${className}`} aria-hidden="true">
      <span
        className="w-[2.5px] h-full rounded-full bg-[#006948] dark:bg-[#6EE7B7] fx-eq-bar"
        style={{ animationDelay: '0ms' }}
      />
      <span
        className="w-[2.5px] h-full rounded-full bg-[#F56498] dark:bg-[#FFB1C6] fx-eq-bar"
        style={{ animationDelay: '180ms' }}
      />
      <span
        className="w-[2.5px] h-full rounded-full bg-[#006948] dark:bg-[#6EE7B7] fx-eq-bar"
        style={{ animationDelay: '340ms' }}
      />
    </span>
  );
};

interface SegmentedOption<T extends string> {
  id: T;
  label: string;
  count?: number;
  icon?: React.ReactNode;
}

interface SegmentedControlProps<T extends string> {
  options: Array<SegmentedOption<T>>;
  value: T;
  onChange: (val: T) => void;
  layoutId: string;
  variant?: 'rose' | 'surface' | 'emerald';
  size?: 'sm' | 'md';
  className?: string;
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  layoutId,
  variant = 'surface',
  size = 'sm',
  className = '',
}: SegmentedControlProps<T>) {
  const pillStyle =
    variant === 'rose'
      ? 'bg-[#FFB9F9] dark:bg-[#F56498] shadow-xs'
      : variant === 'emerald'
        ? 'bg-[#006948] dark:bg-[#58CD9B] shadow-xs'
        : 'bg-white dark:bg-[#312A3C] shadow-xs';

  const activeText =
    variant === 'rose'
      ? 'text-[#3B1837] dark:text-[#1A0814] font-semibold'
      : variant === 'emerald'
        ? 'text-white dark:text-[#072116] font-semibold'
        : 'text-[#1F1A1E] dark:text-[#F5EFF3] font-semibold';

  const pad = size === 'md' ? 'px-3.5 py-2 text-xs' : 'px-3 py-1.5 text-xs';

  return (
    <div
      className={`inline-flex flex-wrap items-center gap-0.5 p-1 rounded-xl bg-[#F3E7EE]/90 dark:bg-[#221D2A] border border-[#EAE0E5] dark:border-[#322C3C] ${className}`}
    >
      {options.map((opt) => {
        const active = value === opt.id;
        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => onChange(opt.id)}
            className={`relative inline-flex items-center gap-1.5 ${pad} rounded-lg cursor-pointer whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A3265B] ${
              active
                ? activeText
                : 'text-[#574146] dark:text-[#B5A8B2] hover:text-[#1F1A1E] dark:hover:text-[#F5EFF3] font-medium'
            }`}
          >
            {active && (
              <motion.span
                layoutId={layoutId}
                transition={FLOW_SPRING}
                className={`absolute inset-0 rounded-lg ${pillStyle}`}
              />
            )}
            <span className="relative z-10 inline-flex items-center gap-1.5">
              {opt.icon}
              <span>{opt.label}</span>
              {typeof opt.count === 'number' && (
                <span className="font-mono text-[11px] opacity-80 tabular-nums">{opt.count}</span>
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
}

interface AnimatedModalProps {
  open: boolean;
  onClose: () => void;
  maxWidthClass?: string;
  children: React.ReactNode;
}

export const AnimatedModal: React.FC<AnimatedModalProps> = ({
  open,
  onClose,
  maxWidthClass = 'max-w-md',
  children,
}) => {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.16 }}
          onClick={onClose}
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 14 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 10 }}
            transition={FLOW_SPRING}
            onClick={(e) => e.stopPropagation()}
            className={`bg-white dark:bg-[#1C1823] border border-[#EAE0E5] dark:border-[#322C3C] rounded-2xl ${maxWidthClass} w-full shadow-2xl overflow-hidden`}
          >
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
