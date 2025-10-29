-- ============================================================================
-- SEED 001: Dados de Demonstração
-- ============================================================================
-- Descrição: Popula o banco com dados iniciais para demonstração e testes
-- Data: 2025-10-29
-- Autor: DuduFisio-AI Team
-- ============================================================================

-- ⚠️ IMPORTANTE: Este arquivo cria APENAS os dados.
-- Os usuários devem ser criados manualmente no Supabase Dashboard ou via API
-- porque as senhas precisam ser hash

-- ============================================================================
-- INSTRUÇÕES PARA CRIAR USUÁRIOS NO SUPABASE
-- ============================================================================
-- 1. Vá em: Supabase Dashboard → Authentication → Users
-- 2. Clique em "Add User" ou "Invite User"
-- 3. Crie os seguintes usuários com senha: demo123456
--
-- USUÁRIOS A CRIAR:
-- - admin@dudufisio.com (Admin)
-- - therapist@dudufisio.com (Therapist)
-- - patient@dudufisio.com (Patient)
-- - educator@dudufisio.com (EducadorFisico)
-- ============================================================================

-- ============================================================================
-- NOTA: Profiles serão criados automaticamente pelo trigger handle_new_user
-- Vamos apenas atualizar os roles após criar os usuários
-- ============================================================================

-- Atualizar roles dos usuários (EXECUTAR APÓS CRIAR USUÁRIOS NO DASHBOARD)
-- Substitua os UUIDs pelos IDs reais dos usuários criados

-- UPDATE profiles SET role = 'Admin', name = 'Administrador', specialty = 'Gestão' 
-- WHERE email = 'admin@dudufisio.com';

-- UPDATE profiles SET role = 'Therapist', name = 'Dr. Carlos Silva', specialty = 'Fisioterapia Ortopédica', registration_number = 'CREFITO-3/123456'
-- WHERE email = 'therapist@dudufisio.com';

-- UPDATE profiles SET role = 'Patient', name = 'Maria Santos'
-- WHERE email = 'patient@dudufisio.com';

-- UPDATE profiles SET role = 'EducadorFisico', name = 'João Educador', specialty = 'Educação Física', registration_number = 'CREF-123456'
-- WHERE email = 'educator@dudufisio.com';

-- ============================================================================
-- PACIENTES DE DEMONSTRAÇÃO
-- ============================================================================

-- Paciente 1: Ana Silva
INSERT INTO patients (
  name, email, phone, birth_date, cpf, gender,
  address, emergency_contact,
  medical_history, status, notes
) VALUES (
  'Ana Silva',
  'ana.silva@email.com',
  '(11) 98765-4321',
  '1985-03-15',
  '123.456.789-00',
  'F',
  '{"street": "Rua das Flores", "number": "123", "neighborhood": "Jardim Paulista", "city": "São Paulo", "state": "SP", "zip_code": "01234-567"}'::jsonb,
  '{"name": "Pedro Silva", "relationship": "Esposo", "phone": "(11) 98765-4322"}'::jsonb,
  'Histórico de dor lombar crônica. Sedentarismo.',
  'Active',
  'Paciente muito engajada no tratamento'
);

-- Paciente 2: Carlos Santos
INSERT INTO patients (
  name, email, phone, birth_date, cpf, gender,
  address, emergency_contact,
  medical_history, medications, status
) VALUES (
  'Carlos Santos',
  'carlos.santos@email.com',
  '(11) 97654-3210',
  '1978-07-22',
  '234.567.890-11',
  'M',
  '{"street": "Av. Paulista", "number": "1000", "neighborhood": "Bela Vista", "city": "São Paulo", "state": "SP", "zip_code": "01310-100"}'::jsonb,
  '{"name": "Maria Santos", "relationship": "Esposa", "phone": "(11) 97654-3211"}'::jsonb,
  'Bursite no ombro direito. Praticante de tênis.',
  'Anti-inflamatório conforme prescrição médica',
  'Active'
);

-- Paciente 3: Maria Oliveira
INSERT INTO patients (
  name, email, phone, birth_date, cpf, gender,
  address, medical_history, allergies, status
) VALUES (
  'Maria Oliveira',
  'maria.oliveira@email.com',
  '(11) 96543-2109',
  '1990-11-30',
  '345.678.901-22',
  'F',
  '{"street": "Rua Augusta", "number": "500", "neighborhood": "Consolação", "city": "São Paulo", "state": "SP", "zip_code": "01305-000"}'::jsonb,
  'Hérnia de disco L4-L5. Trabalha em escritório (muitas horas sentada).',
  'Alérgica a dipirona',
  'Active'
);

-- Paciente 4: João Costa
INSERT INTO patients (
  name, email, phone, birth_date, cpf, gender,
  address, medical_history, status
) VALUES (
  'João Costa',
  'joao.costa@email.com',
  '(11) 95432-1098',
  '2005-05-10',
  '456.789.012-33',
  'M',
  '{"street": "Rua da Consolação", "number": "2000", "neighborhood": "Consolação", "city": "São Paulo", "state": "SP", "zip_code": "01301-000"}'::jsonb,
  'Escoliose leve. Adolescente ativo, pratica basquete.',
  'Active'
);

-- Pacientes adicionais para demonstração
INSERT INTO patients (name, email, phone, birth_date, cpf, gender, status) VALUES
('Fernanda Lima', 'fernanda.lima@email.com', '(11) 94321-0987', '1982-08-14', '567.890.123-44', 'F', 'Active'),
('Roberto Alves', 'roberto.alves@email.com', '(11) 93210-9876', '1975-12-25', '678.901.234-55', 'M', 'Active'),
('Juliana Souza', 'juliana.souza@email.com', '(11) 92109-8765', '1988-04-18', '789.012.345-66', 'F', 'Inactive'),
('Paulo Mendes', 'paulo.mendes@email.com', '(11) 91098-7654', '1995-09-03', '890.123.456-77', 'M', 'Active'),
('Carla Rodrigues', 'carla.rodrigues@email.com', '(11) 90987-6543', '1980-06-20', '901.234.567-88', 'F', 'Active'),
('Ricardo Pereira', 'ricardo.pereira@email.com', '(11) 89876-5432', '1970-01-11', '012.345.678-99', 'M', 'Active');

-- ============================================================================
-- EXERCÍCIOS DE DEMONSTRAÇÃO
-- ============================================================================

INSERT INTO exercises (name, description, category, difficulty, body_part, instructions, is_public) VALUES
(
  'Alongamento de Cadeia Posterior',
  'Alongamento completo da cadeia posterior do corpo',
  'Alongamento',
  'Iniciante',
  'Pernas e Costas',
  ARRAY[
    'Sente-se no chão com as pernas estendidas',
    'Mantenha a coluna ereta',
    'Incline o tronco à frente tentando tocar os pés',
    'Mantenha por 30 segundos',
    'Respire profundamente durante o alongamento'
  ],
  TRUE
),
(
  'Fortalecimento de Core - Prancha',
  'Exercício isométrico para fortalecimento do core',
  'Fortalecimento',
  'Intermediário',
  'Abdômen',
  ARRAY[
    'Deite-se de bruços no chão',
    'Apoie-se nos antebraços e pontas dos pés',
    'Mantenha o corpo alinhado como uma prancha',
    'Contraia o abdômen',
    'Mantenha por 30-60 segundos'
  ],
  TRUE
),
(
  'Mobilidade de Ombro - Círculos',
  'Exercício para melhorar mobilidade do ombro',
  'Mobilidade',
  'Iniciante',
  'Ombro',
  ARRAY[
    'Fique em pé com os braços ao longo do corpo',
    'Faça círculos com os ombros para frente',
    'Repita 10 vezes',
    'Faça círculos para trás',
    'Repita 10 vezes'
  ],
  TRUE
),
(
  'Equilíbrio Unipodal',
  'Treino de equilíbrio em uma perna',
  'Equilíbrio',
  'Iniciante',
  'Membros Inferiores',
  ARRAY[
    'Fique em pé próximo a uma parede ou apoio',
    'Levante uma perna do chão',
    'Mantenha o equilíbrio por 30 segundos',
    'Troque de perna',
    'Repita 3 vezes cada lado'
  ],
  TRUE
),
(
  'Fortalecimento de Quadríceps',
  'Exercício para fortalecer a musculatura anterior da coxa',
  'Fortalecimento',
  'Intermediário',
  'Quadríceps',
  ARRAY[
    'Sente-se em uma cadeira',
    'Estenda uma perna à frente',
    'Mantenha por 5 segundos',
    'Retorne à posição inicial',
    'Faça 3 séries de 10 repetições'
  ],
  TRUE
);

-- ============================================================================
-- NOTA: Agendamentos e Sessões devem ser criados APÓS criar os usuários
-- porque precisam dos UUIDs reais dos therapists e patients
-- ============================================================================

-- Exemplo de como criar agendamentos (executar após ter os UUIDs):
-- INSERT INTO appointments (patient_id, therapist_id, start_time, end_time, type, status)
-- SELECT 
--   p.id as patient_id,
--   t.id as therapist_id,
--   NOW() + INTERVAL '1 day' + INTERVAL '9 hours' as start_time,
--   NOW() + INTERVAL '1 day' + INTERVAL '10 hours' as end_time,
--   'Primeira Consulta' as type,
--   'scheduled' as status
-- FROM patients p
-- CROSS JOIN profiles t
-- WHERE p.name = 'Ana Silva'
-- AND t.email = 'therapist@dudufisio.com'
-- LIMIT 1;

-- ============================================================================
-- VIEWS ÚTEIS PARA DEMONSTRAÇÃO
-- ============================================================================

-- View para listar agendamentos com informações completas
CREATE OR REPLACE VIEW appointments_detailed AS
SELECT 
  a.id,
  a.start_time,
  a.end_time,
  a.type,
  a.status,
  a.notes,
  p.name as patient_name,
  p.email as patient_email,
  p.phone as patient_phone,
  t.name as therapist_name,
  t.email as therapist_email
FROM appointments a
JOIN patients p ON a.patient_id = p.id
JOIN profiles t ON a.therapist_id = t.id;

-- View para estatísticas de pacientes
CREATE OR REPLACE VIEW patient_stats AS
SELECT 
  status,
  COUNT(*) as total,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) as percentage
FROM patients
GROUP BY status;

-- View para agenda do dia
CREATE OR REPLACE VIEW today_appointments AS
SELECT 
  a.*,
  p.name as patient_name,
  t.name as therapist_name
FROM appointments a
JOIN patients p ON a.patient_id = p.id
JOIN profiles t ON a.therapist_id = t.id
WHERE DATE(a.start_time) = CURRENT_DATE
ORDER BY a.start_time;

-- ============================================================================
-- FIM DO SEED 001
-- ============================================================================

-- Mensagem final
DO $$
BEGIN
  RAISE NOTICE '✅ Dados de demonstração carregados com sucesso!';
  RAISE NOTICE '';
  RAISE NOTICE '📝 PRÓXIMOS PASSOS:';
  RAISE NOTICE '1. Crie os usuários no Supabase Dashboard:';
  RAISE NOTICE '   - admin@dudufisio.com';
  RAISE NOTICE '   - therapist@dudufisio.com';
  RAISE NOTICE '   - patient@dudufisio.com';
  RAISE NOTICE '   - educator@dudufisio.com';
  RAISE NOTICE '2. Senha para todos: demo123456';
  RAISE NOTICE '3. Execute os UPDATEs comentados acima para definir os roles';
  RAISE NOTICE '';
  RAISE NOTICE '📊 Estatísticas:';
  RAISE NOTICE '   - Pacientes criados: 10';
  RAISE NOTICE '   - Exercícios criados: 5';
  RAISE NOTICE '';
END $$;

