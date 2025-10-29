import React, { useMemo, useCallback } from 'react';
import { WeekViewProps } from '@/components/Calendar/CalendarView.types';
import { getWeekGrid, getTimeSlots, formatTime, calculateEventPosition, groupOverlappingEvents } from '@/utils/date.utils';
import { getEventsForWeek } from '@/utils/event.utils';
import { clsx } from 'clsx';

export const WeekView: React.FC<WeekViewProps> = React.memo(({
  currentDate,
  events,
  selectedDate,
  onDateClick,
  onEventClick,
}) => {
  const weekDays = useMemo(() => getWeekGrid(currentDate), [currentDate]);
  const timeSlots = useMemo(() => getTimeSlots(), []);
  const weekEvents = useMemo(() => {
    if (weekDays.length === 0 || !weekDays[0]) return [];
    return getEventsForWeek(events, weekDays[0]);
  }, [events, weekDays]);
  
  const handleTimeSlotClick = useCallback((timeSlot: Date, dayIndex: number) => {
    const day = weekDays[dayIndex];
    if (!day) return;
    const clickedDate = new Date(day);
    clickedDate.setHours(timeSlot.getHours(), timeSlot.getMinutes(), 0, 0);
    onDateClick(clickedDate);
  }, [weekDays, onDateClick]);
  
  const handleEventClick = useCallback((event: React.MouseEvent, calendarEvent: any) => {
    event.stopPropagation();
    onEventClick(calendarEvent);
  }, [onEventClick]);
  
  const getEventsForDay = useCallback((dayIndex: number) => {
    const day = weekDays[dayIndex];
    if (!day) return [];
    
    const startOfDay = new Date(day);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(day);
    endOfDay.setHours(23, 59, 59, 999);
    
    return weekEvents.filter(event => {
      // Event starts on this day
      if (event.startDate.toDateString() === day.toDateString()) return true;
      // Event ends on this day
      if (event.endDate.toDateString() === day.toDateString()) return true;
      // Event spans across this day
      if (event.startDate <= startOfDay && event.endDate >= endOfDay) return true;
      // Event is in progress on this day
      if (event.startDate <= endOfDay && event.endDate >= startOfDay) return true;
      
      return false;
    });
  }, [weekDays, weekEvents]);
  
  const getEventsForTimeSlot = useCallback((timeSlot: Date, dayIndex: number) => {
    const dayEvents = getEventsForDay(dayIndex);
    const slotStart = new Date(timeSlot);
    const slotEnd = new Date(timeSlot);
    slotEnd.setMinutes(slotEnd.getMinutes() + 30);
    
    return dayEvents.filter(event => 
      event.startDate >= slotStart && event.startDate < slotEnd
    );
  }, [getEventsForDay]);
  
  return (
    <div className="bg-white rounded-lg shadow-card overflow-hidden">
      {/* Header with day names */}
      <div className="grid grid-cols-8 border-b border-neutral-200">
        <div className="p-3 text-sm font-medium text-neutral-600 bg-neutral-50 border-r border-neutral-200">
          Time
        </div>
        {weekDays.map((day, index) => (
          <div
            key={index}
            className={clsx(
              'p-3 text-center text-sm font-medium bg-neutral-50',
              index < weekDays.length - 1 && 'border-r border-neutral-200'
            )}
          >
            <div className="text-neutral-600">{day.toLocaleDateString('en-US', { weekday: 'short' })}</div>
            <div className={clsx(
              'text-lg font-semibold',
              selectedDate && selectedDate.toDateString() === day.toDateString() 
                ? 'text-primary-600' 
                : 'text-neutral-900'
            )}>
              {day.getDate()}
            </div>
          </div>
        ))}
      </div>
      
      {/* Time slots and events */}
      <div className="grid grid-cols-8 max-h-96 overflow-y-auto">
        {/* Time column */}
        <div className="border-r border-neutral-200">
          {timeSlots.map((timeSlot, index) => (
            <div
              key={index}
              className="h-5 text-xs text-neutral-500 px-2 py-1 border-b border-neutral-100"
            >
              {timeSlot.getMinutes() === 0 && formatTime(timeSlot)}
            </div>
          ))}
        </div>
        
        {/* Day columns */}
        {weekDays.map((day, dayIndex) => (
          <div key={dayIndex} className="border-r border-neutral-200 last:border-r-0">
            {timeSlots.map((timeSlot, slotIndex) => {
              const eventsInSlot = getEventsForTimeSlot(timeSlot, dayIndex);
              const isSelected = selectedDate && 
                selectedDate.toDateString() === day.toDateString() &&
                selectedDate.getHours() === timeSlot.getHours() &&
                Math.floor(selectedDate.getMinutes() / 30) === Math.floor(timeSlot.getMinutes() / 30);
              
              return (
                <div
                  key={slotIndex}
                  className={clsx(
                    'h-5 border-b border-neutral-100 cursor-pointer hover:bg-neutral-50 transition-colors',
                    isSelected && 'bg-primary-50'
                  )}
                  onClick={() => handleTimeSlotClick(timeSlot, dayIndex)}
                  role="button"
                  tabIndex={0}
                  aria-label={`${day.toLocaleDateString()} at ${formatTime(timeSlot)}`}
                >
                  {eventsInSlot.length > 0 && (
                    <div className="relative h-full">
                      {eventsInSlot.map((event) => {
                        const position = calculateEventPosition(event);
                        const overlappingGroups = groupOverlappingEvents(eventsInSlot);
                        const group = overlappingGroups.find(g => g.some(e => e.id === event.id));
                        const groupSize = group ? group.length : 1;
                        const eventIndexInGroup = group ? group.findIndex(e => e.id === event.id) : 0;
                        
                        return (
                          <div
                            key={event.id}
                            className={clsx(
                              'absolute left-0 right-0 text-xs px-1 py-0.5 rounded cursor-pointer hover:opacity-80 transition-opacity',
                              groupSize > 1 && 'border border-white'
                            )}
                            style={{
                              ...position,
                              backgroundColor: event.color || '#3b82f6',
                              left: groupSize > 1 ? `${(eventIndexInGroup / groupSize) * 100}%` : '0%',
                              width: groupSize > 1 ? `${100 / groupSize}%` : '100%',
                            }}
                            onClick={(e) => handleEventClick(e, event)}
                            title={`${event.title} - ${formatTime(event.startDate)}`}
                          >
                            <div className="truncate">{event.title}</div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
});

WeekView.displayName = 'WeekView';
