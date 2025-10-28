import { useState, useEffect } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { CalendarView } from './CalendarView';
import { CalendarEvent } from './CalendarView.types';

// Helper to get today's date with specific time
const getTodayWithTime = (hours: number, minutes: number) => {
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date;
};

// Keys for localStorage
const USER_EVENTS_KEY = 'storybook_user_created_events';
const MODIFIED_EVENTS_KEY = 'storybook_user_modified_events';

// Sample events for stories (matching the app's events exactly)
const getInitialSampleEvents = (): CalendarEvent[] => [
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

// Helper to parse events from localStorage with proper date handling
const parseEvents = (json: string): CalendarEvent[] => {
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

// Many events for stress testing
const getManyEvents = (): CalendarEvent[] => 
  Array.from({ length: 25 }, (_, i) => {
    const baseDate = new Date();
    const startDate = new Date(baseDate);
    startDate.setDate(baseDate.getDate() + Math.floor(i / 5));
    
    const endDate = new Date(startDate);
    endDate.setHours(startDate.getHours() + 1);
    
    return {
      id: `evt-many-${i}`,
      title: `Event ${i + 1}`,
      description: `This is event number ${i + 1}`,
      startDate,
      endDate,
      color: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'][i % 5] as string,
      category: ['Meeting', 'Work', 'Personal', 'Health', 'Education'][i % 5] as string,
    };
  });

const meta: Meta<typeof CalendarView> = {
  title: 'Components/CalendarView',
  component: CalendarView,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'A fully interactive calendar component with month and week views, event management, and accessibility features.',
      },
    },
  },
  argTypes: {
    events: {
      description: 'Array of calendar events to display',
      control: false,
    },
    onEventAdd: {
      description: 'Callback when a new event is added',
      action: 'onEventAdd',
    },
    onEventUpdate: {
      description: 'Callback when an event is updated',
      action: 'onEventUpdate',
    },
    onEventDelete: {
      description: 'Callback when an event is deleted',
      action: 'onEventDelete',
    },
    initialView: {
      description: 'Initial view mode',
      control: 'select',
      options: ['month', 'week'],
    },
    initialDate: {
      description: 'Initial date to display',
      control: 'date',
    },
  },
};

export default meta;
type Story = StoryObj<typeof CalendarView>;

// Stateful wrapper component that mimics the app's event handling
const CalendarWithState = (args: any) => {
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
  const [userModifiedEvents, setUserModifiedEvents] = useState<Record<string, Partial<CalendarEvent>>>(() => {
    try {
      const saved = localStorage.getItem(MODIFIED_EVENTS_KEY);
      if (!saved) return {};
      
      const parsed = JSON.parse(saved);
      const result: Record<string, Partial<CalendarEvent>> = {};
      
      for (const [id, event] of Object.entries(parsed)) {
        if (event && typeof event === 'object') {
          const typedEvent = event as any;
          result[id] = {
            ...typedEvent,
            startDate: typedEvent.startDate ? new Date(typedEvent.startDate) : undefined,
            endDate: typedEvent.endDate ? new Date(typedEvent.endDate) : undefined
          };
        }
      }
      return result;
    } catch (error) {
      console.error('Failed to load modified events', error);
      return {};
    }
  });

  // Get current sample events with any modifications
  const getCurrentSampleEvents = (): CalendarEvent[] => {
    return getInitialSampleEvents().map(event => {
      const modifiedEvent = userModifiedEvents[event.id];
      if (modifiedEvent) {
        // Ensure we have all required fields by spreading the original event first
        return { ...event, ...modifiedEvent } as CalendarEvent;
      }
      return event;
    });
  };

  // Combine sample and user-created events
  const allEvents = [...getCurrentSampleEvents(), ...userCreatedEvents];

  // Save user-created events to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(USER_EVENTS_KEY, stringifyEvents(userCreatedEvents));
    } catch (error) {
      console.error('Failed to save user events', error);
    }
  }, [userCreatedEvents]);

  // Save modified events to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(MODIFIED_EVENTS_KEY, stringifyEvents(userModifiedEvents));
    } catch (error) {
      console.error('Failed to save modified events', error);
    }
  }, [userModifiedEvents]);

  const handleEventAdd = (event: CalendarEvent) => {
    const newEvent = { 
      ...event, 
      id: `user-${Date.now()}`,
      isUserCreated: true
    };
    setUserCreatedEvents(prev => [...prev, newEvent]);
  };

  const handleEventUpdate = (id: string, updates: Partial<CalendarEvent>) => {
    // Check if it's a sample event
    const isSampleEvent = getInitialSampleEvents().some(evt => evt.id === id);
    
    if (isSampleEvent) {
      // For sample events, update the modified events
      const sampleEvent = getInitialSampleEvents().find(evt => evt.id === id);
      if (!sampleEvent) return;
      
      setUserModifiedEvents(prev => ({
        ...prev,
        [id]: {
          ...prev[id],
          ...updates
        }
      }));
    } else {
      // For user-created events, update in userCreatedEvents
      setUserCreatedEvents(prev => 
        prev.map(event => 
          event.id === id ? { ...event, ...updates } as CalendarEvent : event
        )
      );
    }
  };

  const handleEventDelete = (id: string) => {
    // Check if it's a sample event
    const isSampleEvent = getInitialSampleEvents().some(evt => evt.id === id);
    
    if (isSampleEvent) {
      // For sample events, we can't delete them, but we can hide them
      // by setting them to a very old date
      setUserModifiedEvents(prev => ({
        ...prev,
        [id]: {
          ...prev[id],
          startDate: new Date(0),
          endDate: new Date(0)
        }
      }));
    } else {
      // For user-created events, remove them
      setUserCreatedEvents(prev => prev.filter(event => event.id !== id));
    }
  };

  return (
    <div style={{ height: '100vh' }}>
      <CalendarView
        {...args}
        events={allEvents}
        onEventAdd={handleEventAdd}
        onEventUpdate={handleEventUpdate}
        onEventDelete={handleEventDelete}
      />
    </div>
  );
};

export const Default: Story = {
  render: (args) => <CalendarWithState {...args} />,
  args: {
    initialView: 'month',
    initialDate: new Date(),
  },
  parameters: {
    docs: {
      description: {
        story: 'Default calendar view with sample events showing the current month.',
      },
    },
  },
};

const EmptyCalendar = (args: any) => {
  // No events state - always empty
  const events: CalendarEvent[] = [];
  
  // No-op handlers since there are no events to modify
  const handleEventAdd = () => {};
  const handleEventUpdate = () => {};
  const handleEventDelete = () => {};

  return (
    <div style={{ height: '100vh' }}>
      <CalendarView
        {...args}
        events={events}
        onEventAdd={handleEventAdd}
        onEventUpdate={handleEventUpdate}
        onEventDelete={handleEventDelete}
      />
    </div>
  );
};

export const EmptyState: Story = {
  render: (args) => <EmptyCalendar {...args} />,
  args: {
    initialView: 'month',
    initialDate: new Date(),
  },
  parameters: {
    docs: {
      description: {
        story: 'Empty calendar state with no events to demonstrate the clean interface.',
      },
    },
  },
};

export const WeekView: Story = {
  render: (args) => <CalendarWithState {...args} initialView="week" />,
  args: {
    initialDate: new Date(),
  },
  parameters: {
    docs: {
      description: {
        story: 'Week view showing time slots and event positioning.',
      },
    },
  },
};

const WithManyEventsComponent = (args: any) => {
  const [events, setEvents] = useState<CalendarEvent[]>(getManyEvents());
  
  const handleEventAdd = (event: CalendarEvent) => {
    setEvents(prev => [...prev, { ...event, id: `evt-${Date.now()}` }]);
  };

  const handleEventUpdate = (id: string, updates: Partial<CalendarEvent>) => {
    setEvents(prev => 
      prev.map(event => event.id === id ? { ...event, ...updates } : event)
    );
  };

  const handleEventDelete = (id: string) => {
    setEvents(prev => prev.filter(event => event.id !== id));
  };

  return (
    <div style={{ height: '100vh' }}>
      <CalendarView
        {...args}
        events={events}
        onEventAdd={handleEventAdd}
        onEventUpdate={handleEventUpdate}
        onEventDelete={handleEventDelete}
      />
    </div>
  );
};

export const WithManyEvents: Story = {
  render: (args) => <WithManyEventsComponent {...args} />,
  args: {
    initialView: 'month',
    initialDate: new Date(),
  },
  parameters: {
    docs: {
      description: {
        story: 'Calendar with many events to test performance and event overflow handling.',
      },
    },
  },
};

export const InteractiveDemo: Story = {
  render: (args) => <CalendarWithState {...args} />,
  args: {
    initialView: 'month',
    initialDate: new Date(),
  },
  parameters: {
    docs: {
      description: {
        story: 'Fully interactive demo where you can create, edit, and delete events.',
      },
    },
  },
};

export const MobileView: Story = {
  render: (args) => <CalendarWithState {...args} />,
  args: {
    initialView: 'month',
    initialDate: new Date(),
  },
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
    docs: {
      description: {
        story: 'Mobile-optimized view demonstrating responsive design.',
      },
    },
  },
};

export const Accessibility: Story = {
  render: (args) => <CalendarWithState {...args} />,
  args: {
    initialView: 'month',
    initialDate: new Date(),
  },
  parameters: {
    docs: {
      description: {
        story: 'Demonstrates keyboard navigation and ARIA accessibility features. Use Tab, Enter, and arrow keys to navigate.',
      },
    },
  },
};
