-- Migration: Adicionar colunas de condutas estruturadas
-- Data: 05/11/2025
-- Descrição: Adiciona suporte para condutas estruturadas e categorizadas no campo P - Plano

-- Adicionar coluna conducts (JSONB array)
ALTER TABLE session_evolutions 
ADD COLUMN IF NOT EXISTS conducts JSONB DEFAULT '[]'::jsonb;

-- Adicionar coluna para observações gerais do plano
ALTER TABLE session_evolutions 
ADD COLUMN IF NOT EXISTS plan_general_notes TEXT;

-- Criar índice GIN para permitir queries eficientes em conducts
CREATE INDEX IF NOT EXISTS idx_session_evolutions_conducts_gin 
ON session_evolutions USING gin(conducts);

-- Adicionar comentários para documentação
COMMENT ON COLUMN session_evolutions.conducts IS 'Array de condutas estruturadas (categoria, nome, detalhes, duração, equipamento, notas)';
COMMENT ON COLUMN session_evolutions.plan_general_notes IS 'Observações gerais sobre o plano de tratamento';

-- Nota: O campo 'plan' (TEXT) existente é mantido para compatibilidade
-- e será automaticamente populado com a versão em texto das conducts

