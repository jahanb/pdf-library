
'use client';

export default function ConfirmDialog({ 
  isOpen, 
  title, 
  message, 
  onConfirm, 
  onCancel,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'default'
}) {
  if (!isOpen) return null;

  const confirmButtonClass = type === 'danger' ? 'btn btn-danger' : 'btn btn-primary';

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-content confirm-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="confirm-header">
          <h3>{title}</h3>
        </div>
        
        <div className="confirm-message">
          <p>{message}</p>
        </div>
        
        <div className="confirm-actions">
          <button 
            className="btn btn-secondary"
            onClick={onCancel}
          >
            {cancelText}
          </button>
          <button 
            className={confirmButtonClass}
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
