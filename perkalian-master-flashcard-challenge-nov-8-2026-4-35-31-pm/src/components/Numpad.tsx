import React, { useEffect } from 'react';
import { Delete, Check } from 'lucide-react';

interface NumpadProps {
  value: string;
  onChange: (val: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
  submitLabel?: string;
  autoCheck?: boolean;
}

export const Numpad: React.FC<NumpadProps> = ({
  value,
  onChange,
  onSubmit,
  disabled = false,
  submitLabel = 'PERIKSA',
}) => {
  const handleDigit = (digit: string) => {
    if (disabled) return;
    if (value.length >= 6) return; // Prevent excessive digit spam
    onChange(value + digit);
  };

  const handleBackspace = () => {
    if (disabled) return;
    onChange(value.slice(0, -1));
  };

  const handleClear = () => {
    if (disabled) return;
    onChange('');
  };

  // Keyboard integration for laptops/desktops
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (disabled) return;

      if (e.key >= '0' && e.key <= '9') {
        e.preventDefault();
        handleDigit(e.key);
      } else if (e.key === 'Backspace') {
        e.preventDefault();
        handleBackspace();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        handleClear();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        onSubmit();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [value, disabled, onSubmit]);

  const digits = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];

  return (
    <div className="w-full max-w-sm mx-auto select-none">
      {/* 3x3 Digit Grid */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-2 sm:mb-3">
        {digits.map((num) => (
          <button
            key={num}
            type="button"
            disabled={disabled}
            onClick={() => handleDigit(num)}
            className="h-13 sm:h-15 text-2xl font-display font-extrabold bg-white hover:bg-blue-50 active:scale-95 text-slate-800 rounded-2xl border-2 border-slate-200/90 shadow-xs hover:border-blue-400 hover:text-blue-700 transition-all flex items-center justify-center cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {num}
          </button>
        ))}

        {/* Bottom Row: Clear, 0, Backspace */}
        <button
          type="button"
          disabled={disabled || value.length === 0}
          onClick={handleClear}
          className="h-13 sm:h-15 text-sm font-bold bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-600 rounded-2xl border-2 border-slate-200 shadow-xs transition-all flex items-center justify-center cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
        >
          HAPUS
        </button>

        <button
          type="button"
          disabled={disabled}
          onClick={() => handleDigit('0')}
          className="h-13 sm:h-15 text-2xl font-display font-extrabold bg-white hover:bg-blue-50 active:scale-95 text-slate-800 rounded-2xl border-2 border-slate-200/90 shadow-xs hover:border-blue-400 hover:text-blue-700 transition-all flex items-center justify-center cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          0
        </button>

        <button
          type="button"
          disabled={disabled || value.length === 0}
          onClick={handleBackspace}
          aria-label="Hapus satu angka"
          className="h-13 sm:h-15 bg-amber-50 hover:bg-amber-100 active:scale-95 text-amber-700 rounded-2xl border-2 border-amber-200 shadow-xs transition-all flex items-center justify-center cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Delete className="w-6 h-6" />
        </button>
      </div>

      {/* Primary Submit Button */}
      <button
        type="button"
        disabled={disabled || value.trim().length === 0}
        onClick={onSubmit}
        className="w-full h-13 sm:h-14 bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-display font-extrabold text-lg sm:text-xl rounded-2xl shadow-md hover:shadow-lg active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <Check className="w-5 h-5 stroke-[3]" />
        <span>{submitLabel}</span>
      </button>
    </div>
  );
};
