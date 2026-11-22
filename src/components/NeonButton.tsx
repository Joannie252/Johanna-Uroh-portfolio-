import React from 'react';
import { Link } from '../lib/router';

export type NeonButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type NeonButtonSize = 'sm' | 'md' | 'lg';

export interface NeonButtonProps {
  variant?: NeonButtonVariant;
  size?: NeonButtonSize;
  pulse?: boolean;
  shake?: boolean;
  to?: string;
  href?: string;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  children?: React.ReactNode;
  id?: string;
  type?: 'button' | 'submit' | 'reset';
  onClick?: (e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => void;
  target?: string;
  rel?: string;
  title?: string;
  'aria-label'?: string;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

export const NeonButton: React.FC<NeonButtonProps> = ({
  variant = 'primary',
  size = 'md',
  pulse = false,
  shake = false,
  to,
  href,
  disabled = false,
  loading = false,
  className = '',
  children,
  id,
  type = 'button',
  onClick,
  target,
  rel,
  title,
  'aria-label': ariaLabel,
  icon,
  iconPosition = 'right',
}) => {
  // Size classes
  const sizeClasses = {
    sm: 'px-3.5 py-2 text-xs',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-6 py-3.5 text-base',
  }[size];

  // Variant classes
  const variantClass = {
    primary: 'btn-neon-primary',
    secondary: 'btn-neon-secondary',
    ghost:
      'bg-transparent text-zinc-700 dark:text-zinc-300 hover:text-purple-600 dark:hover:text-purple-300 hover:bg-purple-500/10 active:scale-[0.98] transition-all rounded-xl focus-visible:ring-2 focus-visible:ring-purple-400',
    danger:
      'bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-sm hover:shadow-[0_0_16px_rgba(244,63,94,0.4)] active:scale-[0.98] transition-all focus-visible:ring-2 focus-visible:ring-rose-400',
  }[variant];

  const pulseClass = pulse ? 'neon-pulse' : '';
  const shakeClass = shake ? 'neon-shake' : '';
  const disabledClass = disabled || loading ? 'opacity-50 cursor-not-allowed pointer-events-none' : '';

  const combinedClasses = [
    variantClass,
    sizeClasses,
    pulseClass,
    shakeClass,
    disabledClass,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const content = (
    <>
      {loading && (
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {icon && iconPosition === 'left' && <span className="shrink-0">{icon}</span>}
      {children}
      {icon && iconPosition === 'right' && <span className="shrink-0">{icon}</span>}
    </>
  );

  // If internal router link
  if (to && !disabled) {
    return (
      <Link
        id={id}
        to={to}
        className={combinedClasses}
        onClick={onClick}
        title={title}
        aria-label={ariaLabel}
      >
        {content}
      </Link>
    );
  }

  // If external link
  if (href && !disabled) {
    return (
      <a
        id={id}
        href={href}
        className={combinedClasses}
        onClick={onClick}
        target={target}
        rel={target === '_blank' ? 'noopener noreferrer' : rel}
        title={title}
        aria-label={ariaLabel}
      >
        {content}
      </a>
    );
  }

  // Standard button
  return (
    <button
      id={id}
      type={type}
      className={combinedClasses}
      onClick={onClick}
      disabled={disabled || loading}
      title={title}
      aria-label={ariaLabel}
    >
      {content}
    </button>
  );
};
