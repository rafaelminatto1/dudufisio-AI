# Tasks: Comprehensive FisioFlow System

**Input**: Design documents from `/specs/001-documenta-o-completa/`
**Prerequisites**: plan.md ✓, research.md ✓, data-model.md ✓, contracts/ ✓

## Execution Flow (main)
```
1. Load plan.md from feature directory
   → ✅ Found: React 19 + TypeScript SPA with Supabase backend
   → ✅ Extract: TailwindCSS, shadcn/ui, React Router, Zod, React Hook Form
2. Load optional design documents:
   → ✅ data-model.md: 8 core entities extracted
   → ✅ contracts/: 3 API contracts found (patients, appointments, body-map)
   → ✅ research.md: Technical decisions and architecture patterns
3. Generate tasks by category:
   → Setup: TypeScript config, Supabase setup, dependencies
   → Tests: Contract tests, integration tests (TDD)
   → Core: TypeScript interfaces, service functions, React components
   → Integration: Authentication, RLS policies, real-time features
   → Polish: Performance optimization, PWA setup, deployment
4. Apply task rules:
   → Independent API tests marked [P]
   → Different component files marked [P]
   → Tests before implementation (TDD enforced)
5. Number tasks sequentially (T001-T055)
6. Generate dependency graph and parallel execution examples
7. Validate completeness: All contracts tested ✓, All entities modeled ✓
8. Return: SUCCESS - 55 tasks ready for execution
```

## Format: `[ID] [P?] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- All file paths are absolute from repository root

## Path Conventions
- **React SPA structure**: `pages/`, `components/`, `services/`, `hooks/`, `contexts/`
- **Tests**: `tests/contract/`, `tests/integration/`, `tests/unit/`
- **Database**: Supabase migrations and RLS policies

## Phase 3.1: Setup & Configuration
- [x] T001 Configure TypeScript with strict mode in `tsconfig.json` and update existing config for healthcare compliance
- [x] T002 [P] Install and configure new dependencies: Zod validation, React Hook Form, Framer Motion, Recharts
- [x] T003 [P] Setup Supabase environment variables in `.env.local` and create environment template
- [x] T004 [P] Configure Vite for PWA capabilities with service worker and offline support
- [x] T005 [P] Setup ESLint rules for healthcare data privacy and TypeScript strict mode

## Phase 3.2: Tests First (TDD) ⚠️ MUST COMPLETE BEFORE 3.3
**CRITICAL: These tests MUST be written and MUST FAIL before ANY implementation**

### Contract Tests [P] - Can run in parallel
- [x] T006 [P] Contract test for POST /api/patients in `tests/contract/test_patients_post.test.ts`
- [ ] T007 [P] Contract test for GET /api/patients with search in `tests/contract/test_patients_get.test.ts`
- [ ] T008 [P] Contract test for PUT /api/patients/{id} in `tests/contract/test_patients_update.test.ts`
- [x] T009 [P] Contract test for POST /api/appointments in `tests/contract/test_appointments_post.test.ts`
- [ ] T010 [P] Contract test for GET /api/appointments with filters in `tests/contract/test_appointments_get.test.ts`
- [ ] T011 [P] Contract test for POST /api/appointments/conflicts in `tests/contract/test_appointments_conflicts.test.ts`
- [x] T012 [P] Contract test for POST /api/patients/{id}/pain-points in `tests/contract/test_body_map_post.test.ts`
- [ ] T013 [P] Contract test for GET /api/patients/{id}/pain-points in `tests/contract/test_body_map_get.test.ts`

### Integration Tests [P] - Can run in parallel
- [x] T014 [P] Integration test for admin user journey in `tests/integration/test_admin_workflow.test.ts`
- [ ] T015 [P] Integration test for physiotherapist workflow in `tests/integration/test_therapist_workflow.test.ts`
- [ ] T016 [P] Integration test for patient portal access in `tests/integration/test_patient_portal.test.ts`
- [ ] T017 [P] Integration test for appointment scheduling conflicts in `tests/integration/test_scheduling_conflicts.test.ts`
- [ ] T018 [P] Integration test for body map pain point tracking in `tests/integration/test_body_map_flow.test.ts`

## Phase 3.3: Data Layer & TypeScript Interfaces
**ONLY after tests are failing**

### Core TypeScript Interfaces [P]
- [x] T019 [P] Create User interface and types in `types/user.ts`
- [x] T020 [P] Create Patient interface and validation schemas in `types/patient.ts`
- [x] T021 [P] Create Appointment interface and enums in `types/appointment.ts`
- [ ] T022 [P] Create Session interface in `types/session.ts`
- [x] T023 [P] Create PainPoint interface and body region types in `types/pain-point.ts`
- [ ] T024 [P] Create Exercise interfaces and category enums in `types/exercise.ts`
- [ ] T025 [P] Create FinancialTransaction interface in `types/financial.ts`
- [x] T026 [P] Create API response types and error interfaces in `types/api.ts`

### Database Schema & RLS
- [ ] T027 Create Supabase database tables in `database/migrations/001_create_tables.sql`
- [ ] T028 Create Row Level Security policies in `database/migrations/002_create_rls_policies.sql`
- [ ] T029 Create database indexes for performance in `database/migrations/003_create_indexes.sql`
- [ ] T030 Create seed data for development in `database/seeds/development_data.sql`

## Phase 3.4: Service Layer & Business Logic

### Authentication & Authorization
- [ ] T031 Create Supabase auth service in `services/auth.ts` with role-based access control
- [ ] T032 Create auth context and hooks in `contexts/AuthContext.tsx` and `hooks/useAuth.ts`
- [ ] T033 Create route protection middleware in `components/ProtectedRoute.tsx`

### Core Services [P] - Independent service modules
- [ ] T034 [P] Create patient service functions in `services/patientService.ts`
- [ ] T035 [P] Create appointment service functions in `services/appointmentService.ts`
- [ ] T036 [P] Create body map service functions in `services/bodyMapService.ts`
- [ ] T037 [P] Create exercise service functions in `services/exerciseService.ts`
- [ ] T038 [P] Create session service functions in `services/sessionService.ts`
- [ ] T039 [P] Create financial service functions in `services/financialService.ts`

## Phase 3.5: UI Components & Pages

### Core UI Components [P] - Independent components
- [ ] T040 [P] Create PatientForm component with Zod validation in `components/patients/PatientForm.tsx`
- [ ] T041 [P] Create PatientList with search and filters in `components/patients/PatientList.tsx`
- [ ] T042 [P] Create AppointmentCalendar with drag-drop in `components/appointments/AppointmentCalendar.tsx`
- [ ] T043 [P] Create AppointmentForm with conflict checking in `components/appointments/AppointmentForm.tsx`
- [ ] T044 [P] Create BodyMapSVG interactive component in `components/body-map/BodyMapSVG.tsx`
- [ ] T045 [P] Create PainPointModal for adding pain points in `components/body-map/PainPointModal.tsx`

### Page Components
- [ ] T046 Create PatientListPage in `pages/PatientListPage.tsx`
- [ ] T047 Create PatientDetailPage in `pages/PatientDetailPage.tsx`
- [ ] T048 Create AgendaPage with calendar views in `pages/AgendaPage.tsx`
- [ ] T049 Create DashboardPage with role-based content in `pages/DashboardPage.tsx`
- [ ] T050 Create ExerciseLibraryPage in `pages/ExerciseLibraryPage.tsx`

## Phase 3.6: Integration & Advanced Features
- [ ] T051 Implement real-time appointment updates with Supabase subscriptions
- [ ] T052 Create PDF generation for patient reports using html2pdf.js
- [ ] T053 Implement file upload for patient photos and exercise videos
- [ ] T054 Create LGPD compliance features (data export, deletion) in `services/lgpdService.ts`

## Phase 3.7: Performance & PWA
- [ ] T055 [P] Implement lazy loading for all page components and optimize bundle sizes

## Dependencies
```
Setup (T001-T005) → All other phases
Tests (T006-T018) → Implementation (T019+)
TypeScript Interfaces (T019-T026) → Services (T034-T039)
Database (T027-T030) → Services (T034-T039)
Auth (T031-T033) → All protected features
Services (T034-T039) → UI Components (T040-T050)
Core Components (T040-T045) → Pages (T046-T050)
Basic Features → Integration (T051-T054)
All Implementation → Performance (T055)
```

## Parallel Execution Examples

### Phase 3.2 - Contract Tests (Run simultaneously)
```bash
# Launch all contract tests together:
Task: "Contract test POST /api/patients in tests/contract/test_patients_post.test.ts"
Task: "Contract test GET /api/patients with search in tests/contract/test_patients_get.test.ts"
Task: "Contract test POST /api/appointments in tests/contract/test_appointments_post.test.ts"
Task: "Contract test POST /api/patients/{id}/pain-points in tests/contract/test_body_map_post.test.ts"
```

### Phase 3.3 - TypeScript Interfaces (Run simultaneously)
```bash
# Launch interface creation in parallel:
Task: "Create User interface and types in types/user.ts"
Task: "Create Patient interface and validation schemas in types/patient.ts"
Task: "Create Appointment interface and enums in types/appointment.ts"
Task: "Create PainPoint interface and body region types in types/pain-point.ts"
```

### Phase 3.4 - Service Layer (Run simultaneously)
```bash
# Launch service modules in parallel:
Task: "Create patient service functions in services/patientService.ts"
Task: "Create appointment service functions in services/appointmentService.ts"
Task: "Create body map service functions in services/bodyMapService.ts"
Task: "Create exercise service functions in services/exerciseService.ts"
```

### Phase 3.5 - UI Components (Run simultaneously)
```bash
# Launch independent components in parallel:
Task: "Create PatientForm component with Zod validation in components/patients/PatientForm.tsx"
Task: "Create AppointmentCalendar with drag-drop in components/appointments/AppointmentCalendar.tsx"
Task: "Create BodyMapSVG interactive component in components/body-map/BodyMapSVG.tsx"
```

## Task Validation Checklist
**GATE: Verified before task execution**

- [x] All 3 API contracts have corresponding contract tests (T006-T013)
- [x] All 8 entities have TypeScript interface tasks (T019-T026)
- [x] All contract tests come before implementation (T006-T018 → T019+)
- [x] Parallel tasks are truly independent (different files/modules)
- [x] Each task specifies exact file path for implementation
- [x] No task modifies same file as another [P] task
- [x] TDD enforced: Tests fail first, then implementation makes them pass

## Notes
- [P] tasks = different files, no dependencies between them
- Verify all tests fail before implementing corresponding features
- Commit after completing each phase
- Focus on constitutional compliance: Type safety, TDD, performance, healthcare privacy
- PWA offline functionality for critical appointment and patient data operations