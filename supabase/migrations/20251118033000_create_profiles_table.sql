-- supabase/migrations/20251118033000_create_profiles_table.sql

CREATE TABLE public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    email VARCHAR(255) UNIQUE,
    role VARCHAR(50) NOT NULL CHECK (role IN ('Administrador', 'Fisioterapeuta', 'Paciente')),
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'archived')),
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update the updated_at timestamp
CREATE TRIGGER on_profiles_updated
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Secure the table with Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies will be defined in a separate documentation file (supabase/rls_policies.md)
-- Example policies:
-- CREATE POLICY "Allow authenticated users to read their own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
-- CREATE POLICY "Allow admins to manage all profiles" ON public.profiles FOR ALL USING (public.is_admin(auth.uid()));

COMMENT ON TABLE public.profiles IS 'Stores user profile information, extending the auth.users table.';
COMMENT ON COLUMN public.profiles.role IS 'Defines the user''s role within the system.';
COMMENT ON COLUMN public.profiles.status IS 'Represents the current status of the user''s profile.';
