import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  loading?: boolean;
  children: ReactNode;
}

export default function Button({
  variant = 'primary',
  loading = false,
  disabled,
  children,
  ...buttonProps
}: ButtonProps) {
  return (
    <button
      {...buttonProps}
      className={`btn btn-${variant}`}
      disabled={disabled || loading}
    >
      {loading ? 'Working...' : children}
    </button>
  );
}
