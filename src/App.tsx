import { useState, useEffect } from 'react';
import { CalendarView } from '@/components/Calendar';
import { CalendarEvent } from '@/components/Calendar/CalendarView.types';
import './styles/globals.css';

const getTodayWithTime = (hours: number, minutes: number) => {
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date;
};

// Sample events for the demo
const initialEvents: CalendarEvent[] = [
  {
    id: 'evt-1',
    title: 'Team Standup',
    description: 'Daily sync with the team',
    startDate: getTodayWithTime(9, 0),
    endDate: getTodayWithTime(9, 30),
    color: '#3b82f6',
    category: 'Meeting',
  },
  {
    id: 'evt-2',
    title: 'Design Review',
    description: 'Review new component designs',
    startDate: getTodayWithTime(14, 0),
    endDate: getTodayWithTime(15, 30),
    color: '#10b981',
    category: 'Design',
  },
  {
    id: 'evt-3',
    title: 'Client Presentation',
    startDate: getTodayWithTime(10, 0),
    endDate: getTodayWithTime(11, 30),
    color: '#f59e0b',
    category: 'Meeting',
  },
  {
    id: 'evt-4',
    title: 'Development Sprint',
    description: 'Sprint planning and task assignment',
    startDate: new Date(new Date().setDate(new Date().getDate() + 2)),
    endDate: new Date(new Date().setDate(new Date().getDate() + 2.33)), // ~9am to 5pm
    color: '#8b5cf6',
    category: 'Work',
  },
];

// Keys for localStorage
const USER_EVENTS_KEY = 'user_created_events';
const MODIFIED_EVENTS_KEY = 'user_modified_events';

// Helper to parse events from localStorage with proper date handling
const parseEvents = (json: string): any[] => {
  try {
    return JSON.parse(json, (key, value) => {
      if (key === 'startDate' || key === 'endDate') {
        return new Date(value);
      }
      return value;
    });
  } catch (error) {
    console.error('Error parsing events:', error);
    return [];
  }
};

// Helper to safely stringify events with date handling
const stringifyEvents = (data: any): string => {
  return JSON.stringify(data, (_, value) => {
    if (value instanceof Date) {
      return value.toISOString();
    }
    return value;
  });
};

function App() {
  // User-created events (not in sample events)
  const [userCreatedEvents, setUserCreatedEvents] = useState<CalendarEvent[]>(() => {
    try {
      const saved = localStorage.getItem(USER_EVENTS_KEY);
      return saved ? parseEvents(saved) : [];
    } catch (error) {
      console.error('Failed to load user events', error);
      return [];
    }
  });

  // User-modified sample events
  const [userModifiedEvents, setUserModifiedEvents] = useState<Record<string, CalendarEvent>>(() => {
    try {
      const saved = localStorage.getItem(MODIFIED_EVENTS_KEY);
      if (!saved) return {};
      
      const parsed = JSON.parse(saved);
      const result: Record<string, CalendarEvent> = {};
      
      Object.entries(parsed).forEach(([key, value]: [string, any]) => {
        result[key] = {
          ...value,
          startDate: new Date(value.startDate),
          endDate: new Date(value.endDate)
        };
      });
      
      return result;
    } catch (error) {
      console.error('Failed to load modified events', error);
      return {};
    }
  });

  // Save events to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(USER_EVENTS_KEY, stringifyEvents(userCreatedEvents));
      
      // Stringify with date handling for modified events
      const modifiedToSave: Record<string, any> = {};
      Object.entries(userModifiedEvents).forEach(([key, event]) => {
        modifiedToSave[key] = {
          ...event,
          startDate: event.startDate.toISOString(),
          endDate: event.endDate.toISOString()
        };
      });
      
      localStorage.setItem(MODIFIED_EVENTS_KEY, JSON.stringify(modifiedToSave));
    } catch (error) {
      console.error('Failed to save events', error);
    }
  }, [userCreatedEvents, userModifiedEvents]);

  // Get the most recent version of each event (modified > sample) and filter out deleted events
  const allEvents = [
    ...initialEvents.map(event => ({
      ...(userModifiedEvents[event.id] || event)
    })).filter(event => {
      // Filter out deleted events (marked with endDate of 0)
      const modifiedEvent = userModifiedEvents[event.id];
      return !modifiedEvent || modifiedEvent.endDate.getTime() !== 0;
    }),
    ...userCreatedEvents
  ];

  const handleEventAdd = (event: CalendarEvent) => {
    if (initialEvents.some(e => e.id === event.id)) {
      // Update modified sample event
      setUserModifiedEvents(prev => ({
        ...prev,
        [event.id]: event
      }));
    } else {
      // Add new user-created event
      setUserCreatedEvents(prev => [...prev, event]);
    }
  };

  const handleEventUpdate = (id: string, updates: Partial<CalendarEvent>) => {
    if (initialEvents.some(e => e.id === id)) {
      // Update modified sample event
      setUserModifiedEvents(prev => ({
        ...prev,
        [id]: {
          ...(prev[id] || initialEvents.find(e => e.id === id)!),
          ...updates
        }
      }));
    } else {
      // Update user-created event
      setUserCreatedEvents(prev =>
        prev.map(event => 
          event.id === id ? { ...event, ...updates } : event
        )
      );
    }
  };

  const handleEventDelete = (id: string) => {
    if (initialEvents.some(e => e.id === id)) {
      // For sample events, mark as deleted
      setUserModifiedEvents(prev => ({
        ...prev,
        [id]: {
          ...(prev[id] || initialEvents.find(e => e.id === id)!),
          endDate: new Date(0) // Mark as deleted
        }
      }));
    } else {
      // Delete user-created event
      setUserCreatedEvents(prev => prev.filter(event => event.id !== id));
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      <CalendarView
        events={allEvents}
        onEventAdd={handleEventAdd}
        onEventUpdate={handleEventUpdate}
        onEventDelete={handleEventDelete}
        initialView="month"
      />
    </div>
  );
}

export default App;
