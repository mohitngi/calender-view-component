import { CalendarEvent } from '@/components/Calendar/CalendarView.types';
import { isSameDayCustom, isSameMonth } from '@/utils/date.utils';

/**
 * Filters events for a specific date
 */
export const getEventsForDate = (events: CalendarEvent[], date: Date): CalendarEvent[] => {
  return events.filter(event => isSameDayCustom(event.startDate, date));
};

/**
 * Filters events for a specific month
 */
export const getEventsForMonth = (events: CalendarEvent[], date: Date): CalendarEvent[] => {
  return events.filter(event => isSameMonth(event.startDate, date));
};

/**
 * Filters events for a specific week
 */
export const getEventsForWeek = (events: CalendarEvent[], weekStart: Date): CalendarEvent[] => {
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);
  weekEnd.setHours(23, 59, 59, 999);
  
  return events.filter(event => 
    event.startDate >= weekStart && event.startDate <= weekEnd
  );
};

/**
 * Generates a unique ID for events
 */
export const generateEventId = (): string => {
  return `evt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Validates event data
 */
export const validateEvent = (event: Partial<CalendarEvent>): string[] => {
  const errors: string[] = [];
  
  if (!event.title || event.title.trim().length === 0) {
    errors.push('Title is required');
  }
  
  if (event.title && event.title.length > 100) {
    errors.push('Title must be 100 characters or less');
  }
  
  if (event.description && event.description.length > 500) {
    errors.push('Description must be 500 characters or less');
  }
  
  if (!event.startDate) {
    errors.push('Start date is required');
  }
  
  if (!event.endDate) {
    errors.push('End date is required');
  }
  
  if (event.startDate && event.endDate && event.startDate >= event.endDate) {
    errors.push('End date must be after start date');
  }
  
  return errors;
};

/**
 * Creates a new event with default values
 */
export const createNewEvent = (selectedDate?: Date): Omit<CalendarEvent, 'id'> => {
  const now = new Date();
  const startDate = selectedDate ? new Date(selectedDate) : now;
  startDate.setHours(9, 0, 0, 0); // Default to 9:00 AM
  
  const endDate = new Date(startDate);
  endDate.setHours(10, 0, 0, 0); // Default to 10:00 AM
  
  return {
    title: '',
    description: '',
    startDate,
    endDate,
    color: '#3b82f6', // Default blue color
    category: 'Meeting',
  };
};

/**
 * Sorts events by start time
 */
export const sortEventsByTime = (events: CalendarEvent[]): CalendarEvent[] => {
  return [...events].sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
};

/**
 * Gets events for a specific time range
 */
export const getEventsInTimeRange = (
  events: CalendarEvent[],
  startTime: Date,
  endTime: Date
): CalendarEvent[] => {
  return events.filter(event => 
    event.startDate >= startTime && event.startDate <= endTime
  );
};

/**
 * Checks if an event is all day
 */
export const isAllDayEvent = (event: CalendarEvent): boolean => {
  const start = event.startDate;
  const end = event.endDate;
  
  return (
    start.getHours() === 0 &&
    start.getMinutes() === 0 &&
    end.getHours() === 23 &&
    end.getMinutes() === 59
  );
};

/**
 * Formats event duration
 */
export const formatEventDuration = (event: CalendarEvent): string => {
  const durationMs = event.endDate.getTime() - event.startDate.getTime();
  const durationMinutes = Math.floor(durationMs / (1000 * 60));
  
  if (durationMinutes < 60) {
    return `${durationMinutes}m`;
  }
  
  const hours = Math.floor(durationMinutes / 60);
  const minutes = durationMinutes % 60;
  
  if (minutes === 0) {
    return `${hours}h`;
  }
  
  return `${hours}h ${minutes}m`;
};

/**
 * Gets event color with fallback
 */
export const getEventColor = (event: CalendarEvent): string => {
  return event.color || '#3b82f6';
};

/**
 * Searches events by title or description
 */
export const searchEvents = (events: CalendarEvent[], query: string): CalendarEvent[] => {
  if (!query.trim()) return events;
  
  const lowercaseQuery = query.toLowerCase();
  
  return events.filter(event => 
    event.title.toLowerCase().includes(lowercaseQuery) ||
    (event.description && event.description.toLowerCase().includes(lowercaseQuery))
  );
};

/**
 * Groups events by category
 */
export const groupEventsByCategory = (events: CalendarEvent[]): Record<string, CalendarEvent[]> => {
  return events.reduce((groups, event) => {
    const category = event.category || 'Other';
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(event);
    return groups;
  }, {} as Record<string, CalendarEvent[]>);
};

/**
 * Gets events count for a date
 */
export const getEventCountForDate = (events: CalendarEvent[], date: Date): number => {
  return getEventsForDate(events, date).length;
};

/**
 * Checks if a date has many events (more than 3)
 */
export const hasManyEvents = (events: CalendarEvent[], date: Date): boolean => {
  return getEventCountForDate(events, date) > 3;
};
