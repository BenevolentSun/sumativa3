import React from 'react';
import { useBuilder } from '../../context/BuilderContext';

export default function ToastNotification() {
  const { state } = useBuilder();
  const { toast } = state.ui;

  if (!toast) return null;

  return (
    <div className="toast-container-custom">
      <div className={`toast-item ${toast.type}`}>
        <i className={`bi ${
          toast.type === 'success' ? 'bi-check-circle-fill' :
          toast.type === 'error'   ? 'bi-x-circle-fill' :
                                     'bi-info-circle-fill'
        } me-2`} />
        {toast.message}
      </div>
    </div>
  );
}
