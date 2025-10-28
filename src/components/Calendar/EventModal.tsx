import React, { useState, useEffect, useCallback, useRef } from 'react';
import { EventModalProps, EVENT_COLORS, EVENT_CATEGORIES } from '@/components/Calendar/CalendarView.types';
import { Modal } from '@/components/primitives/Modal';
import { Button } from '@/components/primitives/Button';
import { Select } from '@/components/primitives/Select';
import { clsx } from 'clsx';

const formatDateTimeLocal = (date: Date): string => {
  const pad = (num: number) => num.toString().padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

export const EventModal: React.FC<EventModalProps> = React.memo(({
  isOpen,
  onClose,
  event,
  selectedDate,
  onSave,
  onDelete,
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startDate: new Date(),
    endDate: new Date(),
    color: '#3b82f6',
    category: 'Meeting',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const titleInputRef = useRef<HTMLInputElement>(null);
  
  const isEditing = !!event;
  
  // Reset form when modal opens/closes or when switching between events
  useEffect(() => {
    if (!isOpen) return;

    // Focus the title input when the modal opens
    const focusTimer = setTimeout(() => {
      titleInputRef.current?.focus();
    }, 0);
    
    if (event) {
      // Editing existing event
      setFormData({
        title: event.title,
        description: event.description || '',
        startDate: event.startDate,
        endDate: event.endDate,
        color: event.color || '#3b82f6',
        category: event.category || 'Meeting',
      });
    } else {
      // Creating new event - reset form data
      const startDate = selectedDate ? new Date(selectedDate) : new Date();
      const endDate = new Date(startDate);
      endDate.setHours(startDate.getHours() + 1);
      
      setFormData({
        title: '',
        description: '',
        startDate,
        endDate,
        color: '#3b82f6',
        category: 'Meeting',
      });
    }
    
    setErrors({});
    
    return () => {
      clearTimeout(focusTimer);
    };
  }, [isOpen, event, selectedDate]);
  
  const validateForm = useCallback(() => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.length > 100) {
      newErrors.title = 'Title must be 100 characters or less';
    }
    
    if (formData.description.length > 500) {
      newErrors.description = 'Description must be 500 characters or less';
    }
    
    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required';
    }
    
    if (!formData.endDate) {
      newErrors.endDate = 'End date is required';
    }
    
    if (formData.startDate && formData.endDate && formData.startDate >= formData.endDate) {
      newErrors.endDate = 'End date must be after start date';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);
  
  
  // Handle event deletion
  const handleDelete = useCallback(() => {
    if (event?.id && onDelete) {
      onDelete(event.id);
      onClose();
    }
  }, [event, onDelete, onClose]);
  
  const handleChange = useCallback((field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  }, [errors]);
  
  const handleDateTimeChange = useCallback((field: string, value: string) => {
    const newDate = new Date(value);
    setFormData(prev => ({
      ...prev,
      [field]: newDate,
      // Update end date if start date is after current end date
      ...(field === 'startDate' && newDate > prev.endDate ? { endDate: new Date(newDate.getTime() + 60 * 60 * 1000) } : {})
    }));
    
    if (errors[field] || errors[field === 'startDate' ? 'endDate' : 'startDate']) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        if (field === 'startDate') delete newErrors['endDate'];
        return newErrors;
      });
    }
  }, [errors]);
  
  const handleSubmit = useCallback((e?: React.FormEvent) => {
    e?.preventDefault();
    if (!validateForm()) return;
    
    const eventData = {
      ...formData,
      id: event?.id || `evt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };
    
    onSave(eventData);
    onClose();
  }, [formData, event?.id, validateForm, onSave, onClose]);
  
  // Handle keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    // Handle Enter key press (but not when in a textarea or when Shift+Enter is pressed)
    if (e.key === 'Enter' && !(e.target instanceof HTMLTextAreaElement) && !e.shiftKey) {
      e.preventDefault();
      e.stopPropagation();
      handleSubmit(e as any);
    }
  }, [handleSubmit]);


  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={event ? 'Edit Event' : 'Create Event'}
      size="md"
    >
      <div className="space-y-4 sm:space-y-6" onKeyDown={handleKeyDown}>
        {/* Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-neutral-700 mb-1.5">
            Title *
          </label>
          <input
            type="text"
            id="title"
            ref={titleInputRef}
            className={clsx(
              'w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base',
              'h-12',
              errors.title ? 'border-red-500' : 'border-neutral-300'
            )}
            value={formData.title}
            onChange={(e) => handleChange('title', e.target.value)}
            placeholder="Event title"
            autoFocus
          />
          {errors.title && <p className="mt-1.5 text-sm text-red-600">{errors.title}</p>}
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-neutral-700 mb-1.5">
            Description
          </label>
          <textarea
            id="description"
            rows={3}
            className="w-full px-3 py-2.5 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            placeholder="Event description"
          />
        </div>

        {/* Date and Time */}
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label htmlFor="startDate" className="block text-sm font-medium text-neutral-700 mb-1.5">
              Start Date & Time *
            </label>
            <input
              type="datetime-local"
              id="startDate"
              className={clsx(
                'w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base',
                'h-12',
                errors.startDate ? 'border-red-500' : 'border-neutral-300'
              )}
              value={formatDateTimeLocal(formData.startDate)}
              onChange={(e) => handleDateTimeChange('startDate', e.target.value)}
            />
            {errors.startDate && <p className="mt-1.5 text-sm text-red-600">{errors.startDate}</p>}
          </div>

          <div>
            <label htmlFor="endDate" className="block text-sm font-medium text-neutral-700 mb-1.5">
              End Date & Time *
            </label>
            <input
              type="datetime-local"
              id="endDate"
              className={clsx(
                'w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base',
                'h-12',
                errors.endDate ? 'border-red-500' : 'border-neutral-300'
              )}
              value={formatDateTimeLocal(formData.endDate)}
              onChange={(e) => handleDateTimeChange('endDate', e.target.value)}
              min={formatDateTimeLocal(formData.startDate)}
            />
            {errors.endDate && <p className="mt-1.5 text-sm text-red-600">{errors.endDate}</p>}
          </div>
        </div>

        {/* Color and Category */}
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Color
            </label>
            <div className="flex flex-wrap gap-2.5">
              {EVENT_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  className={clsx(
                    'w-10 h-10 rounded-full border-2 transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500',
                    'active:scale-95',
                    formData.color === color ? 'ring-2 ring-offset-2 ring-blue-500' : 'border-transparent'
                  )}
                  style={{ backgroundColor: color }}
                  onClick={() => handleChange('color', color)}
                  aria-label={`Select ${color} color`}
                />
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="category" className="block text-sm font-medium text-neutral-700 mb-1.5">
              Category
            </label>
            <Select
              options={EVENT_CATEGORIES.map(cat => ({ value: cat, label: cat }))}
              value={formData.category}
              onChange={(value) => handleChange('category', value)}
              className="w-full h-12"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4 border-t border-neutral-200">
          <div className="flex-1 sm:flex-none">
            {isEditing && onDelete && (
              <Button
                variant="danger"
                onClick={handleDelete}
                className="w-full sm:w-auto h-12 px-6 text-base"
              >
                Delete Event
              </Button>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3 w-full sm:w-auto">
            <Button
              variant="secondary"
              onClick={onClose}
              className="w-full h-12 px-6 text-base"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              className="w-full h-12 px-6 text-base"
            >
              {isEditing ? 'Update' : 'Create'}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
});

EventModal.displayName = 'EventModal';
