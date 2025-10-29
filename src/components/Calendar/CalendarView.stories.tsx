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
const MODIFIED_EVENTS_KEY = 'storybook_modified_events';

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
    startDate: (() => {
      const date = new Date();
      // Set to 2 days from now at 9:00 AM
      date.setDate(date.getDate() + 2);
      date.setHours(9, 0, 0, 0);
      return date;
    })(),
    endDate: (() => {
      const date = new Date();
      // Set to 2 days from now at 5:00 PM
      date.setDate(date.getDate() + 2);
      date.setHours(17, 0, 0, 0);
      return date;
    })(),
    color: '#8b5cf6',
    category: 'Work',
  },
];


// Generate consistent 32 events for the month with at least one event today
const getManyEvents = (): CalendarEvent[] => {
  const events: CalendarEvent[] = [];
  const categories = ['Meeting', 'Work', 'Personal', 'Health', 'Education'];
  const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
  
  // Fixed base date (first day of current month)
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const baseDate = new Date(now.getFullYear(), now.getMonth(), 1);
  
  // Seeded random number generator for consistent results
  const seededRandom = (seed: number) => {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
  };
  
  // Always add an event for today
  const todayEventTime = new Date(today);
  todayEventTime.setHours(14, 0, 0, 0); // 2 PM
  
  events.push({
    id: 'evt-today',
    title: 'Today\'s Event',
    description: 'This event is scheduled for today',
    startDate: todayEventTime,
    endDate: new Date(todayEventTime.getTime() + 60 * 60 * 1000), // 1 hour duration
    color: '#3b82f6',
    category: 'Meeting'
  });
  
  // Generate remaining 31 events
  for (let i = 0; i < 31; i++) {
    // Use the event index as part of the seed for consistent results
    const seed = i * 1000 + now.getMonth();
    
    // Distribute events across the month (0-30 days from start of month)
    const dayOffset = Math.floor(seededRandom(seed) * 28);
    const startDate = new Date(baseDate);
    startDate.setDate(baseDate.getDate() + dayOffset);
    
    // Skip today as we already added a specific event for it
    if (startDate.toDateString() === today.toDateString()) {
      continue;
    }
    
    // Fixed time slots (9am, 12pm, 3pm, 6pm) for consistency
    const timeSlots = [9, 12, 15, 18];
    const timeSlot = timeSlots[i % timeSlots.length]!; // Non-null assertion as we know index is valid
    startDate.setHours(timeSlot, 0, 0, 0);
    
    // Fixed duration (1, 1.5, or 2 hours) - ensure it's always defined
    const durationOptions = [1, 1.5, 2];
    const durationHours = durationOptions[i % durationOptions.length]!; // Non-null assertion as we know index is valid
    const endDate = new Date(startDate.getTime() + durationHours * 60 * 60 * 1000);
    
    // Consistent category and color based on event index
    const categoryIndex = i % categories.length;
    const color = colors[categoryIndex]!; // Non-null assertion as we know index is valid
    const category = categories[categoryIndex]!; // Non-null assertion as we know index is valid
    
    // Create event titles that indicate their position in the sequence
    const eventNumber = i + 1;
    const timeStr = startDate.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
    
    // Create the event with all required properties
    const event: CalendarEvent = {
      id: `evt-${i}`,
      title: `Event ${eventNumber}`,
      description: `Scheduled on ${startDate.toLocaleDateString()} at ${timeStr}`,
      startDate,
      endDate,
      color,
      category,
      // Add any other required properties from CalendarEvent type here
    };
    
    events.push(event);
  }
  
  return events;
};

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


// Helper to load modified events from localStorage
const loadModifiedEvents = (): Record<string, CalendarEvent> => {
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
};

// Helper to save modified events to localStorage
const saveModifiedEvents = (events: Record<string, CalendarEvent>) => {
  try {
    const toSave: Record<string, any> = {};
    Object.entries(events).forEach(([key, event]) => {
      toSave[key] = {
        ...event,
        startDate: event.startDate.toISOString(),
        endDate: event.endDate.toISOString()
      };
    });
    localStorage.setItem(MODIFIED_EVENTS_KEY, JSON.stringify(toSave));
  } catch (error) {
    console.error('Failed to save modified events', error);
  }
};

// Stateful wrapper component that mimics the app's event handling
const CalendarWithState = (args: any) => {
  // Load events from localStorage on initial render
  const [userEvents, setUserEvents] = useState<CalendarEvent[]>(() => loadUserEvents());
  const [sampleEvents] = useState<CalendarEvent[]>(() => getInitialSampleEvents());
  const [modifiedEvents, setModifiedEvents] = useState<Record<string, CalendarEvent>>(() => loadModifiedEvents());
  
  // Combine sample events (with modifications) and user-created events
  const allEvents = [
    ...sampleEvents.map(event => ({
      ...(modifiedEvents[event.id] || event)
    })).filter(event => {
      // Filter out deleted events (marked with endDate of 0)
      const modifiedEvent = modifiedEvents[event.id];
      return !modifiedEvent || modifiedEvent.endDate.getTime() !== 0;
    }),
    ...userEvents
  ];

  // Save events to localStorage whenever they change
  useEffect(() => {
    saveUserEvents(userEvents);
  }, [userEvents]);

  // Save modified events to localStorage whenever they change
  useEffect(() => {
    saveModifiedEvents(modifiedEvents);
  }, [modifiedEvents]);

  // Handle adding a new event
  const handleEventAdd = (event: CalendarEvent) => {
    if (sampleEvents.some(e => e.id === event.id)) {
      // Update modified sample event
      setModifiedEvents(prev => ({
        ...prev,
        [event.id]: event
      }));
    } else {
      // Add new user-created event
      const newEvent = {
        ...event,
        id: `user-${Date.now()}`
      };
      setUserEvents(prev => [...prev, newEvent]);
    }
  };

  // Handle updating an event
  const handleEventUpdate = (id: string, updates: Partial<CalendarEvent>) => {
    if (sampleEvents.some(e => e.id === id)) {
      // Update modified sample event
      setModifiedEvents(prev => ({
        ...prev,
        [id]: {
          ...(prev[id] || sampleEvents.find(e => e.id === id)!),
          ...updates
        }
      }));
    } else {
      // Update user-created event
      setUserEvents(prev => 
        prev.map(event => event.id === id ? { ...event, ...updates } : event)
      );
    }
  };

  // Handle deleting an event
  const handleEventDelete = (id: string) => {
    if (sampleEvents.some(e => e.id === id)) {
      // For sample events, mark as deleted
      setModifiedEvents(prev => ({
        ...prev,
        [id]: {
          ...(prev[id] || sampleEvents.find(e => e.id === id)!),
          endDate: new Date(0) // Mark as deleted
        }
      }));
    } else {
      // Delete user-created event
      setUserEvents(prev => prev.filter(event => event.id !== id));
    }
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
    initialDate: new Date(1759683319393),
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
  const STORAGE_KEY = 'calendar-many-events';
  
  // Load events from localStorage or generate new ones
  const loadEvents = (): CalendarEvent[] => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Convert string dates back to Date objects
        return parsed.map((event: any) => ({
          ...event,
          startDate: new Date(event.startDate),
          endDate: new Date(event.endDate)
        }));
      }
    } catch (e) {
      console.warn('Failed to load events from localStorage', e);
    }
    // Generate new events if none saved
    return getManyEvents();
  };
  
  // Save events to localStorage
  const saveEvents = (events: CalendarEvent[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
    } catch (e) {
      console.warn('Failed to save events to localStorage', e);
    }
  };
  
  const [events, setEvents] = useState<CalendarEvent[]>(() => loadEvents());
  
  const handleEventAdd = (event: CalendarEvent) => {
    const newEvent = { ...event, id: `evt-${Date.now()}` };
    const newEvents = [...events, newEvent];
    setEvents(newEvents);
    saveEvents(newEvents);
  };

  const handleEventUpdate = (id: string, updates: Partial<CalendarEvent>) => {
    const newEvents = events.map(event => 
      event.id === id ? { ...event, ...updates } : event
    );
    setEvents(newEvents);
    saveEvents(newEvents);
  };

  const handleEventDelete = (id: string) => {
    const newEvents = events.filter(event => event.id !== id);
    setEvents(newEvents);
    saveEvents(newEvents);
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
        story: 'Calendar with many events to test performance and event overflow handling. Events are persisted in localStorage.',
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
  const [modifiedEvents, setModifiedEvents] = useState<Record<string, CalendarEvent>>(() => loadModifiedEvents());
  
  // Combine sample events (with modifications) and user-created events
  const allEvents = [
    ...sampleEvents.map(event => ({
      ...(modifiedEvents[event.id] || event)
    })).filter(event => {
      // Filter out deleted events (marked with endDate of 0)
      const modifiedEvent = modifiedEvents[event.id];
      return !modifiedEvent || modifiedEvent.endDate.getTime() !== 0;
    }),
    ...userEvents
  ];

  // Save events to localStorage whenever they change
  useEffect(() => {
    saveUserEvents(userEvents);
  }, [userEvents]);

  // Save modified events to localStorage whenever they change
  useEffect(() => {
    saveModifiedEvents(modifiedEvents);
  }, [modifiedEvents]);

  // Handle adding a new event
  const handleEventAdd = (event: CalendarEvent) => {
    if (sampleEvents.some(e => e.id === event.id)) {
      // Update modified sample event
      setModifiedEvents(prev => ({
        ...prev,
        [event.id]: event
      }));
    } else {
      // Add new user-created event
      const newEvent = {
        ...event,
        id: `user-${Date.now()}`
      };
      setUserEvents(prev => [...prev, newEvent]);
    }
  };

  // Handle updating an event
  const handleEventUpdate = (id: string, updates: Partial<CalendarEvent>) => {
    if (sampleEvents.some(e => e.id === id)) {
      // Update modified sample event
      setModifiedEvents(prev => ({
        ...prev,
        [id]: {
          ...(prev[id] || sampleEvents.find(e => e.id === id)!),
          ...updates
        }
      }));
    } else {
      // Update user-created event
      setUserEvents(prev => 
        prev.map(event => event.id === id ? { ...event, ...updates } : event)
      );
    }
  };

  // Handle deleting an event
  const handleEventDelete = (id: string) => {
    if (sampleEvents.some(e => e.id === id)) {
      // For sample events, mark as deleted
      setModifiedEvents(prev => ({
        ...prev,
        [id]: {
          ...(prev[id] || sampleEvents.find(e => e.id === id)!),
          endDate: new Date(0) // Mark as deleted
        }
      }));
    } else {
      // Delete user-created event
      setUserEvents(prev => prev.filter(event => event.id !== id));
    }
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
            <li>🔄 <strong>Update events</strong> using the update button in the event modal</li>
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

const AccessibilityWrapper = (args: any) => {
  const [showInstructions, setShowInstructions] = useState(true);
  const [userEvents, setUserEvents] = useState<CalendarEvent[]>(() => loadUserEvents());
  const [sampleEvents] = useState<CalendarEvent[]>(() => getInitialSampleEvents());
  const [modifiedEvents, setModifiedEvents] = useState<Record<string, CalendarEvent>>(() => loadModifiedEvents());
  
  // Combine sample events (with modifications) and user-created events
  const allEvents = [
    ...sampleEvents.map(event => ({
      ...(modifiedEvents[event.id] || event)
    })).filter(event => {
      // Filter out deleted events (marked with endDate of 0)
      const modifiedEvent = modifiedEvents[event.id];
      return !modifiedEvent || modifiedEvent.endDate.getTime() !== 0;
    }),
    ...userEvents
  ];

  // Save events to localStorage whenever they change
  useEffect(() => {
    saveUserEvents(userEvents);
  }, [userEvents]);

  // Save modified events to localStorage whenever they change
  useEffect(() => {
    saveModifiedEvents(modifiedEvents);
  }, [modifiedEvents]);

  // Handle adding a new event
  const handleEventAdd = (event: CalendarEvent) => {
    if (sampleEvents.some(e => e.id === event.id)) {
      // Update modified sample event
      setModifiedEvents(prev => ({
        ...prev,
        [event.id]: event
      }));
    } else {
      // Add new user-created event
      const newEvent = {
        ...event,
        id: `user-${Date.now()}`
      };
      setUserEvents(prev => [...prev, newEvent]);
    }
  };

  // Handle updating an event
  const handleEventUpdate = (id: string, updates: Partial<CalendarEvent>) => {
    if (sampleEvents.some(e => e.id === id)) {
      // Update modified sample event
      setModifiedEvents(prev => ({
        ...prev,
        [id]: {
          ...(prev[id] || sampleEvents.find(e => e.id === id)!),
          ...updates
        }
      }));
    } else {
      // Update user-created event
      setUserEvents(prev => 
        prev.map(event => event.id === id ? { ...event, ...updates } : event)
      );
    }
  };

  // Handle deleting an event
  const handleEventDelete = (id: string) => {
    if (sampleEvents.some(e => e.id === id)) {
      // For sample events, mark as deleted
      setModifiedEvents(prev => ({
        ...prev,
        [id]: {
          ...(prev[id] || sampleEvents.find(e => e.id === id)!),
          endDate: new Date(0) // Mark as deleted
        }
      }));
    } else {
      // Delete user-created event
      setUserEvents(prev => prev.filter(event => event.id !== id));
    }
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
            <h3 style={{ margin: 0 }}>♿ Accessibility Features</h3>
            <button 
              onClick={() => setShowInstructions(false)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: '1.25rem',
                color: '#64748b'
              }}
              aria-label="Close accessibility instructions"
            >
              ×
            </button>
          </div>
          <p style={{ margin: '0.5rem 0' }}>This calendar includes the following accessibility features:</p>
          <ul style={{ margin: '0.5rem 0', paddingLeft: '1.25rem' }}>
            <li>🔤 <strong>Keyboard Navigation</strong>: Use Tab, Enter, and Esc key to navigate</li>
            <li>🎯 <strong>Focus Management</strong>: Clear visual focus indicators for keyboard users</li>
            <li>🎨 <strong>Color Contrast</strong>: Meets WCAG AA contrast ratio requirements</li>
          </ul>
          <div style={{
            display: 'flex',
            justifyContent: 'flex-end',
            marginTop: '0.75rem',
          }}>
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
      <div style={{ paddingTop: showInstructions ? '240px' : '1rem' }}>
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

export const Accessibility: Story = {
  render: (args) => <AccessibilityWrapper {...args} />,
  args: {
    initialView: 'month',
    initialDate: new Date(),
  },
  parameters: {
    docs: {
      description: {
        story: `## ♿ Accessible Calendar Demo

This calendar includes comprehensive accessibility features:

- **Keyboard Navigation**: Full keyboard support for all interactive elements
- **Focus Management**: Clear visual focus indicators
- **Color Contrast**: Meets WCAG 2.1 AA contrast requirements
- **Zoom Support**: Fully functional at 200% zoom

### Keyboard Shortcuts:
- **Tab**: Navigate between interactive elements
- **Enter/Space**: Activate buttons and controls
- **Arrow Keys**: Navigate between dates
- **Page Up/Down**: Move between months
- **Home/End**: Jump to start/end of week

Try navigating the calendar using only your keyboard!`,
      },
    },
  },
};
