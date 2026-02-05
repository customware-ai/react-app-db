import type { HTMLAttributes, ReactElement } from 'react';
import clsx from "clsx";

type BadgeVariant =
  | 'default'
  | 'primary'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: 'bg-surface-100 dark:bg-surface-700 text-surface-700 dark:text-surface-300',
  primary: 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400',
  success: 'bg-success-light dark:bg-green-900/30 text-success-dark dark:text-green-400',
  warning: 'bg-warning-light dark:bg-amber-900/30 text-warning-dark dark:text-amber-400',
  danger: 'bg-danger-light dark:bg-red-900/30 text-danger-dark dark:text-red-400',
  info: 'bg-info-light dark:bg-blue-900/30 text-info-dark dark:text-blue-400',
};

export function Badge({
  variant = 'default',
  className = '',
  children,
  ...props
}: BadgeProps): ReactElement {
  const baseStyles =
    'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium';

  return (
    <span
      className={clsx(baseStyles, variantStyles[variant], className)}
      {...props}
    >
      {children}
    </span>
  );
}
