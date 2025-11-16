-- Teste 1: Validar código de acesso
SELECT * FROM validate_access_code('EYNFFQ');

-- Teste 2: Ver dados do paciente
SELECT p.id, p.full_name, p.email, p.phone 
FROM patients p
JOIN patient_access_codes pac ON p.id = pac.patient_id
WHERE pac.access_code = 'EYNFFQ';

-- Teste 3: Contar exercícios prescritos
SELECT COUNT(*) as total_exercises
FROM patient_exercises pe
WHERE pe.patient_id = (
  SELECT patient_id FROM patient_access_codes WHERE access_code = 'EYNFFQ'
);

-- Teste 4: Ver exercícios com vídeos
SELECT 
  pe.exercise_name,
  pe.sets,
  pe.reps,
  pe.frequency_per_week,
  ev.title as video_title,
  ev.video_url,
  ev.category
FROM patient_exercises pe
LEFT JOIN exercise_videos ev ON pe.exercise_video_id = ev.id
WHERE pe.patient_id = (
  SELECT patient_id FROM patient_access_codes WHERE access_code = 'EYNFFQ'
)
AND pe.is_active = TRUE;

