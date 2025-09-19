# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Build and Development
- `npm run dev` - Start development server with Vite
- `npm run build` - Build for production (TypeScript compilation + Vite build)
- `npm run start` - Preview production build

### Installation
- `npm install` - Install dependencies
- Set `GEMINI_API_KEY` in `.env.local` for AI features

## Project Architecture

### Tech Stack
- **Frontend**: React 19 with TypeScript, Vite bundler
- **Routing**: React Router DOM with lazy loading for code splitting
- **Styling**: TailwindCSS with custom components
- **AI Integration**: Google Gemini API (@google/genai)
- **Forms**: React Hook Form with Zod validation
- **Icons**: Lucide React
- **Charts**: Recharts
- **Animations**: Framer Motion

### Project Structure

```
├── pages/                    # Page components (lazy loaded)
├── components/              # Reusable UI components
│   ├── ui/                 # Base UI components
│   ├── agenda/             # Agenda-specific components
│   ├── dashboard/          # Dashboard components
│   └── analytics/          # Analytics components
├── services/               # Business logic and API calls
│   ├── ai/                # AI-related services
│   ├── scheduling/        # Appointment scheduling logic
│   └── database/          # Mock database services
├── hooks/                  # Custom React hooks
├── contexts/              # React contexts for global state
├── lib/                   # Utility libraries
├── types.ts               # TypeScript type definitions
└── AppRoutes.tsx          # Main routing configuration
```

### Key Application Modules

**FisioFlow** is a comprehensive physiotherapy clinic management system with the following core modules:

1. **Patient Management** (`pages/PatientListPage.tsx`, `pages/PatientDetailPage.tsx`)
   - Patient records, medical history, treatment tracking
   - Integration with scheduling and financial modules

2. **Appointment Scheduling** (`pages/AgendaPage.tsx`)
   - Weekly calendar view with drag-and-drop
   - Recurrent appointments and conflict detection
   - Multiple therapist support with color coding

3. **Treatment Tracking** (`pages/AcompanhamentoPage.tsx`)
   - Session notes, progress tracking
   - AI-powered suggestions via Gemini API

4. **Financial Management** (`pages/FinancialDashboardPage.tsx`)
   - Revenue tracking, payment management
   - Financial reports and analytics

5. **AI-Powered Features**
   - Treatment recommendations (`services/geminiService.ts`)
   - Clinical decision support
   - Automated documentation assistance

### Code Organization Patterns

- **Lazy Loading**: All pages use `React.lazy()` for code splitting (see `AppRoutes.tsx`)
- **Service Layer**: Business logic separated into service files with mock data
- **Component Structure**: UI components organized by feature/domain
- **Type Safety**: Comprehensive TypeScript types in `types.ts`

### State Management
- React Context for global state (`contexts/`)
- Custom hooks for component-specific logic (`hooks/`)
- Local state with React Hook Form for forms

### Performance Optimizations
- Code splitting implemented for all routes
- Lazy loading of components
- Optimized bundle with Vite
- Service worker for caching (`sw.js`)

### AI Integration
The application integrates with Google Gemini API for:
- Clinical decision support
- Treatment protocol suggestions
- Documentation assistance
- Patient risk analysis

The main AI service is in `services/geminiService.ts` with comprehensive prompts for physiotherapy-specific use cases.

### Testing
- Test files located in `tests/` directory
- Currently minimal test coverage - consider expanding

### Important Notes
- This is a React-based SPA, not Next.js (despite some Next.js config files present)
- Uses Vite for bundling and development
- Mock data services simulate backend functionality
- Gemini API key required for AI features to work