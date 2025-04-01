import React from 'react';
import Modal from './Modal';

const ConfirmationDialog = ({ isOpen, onConfirm, onCancel, message }) => {
  return (
    <Modal isOpen={isOpen} onClose={onCancel}>
      <div className="confirmation-dialog">
        <p>{message}</p>
        <div className="dialog-actions">
          <button className="btn confirm" onClick={onConfirm}>Confirm</button>
          <button className="btn cancel" onClick={onCancel}>Cancel</button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmationDialog;