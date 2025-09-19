-- =============================================
-- DEVELOPMENT SEED DATA
-- =============================================

-- Note: This script assumes you have already created users in Supabase Auth
-- You'll need to replace the UUIDs below with actual auth.users IDs

-- Sample UUIDs (replace these with actual auth.users IDs)
-- Admin: 'a1111111-1111-1111-1111-111111111111'
-- Therapist 1: 'b2222222-2222-2222-2222-222222222222'
-- Therapist 2: 'b3333333-3333-3333-3333-333333333333'
-- Receptionist: 'c4444444-4444-4444-4444-444444444444'
-- Patient 1: 'd5555555-5555-5555-5555-555555555555'
-- Patient 2: 'd6666666-6666-6666-6666-666666666666'

-- =============================================
-- USERS
-- =============================================

INSERT INTO public.users (id, email, full_name, phone, role, specialization, professional_id, active) VALUES
('a1111111-1111-1111-1111-111111111111', 'admin@fisioflow.com', 'Admin Sistema', '(11) 99999-0001', 'admin', NULL, NULL, true),
('b2222222-2222-2222-2222-222222222222', 'maria.santos@fisioflow.com', 'Dra. Maria Santos', '(11) 99999-0002', 'therapist', 'Fisioterapia Ortopédica', 'CREFITO-3/123456', true),
('b3333333-3333-3333-3333-333333333333', 'carlos.mendes@fisioflow.com', 'Dr. Carlos Mendes', '(11) 99999-0003', 'therapist', 'Fisioterapia Esportiva', 'CREFITO-3/234567', true),
('c4444444-4444-4444-4444-444444444444', 'julia.costa@fisioflow.com', 'Julia Costa', '(11) 99999-0004', 'receptionist', NULL, NULL, true),
('d5555555-5555-5555-5555-555555555555', 'joao.silva@email.com', 'João Silva', '(11) 98765-4321', 'patient', NULL, NULL, true),
('d6666666-6666-6666-6666-666666666666', 'ana.oliveira@email.com', 'Ana Oliveira', '(11) 98765-4322', 'patient', NULL, NULL, true)
ON CONFLICT (id) DO NOTHING;

-- =============================================
-- PATIENTS
-- =============================================

INSERT INTO public.patients (
    id, user_id, full_name, email, phone, cpf, birth_date, gender,
    address_street, address_number, address_complement, address_neighborhood,
    address_city, address_state, address_zip_code,
    emergency_contact_name, emergency_contact_phone, emergency_contact_relationship,
    medical_history, allergies, medications, blood_type,
    insurance_provider, insurance_plan, insurance_number,
    occupation, observations, status
) VALUES
(
    '11111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'd5555555-5555-5555-5555-555555555555',
    'João Silva',
    'joao.silva@email.com',
    '(11) 98765-4321',
    '123.456.789-00',
    '1985-03-15',
    'male',
    'Rua das Flores',
    '123',
    'Apto 45',
    'Jardim Primavera',
    'São Paulo',
    'SP',
    '01234-567',
    'Maria Silva',
    '(11) 98765-4320',
    'Esposa',
    ARRAY['Hipertensão', 'Diabetes Tipo 2'],
    ARRAY['Dipirona'],
    ARRAY['Losartana 50mg', 'Metformina 850mg'],
    'O+',
    'Unimed',
    'Plano Básico',
    'UNI123456',
    'Engenheiro',
    'Paciente com dor lombar crônica há 3 meses',
    'active'
),
(
    '22222222-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    'd6666666-6666-6666-6666-666666666666',
    'Ana Oliveira',
    'ana.oliveira@email.com',
    '(11) 98765-4322',
    '987.654.321-00',
    '1990-07-22',
    'female',
    'Av. Paulista',
    '1000',
    'Sala 201',
    'Bela Vista',
    'São Paulo',
    'SP',
    '01310-100',
    'Carlos Oliveira',
    '(11) 98765-4323',
    'Pai',
    ARRAY['Asma'],
    ARRAY['Penicilina', 'Ibuprofeno'],
    ARRAY['Salbutamol spray'],
    'A+',
    'SulAmérica',
    'Plano Executivo',
    'SUL987654',
    'Advogada',
    'Lesão no ombro após acidente automobilístico',
    'active'
),
(
    '33333333-cccc-cccc-cccc-cccccccccccc',
    NULL,
    'Pedro Santos',
    'pedro.santos@email.com',
    '(11) 98765-4324',
    '456.789.123-00',
    '1978-11-30',
    'male',
    'Rua Augusta',
    '500',
    NULL,
    'Consolação',
    'São Paulo',
    'SP',
    '01305-000',
    'Lucia Santos',
    '(11) 98765-4325',
    'Esposa',
    NULL,
    NULL,
    NULL,
    'AB+',
    NULL,
    NULL,
    NULL,
    'Professor',
    'Tendinite no cotovelo direito',
    'active'
),
(
    '44444444-dddd-dddd-dddd-dddddddddddd',
    NULL,
    'Mariana Costa',
    'mariana.costa@email.com',
    '(11) 98765-4326',
    '789.123.456-00',
    '1995-05-18',
    'female',
    'Rua Oscar Freire',
    '200',
    'Cobertura',
    'Pinheiros',
    'São Paulo',
    'SP',
    '05409-000',
    'Roberto Costa',
    '(11) 98765-4327',
    'Irmão',
    ARRAY['Fibromialgia'],
    NULL,
    ARRAY['Duloxetina 60mg', 'Ciclobenzaprina 10mg'],
    'B+',
    'Bradesco Saúde',
    'Plano Premium',
    'BRA456789',
    'Designer',
    'Dores generalizadas, necessita abordagem multidisciplinar',
    'active'
);

-- =============================================
-- APPOINTMENTS
-- =============================================

-- Current week appointments
INSERT INTO public.appointments (
    id, patient_id, therapist_id, appointment_date, start_time, end_time,
    appointment_type, room, status, chief_complaint, price, insurance_covered
) VALUES
-- Monday
('aaaa1111-1111-1111-1111-111111111111', '11111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'b2222222-2222-2222-2222-222222222222',
 CURRENT_DATE, '09:00', '10:00', 'session', 'Sala 1', 'completed', 'Dor lombar', 150.00, true),
('aaaa2222-2222-2222-2222-222222222222', '22222222-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'b2222222-2222-2222-2222-222222222222',
 CURRENT_DATE, '10:00', '11:00', 'evaluation', 'Sala 1', 'completed', 'Avaliação ombro', 200.00, true),
('aaaa3333-3333-3333-3333-333333333333', '33333333-cccc-cccc-cccc-cccccccccccc', 'b3333333-3333-3333-3333-333333333333',
 CURRENT_DATE, '14:00', '15:00', 'session', 'Sala 2', 'scheduled', 'Tendinite cotovelo', 150.00, false),

-- Tuesday
('aaaa4444-4444-4444-4444-444444444444', '44444444-dddd-dddd-dddd-dddddddddddd', 'b2222222-2222-2222-2222-222222222222',
 CURRENT_DATE + INTERVAL '1 day', '09:00', '10:00', 'session', 'Sala 1', 'scheduled', 'Fibromialgia', 150.00, true),
('aaaa5555-5555-5555-5555-555555555555', '11111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'b3333333-3333-3333-3333-333333333333',
 CURRENT_DATE + INTERVAL '1 day', '10:00', '11:00', 'session', 'Sala 2', 'scheduled', 'Dor lombar', 150.00, true),

-- Wednesday
('aaaa6666-6666-6666-6666-666666666666', '22222222-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'b2222222-2222-2222-2222-222222222222',
 CURRENT_DATE + INTERVAL '2 days', '14:00', '15:00', 'session', 'Sala 1', 'confirmed', 'Reabilitação ombro', 150.00, true),
('aaaa7777-7777-7777-7777-777777777777', '33333333-cccc-cccc-cccc-cccccccccccc', 'b3333333-3333-3333-3333-333333333333',
 CURRENT_DATE + INTERVAL '2 days', '15:00', '16:00', 'session', 'Sala 2', 'scheduled', 'Tendinite cotovelo', 150.00, false),

-- Thursday
('aaaa8888-8888-8888-8888-888888888888', '11111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'b2222222-2222-2222-2222-222222222222',
 CURRENT_DATE + INTERVAL '3 days', '09:00', '10:00', 'return', 'Sala 1', 'scheduled', 'Retorno - Dor lombar', 100.00, true),

-- Friday
('aaaa9999-9999-9999-9999-999999999999', '44444444-dddd-dddd-dddd-dddddddddddd', 'b2222222-2222-2222-2222-222222222222',
 CURRENT_DATE + INTERVAL '4 days', '10:00', '11:00', 'session', 'Sala 1', 'scheduled', 'Fibromialgia', 150.00, true),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '22222222-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'b3333333-3333-3333-3333-333333333333',
 CURRENT_DATE + INTERVAL '4 days', '11:00', '12:00', 'session', 'Sala 2', 'scheduled', 'Reabilitação ombro', 150.00, true);

-- =============================================
-- SESSIONS (for completed appointments)
-- =============================================

INSERT INTO public.sessions (
    id, appointment_id, procedures_performed, pain_level_before, pain_level_after,
    objective_assessment, treatment_performed, patient_response, progress_notes,
    next_session_notes, exercises_prescribed
) VALUES
(
    'sess1111-1111-1111-1111-111111111111',
    'aaaa1111-1111-1111-1111-111111111111',
    'Mobilização articular, Exercícios terapêuticos, TENS',
    7,
    4,
    'Limitação de movimento em flexão anterior (45°), dor à palpação em L4-L5',
    'Mobilização articular grau III, exercícios de fortalecimento core, eletroterapia',
    'Boa resposta ao tratamento, relatou alívio imediato após mobilização',
    'Paciente apresenta melhora significativa comparado à sessão anterior',
    'Progressão dos exercícios de fortalecimento',
    'Ponte: 3x10, Prancha: 3x30seg, Alongamento lombar: 3x30seg'
),
(
    'sess2222-2222-2222-2222-222222222222',
    'aaaa2222-2222-2222-2222-222222222222',
    'Avaliação completa, testes funcionais',
    8,
    6,
    'Limitação severa de abdução (60°), teste de Neer positivo, força grau 3/5',
    'Avaliação fisioterapêutica completa, orientações posturais',
    'Paciente compreendeu orientações, motivada para tratamento',
    'Necessita reabilitação intensiva, prognóstico favorável',
    'Iniciar mobilização passiva e exercícios isométricos',
    'Exercícios pendulares, isométricos de ombro'
);

-- =============================================
-- PAIN POINTS
-- =============================================

INSERT INTO public.pain_points (
    id, patient_id, body_region, coordinates_x, coordinates_y, side,
    pain_intensity, pain_type, pain_characteristics, description,
    triggers, relief_methods, frequency, duration, start_date, status
) VALUES
(
    'pain1111-1111-1111-1111-111111111111',
    '11111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'lower_back',
    200,
    180,
    'center',
    7,
    ARRAY['aching', 'stabbing'],
    ARRAY['constant', 'radiating'],
    'Dor constante na região lombar com irradiação para perna direita',
    ARRAY['Ficar sentado por muito tempo', 'Levantar peso', 'Movimentos bruscos'],
    ARRAY['Alongamento', 'Compressa quente', 'Medicação'],
    'constant',
    '3 meses',
    '2024-11-15',
    'active'
),
(
    'pain2222-2222-2222-2222-222222222222',
    '22222222-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    'shoulder_right',
    250,
    110,
    'right',
    8,
    ARRAY['sharp', 'burning'],
    ARRAY['intermittent', 'movement-related'],
    'Dor aguda no ombro direito ao elevar o braço',
    ARRAY['Elevar braço acima da cabeça', 'Carregar peso', 'Dormir sobre o lado'],
    ARRAY['Repouso', 'Gelo', 'Anti-inflamatório'],
    'frequent',
    '2 semanas',
    '2024-02-01',
    'active'
),
(
    'pain3333-3333-3333-3333-333333333333',
    '33333333-cccc-cccc-cccc-cccccccccccc',
    'elbow_right',
    290,
    170,
    'right',
    6,
    ARRAY['burning', 'aching'],
    ARRAY['activity-related'],
    'Dor em queimação no cotovelo durante atividades',
    ARRAY['Movimentos repetitivos', 'Pegar objetos', 'Digitar'],
    ARRAY['Repouso', 'Alongamento', 'Bandagem'],
    'frequent',
    '1 mês',
    '2024-01-15',
    'improving'
);

-- =============================================
-- EXERCISES
-- =============================================

INSERT INTO public.exercises (
    id, name, description, category, difficulty_level,
    instructions, contraindications, equipment_needed,
    default_sets, default_repetitions, default_duration_seconds, default_rest_seconds,
    tags, target_muscles, benefits, active, created_by
) VALUES
(
    'ex111111-1111-1111-1111-111111111111',
    'Ponte',
    'Exercício para fortalecimento de glúteos e core',
    'fortalecimento',
    2,
    '1. Deite de costas com joelhos flexionados\n2. Eleve o quadril mantendo alinhamento\n3. Mantenha por 2 segundos\n4. Desça controladamente',
    'Lesão aguda na coluna, dor intensa durante execução',
    ARRAY['mat'],
    3,
    15,
    NULL,
    30,
    ARRAY['core', 'glúteos', 'lombar'],
    ARRAY['Glúteos', 'Core', 'Isquiotibiais'],
    ARRAY['Fortalecimento muscular', 'Melhora da estabilidade', 'Alívio de dor lombar'],
    true,
    'b2222222-2222-2222-2222-222222222222'
),
(
    'ex222222-2222-2222-2222-222222222222',
    'Alongamento Lombar',
    'Alongamento para região lombar',
    'alongamento',
    1,
    '1. Deite de costas\n2. Puxe os joelhos em direção ao peito\n3. Mantenha a posição\n4. Respire profundamente',
    'Hérnia de disco aguda',
    ARRAY['mat'],
    3,
    NULL,
    30,
    10,
    ARRAY['lombar', 'alongamento', 'relaxamento'],
    ARRAY['Paravertebrais', 'Glúteos'],
    ARRAY['Melhora da flexibilidade', 'Alívio da dor', 'Relaxamento muscular'],
    true,
    'b2222222-2222-2222-2222-222222222222'
),
(
    'ex333333-3333-3333-3333-333333333333',
    'Exercícios Pendulares',
    'Exercícios para mobilização do ombro',
    'mobilizacao_neural',
    1,
    '1. Incline o tronco à frente\n2. Deixe o braço afetado pendurado\n3. Faça movimentos circulares suaves\n4. Alterne direções',
    'Luxação recente, instabilidade severa',
    ARRAY['none'],
    3,
    10,
    NULL,
    30,
    ARRAY['ombro', 'mobilização', 'reabilitação'],
    ARRAY['Deltoides', 'Manguito rotador'],
    ARRAY['Melhora da amplitude de movimento', 'Redução da rigidez', 'Alívio da dor'],
    true,
    'b3333333-3333-3333-3333-333333333333'
),
(
    'ex444444-4444-4444-4444-444444444444',
    'Prancha',
    'Exercício isométrico para core',
    'tronco_core',
    3,
    '1. Posição de flexão com apoio nos antebraços\n2. Mantenha corpo alinhado\n3. Contraia abdômen\n4. Respire normalmente',
    'Diástase abdominal, hérnia',
    ARRAY['mat'],
    3,
    NULL,
    45,
    45,
    ARRAY['core', 'isométrico', 'avançado'],
    ARRAY['Core', 'Deltoides', 'Glúteos'],
    ARRAY['Fortalecimento do core', 'Melhora da postura', 'Estabilidade'],
    true,
    'b2222222-2222-2222-2222-222222222222'
);

-- =============================================
-- EXERCISE PRESCRIPTIONS
-- =============================================

INSERT INTO public.exercise_prescriptions (
    id, patient_id, therapist_id, name, start_date, end_date,
    frequency_per_week, general_notes, status
) VALUES
(
    'pres1111-1111-1111-1111-111111111111',
    '11111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'b2222222-2222-2222-2222-222222222222',
    'Programa de Reabilitação Lombar',
    CURRENT_DATE,
    CURRENT_DATE + INTERVAL '30 days',
    5,
    'Realizar exercícios preferencialmente pela manhã. Parar se houver dor intensa.',
    'active'
),
(
    'pres2222-2222-2222-2222-222222222222',
    '22222222-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    'b2222222-2222-2222-2222-222222222222',
    'Reabilitação de Ombro',
    CURRENT_DATE,
    CURRENT_DATE + INTERVAL '45 days',
    3,
    'Aplicar gelo após os exercícios. Progressão gradual conforme tolerância.',
    'active'
);

-- =============================================
-- EXERCISE PRESCRIPTION ITEMS
-- =============================================

INSERT INTO public.exercise_prescription_items (
    id, prescription_id, exercise_id, sets, repetitions, rest_seconds,
    specific_notes, order_index
) VALUES
-- Prescription 1 items
('item1111-1111-1111-1111-111111111111', 'pres1111-1111-1111-1111-111111111111', 'ex222222-2222-2222-2222-222222222222',
 3, NULL, 10, 'Manter por 30 segundos', 1),
('item2222-2222-2222-2222-222222222222', 'pres1111-1111-1111-1111-111111111111', 'ex111111-1111-1111-1111-111111111111',
 3, 15, 30, 'Progressão: aumentar para 20 reps na próxima semana', 2),
('item3333-3333-3333-3333-333333333333', 'pres1111-1111-1111-1111-111111111111', 'ex444444-4444-4444-4444-444444444444',
 3, NULL, 45, 'Começar com 30 segundos, progredir conforme tolerância', 3),

-- Prescription 2 items
('item4444-4444-4444-4444-444444444444', 'pres2222-2222-2222-2222-222222222222', 'ex333333-3333-3333-3333-333333333333',
 3, 10, 30, 'Fazer movimentos suaves e controlados', 1);

-- =============================================
-- INSURANCE PROVIDERS
-- =============================================

INSERT INTO public.insurance_providers (
    id, name, code, tax_id, phone, email, website,
    address_street, address_number, address_city, address_state, address_zip_code,
    contract_number, payment_terms_days, reimbursement_percentage, active
) VALUES
(
    'ins11111-1111-1111-1111-111111111111',
    'Unimed São Paulo',
    'UNIMED-SP',
    '12.345.678/0001-90',
    '(11) 3265-9000',
    'contato@unimedsp.com.br',
    'www.unimedsp.com.br',
    'Av. Angélica',
    '2530',
    'São Paulo',
    'SP',
    '01228-200',
    'CTR-2024-001',
    30,
    80.00,
    true
),
(
    'ins22222-2222-2222-2222-222222222222',
    'SulAmérica Saúde',
    'SULAMERICA',
    '98.765.432/0001-10',
    '(11) 3004-6722',
    'contato@sulamerica.com.br',
    'www.sulamerica.com.br',
    'Rua Beatriz Larragoiti Lucas',
    '121',
    'Rio de Janeiro',
    'RJ',
    '22793-121',
    'CTR-2024-002',
    45,
    70.00,
    true
),
(
    'ins33333-3333-3333-3333-333333333333',
    'Bradesco Saúde',
    'BRADESCO',
    '45.678.901/0001-23',
    '(11) 4004-2700',
    'contato@bradescosaude.com.br',
    'www.bradescosaude.com.br',
    'Rua Barão de Itapagipe',
    '225',
    'Rio de Janeiro',
    'RJ',
    '20261-901',
    'CTR-2024-003',
    30,
    75.00,
    true
);

-- =============================================
-- SAMPLE INVOICES
-- =============================================

INSERT INTO public.invoices (
    id, invoice_number, patient_id, issue_date, due_date,
    subtotal, tax_amount, discount_amount, total_amount, paid_amount,
    status, payment_terms
) VALUES
(
    'inv11111-1111-1111-1111-111111111111',
    '20240200001',
    '11111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    CURRENT_DATE - INTERVAL '15 days',
    CURRENT_DATE + INTERVAL '15 days',
    600.00,
    0.00,
    0.00,
    600.00,
    0.00,
    'sent',
    'Pagamento em até 30 dias'
),
(
    'inv22222-2222-2222-2222-222222222222',
    '20240200002',
    '22222222-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    CURRENT_DATE - INTERVAL '30 days',
    CURRENT_DATE - INTERVAL '5 days',
    800.00,
    0.00,
    80.00,
    720.00,
    720.00,
    'paid',
    'Pagamento via convênio'
);

-- =============================================
-- SAMPLE FINANCIAL TRANSACTIONS
-- =============================================

INSERT INTO public.financial_transactions (
    id, transaction_type, amount, currency, description,
    patient_id, invoice_id, payment_method, payment_date,
    status, reference_number, created_by
) VALUES
(
    'trans111-1111-1111-1111-111111111111',
    'payment',
    720.00,
    'BRL',
    'Pagamento fatura 20240200002',
    '22222222-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    'inv22222-2222-2222-2222-222222222222',
    'insurance',
    CURRENT_DATE - INTERVAL '5 days',
    'completed',
    'PAG-2024-0001',
    'c4444444-4444-4444-4444-444444444444'
);

-- =============================================
-- SAMPLE NOTIFICATIONS
-- =============================================

INSERT INTO public.notifications (
    id, user_id, patient_id, title, message,
    notification_type, channel, status, read,
    appointment_id, created_by
) VALUES
(
    'notif111-1111-1111-1111-111111111111',
    'd5555555-5555-5555-5555-555555555555',
    '11111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'Lembrete de Consulta',
    'Sua sessão de fisioterapia é amanhã às 09:00',
    'appointment_reminder',
    'email',
    'sent',
    false,
    'aaaa8888-8888-8888-8888-888888888888',
    'c4444444-4444-4444-4444-444444444444'
),
(
    'notif222-2222-2222-2222-222222222222',
    'd6666666-6666-6666-6666-666666666666',
    '22222222-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    'Confirmação de Agendamento',
    'Seu agendamento para quarta-feira às 14:00 foi confirmado',
    'appointment_confirmation',
    'whatsapp',
    'delivered',
    true,
    'aaaa6666-6666-6666-6666-666666666666',
    'c4444444-4444-4444-4444-444444444444'
);

-- =============================================
-- SAMPLE PATIENT CONSENTS
-- =============================================

INSERT INTO public.patient_consents (
    id, patient_id, treatment_consent, data_sharing_consent,
    marketing_consent, image_use_consent, consent_date,
    consent_method, recorded_by
) VALUES
(
    'cons1111-1111-1111-1111-111111111111',
    '11111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    true,
    true,
    false,
    true,
    CURRENT_DATE - INTERVAL '30 days',
    'digital',
    'c4444444-4444-4444-4444-444444444444'
),
(
    'cons2222-2222-2222-2222-222222222222',
    '22222222-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    true,
    true,
    true,
    false,
    CURRENT_DATE - INTERVAL '45 days',
    'written',
    'c4444444-4444-4444-4444-444444444444'
);

-- =============================================
-- COMMIT TRANSACTION
-- =============================================

-- Note: When running this script, make sure to:
-- 1. First create the corresponding users in Supabase Auth
-- 2. Replace the UUID placeholders with actual auth.users IDs
-- 3. Adjust dates and data as needed for your testing environment