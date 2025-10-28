import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { CalendarView } from './CalendarView';
import { CalendarEvent } from './CalendarView.types';

// Helper to get today's date with specific time
const getTodayWithTime = (hours: number, minutes: number) => {
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date;
};

// Key for localStorage
const USER_EVENTS_KEY = 'storybook_user_created_events';

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
  // Load user events from localStorage on initial render
  const [userEvents, setUserEvents] = useState<CalendarEvent[]>(() => loadUserEvents());
  const [sampleEvents] = useState<CalendarEvent[]>(() => getInitialSampleEvents());
  
  // Combine sample events and user-created events
  const allEvents = [...sampleEvents, ...userEvents];

  // Handle adding a new event
  const handleEventAdd = (event: CalendarEvent) => {
    const newEvent = {
      ...event,
      id: `user-${Date.now()}`,
      isUserCreated: true
    };
    const updatedEvents = [...userEvents, newEvent];
    setUserEvents(updatedEvents);
    saveUserEvents(updatedEvents);
  };

  // Handle updating an event
  const handleEventUpdate = (id: string, updates: Partial<CalendarEvent>) => {
    const updatedEvents = userEvents.map(event => 
      event.id === id ? { ...event, ...updates } : event
    );
    setUserEvents(updatedEvents);
    saveUserEvents(updatedEvents);
  };

  // Handle deleting an event
  const handleEventDelete = (id: string) => {
    const updatedEvents = userEvents.filter(event => event.id !== id);
    setUserEvents(updatedEvents);
    saveUserEvents(updatedEvents);
  };

  // Return the calendar view with event handlers
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

  // This function is now moved to the top of the component
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

// Helper to load events from localStorage
const loadUserEvents = (): CalendarEvent[] => {
  try {
    const saved = localStorage.getItem(USER_EVENTS_KEY);
    return saved ? JSON.parse(saved).map((event: any) => ({
      ...event,
      startDate: new Date(event.startDate),
      endDate: new Date(event.endDate)
    })) : [];
  } catch (error) {
    console.error('Error loading user events:', error);
    return [];
  }
};

// Helper to save events to localStorage
const saveUserEvents = (events: CalendarEvent[]) => {
  try {
    localStorage.setItem(USER_EVENTS_KEY, JSON.stringify(events));
  } catch (error) {
    console.error('Error saving user events:', error);
  }
};

const InteractiveDemoWrapper = (args: any) => {
  const [showInstructions, setShowInstructions] = useState(true);
  const [userEvents, setUserEvents] = useState<CalendarEvent[]>(() => loadUserEvents());
  const [sampleEvents] = useState<CalendarEvent[]>(() => getInitialSampleEvents());
  
  // Combine sample events and user-created events
  const allEvents = [...sampleEvents, ...userEvents];

  // Handle adding a new event
  const handleEventAdd = (event: CalendarEvent) => {
    const newEvent = {
      ...event,
      id: `user-${Date.now()}`,
      isUserCreated: true
    };
    const updatedEvents = [...userEvents, newEvent];
    setUserEvents(updatedEvents);
    saveUserEvents(updatedEvents);
  };

  // Handle updating an event
  const handleEventUpdate = (id: string, updates: Partial<CalendarEvent>) => {
    const updatedEvents = userEvents.map(event => 
      event.id === id ? { ...event, ...updates } : event
    );
    setUserEvents(updatedEvents);
    saveUserEvents(updatedEvents);
  };

  // Handle deleting an event
  const handleEventDelete = (id: string) => {
    const updatedEvents = userEvents.filter(event => event.id !== id);
    setUserEvents(updatedEvents);
    saveUserEvents(updatedEvents);
  };
  
  return (
    <div style={{ position: 'relative', height: '100vh' }}>
      {showInstructions && (
        <div style={{
          position: 'absolute',
          top: '1rem',
          left: '1rem',
          right: '1rem',
          background: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: '0.5rem',
          padding: '1rem',
          zIndex: 10,
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          maxWidth: '600px',
          margin: '0 auto'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <h3 style={{ margin: 0 }}>🎯 Interactive Demo</h3>
            <button 
              onClick={() => setShowInstructions(false)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: '1.25rem',
                color: '#64748b'
              }}
              aria-label="Close instructions"
            >
              ×
            </button>
          </div>
          <p style={{ margin: '0.5rem 0' }}>Try these interactions:</p>
          <ul style={{ margin: '0.5rem 0', paddingLeft: '1.25rem' }}>
            <li>📅 <strong>Click on a date</strong> to create a new event</li>
            <li>✏️ <strong>Click on an event</strong> to view or edit its details</li>
            <li>🗑️ <strong>Delete events</strong> using the delete button in the event modal</li>
            <li>🔄 <strong>Drag and drop</strong> events to reschedule them</li>
          </ul>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginTop: '0.75rem',
            gap: '0.5rem'
          }}>
            <button 
              onClick={() => {
                setUserEvents([]);
                saveUserEvents([]);
              }}
              style={{
                padding: '0.25rem 0.75rem',
                background: '#f8fafc',
                color: '#ef4444',
                border: '1px solid #ef4444',
                borderRadius: '0.25rem',
                cursor: 'pointer',
                fontSize: '0.875rem'
              }}
            >
              Clear All My Events
            </button>
            <button 
              onClick={() => setShowInstructions(false)}
              style={{
                padding: '0.25rem 0.75rem',
                background: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '0.25rem',
                cursor: 'pointer',
                fontSize: '0.875rem'
              }}
            >
              Got it!
            </button>
          </div>
        </div>
      )}
      <div style={{ paddingTop: showInstructions ? '180px' : '1rem' }}>
        <CalendarView
          {...args}
          events={allEvents}
          onEventAdd={handleEventAdd}
          onEventUpdate={handleEventUpdate}
          onEventDelete={handleEventDelete}
        />
      </div>
    </div>
  );
};

export const InteractiveDemo: Story = {
  render: (args) => <InteractiveDemoWrapper {...args} />,
  args: {
    initialView: 'month',
    initialDate: new Date(),
  },
  parameters: {
    docs: {
      description: {
        story: `## 🎯 Interactive Calendar Demo

A fully interactive calendar where you can:

- **Create events** by clicking on any date
- **Edit events** by clicking on them
- **Delete events** using the delete button
- **Drag and drop** to reschedule events
- **Switch between month and week** views

### Tips:
- Hover over events to see a tooltip with details
- Use the navigation buttons to move between months/weeks
- Click on today's date to quickly return to the current day

Try it out by creating a few events and playing with the interactions!`,
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
