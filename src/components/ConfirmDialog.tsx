import { useState } from 'react';
import Alert from './Alert';
import Button from './Button';
import Modal from './Modal';

interface ConfirmDialogProps {
  title: string;
  message: string;
  confirmLabel: string;
  errorMessage: string;
  onConfirm: () => Promise<void>;
  onClose: () => void;
}

export default function ConfirmDialog({
  title,
  message,
  confirmLabel,
  errorMessage,
  onConfirm,
  onClose,
}: ConfirmDialogProps) {
  const [working, setWorking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = async () => {
    setError(null);
    setWorking(true);
    try {
      await onConfirm();
    } catch {
      setError(errorMessage);
    } finally {
      setWorking(false);
    }
  };

  return (
    <Modal title={title} onClose={onClose}>
      {error && <Alert>{error}</Alert>}
      <p className="muted">{message}</p>
      <div className="form-actions">
        <Button variant="secondary" onClick={onClose} disabled={working}>
          Cancel
        </Button>
        <Button variant="danger" onClick={handleConfirm} loading={working}>
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}
