# Database Quick Reference Guide

**DuduFisio AI - Supabase Database**
**Last Updated:** 2025-01-14
**Version:** 1.0

---

## 📋 Table of Contents

1. [Quick Lookup Tables](#quick-lookup-tables)
2. [Common Functions](#common-functions)
3. [RLS Policy Patterns](#rls-policy-patterns)
4. [Security Checklist](#security-checklist)
5. [Common Queries](#common-queries)

---

## Quick Lookup Tables

### Authentication Functions (5)

| Function | Purpose | Usage |
|----------|---------|-------|
| `handle_new_user()` | Auto-create user profile on signup | Trigger on auth.users |
| `create_user_with_role()` | Create user with specific role | `SELECT create_user_with_role('email', 'password', 'role')` |
| `update_user_role()` | Change user role | `SELECT update_user_role(user_id, 'new_role')` |
| `get_user_role()` | Get current user's role | `SELECT get_user_role(user_id)` |
| `is_admin()` | Check if user is admin | `SELECT is_admin(user_id)` |

### Timestamp Functions (9)

| Function | Applied To | Purpose |
|----------|-----------|---------|
| `update_appointments_updated_at()` | appointments | Auto-update timestamp |
| `update_body_map_pain_regions_updated_at()` | body_map_pain_regions | Auto-update timestamp |
| `update_clinical_materials_updated_at()` | clinical_materials | Auto-update timestamp |
| `update_notifications_updated_at()` | notifications | Auto-update timestamp |
| `update_patients_updated_at()` | patients | Auto-update timestamp |
| `update_session_evolutions_updated_at()` | session_evolutions | Auto-update timestamp |
| `update_teleconsultas_updated_at()` | teleconsultas | Auto-update timestamp |
| `update_users_updated_at()` | users | Auto-update timestamp |
| `update_exercise_prescriptions_updated_at()` | exercise_prescriptions | Auto-update timestamp |

### Business Logic Functions (10)

| Function | Purpose | Quick Example |
|----------|---------|---------------|
| `create_payment()` | Create payment record | `SELECT create_payment(appt_id, patient_id, 150.00, 'completed', 'pix', '{}')` |
| `check_appointment_conflict()` | Validate appointment slot | `SELECT check_appointment_conflict(therapist_id, start_time, end_time, NULL)` |
| `cancel_appointment()` | Cancel with reason | `SELECT cancel_appointment(appt_id, 'Patient requested')` |
| `get_available_time_slots()` | Find free slots | `SELECT * FROM get_available_time_slots(therapist_id, '2025-01-15')` |
| `calculate_session_duration()` | Get session length | `SELECT calculate_session_duration(appt_id)` |
| `get_patient_statistics()` | Patient metrics | `SELECT * FROM get_patient_statistics(patient_id)` |
| `get_therapist_schedule()` | Daily schedule | `SELECT * FROM get_therapist_schedule(therapist_id, '2025-01-15')` |
| `update_appointment_status()` | Change status | `SELECT update_appointment_status(appt_id, 'completed')` |
| `get_next_appointment()` | Next scheduled | `SELECT * FROM get_next_appointment(patient_id)` |
| `get_average_ratings_by_period()` | Rating analytics | `SELECT * FROM get_average_ratings_by_period(patient_id, start_date, end_date)` |

### Notification Functions (8)

| Function | Purpose | Quick Example |
|----------|---------|---------------|
| `create_notification()` | Send notification | `SELECT create_notification(user_id, 'appointment', 'Title', 'Message', '{}', NULL, NULL)` |
| `mark_notification_read()` | Mark as read | `SELECT mark_notification_read(user_id, notif_id)` |
| `mark_all_notifications_read()` | Read all | `SELECT mark_all_notifications_read(user_id)` |
| `delete_notification()` | Remove notification | `SELECT delete_notification(user_id, notif_id)` |
| `get_unread_count()` | Count unread | `SELECT get_unread_count(user_id)` |
| `get_user_notifications()` | Fetch all | `SELECT * FROM get_user_notifications(user_id, 10, 0)` |
| `send_appointment_reminder()` | Auto reminder | Triggered automatically |
| `cleanup_old_notifications()` | Delete old | `SELECT cleanup_old_notifications(90)` |

---

## Common Functions

### 🔐 Check User Role

```sql
-- Check if current user is admin
SELECT is_admin(auth.uid());

-- Get current user's role
SELECT get_user_role(auth.uid());

-- Update user role (admin only)
SELECT update_user_role('user-uuid-here', 'therapist');
```

### 📅 Appointment Management

```sql
-- Check for scheduling conflicts
SELECT check_appointment_conflict(
  'therapist-uuid',
  '2025-01-15 10:00:00+00',
  '2025-01-15 11:00:00+00',
  NULL -- Or appointment_id if updating
);

-- Get available time slots
SELECT * FROM get_available_time_slots(
  'therapist-uuid',
  '2025-01-15'::DATE
);

-- Get therapist's daily schedule
SELECT * FROM get_therapist_schedule(
  'therapist-uuid',
  '2025-01-15'::DATE
);

-- Cancel appointment
SELECT cancel_appointment(
  'appointment-uuid',
  'Patient requested cancellation'
);
```

### 💰 Payment Processing

```sql
-- Create payment record
SELECT create_payment(
  'appointment-uuid',
  'patient-uuid',
  150.00,
  'completed',
  'credit_card',
  '{"transaction_id": "tx_123456"}'::jsonb
);

-- Get financial summary
SELECT * FROM get_financial_summary(
  '2025-01-01'::DATE,
  '2025-01-31'::DATE,
  NULL -- All therapists, or specific UUID
);
```

### 🔔 Notifications

```sql
-- Create notification
SELECT create_notification(
  'user-uuid',
  'appointment',
  'Appointment Reminder',
  'You have an appointment tomorrow at 10:00 AM',
  '{"appointment_id": "appt-uuid"}'::jsonb,
  '2025-01-14 18:00:00+00'::TIMESTAMPTZ, -- Schedule for later
  ARRAY['email', 'push'] -- Channels
);

-- Get unread count
SELECT get_unread_count('user-uuid');

-- Mark notification as read
SELECT mark_notification_read('user-uuid', 'notification-uuid');

-- Get user notifications (paginated)
SELECT * FROM get_user_notifications(
  'user-uuid',
  20, -- limit
  0   -- offset
);
```

### 📊 Analytics & Reports

```sql
-- Get patient statistics
SELECT * FROM get_patient_statistics('patient-uuid');

-- Get average ratings for period
SELECT * FROM get_average_ratings_by_period(
  'patient-uuid',
  '2025-01-01 00:00:00+00',
  '2025-01-31 23:59:59+00'
);

-- Calculate session duration
SELECT calculate_session_duration('appointment-uuid');
```

### 🏥 Clinical Materials

```sql
-- Search clinical materials
SELECT * FROM search_clinical_materials('exercise');

-- Get materials by category
SELECT * FROM get_materials_by_category('category-uuid');

-- Get material with category info
SELECT * FROM get_material_with_category('material-uuid');
```

### 💻 Teleconsultation

```sql
-- Create teleconsultation session
SELECT create_teleconsulta(
  'appointment-uuid',
  'patient-uuid',
  'therapist-uuid',
  '2025-01-15 10:00:00+00',
  '2025-01-15 11:00:00+00'
);

-- End teleconsultation
SELECT end_teleconsulta('teleconsulta-uuid');

-- Get active sessions
SELECT * FROM get_active_teleconsultas('user-uuid');
```

---

## RLS Policy Patterns

### Pattern 1: Role-Based Access

```sql
-- Read: All authenticated users
CREATE POLICY "name" ON table_name
  FOR SELECT TO authenticated
  USING (true);

-- Write: Only admins and therapists
CREATE POLICY "name" ON table_name
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role IN ('admin', 'therapist')
    )
  );
```

### Pattern 2: Owner-Based Access

```sql
-- Users can only see their own data
CREATE POLICY "name" ON table_name
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- Users can only update their own data
CREATE POLICY "name" ON table_name
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid());
```

### Pattern 3: Creator-Based Access

```sql
-- Can only modify what you created
CREATE POLICY "name" ON table_name
  FOR UPDATE TO authenticated
  USING (created_by = auth.uid());

CREATE POLICY "name" ON table_name
  FOR DELETE TO authenticated
  USING (created_by = auth.uid());
```

### Pattern 4: Relationship-Based Access

```sql
-- Patients see their own appointments
CREATE POLICY "name" ON appointments
  FOR SELECT TO authenticated
  USING (
    patient_id = auth.uid()
    OR therapist_id = auth.uid()
  );
```

### Pattern 5: Admin Override

```sql
-- Admins can see everything
CREATE POLICY "name" ON table_name
  FOR SELECT TO authenticated
  USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role = 'admin'
    )
  );
```

---

## Security Checklist

### ✅ Before Deploying New Tables

- [ ] Enable RLS: `ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;`
- [ ] Create SELECT policy for read access
- [ ] Create INSERT policy for write access
- [ ] Create UPDATE policy for modifications
- [ ] Create DELETE policy if needed
- [ ] Test policies with different user roles
- [ ] Verify no data leakage

### ✅ Before Deploying New Functions

- [ ] Add `SET search_path = public` to function definition
- [ ] Use `SECURITY DEFINER` only if absolutely necessary
- [ ] Document why `SECURITY DEFINER` is needed (if used)
- [ ] Validate all input parameters
- [ ] Use prepared statements for dynamic SQL
- [ ] Test function with different user roles
- [ ] Add error handling with `EXCEPTION` blocks

### ✅ Before Deploying Migrations

- [ ] Test migration on local/dev environment
- [ ] Check for column name mismatches
- [ ] Verify UUID vs TEXT type consistency
- [ ] Add `IF NOT EXISTS` for idempotency
- [ ] Add `DROP IF EXISTS` before recreating
- [ ] Document breaking changes
- [ ] Create rollback migration if needed

### ✅ Regular Security Audits

```sql
-- Check tables without RLS enabled
SELECT schemaname, tablename
FROM pg_tables
WHERE schemaname = 'public'
AND tablename NOT IN (
  SELECT tablename FROM pg_policies
)
AND rowsecurity = false;

-- Check functions without search_path
SELECT n.nspname, p.proname
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
AND NOT EXISTS (
  SELECT 1 FROM pg_proc p2
  WHERE p2.oid = p.oid
  AND p2.proconfig::text LIKE '%search_path%'
);
```

---

## Common Queries

### User Management

```sql
-- Get all therapists
SELECT * FROM users WHERE role = 'therapist' AND deleted_at IS NULL;

-- Get all active patients
SELECT * FROM users WHERE role = 'patient' AND deleted_at IS NULL;

-- Get user with appointments count
SELECT u.*, COUNT(a.id) as appointment_count
FROM users u
LEFT JOIN appointments a ON a.patient_id = u.id
WHERE u.role = 'patient'
GROUP BY u.id;
```

### Appointment Queries

```sql
-- Today's appointments for therapist
SELECT * FROM appointments
WHERE therapist_id = 'therapist-uuid'
AND DATE(start_time) = CURRENT_DATE
AND status != 'cancelled'
ORDER BY start_time;

-- Upcoming appointments for patient
SELECT * FROM appointments
WHERE patient_id = 'patient-uuid'
AND start_time > NOW()
AND status IN ('scheduled', 'confirmed')
ORDER BY start_time
LIMIT 10;

-- Appointments requiring confirmation
SELECT * FROM appointments
WHERE status = 'scheduled'
AND start_time > NOW()
AND start_time < NOW() + INTERVAL '48 hours'
ORDER BY start_time;
```

### Financial Queries

```sql
-- Monthly revenue by therapist
SELECT
  t.full_name,
  DATE_TRUNC('month', p.created_at) as month,
  SUM(p.amount) as total_revenue,
  COUNT(p.id) as payment_count
FROM payments p
JOIN users t ON p.therapist_id = t.id
WHERE p.status = 'completed'
GROUP BY t.id, t.full_name, DATE_TRUNC('month', p.created_at)
ORDER BY month DESC, total_revenue DESC;

-- Pending payments
SELECT
  p.*,
  u.full_name as patient_name,
  a.start_time as appointment_date
FROM payments p
JOIN users u ON p.patient_id = u.id
JOIN appointments a ON p.appointment_id = a.id
WHERE p.status = 'pending'
ORDER BY a.start_time DESC;
```

### Notification Queries

```sql
-- Unread notifications by user
SELECT * FROM notifications
WHERE user_id = 'user-uuid'
AND read = false
ORDER BY created_at DESC;

-- Scheduled notifications (not yet sent)
SELECT * FROM notifications
WHERE scheduled_for > NOW()
AND read = false
ORDER BY scheduled_for;

-- Notification statistics
SELECT
  type,
  COUNT(*) as total,
  SUM(CASE WHEN read THEN 1 ELSE 0 END) as read_count,
  SUM(CASE WHEN read THEN 0 ELSE 1 END) as unread_count
FROM notifications
WHERE user_id = 'user-uuid'
GROUP BY type;
```

### Clinical Material Queries

```sql
-- Popular clinical materials
SELECT
  cm.*,
  COUNT(DISTINCT ep.id) as prescription_count
FROM clinical_materials cm
LEFT JOIN exercise_prescriptions ep ON ep.material_id = cm.id
WHERE cm.deleted_at IS NULL
GROUP BY cm.id
ORDER BY prescription_count DESC
LIMIT 10;

-- Materials by category with counts
SELECT
  cat.name as category,
  COUNT(cm.id) as material_count
FROM clinical_material_categories cat
LEFT JOIN clinical_materials cm ON cm.category_id = cat.id
WHERE cat.deleted_at IS NULL
GROUP BY cat.id, cat.name
ORDER BY material_count DESC;
```

### Session Evolution Queries

```sql
-- Recent session evolutions with ratings
SELECT
  se.*,
  p.full_name as patient_name,
  t.full_name as therapist_name
FROM session_evolutions se
JOIN users p ON se.patient_id = p.id
JOIN users t ON se.therapist_id = t.id
WHERE se.patient_rating IS NOT NULL
OR se.professional_rating IS NOT NULL
ORDER BY se.session_date DESC
LIMIT 20;

-- Average ratings per therapist
SELECT
  t.full_name,
  ROUND(AVG(se.professional_rating)::NUMERIC, 2) as avg_rating,
  COUNT(se.id) as session_count
FROM session_evolutions se
JOIN users t ON se.therapist_id = t.id
WHERE se.professional_rating IS NOT NULL
GROUP BY t.id, t.full_name
HAVING COUNT(se.id) >= 5
ORDER BY avg_rating DESC;
```

---

## Quick Tips

### 🚀 Performance

1. **Always use indexes** on foreign keys and frequently queried columns
2. **Limit result sets** with appropriate WHERE clauses and LIMIT
3. **Use views** for complex repeated queries (e.g., `v_active_prescriptions`)
4. **Batch operations** when possible instead of multiple single inserts

### 🔒 Security

1. **Never disable RLS** unless absolutely necessary and well-documented
2. **Always validate input** in functions before using in queries
3. **Use `auth.uid()`** for current user identification in policies
4. **Avoid `SECURITY DEFINER`** unless specifically needed for bypass
5. **Set `search_path = public`** on all functions

### 📝 Best Practices

1. **Soft delete** with `deleted_at` timestamp instead of hard deletes
2. **Use triggers** for automatic timestamp updates
3. **Add constraints** to ensure data integrity (NOT NULL, CHECK, etc.)
4. **Document functions** with SQL comments
5. **Version migrations** with timestamps in filename

### 🧪 Testing

```sql
-- Test as different user (in SQL editor)
SET request.jwt.claims.sub = 'user-uuid-here';

-- Reset to your user
RESET request.jwt.claims.sub;

-- Test RLS policy
EXPLAIN (ANALYZE, BUFFERS)
SELECT * FROM table_name WHERE condition;
```

---

## Emergency Commands

### Disable RLS (Emergency Only)

```sql
-- ⚠️ USE WITH EXTREME CAUTION
ALTER TABLE table_name DISABLE ROW LEVEL SECURITY;
-- Remember to re-enable after fixing
ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;
```

### Drop All Policies on Table

```sql
-- Remove all policies
DO $$
DECLARE
  pol RECORD;
BEGIN
  FOR pol IN
    SELECT policyname
    FROM pg_policies
    WHERE tablename = 'table_name'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON table_name', pol.policyname);
  END LOOP;
END $$;
```

### Reset Function search_path

```sql
-- If function needs search_path reset
ALTER FUNCTION function_name(params) RESET search_path;
-- Then re-add correct one
ALTER FUNCTION function_name(params) SET search_path = public;
```

---

## Reference Links

- **Full Documentation:** [DATABASE_FUNCTIONS.md](./DATABASE_FUNCTIONS.md)
- **Security Guide:** [DATABASE_SECURITY.md](./DATABASE_SECURITY.md)
- **Improvements Report:** [DATABASE_IMPROVEMENTS_REPORT.md](./DATABASE_IMPROVEMENTS_REPORT.md)
- **Supabase Docs:** https://supabase.com/docs
- **PostgreSQL RLS:** https://www.postgresql.org/docs/current/ddl-rowsecurity.html

---

**Last Updated:** 2025-01-14
**Maintained by:** Database Security Team
**Status:** ✅ All security issues resolved
