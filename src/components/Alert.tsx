import type { ReactNode } from 'react';

interface AlertProps {
  variant?: 'error' | 'info';
  children: ReactNode;
}

export default function Alert({ variant = 'error', children }: AlertProps) {
  return (
    <p className={`alert alert-${variant}`} role={variant === 'error' ? 'alert' : 'status'}>
      {children}
    </p>
  );
}
