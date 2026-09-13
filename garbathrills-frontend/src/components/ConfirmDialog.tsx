interface ConfirmDialogProps {
  title: string;
  message: string;
  confirmLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmDisabled?: boolean;
  children?: React.ReactNode;
}

const ConfirmDialog = ({
  title,
  message,
  confirmLabel,
  onConfirm,
  onCancel,
  confirmDisabled,
  children,
}: ConfirmDialogProps) => {
  return (
    <div className="match-modal-overlay" onClick={onCancel}>
      <div className="confirm-dialog" onClick={(e) => e.stopPropagation()}>
        <h3>{title}</h3>
        <p>{message}</p>
        {children}
        <div className="profile-edit-actions">
          <button type="button" className="btn-secondary" onClick={onCancel}>
            Cancel
          </button>
          <button type="button" className="btn-danger" onClick={onConfirm} disabled={confirmDisabled}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;