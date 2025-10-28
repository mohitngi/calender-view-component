import { useState, useCallback, useMemo } from 'react';
import { CalendarEvent, EventFormData, FormErrors } from '@/components/Calendar/CalendarView.types';
import { generateEventId, validateEvent, createNewEvent } from '@/utils/event.utils';

export const useEventManager = (initialEvents: CalendarEvent[] = []) => {
  const [events, setEvents] = useState<CalendarEvent[]>(initialEvents);
  const [formData, setFormData] = useState<EventFormData>(() => ({
    title: '',
    description: '',
    startDate: new Date(),
    endDate: new Date(),
    color: '#3b82f6',
    category: 'Meeting',
  }));
  const [errors, setErrors] = useState<FormErrors>({});
  
  const addEvent = useCallback((eventData: Omit<CalendarEvent, 'id'>) => {
    const validationErrors = validateEvent(eventData);
    if (validationErrors.length > 0) {
      const errorMap: FormErrors = {};
      validationErrors.forEach(error => {
        if (error.includes('Title')) errorMap.title = error;
        if (error.includes('Start date')) errorMap.startDate = error;
        if (error.includes('End date')) errorMap.endDate = error;
        if (error.includes('Description')) errorMap.description = error;
      });
      setErrors(errorMap);
      return false;
    }
    
    const newEvent: CalendarEvent = {
      ...eventData,
      id: generateEventId(),
    };
    
    setEvents(prev => [...prev, newEvent]);
    setErrors({});
    return true;
  }, []);
  
  const updateEvent = useCallback((id: string, updates: Partial<CalendarEvent>) => {
    const validationErrors = validateEvent(updates);
    if (validationErrors.length > 0) {
      const errorMap: FormErrors = {};
      validationErrors.forEach(error => {
        if (error.includes('Title')) errorMap.title = error;
        if (error.includes('Start date')) errorMap.startDate = error;
        if (error.includes('End date')) errorMap.endDate = error;
        if (error.includes('Description')) errorMap.description = error;
      });
      setErrors(errorMap);
      return false;
    }
    
    setEvents(prev => prev.map(event => 
      event.id === id ? { ...event, ...updates } : event
    ));
    setErrors({});
    return true;
  }, []);
  
  const deleteEvent = useCallback((id: string) => {
    setEvents(prev => prev.filter(event => event.id !== id));
  }, []);
  
  const getEventById = useCallback((id: string): CalendarEvent | undefined => {
    return events.find(event => event.id === id);
  }, [events]);
  
  const updateFormData = useCallback((updates: Partial<EventFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
    // Clear related errors when user starts typing
    if (updates.title) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.title;
        return newErrors;
      });
    }
    if (updates.description) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.description;
        return newErrors;
      });
    }
    if (updates.startDate) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.startDate;
        return newErrors;
      });
    }
    if (updates.endDate) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.endDate;
        return newErrors;
      });
    }
  }, []);
  
  const resetForm = useCallback((selectedDate?: Date) => {
    const newEvent = createNewEvent(selectedDate);
    setFormData({
      title: newEvent.title,
      description: newEvent.description || '',
      startDate: newEvent.startDate,
      endDate: newEvent.endDate,
      color: newEvent.color || '#3b82f6',
      category: newEvent.category || 'Meeting',
    });
    setErrors({});
  }, []);
  
  const loadEventIntoForm = useCallback((event: CalendarEvent) => {
    setFormData({
      title: event.title,
      description: event.description || '',
      startDate: event.startDate,
      endDate: event.endDate,
      color: event.color || '#3b82f6',
      category: event.category || 'Meeting',
    });
    setErrors({});
  }, []);
  
  const validateForm = useCallback((): boolean => {
    const validationErrors = validateEvent(formData);
    if (validationErrors.length > 0) {
      const errorMap: FormErrors = {};
      validationErrors.forEach(error => {
        if (error.includes('Title')) errorMap.title = error;
        if (error.includes('Start date')) errorMap.startDate = error;
        if (error.includes('End date')) errorMap.endDate = error;
        if (error.includes('Description')) errorMap.description = error;
      });
      setErrors(errorMap);
      return false;
    }
    setErrors({});
    return true;
  }, [formData]);
  
  const eventsByDate = useMemo(() => {
    const grouped: Record<string, CalendarEvent[]> = {};
    events.forEach(event => {
      const dateKey = event.startDate.toDateString();
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(event);
    });
    return grouped;
  }, [events]);
  
  const eventsByMonth = useMemo(() => {
    const grouped: Record<string, CalendarEvent[]> = {};
    events.forEach(event => {
      const monthKey = `${event.startDate.getFullYear()}-${event.startDate.getMonth()}`;
      if (!grouped[monthKey]) {
        grouped[monthKey] = [];
      }
      grouped[monthKey].push(event);
    });
    return grouped;
  }, [events]);
  
  return {
    events,
    formData,
    errors,
    addEvent,
    updateEvent,
    deleteEvent,
    getEventById,
    updateFormData,
    resetForm,
    loadEventIntoForm,
    validateForm,
    eventsByDate,
    eventsByMonth,
  };
};
