import React, { useMemo } from 'react';
import { MonthViewProps } from '@/components/Calendar/CalendarView.types';
import { getCalendarGrid, isTodayDate, isCurrentMonth } from '@/utils/date.utils';
import { CalendarCell } from './CalendarCell';

export const MonthView: React.FC<MonthViewProps> = React.memo(({
  currentDate,
  events,
  selectedDate,
  onDateClick,
  onEventClick,
}) => {
  const calendarGrid = useMemo(() => getCalendarGrid(currentDate), [currentDate]);
  
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  return (
    <div className="bg-white rounded-lg shadow-card">
      {/* Week day headers */}
      <div className="grid grid-cols-7 border-b border-neutral-200">
        {weekDays.map(day => (
          <div
            key={day}
            className="p-3 text-center text-sm font-medium text-neutral-600 bg-neutral-50"
          >
            {day}
          </div>
        ))}
      </div>
      
      {/* Calendar grid */}
      <div className="grid grid-cols-7">
        {calendarGrid.map((date, index) => {
          const isToday = isTodayDate(date);
          const isSelected = selectedDate ? 
            date.toDateString() === selectedDate.toDateString() : false;
          const isCurrentMonthDate = isCurrentMonth(date, currentDate);
          
          return (
            <CalendarCell
              key={index}
              date={date}
              events={events}
              isToday={isToday}
              isSelected={isSelected}
              isCurrentMonth={isCurrentMonthDate}
              onClick={onDateClick}
              onEventClick={onEventClick}
            />
          );
        })}
      </div>
    </div>
  );
});

MonthView.displayName = 'MonthView';
