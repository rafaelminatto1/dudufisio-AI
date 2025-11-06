-- Verificar se a tabela clinical_materials existe
SELECT EXISTS (
   SELECT FROM information_schema.tables 
   WHERE table_schema = 'public' 
   AND table_name = 'clinical_materials'
);

-- Ver todas as tabelas que começam com 'clinical'
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE 'clinical%'
ORDER BY table_name;

-- Se a tabela existir, ver sua estrutura
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'clinical_materials'
ORDER BY ordinal_position;

