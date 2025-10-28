# Calendar View Component

## App URL
[https://calender-view-component.vercel.app/]

## Storybook URL
[https://690062c5df116b8358c532ca-zysxxpqjrg.chromatic.com/?path=/story/components-calendarview--default&globals=viewport:responsive]

## 📦 Installation

```bash
pnpm install
pnpm dev
pnpm storybook
```

## 🏗️ Architecture

This calendar component is built with a modular architecture focusing on:

- **Component Separation**: Each view (Month/Week) and UI element is a separate, reusable component
- **Custom Hooks**: State management and business logic are abstracted into custom hooks
- **Type Safety**: Comprehensive TypeScript interfaces ensure type safety throughout
- **Performance**: React.memo, useCallback, and useMemo optimizations for smooth interactions
- **Accessibility**: WCAG 2.1 AA compliant with full keyboard navigation and ARIA support

## ✨ Features

- [x] Month/Week views with smooth transitions
- [x] Event management (create, edit, delete)
- [x] Responsive design (mobile, tablet, desktop)
- [x] Keyboard accessibility with ARIA labels
- [x] Drag and drop event creation
- [x] Event color coding and categorization
- [x] Performance optimized for large datasets
- [x] Comprehensive Storybook documentation
- [x] Unit tests with Vitest

## 📚 Storybook Stories

1. **Default** - Current month with sample events
2. **Empty State** - Calendar with no events
3. **Week View** - Week view demonstration
4. **With Many Events** - Month with 20+ events
5. **Interactive Demo** - Fully functional event management
6. **Mobile View** - Responsive layout demonstration
7. **Accessibility** - Keyboard navigation demonstration

## 🛠️ Technologies

- React 18 + TypeScript
- Tailwind CSS for styling
- date-fns for date manipulation
- Storybook for documentation
- Vite for build tooling
- Vitest for testing

## 📁 Project Structure

```
src/
├── components/
│   ├── Calendar/
│   │   ├── CalendarView.tsx          # Main component
│   │   ├── CalendarView.stories.tsx  # Storybook stories
│   │   ├── CalendarView.test.tsx     # Unit tests
│   │   ├── CalendarView.types.ts     # Type definitions
│   │   ├── MonthView.tsx             # Month grid view
│   │   ├── WeekView.tsx              # Week time slots view
│   │   ├── CalendarCell.tsx          # Individual day cell
│   │   ├── EventModal.tsx            # Event creation/editing
│   │   └── index.ts                  # Exports
│   └── primitives/                   # Reusable UI elements
│       ├── Button.tsx
│       ├── Modal.tsx
│       ├── Select.tsx
│       └── index.ts
├── hooks/
│   ├── useCalendar.ts               # Calendar state management
│   └── useEventManager.ts           # Event CRUD operations
├── utils/
│   ├── date.utils.ts                # Date manipulation utilities
│   └── event.utils.ts               # Event-related utilities
├── test/
│   └── setup.ts                     # Test configuration
└── styles/
    └── globals.css                  # Global styles and Tailwind
```

## 🎯 Performance Features

- **Memoization**: All components use React.memo for optimal re-rendering
- **Virtualization**: Efficient rendering for large event datasets
- **Debounced Search**: Smooth filtering without performance impact
- **Lazy Loading**: Modals and complex views load on demand
- **Bundle Optimization**: Production build under 200kb gzipped

## ♿ Accessibility Features

- **Keyboard Navigation**: Full keyboard support with logical tab order
- **ARIA Labels**: Comprehensive screen reader support
- **Focus Management**: Clear focus indicators and logical focus flow
- **Color Contrast**: WCAG AA compliant color ratios
- **Responsive Text**: Scalable text up to 200% without loss of functionality

## 🚀 Getting Started

1. Clone the repository
2. Install dependencies: `pnpm install`
3. Start development server: `pnpm dev`
4. View Storybook: `pnpm storybook`
5. Run tests: `pnpm test`
6. Build for production: `pnpm build`

## 🧪 Testing

The project includes comprehensive unit tests using Vitest and React Testing Library:

```bash
pnpm test
```

## 📝 Development Notes

- All components are built from scratch without external UI libraries
- TypeScript strict mode is enabled for maximum type safety
- Tailwind CSS provides consistent design system tokens
- Storybook stories demonstrate all component states and interactions
- Performance optimizations include React.memo, useCallback, and useMemo
- Accessibility features meet WCAG 2.1 AA standards

## 🎨 Design System

The component follows modern SaaS design principles:
- Clean & minimal interface
- Consistent spacing using Tailwind's 4px base unit
- Clear visual hierarchy
- Subtle micro-animations
- Purposeful color usage

