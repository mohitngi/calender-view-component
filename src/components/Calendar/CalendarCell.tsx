import React, { useCallback } from 'react';
import { CalendarCellProps } from '@/components/Calendar/CalendarView.types';
import { format } from '@/utils/date.utils';
import { getEventsForDate, hasManyEvents } from '@/utils/event.utils';
import { clsx } from 'clsx';

export const CalendarCell: React.FC<CalendarCellProps> = React.memo(({
  date,
  events,
  isToday,
  isSelected,
  isCurrentMonth,
  onClick,
  onEventClick,
}) => {
  const dayNumber = format(date, 'd');
  const dayEvents = getEventsForDate(events, date);
  const hasMany = hasManyEvents(events, date);
  
  const handleClick = useCallback(() => {
    onClick(date);
  }, [date, onClick]);
  
  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onClick(date);
    }
  }, [date, onClick]);
  
  const handleEventClick = useCallback((event: React.MouseEvent, calendarEvent: any) => {
    event.stopPropagation();
    onEventClick(calendarEvent);
  }, [onEventClick]);
  
  return (
    <div
      className={clsx(
        'border border-neutral-200 h-32 p-2 transition-colors cursor-pointer focus-ring rounded-lg',
        isCurrentMonth ? 'bg-white' : 'bg-neutral-50',
        isSelected && 'bg-primary-50 border-primary-300',
        !isCurrentMonth && 'text-neutral-400',
        'hover:bg-neutral-50'
      )}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-label={`${format(date, 'MMMM d, yyyy')}. ${dayEvents.length} events.`}
      aria-pressed={isSelected}
    >
      <div className="flex justify-between items-start mb-1">
        <span className={clsx(
          'text-sm font-medium',
          isCurrentMonth ? 'text-neutral-900' : 'text-neutral-400'
        )}>
          {dayNumber}
        </span>
        {isToday && (
          <div className="relative">
            <button 
              className={clsx(
                'w-2 h-2 rounded-full',
                'bg-primary-500 hover:bg-primary-600 focus:outline-none',
                'transition-all duration-200 transform hover:scale-150',
                'focus:ring-2 focus:ring-primary-300 focus:ring-offset-2',
                'active:scale-90',
                'absolute -top-1 right-0',
                'after:absolute after:inset-0 after:rounded-full after:bg-primary-400 after:opacity-0',
                'hover:after:opacity-30 hover:after:animate-ping',
                'focus:after:opacity-30 focus:after:animate-ping'
              )}
              onClick={(e) => {
                e.stopPropagation();
                onClick(date);
              }}
              aria-label={`Today, ${format(date, 'MMMM d, yyyy')}. Click to select.`}
            />
          </div>
        )}
      </div>
      
      <div className="space-y-1 overflow-hidden">
        {dayEvents.slice(0, 3).map(event => (
          <div
            key={event.id}
            className="text-xs px-2 py-1 rounded truncate cursor-pointer hover:opacity-80 transition-opacity"
            style={{ backgroundColor: event.color || '#3b82f6' }}
            onClick={(e) => handleEventClick(e, event)}
            title={`${event.title} - ${format(event.startDate, 'h:mm a')}`}
          >
            {event.title}
          </div>
        ))}
        {hasMany && (
          <button 
            className="text-xs text-primary-600 hover:underline focus-ring rounded px-1"
            onClick={(e) => {
              e.stopPropagation();
              onClick(date);
            }}
          >
            +{dayEvents.length - 3} more
          </button>
        )}
      </div>
    </div>
  );
});

CalendarCell.displayName = 'CalendarCell';
