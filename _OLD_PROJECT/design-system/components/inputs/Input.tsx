import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';

interface InputProps {
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search' | 'date' | 'time' | 'datetime-local';
  placeholder?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onFocus?: (event: React.FocusEvent<HTMLInputElement>) => void;
  onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void;
  onKeyPress?: (event: React.KeyboardEvent<HTMLInputElement>) => void;
  onKeyDown?: (event: React.KeyboardEvent<HTMLInputElement>) => void;
  onKeyUp?: (event: React.KeyboardEvent<HTMLInputElement>) => void;
  label?: string;
  helperText?: string;
  error?: string;
  success?: string;
  disabled?: boolean;
  required?: boolean;
  readOnly?: boolean;
  autoComplete?: string;
  autoFocus?: boolean;
  maxLength?: number;
  minLength?: number;
  pattern?: string;
  step?: number;
  min?: number | string;
  max?: number | string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  className?: string;
  id?: string;
  name?: string;
  containerClassName?: string;
  labelClassName?: string;
  inputClassName?: string;
  helperClassName?: string;
}

export const Input: React.FC<InputProps> = ({
  type = 'text',
  placeholder,
  value,
  defaultValue,
  onChange,
  onFocus,
  onBlur,
  onKeyPress,
  onKeyDown,
  onKeyUp,
  label,
  helperText,
  error,
  success,
  disabled = false,
  required = false,
  readOnly = false,
  autoComplete,
  autoFocus = false,
  maxLength,
  minLength,
  pattern,
  step,
  min,
  max,
  size = 'md',
  fullWidth = false,
  leftIcon,
  rightIcon,
  className = '',
  id,
  name,
  containerClassName = '',
  labelClassName = '',
  inputClassName = '',
  helperClassName = '',
}) => {
  const { themeConfig } = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const [hasValue, setHasValue] = useState(Boolean(value || defaultValue));
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setHasValue(Boolean(value || defaultValue));
  }, [value, defaultValue]);

  const handleFocus = (event: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(true);
    if (onFocus) onFocus(event);
  };

  const handleBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(false);
    if (onBlur) onBlur(event);
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setHasValue(Boolean(event.target.value));
    if (onChange) onChange(event);
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'xs':
        return 'px-3 py-1.5 text-xs';
      case 'sm':
        return 'px-4 py-2 text-sm';
      case 'md':
        return 'px-4 py-3 text-base';
      case 'lg':
        return 'px-5 py-4 text-lg';
      case 'xl':
        return 'px-6 py-5 text-xl';
      default:
        return 'px-4 py-3 text-base';
    }
  };

  const getStateStyles = () => {
    if (disabled) {
      return `
        bg-gray-100 dark:bg-gray-800
        text-gray-400 dark:text-gray-500
        cursor-not-allowed
        border-gray-200 dark:border-gray-700
      `;
    }
    
    if (error) {
      return `
        bg-red-50 dark:bg-red-900/20
        text-red-900 dark:text-red-100
        border-red-300 dark:border-red-600
        focus:border-red-500 focus:ring-red-500
        hover:border-red-400
      `;
    }
    
    if (success) {
      return `
        bg-green-50 dark:bg-green-900/20
        text-green-900 dark:text-green-100
        border-green-300 dark:border-green-600
        focus:border-green-500 focus:ring-green-500
        hover:border-green-400
      `;
    }
    
    if (isFocused) {
      return `
        bg-white dark:bg-gray-900
        text-gray-900 dark:text-white
        border-[${themeConfig.colors.primary}]
        focus:border-[${themeConfig.colors.primary}] focus:ring-[${themeConfig.colors.primary}]
        shadow-lg shadow-[${themeConfig.colors.primaryLight}] shadow-opacity-25
      `;
    }
    
    return `
      bg-white dark:bg-gray-900
      text-gray-900 dark:text-white
      border-gray-300 dark:border-gray-600
      focus:border-[${themeConfig.colors.primary}] focus:ring-[${themeConfig.colors.primary}]
      hover:border-gray-400 dark:hover:border-gray-500
    `;
  };

  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className={`relative ${fullWidth ? 'w-full' : ''} ${containerClassName}`}>
      {label && (
        <label
          htmlFor={inputId}
          className={`
            block mb-2 text-sm font-medium
            ${error ? 'text-red-700 dark:text-red-400' : 'text-gray-700 dark:text-gray-300'}
            ${disabled ? 'text-gray-400 dark:text-gray-500' : ''}
            ${labelClassName}
          `}
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        {leftIcon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className={`text-gray-400 dark:text-gray-500 ${error ? 'text-red-400' : ''} ${success ? 'text-green-400' : ''}`}>
              {leftIcon}
            </span>
          </div>
        )}
        
        <input
          ref={inputRef}
          id={inputId}
          name={name}
          type={type}
          placeholder={placeholder}
          value={value}
          defaultValue={defaultValue}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyPress={onKeyPress}
          onKeyDown={onKeyDown}
          onKeyUp={onKeyUp}
          disabled={disabled}
          required={required}
          readOnly={readOnly}
          autoComplete={autoComplete}
          autoFocus={autoFocus}
          maxLength={maxLength}
          minLength={minLength}
          pattern={pattern}
          step={step}
          min={min}
          max={max}
          className={`
            block w-full
            rounded-xl
            border-2 transition-all duration-200 ease-in-out
            placeholder-gray-400 dark:placeholder-gray-500
            focus:outline-none focus:ring-2 focus:ring-opacity-50
            ${getSizeStyles()}
            ${getStateStyles()}
            ${leftIcon ? 'pl-10' : ''}
            ${rightIcon ? 'pr-10' : ''}
            ${inputClassName}
            ${className}
          `}
          style={{
            fontFamily: themeConfig.typography.fontFamily.secondary,
            transition: themeConfig.transitions.default,
          }}
        />
        
        {rightIcon && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <span className={`text-gray-400 dark:text-gray-500 ${error ? 'text-red-400' : ''} ${success ? 'text-green-400' : ''}`}>
              {rightIcon}
            </span>
          </div>
        )}
      </div>
      
      {(helperText || error || success) && (
        <div className="mt-2">
          {error && (
            <p className={`text-sm text-red-600 dark:text-red-400 ${helperClassName}`}>
              {error}
            </p>
          )}
          {success && (
            <p className={`text-sm text-green-600 dark:text-green-400 ${helperClassName}`}>
              {success}
            </p>
          )}
          {helperText && !error && !success && (
            <p className={`text-sm text-gray-500 dark:text-gray-400 ${helperClassName}`}>
              {helperText}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

// Componente de área de texto
interface TextareaProps {
  placeholder?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onFocus?: (event: React.FocusEvent<HTMLTextAreaElement>) => void;
  onBlur?: (event: React.FocusEvent<HTMLTextAreaElement>) => void;
  label?: string;
  helperText?: string;
  error?: string;
  success?: string;
  disabled?: boolean;
  required?: boolean;
  readOnly?: boolean;
  autoComplete?: string;
  autoFocus?: boolean;
  maxLength?: number;
  minLength?: number;
  rows?: number;
  cols?: number;
  resize?: 'none' | 'both' | 'horizontal' | 'vertical';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  fullWidth?: boolean;
  className?: string;
  id?: string;
  name?: string;
  containerClassName?: string;
  labelClassName?: string;
  textareaClassName?: string;
  helperClassName?: string;
}

export const Textarea: React.FC<TextareaProps> = ({
  placeholder,
  value,
  defaultValue,
  onChange,
  onFocus,
  onBlur,
  label,
  helperText,
  error,
  success,
  disabled = false,
  required = false,
  readOnly = false,
  autoComplete,
  autoFocus = false,
  maxLength,
  minLength,
  rows = 4,
  cols,
  resize = 'vertical',
  size = 'md',
  fullWidth = false,
  className = '',
  id,
  name,
  containerClassName = '',
  labelClassName = '',
  textareaClassName = '',
  helperClassName = '',
}) => {
  const { themeConfig } = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const [hasValue, setHasValue] = useState(Boolean(value || defaultValue));

  useEffect(() => {
    setHasValue(Boolean(value || defaultValue));
  }, [value, defaultValue]);

  const handleFocus = (event: React.FocusEvent<HTMLTextAreaElement>) => {
    setIsFocused(true);
    if (onFocus) onFocus(event);
  };

  const handleBlur = (event: React.FocusEvent<HTMLTextAreaElement>) => {
    setIsFocused(false);
    if (onBlur) onBlur(event);
  };

  const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setHasValue(Boolean(event.target.value));
    if (onChange) onChange(event);
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'xs':
        return 'px-3 py-1.5 text-xs';
      case 'sm':
        return 'px-4 py-2 text-sm';
      case 'md':
        return 'px-4 py-3 text-base';
      case 'lg':
        return 'px-5 py-4 text-lg';
      case 'xl':
        return 'px-6 py-5 text-xl';
      default:
        return 'px-4 py-3 text-base';
    }
  };

  const getStateStyles = () => {
    if (disabled) {
      return `
        bg-gray-100 dark:bg-gray-800
        text-gray-400 dark:text-gray-500
        cursor-not-allowed
        border-gray-200 dark:border-gray-700
      `;
    }
    
    if (error) {
      return `
        bg-red-50 dark:bg-red-900/20
        text-red-900 dark:text-red-100
        border-red-300 dark:border-red-600
        focus:border-red-500 focus:ring-red-500
        hover:border-red-400
      `;
    }
    
    if (success) {
      return `
        bg-green-50 dark:bg-green-900/20
        text-green-900 dark:text-green-100
        border-green-300 dark:border-green-600
        focus:border-green-500 focus:ring-green-500
        hover:border-green-400
      `;
    }
    
    if (isFocused) {
      return `
        bg-white dark:bg-gray-900
        text-gray-900 dark:text-white
        border-[${themeConfig.colors.primary}]
        focus:border-[${themeConfig.colors.primary}] focus:ring-[${themeConfig.colors.primary}]
        shadow-lg shadow-[${themeConfig.colors.primaryLight}] shadow-opacity-25
      `;
    }
    
    return `
      bg-white dark:bg-gray-900
      text-gray-900 dark:text-white
      border-gray-300 dark:border-gray-600
      focus:border-[${themeConfig.colors.primary}] focus:ring-[${themeConfig.colors.primary}]
      hover:border-gray-400 dark:hover:border-gray-500
    `;
  };

  const inputId = id || `textarea-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className={`relative ${fullWidth ? 'w-full' : ''} ${containerClassName}`}>
      {label && (
        <label
          htmlFor={inputId}
          className={`
            block mb-2 text-sm font-medium
            ${error ? 'text-red-700 dark:text-red-400' : 'text-gray-700 dark:text-gray-300'}
            ${disabled ? 'text-gray-400 dark:text-gray-500' : ''}
            ${labelClassName}
          `}
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <textarea
        id={inputId}
        name={name}
        placeholder={placeholder}
        value={value}
        defaultValue={defaultValue}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        disabled={disabled}
        required={required}
        readOnly={readOnly}
        autoComplete={autoComplete}
        autoFocus={autoFocus}
        maxLength={maxLength}
        minLength={minLength}
        rows={rows}
        cols={cols}
        style={{
          resize,
          fontFamily: themeConfig.typography.fontFamily.secondary,
          transition: themeConfig.transitions.default,
        }}
        className={`
          block w-full
          rounded-xl
          border-2 transition-all duration-200 ease-in-out
          placeholder-gray-400 dark:placeholder-gray-500
          focus:outline-none focus:ring-2 focus:ring-opacity-50
          ${getSizeStyles()}
          ${getStateStyles()}
          ${textareaClassName}
          ${className}
        `}
      />
      
      {(helperText || error || success) && (
        <div className="mt-2">
          {error && (
            <p className={`text-sm text-red-600 dark:text-red-400 ${helperClassName}`}>
              {error}
            </p>
          )}
          {success && (
            <p className={`text-sm text-green-600 dark:text-green-400 ${helperClassName}`}>
              {success}
            </p>
          )}
          {helperText && !error && !success && (
            <p className={`text-sm text-gray-500 dark:text-gray-400 ${helperClassName}`}>
              {helperText}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default Input;