import type { CSSProperties, ReactNode } from 'react';

interface CyanoSlotProps {
  tone?: 'deep' | 'wash';
  hue?: number;
  caption?: string;
  credit?: string;
  aspect?: string;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
}

/**
 * Bloc « cyanotype » servant de repli visuel quand une œuvre n'a pas
 * d'image chargée (ou pour les zones décoratives). Le dégradé varie de
 * façon stable selon la teinte et la tonalité.
 */
export default function CyanoSlot({
  tone = 'deep',
  hue = 218,
  caption = '',
  credit = 'placeholder',
  aspect = '3 / 4',
  className = '',
  style,
  children,
}: CyanoSlotProps) {
  const deep = tone === 'deep' ? `oklch(0.30 0.10 ${hue})` : `oklch(0.50 0.10 ${hue})`;
  const mid = tone === 'deep' ? `oklch(0.40 0.10 ${hue})` : `oklch(0.62 0.08 ${hue})`;
  const hi = tone === 'deep' ? `oklch(0.55 0.08 ${hue})` : `oklch(0.78 0.05 ${hue})`;

  const bgStyle: CSSProperties = {
    background: `radial-gradient(120% 80% at 30% 35%, ${hi} 0%, ${mid} 45%, ${deep} 100%)`,
    aspectRatio: aspect,
    ...style,
  };

  return (
    <div className={`cyano ${className}`.trim()} style={bgStyle}>
      {children}
      {(caption || credit) && (
        <div className="ph-meta">
          <em>{caption}</em>
          <span>{credit}</span>
        </div>
      )}
    </div>
  );
}
