# Quickstart Guide: FisioFlow System

## Development Environment Setup

### Prerequisites
```bash
# Required tools
node --version  # v18+ required
npm --version   # v9+ required
git --version   # v2.25+ required
```

### Initial Setup
```bash
# Clone and install dependencies
git clone <repository-url>
cd fisioflow-app
npm install

# Environment configuration
cp .env.example .env.local
# Configure Supabase keys in .env.local:
# VITE_SUPABASE_URL=your_supabase_url
# VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
# GEMINI_API_KEY=your_gemini_api_key
```

### Database Setup
```sql
-- Run in Supabase SQL Editor
-- 1. Create tables (from data-model.md)
-- 2. Enable Row Level Security
-- 3. Create RLS policies
-- 4. Insert seed data
```

### Development Server
```bash
npm run dev
# Server starts at http://localhost:5173
```

## User Journey Validation

### 1. Admin User Journey
**Goal**: Complete clinic management setup and oversight

**Steps**:
1. **Login as Admin**
   - Navigate to `/login`
   - Enter admin credentials
   - Verify redirect to admin dashboard (`/dashboard/admin`)

2. **Add New Physiotherapist**
   - Click "Usuários" → "Adicionar Fisioterapeuta"
   - Fill required fields: email, role
   - Verify user creation and role assignment

3. **View Clinic Analytics**
   - Access executive dashboard
   - Verify metrics display: active patients, daily appointments, revenue
   - Check charts load correctly (patient growth, revenue trends)

4. **Manage System Settings**
   - Configure appointment types and durations
   - Set clinic operating hours
   - Verify settings persist across sessions

**Success Criteria**:
- ✅ Admin can access all system areas
- ✅ User management functions work correctly
- ✅ Analytics dashboard loads within 2 seconds
- ✅ All metrics display accurate test data

### 2. Physiotherapist User Journey
**Goal**: Complete patient care workflow from appointment to exercise prescription

**Steps**:
1. **Login as Physiotherapist**
   - Navigate to `/login`
   - Enter therapist credentials
   - Verify redirect to therapist dashboard (`/dashboard/fisioterapeuta`)

2. **Schedule New Appointment**
   - Navigate to agenda (`/appointments`)
   - Click time slot for new appointment
   - Select patient, set appointment type (avaliação)
   - Verify no scheduling conflicts
   - Confirm appointment creation

3. **Conduct Patient Session**
   - Open today's appointments
   - Click on patient appointment
   - Record session notes:
     - Procedures performed
     - Pain levels (before: 8, after: 4)
     - Progress observations
     - Next session notes
   - Mark appointment as "completed"

4. **Use Interactive Body Map**
   - Access patient record
   - Open body map module
   - Click on patient's problem area (e.g., lower back)
   - Set pain intensity: 7/10
   - Add description: "Sharp pain, radiates to left leg"
   - Save pain point
   - Verify visual representation updates

5. **Prescribe Exercises**
   - Navigate to exercise library (`/exercises`)
   - Filter by category: "membros_inferiores"
   - Select 3 exercises for patient
   - Customize parameters:
     - Sets: 3, Repetitions: 15
     - Frequency: 3x/week for 4 weeks
   - Add specific notes
   - Send prescription to patient portal

6. **Generate Patient Report**
   - Access patient profile
   - Click "Gerar Relatório"
   - Select report type: "Evolução do Paciente"
   - Include: session notes, pain evolution, exercise compliance
   - Export as PDF
   - Verify professional formatting

**Success Criteria**:
- ✅ Appointment scheduling prevents conflicts
- ✅ Session notes save correctly and link to appointment
- ✅ Body map accurately records pain points with coordinates
- ✅ Exercise prescription creates patient-specific plan
- ✅ Reports generate within 3 seconds with correct data
- ✅ All interactions provide immediate visual feedback

### 3. Patient User Journey
**Goal**: Access prescribed exercises and track progress

**Steps**:
1. **Patient Portal Access**
   - Navigate to `/login`
   - Enter patient credentials (created by physiotherapist)
   - Verify redirect to patient dashboard (`/dashboard/paciente`)

2. **View Prescribed Exercises**
   - Access "Meus Exercícios" section
   - Verify current prescription displays
   - Play exercise demonstration videos
   - Check exercise parameters (sets, reps, frequency)

3. **Log Exercise Completion**
   - Select exercise from list
   - Mark as completed for today
   - Rate difficulty: 3/5
   - Report pain during exercise: 2/10
   - Add personal notes: "Easier than yesterday"
   - Submit exercise log

4. **Track Progress**
   - View exercise compliance chart
   - Check pain evolution graph
   - Review upcoming appointments
   - Access personal exercise history

5. **Update Personal Information**
   - Navigate to profile settings
   - Update contact information
   - Change emergency contact
   - Verify LGPD data portability option

**Success Criteria**:
- ✅ Patient can only access their own data
- ✅ Exercise videos load and play smoothly
- ✅ Progress tracking updates in real-time
- ✅ Data portability option functions correctly
- ✅ Mobile interface is fully functional

### 4. Integration Testing Scenarios

**Real-time Appointment Updates**:
1. Therapist A schedules appointment for 14:00
2. Therapist B attempts to book same slot
3. Verify conflict prevention
4. Verify real-time calendar updates across sessions

**LGPD Compliance Workflow**:
1. Patient requests data export
2. System generates complete data package
3. Patient initiates account deletion request
4. Verify cascading deletion of all related records
5. Confirm audit log maintained for legal compliance

**Performance Under Load**:
1. Simulate 50 concurrent users
2. Verify <2s page load times maintained
3. Check database connection pooling
4. Confirm no memory leaks in long sessions

## API Testing Checklist

### Patient Management API
```bash
# Test patient creation
curl -X POST /api/patients \
  -H "Content-Type: application/json" \
  -d '{"full_name":"João Silva","cpf":"12345678901","birth_date":"1985-05-15","phone":"+55 11 99999-9999"}'

# Expected: 201 Created with patient object
```

### Appointment Scheduling API
```bash
# Test appointment creation
curl -X POST /api/appointments \
  -H "Content-Type: application/json" \
  -d '{"patient_id":"uuid","therapist_id":"uuid","appointment_date":"2025-01-20","start_time":"14:00","appointment_type":"avaliacao"}'

# Expected: 201 Created or 409 Conflict
```

### Body Map API
```bash
# Test pain point creation
curl -X POST /api/patients/{patient_id}/pain-points \
  -H "Content-Type: application/json" \
  -d '{"body_region":"lower_back","body_side":"center","coordinates_x":0.5,"coordinates_y":0.6,"pain_intensity":7}'

# Expected: 201 Created with pain point object
```

## Performance Validation

### Lighthouse Audit Targets
```bash
npm run build
npm run preview
# Use Lighthouse CLI or Chrome DevTools
# Target scores:
# Performance: >90
# Accessibility: >90
# Best Practices: >90
# SEO: >85
```

### Bundle Size Analysis
```bash
npm run build
npm run analyze
# Verify route bundles <1MB each
# Check for code splitting effectiveness
```

### Mobile Performance Testing
```bash
# Use Chrome DevTools device simulation
# Test on various devices:
# - iPhone SE (375px width)
# - iPad (768px width)
# - Galaxy S20 (360px width)

# Verify:
# - Touch targets ≥44px
# - Text readable without zoom
# - Forms usable on mobile
# - Offline functionality
```

## Security Testing

### Authentication Flow
1. Attempt access to protected routes without login
2. Verify redirect to login page
3. Test role-based access restrictions
4. Confirm session timeout handling

### Data Privacy Testing
1. Verify patient data isolation between users
2. Test RLS policies prevent unauthorized access
3. Confirm sensitive data encryption
4. Validate LGPD compliance features

## Deployment Validation

### Vercel Deployment
```bash
# Production deployment
npm run build
vercel --prod

# Verify:
# - Environment variables configured
# - HTTPS certificate active
# - CDN distribution working
# - Database connection established
```

### Post-Deployment Health Checks
1. **Smoke Tests**:
   - Login functionality
   - Patient creation
   - Appointment scheduling
   - Exercise prescription

2. **Performance Monitoring**:
   - Page load times <2s
   - API response times <500ms
   - Error rate <0.1%

3. **Data Integrity**:
   - Database constraints enforced
   - Backup procedures active
   - Audit logs recording

## Success Metrics

### Technical KPIs
- Page load time: <2 seconds (target: 1.5s)
- Bundle size: <1MB per route (target: 800KB)
- API response time: <500ms (target: 300ms)
- Lighthouse score: >90 (target: 95)
- Test coverage: >80% (target: 90%)

### Business KPIs
- User registration: 744+ patients migrated
- Daily appointments: 23+ managed efficiently
- Exercise compliance: >80% patient engagement
- System uptime: >99.9%
- User satisfaction: >4.5/5

---

**Status**: Ready for implementation
**Estimated Development Time**: 12 weeks (6 phases × 2 weeks each)
**Next Steps**: Execute `/tasks` command to generate detailed implementation tasks