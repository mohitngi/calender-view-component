import { useState, useCallback } from 'react';
import { CalendarState, CalendarView } from '@/components/Calendar/CalendarView.types';
import { getNextMonth, getPreviousMonth, getNextWeek, getPreviousWeek } from '@/utils/date.utils';

export const useCalendar = (initialDate: Date = new Date(), initialView: CalendarView = 'month') => {
  const [state, setState] = useState<CalendarState>({
    currentDate: initialDate,
    view: initialView,
    selectedDate: null,
    selectedEvent: null,
    isEventModalOpen: false,
  });
  
  const goToNextMonth = useCallback(() => {
    setState(prev => ({
      ...prev,
      currentDate: getNextMonth(prev.currentDate),
    }));
  }, []);
  
  const goToPreviousMonth = useCallback(() => {
    setState(prev => ({
      ...prev,
      currentDate: getPreviousMonth(prev.currentDate),
    }));
  }, []);
  
  const goToNextWeek = useCallback(() => {
    setState(prev => ({
      ...prev,
      currentDate: getNextWeek(prev.currentDate),
    }));
  }, []);
  
  const goToPreviousWeek = useCallback(() => {
    setState(prev => ({
      ...prev,
      currentDate: getPreviousWeek(prev.currentDate),
    }));
  }, []);
  
  const goToToday = useCallback(() => {
    setState(prev => ({
      ...prev,
      currentDate: new Date(),
    }));
  }, []);
  
  const setView = useCallback((view: CalendarView) => {
    setState(prev => ({
      ...prev,
      view,
    }));
  }, []);
  
  const selectDate = useCallback((date: Date) => {
    setState(prev => ({
      ...prev,
      selectedDate: date,
    }));
  }, []);
  
  const openEventModal = useCallback((event?: any, date?: Date) => {
    setState(prev => ({
      ...prev,
      selectedEvent: event || null,
      selectedDate: date || prev.selectedDate,
      isEventModalOpen: true,
    }));
  }, []);
  
  const closeEventModal = useCallback(() => {
    setState(prev => ({
      ...prev,
      selectedEvent: null,
      isEventModalOpen: false,
    }));
  }, []);
  
  const navigateToDate = useCallback((date: Date) => {
    setState(prev => ({
      ...prev,
      currentDate: date,
      selectedDate: date,
    }));
  }, []);
  
  return {
    ...state,
    goToNextMonth,
    goToPreviousMonth,
    goToNextWeek,
    goToPreviousWeek,
    goToToday,
    setView,
    selectDate,
    openEventModal,
    closeEventModal,
    navigateToDate,
  };
};
