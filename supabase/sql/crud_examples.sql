INSERT INTO patients (id, full_name, phone) VALUES ('test-patient-id', 'Paciente Teste', '+5511999999999');
UPDATE patients SET phone = '+5511988888888' WHERE id = 'test-patient-id';
DELETE FROM patients WHERE id = 'test-patient-id';
