
# Implementation Plan: Comprehensive FisioFlow System

**Branch**: `001-documenta-o-completa` | **Date**: 2025-01-19 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/001-documenta-o-completa/spec.md`

## Execution Flow (/plan command scope)
```
1. Load feature spec from Input path
   → If not found: ERROR "No feature spec at {path}"
2. Fill Technical Context (scan for NEEDS CLARIFICATION)
   → Detect Project Type from context (web=frontend+backend, mobile=app+api)
   → Set Structure Decision based on project type
3. Fill the Constitution Check section based on the content of the constitution document.
4. Evaluate Constitution Check section below
   → If violations exist: Document in Complexity Tracking
   → If no justification possible: ERROR "Simplify approach first"
   → Update Progress Tracking: Initial Constitution Check
5. Execute Phase 0 → research.md
   → If NEEDS CLARIFICATION remain: ERROR "Resolve unknowns"
6. Execute Phase 1 → contracts, data-model.md, quickstart.md, agent-specific template file (e.g., `CLAUDE.md` for Claude Code, `.github/copilot-instructions.md` for GitHub Copilot, `GEMINI.md` for Gemini CLI, `QWEN.md` for Qwen Code or `AGENTS.md` for opencode).
7. Re-evaluate Constitution Check section
   → If new violations: Refactor design, return to Phase 1
   → Update Progress Tracking: Post-Design Constitution Check
8. Plan Phase 2 → Describe task generation approach (DO NOT create tasks.md)
9. STOP - Ready for /tasks command
```

**IMPORTANT**: The /plan command STOPS at step 7. Phases 2-4 are executed by other commands:
- Phase 2: /tasks command creates tasks.md
- Phase 3-4: Implementation execution (manual or via tools)

## Summary
Comprehensive physiotherapy clinic management system for FisioFlow clinic (744 patients, 669 monthly appointments) requiring patient management, interactive body mapping, appointment scheduling, exercise library with prescription capabilities, reporting/analytics dashboard, and financial management. System must support role-based access (Admin, Fisioterapeuta, Estagiário, Paciente), ensure LGPD compliance, maintain performance standards (<2s load, <1MB bundles), and provide responsive PWA experience.

## Technical Context
**Language/Version**: TypeScript 5.5+ with React 19, strict type checking enabled
**Primary Dependencies**: React Router DOM, React Hook Form, Zod validation, Supabase Auth, @google/genai, TailwindCSS, shadcn/ui, Framer Motion, Recharts, Lucide React
**Storage**: Supabase (PostgreSQL with RLS policies), file storage for images/videos
**Testing**: Jest for unit tests, React Testing Library, Playwright for E2E testing
**Target Platform**: Web application (mobile-first responsive), PWA capabilities
**Project Type**: Web application (single React SPA with Supabase backend)
**Performance Goals**: <2s page load (3G), <500ms API responses, 60fps animations, <1MB bundle chunks
**Constraints**: LGPD compliance, healthcare data privacy, <100MB memory usage, offline-capable PWA
**Scale/Scope**: 744+ patients, 669+ appointments/month, 4 user roles, 6 core modules, 33 functional requirements

## Constitution Check
*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Type Safety**: All new code uses TypeScript with strict typing, no `any` types
**TDD Compliance**: Tests written and failing before implementation begins
**UX Consistency**: UI follows established patterns, includes proper feedback states
**Performance Impact**: Changes maintain <2s load times, <1MB bundle chunks
**Code Quality**: Business logic in services, proper error handling, clean architecture
**Healthcare Compliance**: Patient data handling meets privacy standards

## Project Structure

### Documentation (this feature)
```
specs/[###-feature]/
├── plan.md              # This file (/plan command output)
├── research.md          # Phase 0 output (/plan command)
├── data-model.md        # Phase 1 output (/plan command)
├── quickstart.md        # Phase 1 output (/plan command)
├── contracts/           # Phase 1 output (/plan command)
└── tasks.md             # Phase 2 output (/tasks command - NOT created by /plan)
```

### Source Code (repository root)
```
# Option 1: Single project (DEFAULT)
src/
├── models/
├── services/
├── cli/
└── lib/

tests/
├── contract/
├── integration/
└── unit/

# Option 2: Web application (when "frontend" + "backend" detected)
backend/
├── src/
│   ├── models/
│   ├── services/
│   └── api/
└── tests/

frontend/
├── src/
│   ├── components/
│   ├── pages/
│   └── services/
└── tests/

# Option 3: Mobile + API (when "iOS/Android" detected)
api/
└── [same as backend above]

ios/ or android/
└── [platform-specific structure]
```

**Structure Decision**: Web application structure - using React SPA architecture with existing project structure (pages/, components/, services/, hooks/, contexts/)

## Phase 0: Outline & Research
1. **Extract unknowns from Technical Context** above:
   - For each NEEDS CLARIFICATION → research task
   - For each dependency → best practices task
   - For each integration → patterns task

2. **Generate and dispatch research agents**:
   ```
   For each unknown in Technical Context:
     Task: "Research {unknown} for {feature context}"
   For each technology choice:
     Task: "Find best practices for {tech} in {domain}"
   ```

3. **Consolidate findings** in `research.md` using format:
   - Decision: [what was chosen]
   - Rationale: [why chosen]
   - Alternatives considered: [what else evaluated]

**Output**: research.md with all NEEDS CLARIFICATION resolved

## Phase 1: Design & Contracts
*Prerequisites: research.md complete*

1. **Extract entities from feature spec** → `data-model.md`:
   - Entity name, fields, relationships
   - Validation rules from requirements
   - State transitions if applicable

2. **Generate API contracts** from functional requirements:
   - For each user action → endpoint
   - Use standard REST/GraphQL patterns
   - Output OpenAPI/GraphQL schema to `/contracts/`

3. **Generate contract tests** from contracts:
   - One test file per endpoint
   - Assert request/response schemas
   - Tests must fail (no implementation yet)

4. **Extract test scenarios** from user stories:
   - Each story → integration test scenario
   - Quickstart test = story validation steps

5. **Update agent file incrementally** (O(1) operation):
   - Run `.specify/scripts/bash/update-agent-context.sh claude` for your AI assistant
   - If exists: Add only NEW tech from current plan
   - Preserve manual additions between markers
   - Update recent changes (keep last 3)
   - Keep under 150 lines for token efficiency
   - Output to repository root

**Output**: data-model.md, /contracts/*, failing tests, quickstart.md, agent-specific file

## Phase 2: Task Planning Approach
*This section describes what the /tasks command will do - DO NOT execute during /plan*

**Task Generation Strategy**:
- Load `.specify/templates/tasks-template.md` as base
- Generate tasks from Phase 1 design docs (contracts, data model, quickstart)
- API contracts → contract test tasks [P] (patients, appointments, body-map)
- Data entities → TypeScript model creation [P] (8 core entities)
- User journeys → integration test scenarios (admin, therapist, patient flows)
- UI components → component implementation (body map, calendar, exercise library)
- Service layer → business logic implementation (authentication, data access)

**Ordering Strategy**:
- **Setup Phase**: Project structure, dependencies, environment configuration
- **TDD Phase**: Contract tests, model validation, integration tests (MUST FAIL first)
- **Data Layer**: TypeScript interfaces, Supabase schemas, RLS policies
- **Service Layer**: Authentication, data services, business logic
- **UI Components**: Core components, pages, responsive layouts
- **Integration**: Real-time features, file uploads, PDF generation
- **Performance**: Bundle optimization, lazy loading, PWA features
- Mark [P] for parallel execution (different files/independent modules)

**Task Categories by Module**:
1. **Authentication & Authorization** (4-5 tasks)
2. **Patient Management** (6-8 tasks)
3. **Appointment Scheduling** (7-9 tasks)
4. **Interactive Body Mapping** (5-7 tasks)
5. **Exercise Library & Prescription** (8-10 tasks)
6. **Reporting & Analytics** (6-8 tasks)
7. **Financial Management** (4-6 tasks)
8. **Performance & Deployment** (4-5 tasks)

**Estimated Output**: 45-55 numbered, ordered tasks in tasks.md
- Setup: T001-T005
- Tests: T006-T020 (contract/integration tests)
- Models: T021-T030 (TypeScript interfaces)
- Services: T031-T040 (business logic)
- Components: T041-T055 (UI implementation)

**Parallelization Strategy**:
- Independent API contracts can be tested simultaneously [P]
- Different page components can be built in parallel [P]
- Service functions for different modules can be developed concurrently [P]
- UI components within same module must be sequential (dependencies)

**IMPORTANT**: This phase is executed by the /tasks command, NOT by /plan

## Phase 3+: Future Implementation
*These phases are beyond the scope of the /plan command*

**Phase 3**: Task execution (/tasks command creates tasks.md)  
**Phase 4**: Implementation (execute tasks.md following constitutional principles)  
**Phase 5**: Validation (run tests, execute quickstart.md, performance validation)

## Complexity Tracking
*Fill ONLY if Constitution Check has violations that must be justified*

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |


## Progress Tracking
*This checklist is updated during execution flow*

**Phase Status**:
- [x] Phase 0: Research complete (/plan command)
- [x] Phase 1: Design complete (/plan command)
- [x] Phase 2: Task planning complete (/plan command - describe approach only)
- [ ] Phase 3: Tasks generated (/tasks command)
- [ ] Phase 4: Implementation complete
- [ ] Phase 5: Validation passed

**Gate Status**:
- [x] Initial Constitution Check: PASS
- [x] Post-Design Constitution Check: PASS
- [x] All NEEDS CLARIFICATION resolved
- [x] Complexity deviations documented (none required)

---
*Based on Constitution v1.0.0 - See `.specify/memory/constitution.md`*
