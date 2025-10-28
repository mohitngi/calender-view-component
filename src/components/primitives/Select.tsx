import React, { useRef, useState, useEffect } from 'react';
import { SelectProps } from '@/components/Calendar/CalendarView.types';
import { clsx } from 'clsx';

export const Select: React.FC<SelectProps> = ({
  value,
  onChange,
  options,
  placeholder = 'Select an option',
  disabled = false,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef<HTMLDivElement>(null);
  
  const selectedOption = options.find(option => option.value === value);
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (disabled) return;
    
    switch (event.key) {
      case 'Enter':
      case ' ':
        event.preventDefault();
        setIsOpen(!isOpen);
        break;
      case 'Escape':
        setIsOpen(false);
        break;
      case 'ArrowDown':
        event.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
        } else {
          const currentIndex = options.findIndex(option => option.value === value);
          const nextIndex = Math.min(currentIndex + 1, options.length - 1);
          if (options[nextIndex]) {
            onChange(options[nextIndex].value);
          }
        }
        break;
      case 'ArrowUp':
        event.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
        } else {
          const currentIndex = options.findIndex(option => option.value === value);
          const prevIndex = Math.max(currentIndex - 1, 0);
          if (options[prevIndex]) {
            onChange(options[prevIndex].value);
          }
        }
        break;
    }
  };
  
  return (
    <div ref={selectRef} className={clsx('relative', className)}>
      <button
        type="button"
        className={clsx(
          'w-full rounded-lg border border-neutral-300 px-3 py-2 text-left text-sm focus-ring focus:border-primary-500',
          disabled && 'bg-neutral-100 cursor-not-allowed opacity-50',
          !disabled && 'hover:border-neutral-400'
        )}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={selectedOption ? selectedOption.label : placeholder}
      >
        <span className={clsx(
          'block truncate',
          !selectedOption && 'text-neutral-500'
        )}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
          <svg
            className={clsx(
              'w-4 h-4 text-neutral-400 transition-transform',
              isOpen && 'rotate-180'
            )}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </span>
      </button>
      
      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-neutral-300 rounded-lg shadow-lg">
          <ul
            role="listbox"
            className="max-h-60 overflow-auto py-1"
          >
            {options.map((option) => (
              <li
                key={option.value}
                role="option"
                className={clsx(
                  'px-3 py-2 text-sm cursor-pointer hover:bg-neutral-100',
                  option.value === value && 'bg-primary-50 text-primary-600'
                )}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
              >
                {option.label}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
