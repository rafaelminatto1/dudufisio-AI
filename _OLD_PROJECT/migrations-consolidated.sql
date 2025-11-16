-- =====================================================
-- SCRIPT RÁPIDO PARA APLICAR MIGRATIONS ESSENCIAIS
-- Projeto: dudufisio-AI (urfxniitfbbvsaskicfo)
-- Dashboard: https://supabase.com/dashboard/project/urfxniitfbbvsaskicfo/editor
-- =====================================================

/*
🎯 GUIA RÁPIDO:

1. Abra o Supabase Dashboard (link acima)
2. Vá em SQL Editor
3. Execute PRIMEIRO este script abaixo
4. Depois execute os outros grupos conforme MIGRATIONS-EXECUTION-ORDER.md

Este script instala o ESSENCIAL para o app funcionar:
- Base tables (users, patients, appointments)
- RLS básico
- Estrutura mínima para CRM
*/

-- =====================================================
-- 🟩 ESSENCIAL - EXECUTE ESTE BLOCO PRIMEIRO
-- =====================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";

-- Create users table (basic structure)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role TEXT DEFAULT 'therapist',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create clinics table (multi-tenant)
CREATE TABLE IF NOT EXISTS clinics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create patients table
CREATE TABLE IF NOT EXISTS patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID REFERENCES clinics(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  created_by UUID REFERENCES users(id),
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  cpf TEXT,
  birth_date DATE,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create appointments table
CREATE TABLE IF NOT EXISTS appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID REFERENCES clinics(id) ON DELETE CASCADE,
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  therapist_id UUID REFERENCES users(id),
  scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
  duration_minutes INTEGER DEFAULT 60,
  status TEXT DEFAULT 'scheduled',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Estrutura mínima CRM para funcionalidade básica
CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID REFERENCES clinics(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  source TEXT DEFAULT 'whatsapp',
  status TEXT DEFAULT 'new',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinics ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies (temporárias, serão melhoradas depois)
CREATE POLICY "Users can view their own data" ON users
  FOR ALL USING (id = auth.uid());

CREATE POLICY "Allow all for now" ON clinics
  FOR ALL USING (true);

CREATE POLICY "Allow all for now" ON patients
  FOR ALL USING (true);

CREATE POLICY "Allow all for now" ON appointments
  FOR ALL USING (true);

CREATE POLICY "Allow all for now" ON leads
  FOR ALL USING (true);

-- Insert dados básicos para teste
INSERT INTO clinics (name, email, phone) VALUES 
  ('DuduFisio-AI Clinic', 'contato@dudufisio.com', '+5511999999999')
ON CONFLICT DO NOTHING;

-- =====================================================
-- ✅ ESSENCIAL COMPLETO
-- =====================================================

/*
🎉 PARABÉNS! 

Se executou sem erros, você tem o ESSENCIAL funcionando:
- ✅ 5 tabelas criadas (users, clinics, patients, appointments, leads)
- ✅ RLS habilitado
- ✅ Policies básicas
- ✅ Dados de teste inseridos

🎯 PRÓXIMOS PASSOS:

1. Testar se app em produção conecta (não deve dar mais erro de Supabase)
2. Se funcionou, continue com outros grupos conforme MIGRATIONS-EXECUTION-ORDER.md
3. Grupo 3 (CRM) é o próximo mais importante

⚠️ IMPORTANTE: 
Execute os outros grupos SOMENTE se este não deu erro!
*/
