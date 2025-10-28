import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isToday, addMonths, subMonths, addWeeks, subWeeks, startOfDay, endOfDay } from 'date-fns';

/**
 * Calculates the number of days between two dates
 * @param start - Start date
 * @param end - End date
 * @returns Number of days (can be negative if end is before start)
 */
export const daysBetween = (start: Date, end: Date): number => {
  const msPerDay = 1000 * 60 * 60 * 24;
  const startMs = start.getTime();
  const endMs = end.getTime();
  return Math.floor((endMs - startMs) / msPerDay);
};

/**
 * Checks if two dates fall on the same day (ignores time)
 */
export const isSameDayCustom = (date1: Date, date2: Date): boolean => {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
};

/**
 * Gets all days in a month
 */
export const getDaysInMonth = (date: Date): Date[] => {
  const year = date.getFullYear();
  const month = date.getMonth();
  const daysCount = new Date(year, month + 1, 0).getDate();
  return Array.from({ length: daysCount }, (_, i) => new Date(year, month, i + 1));
};

/**
 * Gets the calendar grid (42 cells for month view)
 */
export const getCalendarGrid = (date: Date): Date[] => {
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDay = new Date(year, month, 1);
  const startDate = startOfWeek(firstDay, { weekStartsOn: 0 }); // Start from Sunday
  
  const grid: Date[] = [];
  for (let i = 0; i < 42; i++) {
    grid.push(addDays(startDate, i));
  }
  return grid;
};

/**
 * Gets the week grid for week view
 */
export const getWeekGrid = (date: Date): Date[] => {
  const startDate = startOfWeek(date, { weekStartsOn: 0 });
  const week: Date[] = [];
  for (let i = 0; i < 7; i++) {
    week.push(addDays(startDate, i));
  }
  return week;
};

/**
 * Gets time slots for week view (30-minute intervals)
 */
export const getTimeSlots = (): Date[] => {
  const slots: Date[] = [];
  const baseDate = new Date();
  baseDate.setHours(0, 0, 0, 0);
  
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const slot = new Date(baseDate);
      slot.setHours(hour, minute);
      slots.push(slot);
    }
  }
  return slots;
};

/**
 * Formats time for display
 */
export const formatTime = (date: Date): string => {
  return format(date, 'h:mm a');
};

/**
 * Formats date for display
 */
export const formatDate = (date: Date): string => {
  return format(date, 'MMM d, yyyy');
};

/**
 * Formats date and time for display
 */
export const formatDateTime = (date: Date): string => {
  return format(date, 'MMM d, yyyy h:mm a');
};

/**
 * Gets the start of day
 */
export const getStartOfDay = (date: Date): Date => {
  return startOfDay(date);
};

/**
 * Gets the end of day
 */
export const getEndOfDay = (date: Date): Date => {
  return endOfDay(date);
};

/**
 * Checks if a date is today
 */
export const isTodayDate = (date: Date): boolean => {
  return isToday(date);
};

/**
 * Checks if a date is in the current month
 */
export const isCurrentMonth = (date: Date, currentMonth: Date): boolean => {
  return isSameMonth(date, currentMonth);
};

/**
 * Gets the next month
 */
export const getNextMonth = (date: Date): Date => {
  return addMonths(date, 1);
};

/**
 * Gets the previous month
 */
export const getPreviousMonth = (date: Date): Date => {
  return subMonths(date, 1);
};

/**
 * Gets the next week
 */
export const getNextWeek = (date: Date): Date => {
  return addWeeks(date, 1);
};

/**
 * Gets the previous week
 */
export const getPreviousWeek = (date: Date): Date => {
  return subWeeks(date, 1);
};

/**
 * Gets the start of month
 */
export const getStartOfMonth = (date: Date): Date => {
  return startOfMonth(date);
};

/**
 * Gets the end of month
 */
export const getEndOfMonth = (date: Date): Date => {
  return endOfMonth(date);
};

/**
 * Gets the start of week
 */
export const getStartOfWeek = (date: Date): Date => {
  return startOfWeek(date, { weekStartsOn: 0 });
};

/**
 * Gets the end of week
 */
export const getEndOfWeek = (date: Date): Date => {
  return endOfWeek(date, { weekStartsOn: 0 });
};

/**
 * Calculates event position and height for week view
 */
export const calculateEventPosition = (event: { startDate: Date; endDate: Date }) => {
  const startHour = event.startDate.getHours();
  const startMinute = event.startDate.getMinutes();
  const endHour = event.endDate.getHours();
  const endMinute = event.endDate.getMinutes();
  
  const startPosition = startHour * 2 + (startMinute >= 30 ? 1 : 0);
  const endPosition = endHour * 2 + (endMinute >= 30 ? 1 : 0);
  const height = Math.max(1, endPosition - startPosition);
  
  return {
    top: `${startPosition * 20}px`, // 20px per 30-minute slot
    height: `${height * 20}px`,
  };
};

/**
 * Checks if two events overlap
 */
export const eventsOverlap = (event1: { startDate: Date; endDate: Date }, event2: { startDate: Date; endDate: Date }): boolean => {
  return event1.startDate < event2.endDate && event2.startDate < event1.endDate;
};

/**
 * Groups overlapping events for side-by-side positioning
 */
export const groupOverlappingEvents = (events: Array<{ startDate: Date; endDate: Date; id: string }>): Array<Array<{ startDate: Date; endDate: Date; id: string }>> => {
  const groups: Array<Array<{ startDate: Date; endDate: Date; id: string }>> = [];
  
  for (const event of events) {
    let addedToGroup = false;
    
    for (const group of groups) {
      if (group.some(groupEvent => eventsOverlap(event, groupEvent))) {
        group.push(event);
        addedToGroup = true;
        break;
      }
    }
    
    if (!addedToGroup) {
      groups.push([event]);
    }
  }
  
  return groups;
};

// Re-export date-fns functions for convenience
export { format, isSameMonth };
