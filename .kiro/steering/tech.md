# Technology Stack

## Core Framework
- **React 18.3.1** with TypeScript
- **Vite** as build tool and dev server
- **React Router v7** for client-side routing
- **Tailwind CSS** with shadcn/ui components

## Backend & Database
- **Supabase** for authentication, database, and real-time features
- **PostgreSQL** database with Row Level Security (RLS)
- **Supabase Auth** for user management and role-based access

## State Management & Data Fetching
- **React Query (TanStack Query)** for server state management
- **React Context** for client-side state
- **Zustand** patterns for complex state scenarios

## UI Components & Styling
- **shadcn/ui** component library built on Radix UI primitives
- **Tailwind CSS** with custom design system
- **Framer Motion** for animations
- **Lucide React** for icons
- **Monday.com inspired** color palette and design patterns

## AI & Integrations
- **Google Gemini AI** for content generation
- **Anthropic Claude** integration
- **WhatsApp Business API** for notifications
- **Stripe** for payments (optional)

## Development Tools
- **TypeScript** with gradual strict mode adoption
- **ESLint** with React and TypeScript rules
- **Playwright** for E2E testing
- **Vitest** for unit testing
- **Storybook** for component development

## Performance & Monitoring
- **Sentry** for error tracking
- **Vercel Analytics** and Speed Insights
- **Lighthouse CI** for performance budgets
- **Web Vitals** monitoring
- **Service Worker** for offline capabilities

## Common Commands

### Development
```bash
npm run dev                    # Start development server
npm run dev:clean             # Start dev server with clean cache
npm run type-check            # TypeScript type checking
npm run lint                  # Run ESLint
npm run lint:fix              # Fix ESLint issues
```

### Building & Testing
```bash
npm run build                 # Production build with validation
npm run build:fast           # Fast build without validation
npm run test:unit             # Run unit tests
npm run test:e2e              # Run E2E tests with Playwright
npm run test:all              # Run all tests
```

### Performance & Analysis
```bash
npm run build:analyze        # Build with bundle analysis
npm run lighthouse           # Run Lighthouse CI
npm run perf:local           # Performance test on localhost
npm run security:audit       # Security audit
```

### Database & Migrations
```bash
npm run activity:migrate     # Apply Supabase migrations
npm run seed                 # Seed database with test data
```

## Architecture Patterns

### File Organization
- Flat structure at root level for main application files
- Feature-based organization within `/pages/`
- Shared components in `/components/`
- Utilities and services in `/lib/` and `/services/`

### Component Patterns
- Functional components with hooks
- Compound component patterns for complex UI
- Error boundaries for resilient UX
- Lazy loading for performance optimization

### State Management
- Server state via React Query
- Local UI state via useState/useReducer
- Global app state via Context providers
- Form state via React Hook Form + Zod validation

### Performance Optimizations
- Code splitting with React.lazy()
- Bundle optimization with manual chunks
- Image optimization and lazy loading
- Service worker for offline support
- Aggressive tree shaking and dead code elimination