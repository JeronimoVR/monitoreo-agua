'use client';

import { useState } from 'react';

interface EditEmailModalProps {
  isOpen: boolean;
  value: string;
  isLoading?: boolean;
  onChange: (value: string) => void;
  onClose: () => void;
  onSave: () => void;
}

export const EditEmailModal = ({
  isOpen,
  value,
  isLoading = false,
  onChange,
  onClose,
  onSave,
}: EditEmailModalProps) => {
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const validateAndSave = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      setError('Por favor, ingresa un correo electrónico válido');
      return;
    }
    setError(null);
    onSave();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl">
        <h3 className="text-xl font-bold text-slate-900 mb-4">
          Editar correo electrónico
        </h3>

        <input
          type="email"
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            if (error) setError(null);
          }}
          placeholder="Ingresa tu nuevo correo electrónico"
          className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 mb-1 text-slate-900 ${
            error ? 'border-red-500' : 'border-slate-200'
          }`}
          autoFocus
        />
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        {!error && <div className="mb-4"></div>}

        <div className="flex gap-3">
          <button
            onClick={() => {
              setError(null);
              onClose();
            }}
            className="flex-1 px-4 py-2 border border-slate-200 rounded-xl text-slate-700 font-semibold hover:bg-slate-50 transition-colors"
          >
            Cancelar
          </button>

          <button
            onClick={validateAndSave}
            disabled={isLoading}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </div>
    </div>
  );
};
