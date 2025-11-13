-- Enable Realtime for appointments table
-- This allows real-time subscriptions to track INSERT, UPDATE, and DELETE operations

-- Habilitar Realtime na tabela appointments
ALTER PUBLICATION supabase_realtime ADD TABLE appointments;
-- Verificar se foi aplicado corretamente
-- SELECT * FROM pg_publication_tables WHERE pubname = 'supabase_realtime';

-- Comentário: Esta migration habilita sincronização em tempo real para a tabela appointments
-- permitindo que múltiplos usuários vejam atualizações instantaneamente na agenda;
