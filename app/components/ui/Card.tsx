import type { HTMLAttributes, ReactElement, ReactNode } from 'react';
import clsx from "clsx";

type CardVariant = 'default' | 'elevated' | 'outlined';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
}

interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  title?: string;
  description?: string;
  action?: ReactNode;
}

const variantStyles: Record<CardVariant, string> = {
  default: 'bg-transparent border-none', // Invisible container strategy
  elevated: 'bg-white dark:bg-surface-800 shadow-soft border border-transparent',
  outlined: 'bg-transparent border border-surface-200 dark:border-surface-800',
};

export function Card({
  variant = 'default',
  className = '',
  children,
  ...props
}: CardProps): ReactElement {
  const baseStyles = 'rounded-lg p-0'; // Remove default padding for invisible look, let children handle layout or add 'p-6' manually if needed. But safe is p-0 for invisible. Wait, existing uses might rely on p-5.
  // Reverting baseStyles change idea. If I remove padding, content touches edges.
  // "Let content sit directly on the page background."
  // If I keep padding, it just pushes content in.
  // I will keep p-5 but maybe make it p-0 for specific "layout" cards if they exist.
  // Actually, if I remove the background, the padding just adds whitespace. That is consistent with "Use whitespace to define groups".
  
  return (
    <div className={clsx('rounded-lg p-6', variantStyles[variant], className)} {...props}>
      {children}
    </div>
  );
}

export function CardHeader({
  title,
  description,
  action,
  className = '',
  children,
  ...props
}: CardHeaderProps): ReactElement {
  return (
    <div
      className={clsx("flex items-start justify-between mb-4 pb-3 border-b border-surface-100 dark:border-surface-700", className)}
      {...props}
    >
      <div>
        {title && (
          <h3 className="text-lg font-semibold text-surface-800 dark:text-surface-100">{title}</h3>
        )}
        {description && (
          <p className="text-sm text-surface-500 dark:text-surface-400 mt-0.5">{description}</p>
        )}
        {children}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}
