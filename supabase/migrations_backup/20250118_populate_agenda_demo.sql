-- Migration: Populate Agenda Demo Data
-- Description: Creates demo data for testing the agenda page
-- Date: 2025-01-18

-- Clear existing demo data (optional, comment out if you want to keep existing data)
-- DELETE FROM appointments WHERE id LIKE 'appt-demo-%';
-- DELETE FROM waitlist WHERE id LIKE 'wait-demo-%';
-- DELETE FROM patients WHERE id LIKE 'pac-demo-%';
-- DELETE FROM therapists WHERE id LIKE 'ther-demo-%';

-- Insert 15 demo patients
INSERT INTO patients (id, name, phone, email, birth_date, gender, address, created_at) VALUES
  ('pac-demo-001', 'Ana Silva', '(11) 98765-4321', 'ana.silva@email.com', '1985-03-15', 'F', 'Rua das Flores, 123 - São Paulo, SP', NOW()),
  ('pac-demo-002', 'Bruno Gomes', '(11) 97654-3210', 'bruno.gomes@email.com', '1990-07-22', 'M', 'Av. Paulista, 1000 - São Paulo, SP', NOW()),
  ('pac-demo-003', 'Carla Dias', '(11) 96543-2109', 'carla.dias@email.com', '1988-11-30', 'F', 'Rua Augusta, 500 - São Paulo, SP', NOW()),
  ('pac-demo-004', 'Daniel Almeida', '(11) 95432-1098', 'daniel.almeida@email.com', '1992-05-18', 'M', 'Av. Brigadeiro, 2000 - São Paulo, SP', NOW()),
  ('pac-demo-005', 'Elisa Fernandes', '(11) 94321-0987', 'elisa.fernandes@email.com', '1987-09-25', 'F', 'Rua Consolação, 800 - São Paulo, SP', NOW()),
  ('pac-demo-006', 'Fernando Oliveira', '(11) 93210-9876', 'fernando.oliveira@email.com', '1991-12-08', 'M', 'Av. Faria Lima, 1500 - São Paulo, SP', NOW()),
  ('pac-demo-007', 'Gabriela Costa', '(11) 92109-8765', 'gabriela.costa@email.com', '1986-04-20', 'F', 'Rua Oscar Freire, 600 - São Paulo, SP', NOW()),
  ('pac-demo-008', 'Henrique Santos', '(11) 91098-7654', 'henrique.santos@email.com', '1993-08-14', 'M', 'Av. Rebouças, 3000 - São Paulo, SP', NOW()),
  ('pac-demo-009', 'Isabela Martins', '(11) 90987-6543', 'isabela.martins@email.com', '1989-01-30', 'F', 'Rua Haddock Lobo, 700 - São Paulo, SP', NOW()),
  ('pac-demo-010', 'João Pereira', '(11) 89876-5432', 'joao.pereira@email.com', '1984-06-12', 'M', 'Av. 9 de Julho, 4000 - São Paulo, SP', NOW()),
  ('pac-demo-011', 'Karina Lima', '(11) 88765-4321', 'karina.lima@email.com', '1990-10-05', 'F', 'Rua Teodoro Sampaio, 900 - São Paulo, SP', NOW()),
  ('pac-demo-012', 'Lucas Rodrigues', '(11) 87654-3210', 'lucas.rodrigues@email.com', '1992-02-18', 'M', 'Av. Sumaré, 2500 - São Paulo, SP', NOW()),
  ('pac-demo-013', 'Mariana Ferreira', '(11) 86543-2109', 'mariana.ferreira@email.com', '1987-11-22', 'F', 'Rua Bela Cintra, 1100 - São Paulo, SP', NOW()),
  ('pac-demo-014', 'Nicolas Souza', '(11) 85432-1098', 'nicolas.souza@email.com', '1991-03-07', 'M', 'Av. Ipiranga, 3500 - São Paulo, SP', NOW()),
  ('pac-demo-015', 'Olivia Rocha', '(11) 84321-0987', 'olivia.rocha@email.com', '1988-07-15', 'F', 'Rua da Consolação, 1300 - São Paulo, SP', NOW())
ON CONFLICT (id) DO UPDATE SET 
  name = EXCLUDED.name,
  phone = EXCLUDED.phone,
  email = EXCLUDED.email,
  updated_at = NOW();

-- Insert 3 demo therapists
INSERT INTO therapists (id, name, specialty, color, email, phone, created_at) VALUES
  ('ther-demo-001', 'Dr. Roberto', 'Ortopedia', '#10b981', 'roberto@fisio.com', '(11) 91111-1111', NOW()),
  ('ther-demo-002', 'Dra. Camila', 'Neurologia', '#3b82f6', 'camila@fisio.com', '(11) 92222-2222', NOW()),
  ('ther-demo-003', 'Dr. Fernando', 'Esportiva', '#8b5cf6', 'fernando@fisio.com', '(11) 93333-3333', NOW())
ON CONFLICT (id) DO UPDATE SET 
  name = EXCLUDED.name,
  specialty = EXCLUDED.specialty,
  color = EXCLUDED.color,
  updated_at = NOW();

-- Insert 60+ appointments distributed across the current week (Oct 13-19, 2025)
-- Monday (Oct 13) - 15 appointments
INSERT INTO appointments (id, patient_id, therapist_id, start_time, end_time, type, status, payment_status, price, observations, created_at) VALUES
  ('appt-demo-001', 'pac-demo-001', 'ther-demo-001', '2025-10-13 08:00:00', '2025-10-13 09:00:00', 'session', 'scheduled', 'pending', 120.00, 'Primeira sessão', NOW()),
  ('appt-demo-002', 'pac-demo-002', 'ther-demo-002', '2025-10-13 08:00:00', '2025-10-13 09:00:00', 'evaluation', 'scheduled', 'pending', 150.00, 'Avaliação neurológica', NOW()),
  ('appt-demo-003', 'pac-demo-003', 'ther-demo-003', '2025-10-13 08:30:00', '2025-10-13 09:30:00', 'session', 'scheduled', 'paid', 120.00, 'Sessão regular', NOW()),
  ('appt-demo-004', 'pac-demo-004', 'ther-demo-001', '2025-10-13 09:00:00', '2025-10-13 10:00:00', 'session', 'scheduled', 'pending', 120.00, 'Acompanhamento', NOW()),
  ('appt-demo-005', 'pac-demo-005', 'ther-demo-002', '2025-10-13 09:30:00', '2025-10-13 10:30:00', 'session', 'scheduled', 'paid', 120.00, 'Sessão regular', NOW()),
  ('appt-demo-006', 'pac-demo-006', 'ther-demo-003', '2025-10-13 10:00:00', '2025-10-13 11:00:00', 'session', 'scheduled', 'pending', 120.00, 'Treino funcional', NOW()),
  ('appt-demo-007', 'pac-demo-007', 'ther-demo-001', '2025-10-13 10:30:00', '2025-10-13 11:30:00', 'session', 'scheduled', 'paid', 120.00, 'Sessão regular', NOW()),
  ('appt-demo-008', 'pac-demo-008', 'ther-demo-002', '2025-10-13 11:00:00', '2025-10-13 12:00:00', 'session', 'scheduled', 'pending', 120.00, 'Acompanhamento', NOW()),
  ('appt-demo-009', 'pac-demo-009', 'ther-demo-003', '2025-10-13 11:30:00', '2025-10-13 12:30:00', 'session', 'scheduled', 'paid', 120.00, 'Sessão regular', NOW()),
  ('appt-demo-010', 'pac-demo-010', 'ther-demo-001', '2025-10-13 13:00:00', '2025-10-13 14:00:00', 'session', 'scheduled', 'pending', 120.00, 'Acompanhamento', NOW()),
  ('appt-demo-011', 'pac-demo-011', 'ther-demo-002', '2025-10-13 13:30:00', '2025-10-13 14:30:00', 'session', 'scheduled', 'paid', 120.00, 'Sessão regular', NOW()),
  ('appt-demo-012', 'pac-demo-012', 'ther-demo-003', '2025-10-13 14:00:00', '2025-10-13 15:00:00', 'session', 'scheduled', 'pending', 120.00, 'Treino funcional', NOW()),
  ('appt-demo-013', 'pac-demo-013', 'ther-demo-001', '2025-10-13 14:30:00', '2025-10-13 15:30:00', 'session', 'scheduled', 'paid', 120.00, 'Sessão regular', NOW()),
  ('appt-demo-014', 'pac-demo-014', 'ther-demo-002', '2025-10-13 15:00:00', '2025-10-13 16:00:00', 'session', 'scheduled', 'pending', 120.00, 'Acompanhamento', NOW()),
  ('appt-demo-015', 'pac-demo-015', 'ther-demo-003', '2025-10-13 15:30:00', '2025-10-13 16:30:00', 'session', 'scheduled', 'paid', 120.00, 'Sessão regular', NOW())
ON CONFLICT (id) DO NOTHING;

-- Tuesday (Oct 14) - 18 appointments
INSERT INTO appointments (id, patient_id, therapist_id, start_time, end_time, type, status, payment_status, price, observations, created_at) VALUES
  ('appt-demo-016', 'pac-demo-001', 'ther-demo-001', '2025-10-14 08:00:00', '2025-10-14 09:00:00', 'session', 'scheduled', 'paid', 120.00, 'Sessão regular', NOW()),
  ('appt-demo-017', 'pac-demo-002', 'ther-demo-002', '2025-10-14 08:30:00', '2025-10-14 09:30:00', 'session', 'scheduled', 'pending', 120.00, 'Acompanhamento', NOW()),
  ('appt-demo-018', 'pac-demo-003', 'ther-demo-003', '2025-10-14 09:00:00', '2025-10-14 10:00:00', 'session', 'scheduled', 'paid', 120.00, 'Sessão regular', NOW()),
  ('appt-demo-019', 'pac-demo-004', 'ther-demo-001', '2025-10-14 09:30:00', '2025-10-14 10:30:00', 'session', 'scheduled', 'pending', 120.00, 'Acompanhamento', NOW()),
  ('appt-demo-020', 'pac-demo-005', 'ther-demo-002', '2025-10-14 10:00:00', '2025-10-14 11:00:00', 'session', 'scheduled', 'paid', 120.00, 'Sessão regular', NOW()),
  ('appt-demo-021', 'pac-demo-006', 'ther-demo-003', '2025-10-14 10:30:00', '2025-10-14 11:30:00', 'session', 'scheduled', 'pending', 120.00, 'Treino funcional', NOW()),
  ('appt-demo-022', 'pac-demo-007', 'ther-demo-001', '2025-10-14 11:00:00', '2025-10-14 12:00:00', 'session', 'scheduled', 'paid', 120.00, 'Sessão regular', NOW()),
  ('appt-demo-023', 'pac-demo-008', 'ther-demo-002', '2025-10-14 11:30:00', '2025-10-14 12:30:00', 'session', 'scheduled', 'pending', 120.00, 'Acompanhamento', NOW()),
  ('appt-demo-024', 'pac-demo-009', 'ther-demo-003', '2025-10-14 13:00:00', '2025-10-14 14:00:00', 'session', 'scheduled', 'paid', 120.00, 'Sessão regular', NOW()),
  ('appt-demo-025', 'pac-demo-010', 'ther-demo-001', '2025-10-14 13:30:00', '2025-10-14 14:30:00', 'session', 'scheduled', 'pending', 120.00, 'Acompanhamento', NOW()),
  ('appt-demo-026', 'pac-demo-011', 'ther-demo-002', '2025-10-14 14:00:00', '2025-10-14 15:00:00', 'session', 'scheduled', 'paid', 120.00, 'Sessão regular', NOW()),
  ('appt-demo-027', 'pac-demo-012', 'ther-demo-003', '2025-10-14 14:30:00', '2025-10-14 15:30:00', 'session', 'scheduled', 'pending', 120.00, 'Treino funcional', NOW()),
  ('appt-demo-028', 'pac-demo-013', 'ther-demo-001', '2025-10-14 15:00:00', '2025-10-14 16:00:00', 'session', 'scheduled', 'paid', 120.00, 'Sessão regular', NOW()),
  ('appt-demo-029', 'pac-demo-014', 'ther-demo-002', '2025-10-14 15:30:00', '2025-10-14 16:30:00', 'session', 'scheduled', 'pending', 120.00, 'Acompanhamento', NOW()),
  ('appt-demo-030', 'pac-demo-015', 'ther-demo-003', '2025-10-14 16:00:00', '2025-10-14 17:00:00', 'session', 'scheduled', 'paid', 120.00, 'Sessão regular', NOW()),
  ('appt-demo-031', 'pac-demo-001', 'ther-demo-001', '2025-10-14 16:30:00', '2025-10-14 17:30:00', 'session', 'scheduled', 'pending', 120.00, 'Acompanhamento', NOW()),
  ('appt-demo-032', 'pac-demo-002', 'ther-demo-002', '2025-10-14 17:00:00', '2025-10-14 18:00:00', 'session', 'scheduled', 'paid', 120.00, 'Sessão regular', NOW()),
  ('appt-demo-033', 'pac-demo-003', 'ther-demo-003', '2025-10-14 17:30:00', '2025-10-14 18:30:00', 'session', 'scheduled', 'pending', 120.00, 'Treino funcional', NOW())
ON CONFLICT (id) DO NOTHING;

-- Wednesday (Oct 15) - 20 appointments (busiest day)
INSERT INTO appointments (id, patient_id, therapist_id, start_time, end_time, type, status, payment_status, price, observations, created_at) VALUES
  ('appt-demo-034', 'pac-demo-004', 'ther-demo-001', '2025-10-15 07:30:00', '2025-10-15 08:30:00', 'session', 'scheduled', 'paid', 120.00, 'Sessão regular', NOW()),
  ('appt-demo-035', 'pac-demo-005', 'ther-demo-002', '2025-10-15 08:00:00', '2025-10-15 09:00:00', 'session', 'scheduled', 'pending', 120.00, 'Acompanhamento', NOW()),
  ('appt-demo-036', 'pac-demo-006', 'ther-demo-003', '2025-10-15 08:30:00', '2025-10-15 09:30:00', 'session', 'scheduled', 'paid', 120.00, 'Sessão regular', NOW()),
  ('appt-demo-037', 'pac-demo-007', 'ther-demo-001', '2025-10-15 09:00:00', '2025-10-15 10:00:00', 'session', 'scheduled', 'pending', 120.00, 'Acompanhamento', NOW()),
  ('appt-demo-038', 'pac-demo-008', 'ther-demo-002', '2025-10-15 09:30:00', '2025-10-15 10:30:00', 'session', 'scheduled', 'paid', 120.00, 'Sessão regular', NOW()),
  ('appt-demo-039', 'pac-demo-009', 'ther-demo-003', '2025-10-15 10:00:00', '2025-10-15 11:00:00', 'session', 'scheduled', 'pending', 120.00, 'Treino funcional', NOW()),
  ('appt-demo-040', 'pac-demo-010', 'ther-demo-001', '2025-10-15 10:30:00', '2025-10-15 11:30:00', 'session', 'scheduled', 'paid', 120.00, 'Sessão regular', NOW()),
  ('appt-demo-041', 'pac-demo-011', 'ther-demo-002', '2025-10-15 11:00:00', '2025-10-15 12:00:00', 'session', 'scheduled', 'pending', 120.00, 'Acompanhamento', NOW()),
  ('appt-demo-042', 'pac-demo-012', 'ther-demo-003', '2025-10-15 11:30:00', '2025-10-15 12:30:00', 'session', 'scheduled', 'paid', 120.00, 'Sessão regular', NOW()),
  ('appt-demo-043', 'pac-demo-013', 'ther-demo-001', '2025-10-15 13:00:00', '2025-10-15 14:00:00', 'session', 'scheduled', 'pending', 120.00, 'Acompanhamento', NOW()),
  ('appt-demo-044', 'pac-demo-014', 'ther-demo-002', '2025-10-15 13:30:00', '2025-10-15 14:30:00', 'session', 'scheduled', 'paid', 120.00, 'Sessão regular', NOW()),
  ('appt-demo-045', 'pac-demo-015', 'ther-demo-003', '2025-10-15 14:00:00', '2025-10-15 15:00:00', 'session', 'scheduled', 'pending', 120.00, 'Treino funcional', NOW()),
  ('appt-demo-046', 'pac-demo-001', 'ther-demo-001', '2025-10-15 14:30:00', '2025-10-15 15:30:00', 'session', 'scheduled', 'paid', 120.00, 'Sessão regular', NOW()),
  ('appt-demo-047', 'pac-demo-002', 'ther-demo-002', '2025-10-15 15:00:00', '2025-10-15 16:00:00', 'session', 'scheduled', 'pending', 120.00, 'Acompanhamento', NOW()),
  ('appt-demo-048', 'pac-demo-003', 'ther-demo-003', '2025-10-15 15:30:00', '2025-10-15 16:30:00', 'session', 'scheduled', 'paid', 120.00, 'Sessão regular', NOW()),
  ('appt-demo-049', 'pac-demo-004', 'ther-demo-001', '2025-10-15 16:00:00', '2025-10-15 17:00:00', 'session', 'scheduled', 'pending', 120.00, 'Acompanhamento', NOW()),
  ('appt-demo-050', 'pac-demo-005', 'ther-demo-002', '2025-10-15 16:30:00', '2025-10-15 17:30:00', 'session', 'scheduled', 'paid', 120.00, 'Sessão regular', NOW()),
  ('appt-demo-051', 'pac-demo-006', 'ther-demo-003', '2025-10-15 17:00:00', '2025-10-15 18:00:00', 'session', 'scheduled', 'pending', 120.00, 'Treino funcional', NOW()),
  ('appt-demo-052', 'pac-demo-007', 'ther-demo-001', '2025-10-15 17:30:00', '2025-10-15 18:30:00', 'session', 'scheduled', 'paid', 120.00, 'Sessão regular', NOW()),
  ('appt-demo-053', 'pac-demo-008', 'ther-demo-002', '2025-10-15 18:00:00', '2025-10-15 19:00:00', 'session', 'scheduled', 'pending', 120.00, 'Acompanhamento', NOW())
ON CONFLICT (id) DO NOTHING;

-- Thursday (Oct 16) - 16 appointments
INSERT INTO appointments (id, patient_id, therapist_id, start_time, end_time, type, status, payment_status, price, observations, created_at) VALUES
  ('appt-demo-054', 'pac-demo-009', 'ther-demo-003', '2025-10-16 08:00:00', '2025-10-16 09:00:00', 'session', 'scheduled', 'paid', 120.00, 'Sessão regular', NOW()),
  ('appt-demo-055', 'pac-demo-010', 'ther-demo-001', '2025-10-16 08:30:00', '2025-10-16 09:30:00', 'session', 'scheduled', 'pending', 120.00, 'Acompanhamento', NOW()),
  ('appt-demo-056', 'pac-demo-011', 'ther-demo-002', '2025-10-16 09:00:00', '2025-10-16 10:00:00', 'session', 'scheduled', 'paid', 120.00, 'Sessão regular', NOW()),
  ('appt-demo-057', 'pac-demo-012', 'ther-demo-003', '2025-10-16 09:30:00', '2025-10-16 10:30:00', 'session', 'scheduled', 'pending', 120.00, 'Treino funcional', NOW()),
  ('appt-demo-058', 'pac-demo-013', 'ther-demo-001', '2025-10-16 10:00:00', '2025-10-16 11:00:00', 'session', 'scheduled', 'paid', 120.00, 'Sessão regular', NOW()),
  ('appt-demo-059', 'pac-demo-014', 'ther-demo-002', '2025-10-16 10:30:00', '2025-10-16 11:30:00', 'session', 'scheduled', 'pending', 120.00, 'Acompanhamento', NOW()),
  ('appt-demo-060', 'pac-demo-015', 'ther-demo-003', '2025-10-16 11:00:00', '2025-10-16 12:00:00', 'session', 'scheduled', 'paid', 120.00, 'Sessão regular', NOW()),
  ('appt-demo-061', 'pac-demo-001', 'ther-demo-001', '2025-10-16 11:30:00', '2025-10-16 12:30:00', 'session', 'scheduled', 'pending', 120.00, 'Acompanhamento', NOW()),
  ('appt-demo-062', 'pac-demo-002', 'ther-demo-002', '2025-10-16 13:00:00', '2025-10-16 14:00:00', 'session', 'scheduled', 'paid', 120.00, 'Sessão regular', NOW()),
  ('appt-demo-063', 'pac-demo-003', 'ther-demo-003', '2025-10-16 13:30:00', '2025-10-16 14:30:00', 'session', 'scheduled', 'pending', 120.00, 'Treino funcional', NOW()),
  ('appt-demo-064', 'pac-demo-004', 'ther-demo-001', '2025-10-16 14:00:00', '2025-10-16 15:00:00', 'session', 'scheduled', 'paid', 120.00, 'Sessão regular', NOW()),
  ('appt-demo-065', 'pac-demo-005', 'ther-demo-002', '2025-10-16 14:30:00', '2025-10-16 15:30:00', 'session', 'scheduled', 'pending', 120.00, 'Acompanhamento', NOW()),
  ('appt-demo-066', 'pac-demo-006', 'ther-demo-003', '2025-10-16 15:00:00', '2025-10-16 16:00:00', 'session', 'scheduled', 'paid', 120.00, 'Sessão regular', NOW()),
  ('appt-demo-067', 'pac-demo-007', 'ther-demo-001', '2025-10-16 15:30:00', '2025-10-16 16:30:00', 'session', 'scheduled', 'pending', 120.00, 'Acompanhamento', NOW()),
  ('appt-demo-068', 'pac-demo-008', 'ther-demo-002', '2025-10-16 16:00:00', '2025-10-16 17:00:00', 'session', 'scheduled', 'paid', 120.00, 'Sessão regular', NOW()),
  ('appt-demo-069', 'pac-demo-009', 'ther-demo-003', '2025-10-16 16:30:00', '2025-10-16 17:30:00', 'session', 'scheduled', 'pending', 120.00, 'Treino funcional', NOW())
ON CONFLICT (id) DO NOTHING;

-- Friday (Oct 17) - 12 appointments
INSERT INTO appointments (id, patient_id, therapist_id, start_time, end_time, type, status, payment_status, price, observations, created_at) VALUES
  ('appt-demo-070', 'pac-demo-010', 'ther-demo-001', '2025-10-17 08:00:00', '2025-10-17 09:00:00', 'session', 'scheduled', 'paid', 120.00, 'Sessão regular', NOW()),
  ('appt-demo-071', 'pac-demo-011', 'ther-demo-002', '2025-10-17 08:30:00', '2025-10-17 09:30:00', 'session', 'scheduled', 'pending', 120.00, 'Acompanhamento', NOW()),
  ('appt-demo-072', 'pac-demo-012', 'ther-demo-003', '2025-10-17 09:00:00', '2025-10-17 10:00:00', 'session', 'scheduled', 'paid', 120.00, 'Sessão regular', NOW()),
  ('appt-demo-073', 'pac-demo-013', 'ther-demo-001', '2025-10-17 09:30:00', '2025-10-17 10:30:00', 'session', 'scheduled', 'pending', 120.00, 'Acompanhamento', NOW()),
  ('appt-demo-074', 'pac-demo-014', 'ther-demo-002', '2025-10-17 10:00:00', '2025-10-17 11:00:00', 'session', 'scheduled', 'paid', 120.00, 'Sessão regular', NOW()),
  ('appt-demo-075', 'pac-demo-015', 'ther-demo-003', '2025-10-17 10:30:00', '2025-10-17 11:30:00', 'session', 'scheduled', 'pending', 120.00, 'Treino funcional', NOW()),
  ('appt-demo-076', 'pac-demo-001', 'ther-demo-001', '2025-10-17 11:00:00', '2025-10-17 12:00:00', 'session', 'scheduled', 'paid', 120.00, 'Sessão regular', NOW()),
  ('appt-demo-077', 'pac-demo-002', 'ther-demo-002', '2025-10-17 11:30:00', '2025-10-17 12:30:00', 'session', 'scheduled', 'pending', 120.00, 'Acompanhamento', NOW()),
  ('appt-demo-078', 'pac-demo-003', 'ther-demo-003', '2025-10-17 13:00:00', '2025-10-17 14:00:00', 'session', 'scheduled', 'paid', 120.00, 'Sessão regular', NOW()),
  ('appt-demo-079', 'pac-demo-004', 'ther-demo-001', '2025-10-17 13:30:00', '2025-10-17 14:30:00', 'session', 'scheduled', 'pending', 120.00, 'Acompanhamento', NOW()),
  ('appt-demo-080', 'pac-demo-005', 'ther-demo-002', '2025-10-17 14:00:00', '2025-10-17 15:00:00', 'session', 'scheduled', 'paid', 120.00, 'Sessão regular', NOW()),
  ('appt-demo-081', 'pac-demo-006', 'ther-demo-003', '2025-10-17 14:30:00', '2025-10-17 15:30:00', 'session', 'scheduled', 'pending', 120.00, 'Treino funcional', NOW())
ON CONFLICT (id) DO NOTHING;

-- Saturday (Oct 18) - 8 appointments
INSERT INTO appointments (id, patient_id, therapist_id, start_time, end_time, type, status, payment_status, price, observations, created_at) VALUES
  ('appt-demo-082', 'pac-demo-007', 'ther-demo-001', '2025-10-18 08:00:00', '2025-10-18 09:00:00', 'session', 'scheduled', 'paid', 120.00, 'Sessão regular', NOW()),
  ('appt-demo-083', 'pac-demo-008', 'ther-demo-002', '2025-10-18 08:30:00', '2025-10-18 09:30:00', 'session', 'scheduled', 'pending', 120.00, 'Acompanhamento', NOW()),
  ('appt-demo-084', 'pac-demo-009', 'ther-demo-003', '2025-10-18 09:00:00', '2025-10-18 10:00:00', 'session', 'scheduled', 'paid', 120.00, 'Sessão regular', NOW()),
  ('appt-demo-085', 'pac-demo-010', 'ther-demo-001', '2025-10-18 09:30:00', '2025-10-18 10:30:00', 'session', 'scheduled', 'pending', 120.00, 'Acompanhamento', NOW()),
  ('appt-demo-086', 'pac-demo-011', 'ther-demo-002', '2025-10-18 10:00:00', '2025-10-18 11:00:00', 'session', 'scheduled', 'paid', 120.00, 'Sessão regular', NOW()),
  ('appt-demo-087', 'pac-demo-012', 'ther-demo-003', '2025-10-18 10:30:00', '2025-10-18 11:30:00', 'session', 'scheduled', 'pending', 120.00, 'Treino funcional', NOW()),
  ('appt-demo-088', 'pac-demo-013', 'ther-demo-001', '2025-10-18 11:00:00', '2025-10-18 12:00:00', 'session', 'scheduled', 'paid', 120.00, 'Sessão regular', NOW()),
  ('appt-demo-089', 'pac-demo-014', 'ther-demo-002', '2025-10-18 11:30:00', '2025-10-18 12:30:00', 'session', 'scheduled', 'pending', 120.00, 'Acompanhamento', NOW())
ON CONFLICT (id) DO NOTHING;

-- Insert intentional conflicts for testing
INSERT INTO appointments (id, patient_id, therapist_id, start_time, end_time, type, status, payment_status, price, observations, has_conflict, conflict_reason, created_at) VALUES
  ('appt-demo-conflict-001', 'pac-demo-001', 'ther-demo-001', '2025-10-14 10:00:00', '2025-10-14 11:00:00', 'session', 'scheduled', 'pending', 120.00, 'CONFLITO: Paciente com outro agendamento no mesmo horário', true, 'Paciente com outro agendamento no mesmo horário', NOW()),
  ('appt-demo-conflict-002', 'pac-demo-001', 'ther-demo-002', '2025-10-14 10:30:00', '2025-10-14 11:30:00', 'session', 'scheduled', 'pending', 120.00, 'CONFLITO: Horário sobreposto', true, 'Horário sobreposto', NOW()),
  ('appt-demo-conflict-003', 'pac-demo-005', 'ther-demo-001', '2025-10-16 09:00:00', '2025-10-16 10:00:00', 'session', 'scheduled', 'paid', 120.00, 'CONFLITO: Terapeuta com múltiplos agendamentos', true, 'Terapeuta com múltiplos agendamentos simultâneos', NOW()),
  ('appt-demo-conflict-004', 'pac-demo-005', 'ther-demo-001', '2025-10-16 09:30:00', '2025-10-16 10:30:00', 'session', 'scheduled', 'pending', 120.00, 'CONFLITO: Terapeuta com múltiplos agendamentos', true, 'Terapeuta com múltiplos agendamentos simultâneos', NOW())
ON CONFLICT (id) DO NOTHING;

-- Insert 5 waitlist entries
INSERT INTO waitlist (id, patient_id, preferred_therapist_id, preferred_days, urgency, notes, created_at) VALUES
  ('wait-demo-001', 'pac-demo-006', 'ther-demo-001', '{monday,wednesday,friday}', 'high', 'Dor aguda no joelho', NOW()),
  ('wait-demo-002', 'pac-demo-007', 'ther-demo-002', '{tuesday,thursday}', 'medium', 'Acompanhamento neurológico', NOW()),
  ('wait-demo-003', 'pac-demo-008', 'ther-demo-003', '{monday,wednesday,friday}', 'high', 'Lesão esportiva', NOW()),
  ('wait-demo-004', 'pac-demo-009', 'ther-demo-001', '{tuesday,thursday}', 'low', 'Check-up preventivo', NOW()),
  ('wait-demo-005', 'pac-demo-010', 'ther-demo-002', '{monday,wednesday,friday}', 'medium', 'Reabilitação pós-cirúrgica', NOW())
ON CONFLICT (id) DO NOTHING;

-- Summary
SELECT 
  'Migration completed successfully!' as status,
  (SELECT COUNT(*) FROM patients WHERE id LIKE 'pac-demo-%') as patients_created,
  (SELECT COUNT(*) FROM therapists WHERE id LIKE 'ther-demo-%') as therapists_created,
  (SELECT COUNT(*) FROM appointments WHERE id LIKE 'appt-demo-%') as appointments_created,
  (SELECT COUNT(*) FROM appointments WHERE has_conflict = true AND id LIKE 'appt-demo-%') as conflicts_created,
  (SELECT COUNT(*) FROM waitlist WHERE id LIKE 'wait-demo-%') as waitlist_entries_created;

