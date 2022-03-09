import type { ReactNode } from 'react';

interface EmptyStateProps {
  message: string;
  children?: ReactNode;
}

export default function EmptyState({ message, children }: EmptyStateProps) {
  return (
    <div className="state-block">
      <p className="state-message">{message}</p>
      {children}
    </div>
  );
}
