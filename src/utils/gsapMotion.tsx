import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export { gsap, ScrollTrigger };

export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * GSAP.com-inspired masked split-word kinetic headline reveal.
 * Words glide up from behind overflow-hidden masks with power4.out & crisp stagger.
 */
interface GsapSplitHeadingProps {
  text: string;
  className?: string;
  as?: 'h1' | 'h2' | 'h3';
  delay?: number;
  highlightLastWord?: boolean;
}

export const GsapSplitHeading: React.FC<GsapSplitHeadingProps> = ({
  text,
  className = '',
  as = 'h1',
  delay = 0.04,
  highlightLastWord = false,
}) => {
  const containerRef = useRef<HTMLHeadingElement | null>(null);
  const words = text.split(' ');

  useEffect(() => {
    const el = containerRef.current;
    if (!el || prefersReducedMotion()) return;

    const ctx = gsap.context(() => {
      const innerWords = el.querySelectorAll<HTMLElement>('.gsap-split-word');
      gsap.fromTo(
        innerWords,
        {
          yPercent: 118,
          rotateX: -36,
          opacity: 0,
        },
        {
          yPercent: 0,
          rotateX: 0,
          opacity: 1,
          duration: 0.78,
          delay,
          stagger: 0.055,
          ease: 'power4.out',
          clearProps: 'transform',
        }
      );
    }, containerRef);

    return () => ctx.revert();
  }, [text, delay]);

  const Tag = as;

  return (
    <Tag
      ref={containerRef}
      className={className}
      style={{ perspective: '700px' }}
    >
      {words.map((word, idx) => {
        const isHighlighted = highlightLastWord && idx === words.length - 1;
        return (
          <span
            key={`${word}-${idx}`}
            className="inline-block overflow-hidden align-bottom pb-0.5 mr-[0.26em] last:mr-0"
          >
            <span
              className={`gsap-split-word inline-block will-change-transform ${
                isHighlighted
                  ? 'text-[#006948] dark:text-[#6EE7B7]'
                  : ''
              }`}
            >
              {word}
            </span>
          </span>
        );
      })}
    </Tag>
  );
};

/**
 * GSAP.com-inspired magnetic interactive button with quickTo pointer tracking
 * and elastic spring rebound on mouse leave / click.
 */
interface GsapMagneticButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  strength?: number;
  children: React.ReactNode;
}

export const GsapMagneticButton: React.FC<GsapMagneticButtonProps> = ({
  strength = 0.28,
  className = '',
  children,
  onClick,
  ...rest
}) => {
  const btnRef = useRef<HTMLButtonElement | null>(null);
  const xToRef = useRef<gsap.QuickToFunc | null>(null);
  const yToRef = useRef<gsap.QuickToFunc | null>(null);

  useEffect(() => {
    const el = btnRef.current;
    if (!el || prefersReducedMotion()) return;
    xToRef.current = gsap.quickTo(el, 'x', { duration: 0.45, ease: 'elastic.out(1, 0.4)' });
    yToRef.current = gsap.quickTo(el, 'y', { duration: 0.45, ease: 'elastic.out(1, 0.4)' });
    return () => {
      gsap.killTweensOf(el);
    };
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    const el = btnRef.current;
    if (!el || !xToRef.current || !yToRef.current || prefersReducedMotion()) return;
    const rect = el.getBoundingClientRect();
    const relX = e.clientX - (rect.left + rect.width / 2);
    const relY = e.clientY - (rect.top + rect.height / 2);
    xToRef.current(relX * strength);
    yToRef.current(relY * strength);
  };

  const handleMouseLeave = () => {
    if (!xToRef.current || !yToRef.current) return;
    xToRef.current(0);
    yToRef.current(0);
  };

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const el = btnRef.current;
    if (el && !prefersReducedMotion()) {
      gsap.fromTo(
        el,
        { scale: 0.93 },
        { scale: 1, duration: 0.42, ease: 'elastic.out(1.2, 0.45)', overwrite: 'auto' }
      );
    }
    onClick?.(e);
  };

  return (
    <button
      ref={btnRef}
      type={rest.type ?? 'button'}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      className={className}
      {...rest}
    >
      {children}
    </button>
  );
};

/**
 * GSAP.com-inspired interactive 3D tilt showcase wrapper with subtle kinetic sheen.
 */
export const GsapKineticCard: React.FC<{
  children: React.ReactNode;
  className?: string;
  maxTilt?: number;
}> = ({ children, className = '', maxTilt = 4.5 }) => {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const rxTo = useRef<gsap.QuickToFunc | null>(null);
  const ryTo = useRef<gsap.QuickToFunc | null>(null);

  useEffect(() => {
    const el = cardRef.current;
    if (!el || prefersReducedMotion()) return;
    rxTo.current = gsap.quickTo(el, 'rotateX', { duration: 0.35, ease: 'power3.out' });
    ryTo.current = gsap.quickTo(el, 'rotateY', { duration: 0.35, ease: 'power3.out' });
    return () => {
      gsap.killTweensOf(el);
    };
  }, []);

  const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = cardRef.current;
    if (!el || !rxTo.current || !ryTo.current || prefersReducedMotion()) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    rxTo.current(-py * maxTilt * 2);
    ryTo.current(px * maxTilt * 2);
  };

  const handleLeave = () => {
    rxTo.current?.(0);
    ryTo.current?.(0);
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      className={className}
      style={{ transformPerspective: 1100, transformStyle: 'preserve-3d' } as React.CSSProperties}
    >
      {children}
    </div>
  );
};
