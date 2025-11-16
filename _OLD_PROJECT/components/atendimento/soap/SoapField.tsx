// components/atendimento/soap/SoapField.tsx
import React from 'react';
import { useFormContext } from 'react-hook-form';
import type { LucideIcon } from 'lucide-react';
import { AlertCircle } from 'lucide-react';
import { AutoExpandTextarea } from '../../ui/AutoExpandTextarea';

interface SoapFieldProps {
  name: string;
  label: string;
  icon: LucideIcon;
  iconColor: string;
  placeholder: string;
  required?: boolean;
  error?: any;
  maxLength?: number;
}

export const SoapField: React.FC<SoapFieldProps> = ({
  name,
  label,
  icon: Icon,
  iconColor,
  placeholder,
  required = false,
  error,
  maxLength = 5000,
}) => {
  const { register, watch } = useFormContext();
  const value = watch(name) || '';

  const charCount = value.length;
  const charCountColor =
    charCount < 10 ? 'text-red-500' :
    charCount > maxLength * 0.9 ? 'text-amber-600' :
    'text-slate-500';

  return (
    <div className="space-y-2">
      {/* Label + Contador */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className={`w-5 h-5 ${iconColor}`} />
          <label className="text-base font-bold text-slate-900">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        </div>
        <span className={`text-xs ${charCountColor}`}>
          {charCount}/{maxLength}
        </span>
      </div>

      {/* Textarea */}
      <AutoExpandTextarea
        {...register(name)}
        placeholder={placeholder}
        minHeight="120px"
        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${
          error ? 'border-red-500' : 'border-slate-300'
        }`}
      />

      {/* Mensagem de Erro */}
      {error && (
        <p className="text-xs text-red-500 flex items-center gap-1">
          <AlertCircle className="w-3 h-3" />
          {error.message}
        </p>
      )}
    </div>
  );
};
