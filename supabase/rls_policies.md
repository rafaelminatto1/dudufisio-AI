# Supabase Row Level Security (RLS) Policies

This document outlines the recommended Row Level Security (RLS) policies for the tables in this project. These policies are critical for ensuring data privacy and security. They should be applied in the Supabase dashboard.

## Helper Functions

It's recommended to create helper functions in SQL to simplify policy definitions, especially for checking user roles.

```sql
-- Helper function to check if a user is an administrator
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1
        FROM public.profiles
        WHERE public.profiles.user_id = user_id AND public.profiles.role = 'Administrador'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to check if a user is a physiotherapist
CREATE OR REPLACE FUNCTION public.is_fisioterapeuta(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1
        FROM public.profiles
        WHERE public.profiles.user_id = user_id AND public.profiles.role = 'Fisioterapeuta'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## `profiles` Table

- **Enable RLS:** `ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;`

### Policies:

1.  **Allow authenticated users to read their own profile:**
    ```sql
    CREATE POLICY "Allow authenticated users to read their own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = user_id);
    ```

2.  **Allow users to update their own profile:**
    ```sql
    CREATE POLICY "Allow users to update their own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = user_id);
    ```

3.  **Allow admins to manage all profiles:**
    ```sql
    CREATE POLICY "Allow admins to manage all profiles"
    ON public.profiles FOR ALL
    USING (public.is_admin(auth.uid()));
    ```

---

## `waitlist` Table

- **Enable RLS:** `ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;`

### Policies:

1.  **Allow admins and physiotherapists to manage the waitlist:**
    ```sql
    CREATE POLICY "Allow admins and physios to manage waitlist"
    ON public.waitlist FOR ALL
    USING (public.is_admin(auth.uid()) OR public.is_fisioterapeuta(auth.uid()));
    ```

---

## `audit_logs` Table

- **Enable RLS:** `ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;`

### Policies:

1.  **Allow admins to read all audit logs:**
    ```sql
    CREATE POLICY "Allow admins to read all audit logs"
    ON public.audit_logs FOR SELECT
    USING (public.is_admin(auth.uid()));
    ```

---

## `patients` Table (Example)

- **Enable RLS:** `ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;`

### Policies:

1.  **Allow admins and physiotherapists to manage patients:**
    ```sql
    CREATE POLICY "Allow admins and physios to manage patients"
    ON public.patients FOR ALL
    USING (public.is_admin(auth.uid()) OR public.is_fisioterapeuta(auth.uid()));
    ```

2.  **Allow patients to see their own data:**
    ```sql
    -- This assumes a link between the auth.users and the patients table.
    -- If patients are also users, you might have a user_id column on the patients table.
    CREATE POLICY "Allow patients to see their own data"
    ON public.patients FOR SELECT
    USING (auth.uid() = user_id); -- Assuming 'user_id' column exists
    ```
