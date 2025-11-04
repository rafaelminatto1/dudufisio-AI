import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';

interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
  icon?: React.ReactNode;
}

interface SelectProps {
  options: SelectOption[];
  value?: string | number;
  defaultValue?: string | number;
  onChange?: (value: string | number) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  label?: string;
  placeholder?: string;
  helperText?: string;
  error?: string;
  success?: string;
  disabled?: boolean;
  required?: boolean;
  multiple?: boolean;
  searchable?: boolean;
  clearable?: boolean;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  fullWidth?: boolean;
  className?: string;
  id?: string;
  name?: string;
  containerClassName?: string;
  labelClassName?: string;
  selectClassName?: string;
  helperClassName?: string;
}

export const Select: React.FC<SelectProps> = ({
  options,
  value,
  defaultValue,
  onChange,
  onFocus,
  onBlur,
  label,
  placeholder = 'Selecione uma opção...',
  helperText,
  error,
  success,
  disabled = false,
  required = false,
  multiple = false,
  searchable = false,
  clearable = false,
  size = 'md',
  fullWidth = false,
  className = '',
  id,
  name,
  containerClassName = '',
  labelClassName = '',
  selectClassName = '',
  helperClassName = '',
}) => {
  const { themeConfig } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedValue, setSelectedValue] = useState<string | number>(value || defaultValue || '');
  const selectRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (value !== undefined) {
      setSelectedValue(value);
    }
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && searchable) {
      searchInputRef.current?.focus();
    }
  }, [isOpen, searchable]);

  const filteredOptions = searchable
    ? options.filter(option =>
        option.label.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : options;

  const selectedOption = options.find(option => option.value === selectedValue);

  const handleSelect = (optionValue: string | number) => {
    setSelectedValue(optionValue);
    setIsOpen(false);
    if (onChange) {
      onChange(optionValue);
    }
  };

  const handleClear = (event: React.MouseEvent) => {
    event.stopPropagation();
    setSelectedValue('');
    if (onChange) {
      onChange('');
    }
  };

  const handleFocus = () => {
    setIsFocused(true);
    if (onFocus) onFocus();
  };

  const handleBlur = () => {
    setIsFocused(false);
    if (onBlur) onBlur();
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'xs':
        return 'text-xs';
      case 'sm':
        return 'text-sm';
      case 'md':
        return 'text-base';
      case 'lg':
        return 'text-lg';
      case 'xl':
        return 'text-xl';
      default:
        return 'text-base';
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

  const selectId = id || `select-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className={`relative ${fullWidth ? 'w-full' : ''} ${containerClassName}`}>
      {label && (
        <label
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
      
      <div className="relative" ref={selectRef}>
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          onFocus={handleFocus}
          onBlur={handleBlur}
          disabled={disabled}
          className={`
            w-full text-left
            flex items-center justify-between
            rounded-xl
            border-2 transition-all duration-200 ease-in-out
            focus:outline-none focus:ring-2 focus:ring-opacity-50
            ${getSizeStyles()}
            ${getStateStyles()}
            ${selectClassName}
            ${className}
          `}
          style={{
            fontFamily: themeConfig.typography.fontFamily.secondary,
            transition: themeConfig.transitions.default,
            paddingRight: '3rem',
          }}
        >
          <span className={`flex items-center ${!selectedOption ? 'text-gray-400 dark:text-gray-500' : ''}`}>
            {selectedOption ? (
              <>
                {selectedOption.icon && <span className="mr-2">{selectedOption.icon}</span>}
                {selectedOption.label}
              </>
            ) : (
              placeholder
            )}
          </span>
          
          <div className="flex items-center space-x-2">
            {clearable && selectedValue && !disabled && (
              <button
                type="button"
                onClick={handleClear}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
            
            <svg
              className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </button>

        {isOpen && (
          <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-xl shadow-lg max-h-60 overflow-auto">
            {searchable && (
              <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Pesquisar..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            )}
            
            <div className="py-1">
              {filteredOptions.length === 0 ? (
                <div className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
                  Nenhuma opção encontrada
                </div>
              ) : (
                filteredOptions.map((option, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleSelect(option.value)}
                    disabled={option.disabled}
                    className={`
                      w-full text-left px-4 py-2 text-sm
                      flex items-center space-x-2
                      ${option.disabled 
                        ? 'text-gray-400 dark:text-gray-500 cursor-not-allowed' 
                        : 'text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800'
                      }
                      ${selectedValue === option.value ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300' : ''}
                    `}
                  >
                    {option.icon && <span>{option.icon}</span>}
                    <span>{option.label}</span>
                    {selectedValue === option.value && (
                      <svg className="w-4 h-4 ml-auto text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>
                ))
              )}
            </div>
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

export default Select;