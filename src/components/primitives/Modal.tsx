import React, { useEffect, useRef, forwardRef } from 'react';
import { ModalProps } from '@/components/Calendar/CalendarView.types';
import { clsx } from 'clsx';

// Extend ModalProps to include form-related props
interface ExtendedModalProps extends Omit<ModalProps, 'onSubmit' | 'onKeyDown'> {
  as?: React.ElementType;
  onSubmit?: (e: React.FormEvent) => void;
  onKeyDown?: (e: React.KeyboardEvent) => void;
  noValidate?: boolean;
  [key: string]: any; // Allow any other props
}

// Create a polymorphic component that can render as any HTML element or React component
type PolymorphicComponentProps<T extends React.ElementType> = {
  as?: T;
  children: React.ReactNode;
} & Omit<React.ComponentPropsWithoutRef<T>, 'as'>;

const PolymorphicComponent = <T extends React.ElementType = 'div'>({
  as: Component = 'div' as T,
  ...props
}: PolymorphicComponentProps<T>) => {
  const ComponentAs = Component as React.ElementType;
  return <ComponentAs {...props} />;
};

export const Modal = forwardRef<HTMLDivElement, ExtendedModalProps>(({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  as: Component = 'div' as React.ElementType,
  ...rest
}, ref) => {
  const modalRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);
  
  useEffect(() => {
    if (isOpen && modalRef.current) {
      modalRef.current.focus();
    }
  }, [isOpen]);
  
  if (!isOpen) return null;
  
  const sizeClasses: Record<string, string> = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
  };
  
  return (
    <div
      className="fixed inset-0 z-50 flex items-start md:items-center justify-center p-0 md:p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* Modal */}
      <PolymorphicComponent
        as={Component}
        ref={ref}
        className={clsx(
          'relative w-full max-h-[90vh] my-4 mx-0 md:mx-4 rounded-none md:rounded-xl bg-white shadow-modal animate-slide-up',
          'flex flex-col',
          sizeClasses[size as keyof typeof sizeClasses],
          'overflow-hidden' // Ensure content doesn't overflow the modal
        )}
        tabIndex={-1}
        {...rest}
      >
        {/* Header - Sticky on mobile */}
        <div className="flex-shrink-0 flex items-center justify-between p-4 md:p-6 border-b border-neutral-200 sticky top-0 bg-white z-10">
          <h2 id="modal-title" className="text-lg font-semibold text-neutral-900">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-600 transition-colors focus-ring rounded-lg p-1 -mr-2"
            aria-label="Close modal"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        
        {/* Content - Scrollable area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </div>
      </PolymorphicComponent>
    </div>
  );
});

Modal.displayName = 'Modal';
