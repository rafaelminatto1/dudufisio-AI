# Project Structure

## Root Level Organization

The project uses a **flat structure at the root level** for main application files, with feature-based organization within subdirectories.

```
├── components/           # Shared UI components
├── pages/               # Application pages (feature-based)
├── contexts/            # React Context providers
├── services/            # Business logic and API calls
├── hooks/               # Custom React hooks
├── lib/                 # Utilities and configurations
├── types/               # TypeScript type definitions
├── styles/              # Global styles and design tokens
├── public/              # Static assets
├── tests/               # Test files (E2E, unit, integration)
├── scripts/             # Build and utility scripts
├── supabase/            # Database migrations and config
└── src/                 # Additional source files
```

## Key Directories

### `/components/`
Shared UI components organized by category:
- **ui/**: Basic UI primitives (buttons, inputs, modals)
- **forms/**: Form-specific components
- **tables/**: Data table components
- **charts/**: Analytics and visualization components
- **medical/**: Healthcare-specific components
- **shared/**: Cross-feature shared components

### `/pages/`
Feature-based page organization:
- **auth/**: Authentication pages (login, register, 2FA)
- **dashboard/**: Main dashboard views by role
- **patients/**: Patient management pages
- **appointments/**: Scheduling and calendar pages
- **clinical/**: Treatment and clinical documentation
- **reports/**: Analytics and reporting pages
- **settings/**: Configuration and profile pages

### `/contexts/`
React Context providers for global state:
- `SupabaseAuthContext.tsx` - Authentication state
- `AppContext.tsx` - Global application state
- `PatientContext.tsx` - Patient-specific state
- `ToastContext.tsx` - Notification system
- `SafeOfflineContext.tsx` - Offline capabilities

### `/services/`
Business logic and external integrations:
- `supabase/` - Database operations
- `ai/` - AI service integrations
- `whatsapp/` - WhatsApp API integration
- `analytics/` - Performance and usage tracking

### `/lib/`
Utilities and configurations:
- `utils.ts` - General utility functions
- `queryClient.ts` - React Query configuration
- `supabase.ts` - Supabase client setup
- `validations/` - Zod schemas for form validation

## File Naming Conventions

### Components
- **PascalCase** for component files: `PatientCard.tsx`
- **camelCase** for utility files: `formatDate.ts`
- **kebab-case** for CSS files: `patient-card.css`

### Pages
- **PascalCase** with descriptive names: `PatientListPage.tsx`
- Route-based naming: `DashboardPage.tsx`, `LoginPage.tsx`

### Types
- **PascalCase** for interfaces: `Patient`, `Appointment`
- **UPPER_CASE** for enums: `USER_ROLE`, `APPOINTMENT_STATUS`

## Import Path Aliases

Configured in `tsconfig.json` and `vite.config.ts`:

```typescript
"@/*": ["./*"]                    // Root level imports
"@/components/*": ["./components/*"]
"@/pages/*": ["./pages/*"]
"@/services/*": ["./services/*"]
"@/hooks/*": ["./hooks/*"]
"@/contexts/*": ["./contexts/*"]
"@/types/*": ["./types/*"]
"@/lib/*": ["./lib/*"]
```

## Component Organization Patterns

### Compound Components
For complex UI components with multiple related parts:
```
components/
  PatientCard/
    ├── index.ts          # Main export
    ├── PatientCard.tsx   # Main component
    ├── PatientHeader.tsx # Sub-component
    ├── PatientActions.tsx # Sub-component
    └── types.ts          # Component-specific types
```

### Feature-Based Pages
Pages organized by business domain:
```
pages/
  patients/
    ├── PatientListPage.tsx
    ├── PatientDetailPage.tsx
    ├── PatientFormPage.tsx
    └── components/        # Page-specific components
        ├── PatientFilters.tsx
        └── PatientStats.tsx
```

## Configuration Files

### Build & Development
- `vite.config.ts` - Vite configuration with performance optimizations
- `tsconfig.json` - TypeScript configuration with path mapping
- `tailwind.config.ts` - Tailwind CSS with custom design system
- `components.json` - shadcn/ui configuration

### Testing
- `playwright.config.ts` - E2E test configuration
- `vitest.config.ts` - Unit test configuration
- `tests/` - Test files organized by type (e2e, unit, integration)

### Database
- `supabase/` - Database migrations and configuration
- `database/` - Schema definitions and seed data

## Performance Considerations

### Code Splitting
- Pages are lazy-loaded using `React.lazy()`
- Heavy components split into separate chunks
- Manual chunk configuration in `vite.config.ts`

### Bundle Organization
- Vendor libraries grouped by functionality
- Feature-specific chunks for lazy loading
- Shared components optimized for reuse

### Asset Management
- Images optimized and served from `/public/`
- Icons from Lucide React (tree-shakeable)
- Fonts loaded via Google Fonts with preload hints