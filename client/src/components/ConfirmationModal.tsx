import styles from "./ConfirmationModal.module.css";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  isConfirming?: boolean;
}

export function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  isConfirming = false,
}: Props) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h2>{title}</h2>
        <p className={styles.message}>{message}</p>
        <div className={styles.actions}>
          <button type="button" onClick={onClose} disabled={isConfirming}>
            Cancel
          </button>
          <button type="button" onClick={onConfirm} disabled={isConfirming} className={styles.confirmButton}>
            {isConfirming ? "Processing..." : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}