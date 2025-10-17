-- =====================================================
-- Enable Realtime for notifications table
-- =====================================================

-- Habilitar publicação de eventos da tabela notifications
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;

-- Comentário para documentação
COMMENT ON TABLE notifications IS 'Notifications table with Realtime enabled for live updates in the frontend';
