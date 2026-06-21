import type { ReactNode } from 'react';

// ============================================================
// Types
// ============================================================

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

export interface AvatarProps {
  src?: string | null;
  alt?: string;
  name?: string; // used to generate initials fallback
  size?: AvatarSize;
  /** Show story ring (violet→blue gradient border) */
  hasStory?: boolean;
  /** Show online indicator dot */
  online?: boolean;
  className?: string;
  onClick?: () => void;
}

// ============================================================
// Style maps
// ============================================================

const sizeMap: Record<AvatarSize, { container: string; img: string; text: string; dot: string }> = {
  xs: {
    container: 'h-6 w-6',
    img: 'h-6 w-6',
    text: 'text-[10px]',
    dot: 'h-1.5 w-1.5 bottom-0 right-0',
  },
  sm: { container: 'h-8 w-8', img: 'h-8 w-8', text: 'text-xs', dot: 'h-2 w-2 bottom-0 right-0' },
  md: {
    container: 'h-10 w-10',
    img: 'h-10 w-10',
    text: 'text-sm',
    dot: 'h-2.5 w-2.5 bottom-0.5 right-0.5',
  },
  lg: {
    container: 'h-14 w-14',
    img: 'h-14 w-14',
    text: 'text-base',
    dot: 'h-3 w-3 bottom-0.5 right-0.5',
  },
  xl: {
    container: 'h-20 w-20',
    img: 'h-20 w-20',
    text: 'text-xl',
    dot: 'h-3.5 w-3.5 bottom-1 right-1',
  },
  '2xl': {
    container: 'h-28 w-28',
    img: 'h-28 w-28',
    text: 'text-2xl',
    dot: 'h-4 w-4 bottom-1 right-1',
  },
};

// ============================================================
// Helpers
// ============================================================

/** Generate 1–2 uppercase initials from a name */
const getInitials = (name?: string): string => {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  return parts.length === 1
    ? parts[0][0].toUpperCase()
    : `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
};

/** Deterministic hue from name string for consistent bg color */
const getHue = (name?: string): number => {
  if (!name) return 260;
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return Math.abs(hash % 360);
};

// ============================================================
// Component
// ============================================================

const Avatar = ({
  src,
  alt,
  name,
  size = 'md',
  hasStory = false,
  online = false,
  className = '',
  onClick,
}: AvatarProps): ReactNode => {
  const styles = sizeMap[size];
  const initials = getInitials(name);
  const hue = getHue(name);

  const inner = (
    <div className={`relative inline-flex shrink-0 rounded-full overflow-hidden ${className}`}>
      {/* Story ring wrapper */}
      {hasStory ? (
        <div className="story-ring">
          <div className="story-ring-inner">
            <AvatarInner
              src={src}
              alt={alt || name || 'Avatar'}
              initials={initials}
              hue={hue}
              styles={styles}
            />
          </div>
        </div>
      ) : (
        <AvatarInner
          src={src}
          alt={alt || name || 'Avatar'}
          initials={initials}
          hue={hue}
          styles={styles}
        />
      )}

      {/* Online indicator */}
      {online && (
        <span
          className={[
            'absolute rounded-full bg-success-500 ring-2 ring-surface-950',
            styles.dot,
          ].join(' ')}
          aria-label="Online"
        />
      )}
    </div>
  );

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="focus-visible:ring-2 focus-visible:ring-brand-500 rounded-full"
        aria-label={`${name || 'User'} avatar`}
      >
        {inner}
      </button>
    );
  }

  return inner;
};

// ============================================================
// Inner — image or initials fallback
// ============================================================

interface AvatarInnerProps {
  src?: string | null;
  alt: string;
  initials: string;
  hue: number;
  styles: (typeof sizeMap)[AvatarSize];
}

const AvatarInner = ({ src, alt, initials, hue, styles }: AvatarInnerProps): ReactNode => {
  if (src) {
    return <img src={src} alt={alt} className={`${styles.img} rounded-full object-cover`} />;
  }

  return (
    <div
      className={[
        styles.container,
        'rounded-full flex items-center justify-center font-semibold text-white select-none',
      ].join(' ')}
      style={{ backgroundColor: `hsl(${hue}, 65%, 35%)` }}
      aria-label={alt}
    >
      <span className={styles.text}>{initials}</span>
    </div>
  );
};

export default Avatar;
