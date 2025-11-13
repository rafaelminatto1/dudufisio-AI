-- Padronização de nomenclatura via Views (migração incremental)
-- Não altera tabelas originais; cria views com nomes padronizados em pt-BR snake_case

CREATE OR REPLACE VIEW paciente_registros AS
SELECT 
  id,
  full_name       AS nome_completo,
  birth_date      AS data_nascimento,
  phone           AS telefone_contato,
  created_at      AS criado_em,
  updated_at      AS atualizado_em
FROM patients;
CREATE OR REPLACE VIEW agendamento_status AS
SELECT 
  id,
  appointment_id  AS agendamento_id,
  status,
  reason          AS motivo,
  changed_at      AS alterado_em
FROM appointment_status;
CREATE OR REPLACE VIEW prescricoes_exercicios AS
SELECT 
  id,
  patient_id      AS paciente_id,
  exercise_id     AS exercicio_id,
  sets            AS series,
  reps            AS repeticoes,
  frequency       AS frequencia,
  notes           AS observacoes,
  created_at      AS criado_em
FROM exercise_prescriptions;
COMMENT ON VIEW paciente_registros IS 'View padronizada para pacientes (pt-BR snake_case)';
COMMENT ON VIEW agendamento_status IS 'View padronizada para status de agendamentos';
COMMENT ON VIEW prescricoes_exercicios IS 'View padronizada para prescrições de exercícios';
