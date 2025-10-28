import React, { useCallback } from 'react';
import { CalendarViewProps } from './CalendarView.types';
import { MonthView } from './MonthView';
import { WeekView } from './WeekView';
import { EventModal } from './EventModal';
import { Button } from '@/components/primitives/Button';
import { useCalendar } from '@/hooks/useCalendar';
import { useEventManager } from '@/hooks/useEventManager';
import { format } from 'date-fns';

export const CalendarView: React.FC<CalendarViewProps> = React.memo(({
  events,
  onEventAdd,
  onEventUpdate,
  onEventDelete,
  initialView = 'month',
  initialDate = new Date(),
}) => {
  const calendar = useCalendar(initialDate, initialView);
  const eventManager = useEventManager(events);
  
  const handleDateClick = useCallback((date: Date) => {
    calendar.selectDate(date);
    calendar.openEventModal(undefined, date);
  }, [calendar]);
  
  const handleEventClick = useCallback((event: any) => {
    calendar.openEventModal(event);
    eventManager.loadEventIntoForm(event);
  }, [calendar, eventManager]);
  
  const handleEventSave = useCallback((eventData: any) => {
    if (eventData.id && events.find(e => e.id === eventData.id)) {
      // Update existing event
      onEventUpdate(eventData.id, eventData);
    } else {
      // Create new event
      onEventAdd(eventData);
    }
    calendar.closeEventModal();
  }, [events, onEventAdd, onEventUpdate, calendar]);
  
  const handleEventDelete = useCallback((id: string) => {
    onEventDelete(id);
    calendar.closeEventModal();
  }, [onEventDelete, calendar]);
  
  const handleNavigation = useCallback((direction: 'prev' | 'next') => {
    if (calendar.view === 'month') {
      if (direction === 'prev') {
        calendar.goToPreviousMonth();
      } else {
        calendar.goToNextMonth();
      }
    } else {
      if (direction === 'prev') {
        calendar.goToPreviousWeek();
      } else {
        calendar.goToNextWeek();
      }
    }
  }, [calendar]);
  
  const handleViewToggle = useCallback(() => {
    calendar.setView(calendar.view === 'month' ? 'week' : 'month');
  }, [calendar]);
  
  const formatCurrentDate = useCallback(() => {
    if (calendar.view === 'month') {
      return format(calendar.currentDate, 'MMMM yyyy');
    } else {
      const weekStart = calendar.currentDate;
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);
      return `${format(weekStart, 'MMM d')} - ${format(weekEnd, 'MMM d, yyyy')}`;
    }
  }, [calendar.currentDate, calendar.view]);
  
  return (
    <div className="w-full max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-neutral-900">Calendar</h1>
          
          <div className="flex items-center gap-3">
            <Button
              variant="secondary"
              onClick={() => calendar.goToToday()}
            >
              Today
            </Button>
            
            <Button
              variant="secondary"
              onClick={handleViewToggle}
            >
              {calendar.view === 'month' ? 'Week View' : 'Month View'}
            </Button>
          </div>
        </div>
        
        {/* Navigation */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              onClick={() => handleNavigation('prev')}
              aria-label={`Go to previous ${calendar.view}`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Button>
            
            <h2 className="text-xl font-semibold text-neutral-900 min-w-0 flex-1 text-center">
              {formatCurrentDate()}
            </h2>
            
            <Button
              variant="secondary"
              onClick={() => handleNavigation('next')}
              aria-label={`Go to next ${calendar.view}`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Button>
          </div>
        </div>
      </div>
      
      {/* Calendar Content */}
      <div className="mb-6">
        {calendar.view === 'month' ? (
          <MonthView
            currentDate={calendar.currentDate}
            events={events}
            selectedDate={calendar.selectedDate}
            onDateClick={handleDateClick}
            onEventClick={handleEventClick}
          />
        ) : (
          <WeekView
            currentDate={calendar.currentDate}
            events={events}
            selectedDate={calendar.selectedDate}
            onDateClick={handleDateClick}
            onEventClick={handleEventClick}
          />
        )}
      </div>
      
      {/* Event Modal */}
      <EventModal
        isOpen={calendar.isEventModalOpen}
        onClose={calendar.closeEventModal}
        event={calendar.selectedEvent}
        selectedDate={calendar.selectedDate}
        onSave={handleEventSave}
        onDelete={calendar.selectedEvent ? handleEventDelete : undefined}
      />
    </div>
  );
});

CalendarView.displayName = 'CalendarView';
