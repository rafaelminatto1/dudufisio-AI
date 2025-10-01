-- ============================================================================
-- MIGRAÇÃO: SISTEMA AVANÇADO DE ALERTAS E NOTIFICAÇÕES
-- Data: 2025-01-27
-- Descrição: Sistema inteligente de alertas com automação e notificações
-- ============================================================================

BEGIN;

-- ============================================================================
-- TABELA DE CONFIGURAÇÕES DE ALERTAS AUTOMÁTICAS
-- ============================================================================
CREATE TABLE IF NOT EXISTS auto_alert_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_name VARCHAR(255) NOT NULL,
  rule_type VARCHAR(50) NOT NULL CHECK (rule_type IN (
    'low_stock', 'critical_stock', 'expiring_soon', 'expired', 'overdue_order',
    'high_consumption', 'low_turnover', 'price_change', 'supplier_delay'
  )),
  conditions JSONB NOT NULL, -- condições para disparar o alerta
  severity VARCHAR(20) DEFAULT 'medium' CHECK (severity IN (
    'low', 'medium', 'high', 'critical'
  )),
  is_active BOOLEAN DEFAULT true,
  notification_channels TEXT[] DEFAULT '{"in_app"}', -- in_app, email, sms, slack
  escalation_rules JSONB, -- regras de escalação
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- TABELA DE HISTÓRICO DE ALERTAS
-- ============================================================================
CREATE TABLE IF NOT EXISTS alert_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_id UUID REFERENCES supply_alerts(id) ON DELETE CASCADE,
  action VARCHAR(50) NOT NULL CHECK (action IN (
    'created', 'read', 'resolved', 'escalated', 'dismissed', 'reopened'
  )),
  performed_by UUID REFERENCES users(id),
  performed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  notes TEXT,
  metadata JSONB DEFAULT '{}'
);

-- ============================================================================
-- TABELA DE NOTIFICAÇÕES
-- ============================================================================
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN (
    'alert', 'reminder', 'system', 'task', 'supply', 'order'
  )),
  priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN (
    'low', 'medium', 'high', 'urgent'
  )),
  channel VARCHAR(20) DEFAULT 'in_app' CHECK (channel IN (
    'in_app', 'email', 'sms', 'push', 'slack'
  )),
  is_read BOOLEAN DEFAULT false,
  is_sent BOOLEAN DEFAULT false,
  sent_at TIMESTAMP WITH TIME ZONE,
  read_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  related_entity_type VARCHAR(50), -- 'supply', 'task', 'order', 'alert'
  related_entity_id UUID,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- TABELA DE CONFIGURAÇÕES DE NOTIFICAÇÃO POR USUÁRIO
-- ============================================================================
CREATE TABLE IF NOT EXISTS user_notification_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  notification_type VARCHAR(50) NOT NULL,
  channel VARCHAR(20) NOT NULL,
  is_enabled BOOLEAN DEFAULT true,
  quiet_hours_start TIME, -- início do horário silencioso
  quiet_hours_end TIME,   -- fim do horário silencioso
  frequency VARCHAR(20) DEFAULT 'immediate' CHECK (frequency IN (
    'immediate', 'hourly', 'daily', 'weekly'
  )),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, notification_type, channel)
);

-- ============================================================================
-- TABELA DE ALERTAS AGENDADOS (CRON JOBS)
-- ============================================================================
CREATE TABLE IF NOT EXISTS scheduled_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_id UUID REFERENCES auto_alert_rules(id) ON DELETE CASCADE,
  supply_id UUID REFERENCES supplies(id) ON DELETE CASCADE,
  scheduled_for TIMESTAMP WITH TIME ZONE NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN (
    'pending', 'processing', 'completed', 'failed', 'cancelled'
  )),
  attempts INTEGER DEFAULT 0,
  max_attempts INTEGER DEFAULT 3,
  last_attempt_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- ÍNDICES PARA PERFORMANCE
-- ============================================================================

-- Índices para auto_alert_rules
CREATE INDEX IF NOT EXISTS idx_auto_alert_rules_type_active 
  ON auto_alert_rules(rule_type, is_active);

CREATE INDEX IF NOT EXISTS idx_auto_alert_rules_severity 
  ON auto_alert_rules(severity);

-- Índices para alert_history
CREATE INDEX IF NOT EXISTS idx_alert_history_alert 
  ON alert_history(alert_id);

CREATE INDEX IF NOT EXISTS idx_alert_history_action_date 
  ON alert_history(action, performed_at);

-- Índices para notifications (todos já existem)

-- Índices para user_notification_settings
CREATE INDEX IF NOT EXISTS idx_user_notification_settings_user 
  ON user_notification_settings(user_id);

-- Índices para scheduled_alerts
CREATE INDEX IF NOT EXISTS idx_scheduled_alerts_scheduled_for 
  ON scheduled_alerts(scheduled_for) WHERE status = 'pending';

CREATE INDEX IF NOT EXISTS idx_scheduled_alerts_status 
  ON scheduled_alerts(status);

-- ============================================================================
-- FUNÇÕES AUXILIARES PARA ALERTAS
-- ============================================================================

-- Função para verificar alertas de estoque baixo
CREATE OR REPLACE FUNCTION check_low_stock_alerts()
RETURNS INTEGER AS $$
DECLARE
  alert_count INTEGER := 0;
  supply_record RECORD;
  alert_id UUID;
BEGIN
  -- Verificar estoque baixo
  FOR supply_record IN 
    SELECT id, name, current_stock, minimum_stock, category
    FROM supplies 
    WHERE is_active = true 
      AND current_stock <= minimum_stock
      AND current_stock > 0
  LOOP
    -- Verificar se já existe alerta não resolvido
    IF NOT EXISTS (
      SELECT 1 FROM supply_alerts 
      WHERE supply_id = supply_record.id 
        AND alert_type = 'low_stock' 
        AND is_resolved = false
    ) THEN
      -- Criar novo alerta
      INSERT INTO supply_alerts (
        supply_id, alert_type, severity, message, created_at
      ) VALUES (
        supply_record.id,
        'low_stock',
        CASE 
          WHEN supply_record.current_stock = 0 THEN 'critical'
          WHEN supply_record.current_stock <= (supply_record.minimum_stock * 0.5) THEN 'high'
          ELSE 'medium'
        END,
        'Estoque baixo: ' || supply_record.current_stock || ' unidades restantes (mínimo: ' || supply_record.minimum_stock || ')',
        NOW()
      ) RETURNING id INTO alert_id;
      
      alert_count := alert_count + 1;
    END IF;
  END LOOP;
  
  RETURN alert_count;
END;
$$ LANGUAGE plpgsql;

-- Função para verificar alertas de vencimento
CREATE OR REPLACE FUNCTION check_expiration_alerts()
RETURNS INTEGER AS $$
DECLARE
  alert_count INTEGER := 0;
  supply_record RECORD;
  days_until_expiry INTEGER;
  alert_id UUID;
BEGIN
  -- Verificar produtos próximos ao vencimento
  FOR supply_record IN 
    SELECT id, name, expiration_date, current_stock
    FROM supplies 
    WHERE is_active = true 
      AND expiration_date IS NOT NULL
      AND current_stock > 0
  LOOP
    days_until_expiry := (supply_record.expiration_date - CURRENT_DATE);
    
    -- Verificar se está próximo do vencimento (30, 15, 7 dias)
    IF days_until_expiry <= 30 AND days_until_expiry >= 0 THEN
      -- Verificar se já existe alerta não resolvido
      IF NOT EXISTS (
        SELECT 1 FROM supply_alerts 
        WHERE supply_id = supply_record.id 
          AND alert_type = 'expiring' 
          AND is_resolved = false
      ) THEN
        -- Criar novo alerta
        INSERT INTO supply_alerts (
          supply_id, alert_type, severity, message, created_at
        ) VALUES (
          supply_record.id,
          'expiring',
          CASE 
            WHEN days_until_expiry <= 7 THEN 'high'
            WHEN days_until_expiry <= 15 THEN 'medium'
            ELSE 'low'
          END,
          'Produto próximo ao vencimento: ' || supply_record.name || ' vence em ' || days_until_expiry || ' dias',
          NOW()
        ) RETURNING id INTO alert_id;
        
        alert_count := alert_count + 1;
      END IF;
    END IF;
    
    -- Verificar produtos vencidos
    IF days_until_expiry < 0 THEN
      IF NOT EXISTS (
        SELECT 1 FROM supply_alerts 
        WHERE supply_id = supply_record.id 
          AND alert_type = 'expired' 
          AND is_resolved = false
      ) THEN
        INSERT INTO supply_alerts (
          supply_id, alert_type, severity, message, created_at
        ) VALUES (
          supply_record.id,
          'expired',
          'critical',
          'PRODUTO VENCIDO: ' || supply_record.name || ' venceu há ' || ABS(days_until_expiry) || ' dias',
          NOW()
        ) RETURNING id INTO alert_id;
        
        alert_count := alert_count + 1;
      END IF;
    END IF;
  END LOOP;
  
  RETURN alert_count;
END;
$$ LANGUAGE plpgsql;

-- Função para verificar pedidos em atraso
CREATE OR REPLACE FUNCTION check_overdue_orders()
RETURNS INTEGER AS $$
DECLARE
  alert_count INTEGER := 0;
  order_record RECORD;
  days_overdue INTEGER;
  alert_id UUID;
BEGIN
  FOR order_record IN 
    SELECT po.id, po.order_number, po.expected_delivery, s.name as supplier_name
    FROM purchase_orders po
    JOIN suppliers s ON po.supplier_id = s.id
    WHERE po.status IN ('ordered', 'partial')
      AND po.expected_delivery < CURRENT_DATE
      AND po.expected_delivery IS NOT NULL
  LOOP
    days_overdue := (CURRENT_DATE - order_record.expected_delivery);
    
    -- Criar alerta de pedido em atraso
    INSERT INTO supply_alerts (
      supply_id, alert_type, severity, message, created_at
    ) VALUES (
      NULL, -- não específico de um insumo
      'overdue_order',
      CASE 
        WHEN days_overdue > 7 THEN 'critical'
        WHEN days_overdue > 3 THEN 'high'
        ELSE 'medium'
      END,
      'Pedido em atraso: ' || order_record.order_number || ' (Fornecedor: ' || order_record.supplier_name || ') - ' || days_overdue || ' dias de atraso',
      NOW()
    ) RETURNING id INTO alert_id;
    
    alert_count := alert_count + 1;
  END LOOP;
  
  RETURN alert_count;
END;
$$ LANGUAGE plpgsql;

-- Função principal para executar todas as verificações de alertas
CREATE OR REPLACE FUNCTION run_alert_checks()
RETURNS TABLE (
  check_type TEXT,
  alerts_created INTEGER,
  execution_time INTERVAL
) AS $$
DECLARE
  start_time TIMESTAMP;
  end_time TIMESTAMP;
  low_stock_count INTEGER;
  expiration_count INTEGER;
  overdue_count INTEGER;
BEGIN
  -- Verificar estoque baixo
  start_time := clock_timestamp();
  SELECT check_low_stock_alerts() INTO low_stock_count;
  end_time := clock_timestamp();
  
  RETURN QUERY SELECT 
    'low_stock'::TEXT,
    low_stock_count,
    end_time - start_time;
  
  -- Verificar vencimentos
  start_time := clock_timestamp();
  SELECT check_expiration_alerts() INTO expiration_count;
  end_time := clock_timestamp();
  
  RETURN QUERY SELECT 
    'expiration'::TEXT,
    expiration_count,
    end_time - start_time;
  
  -- Verificar pedidos em atraso
  start_time := clock_timestamp();
  SELECT check_overdue_orders() INTO overdue_count;
  end_time := clock_timestamp();
  
  RETURN QUERY SELECT 
    'overdue_orders'::TEXT,
    overdue_count,
    end_time - start_time;
END;
$$ LANGUAGE plpgsql;

-- Função para criar notificações baseadas em alertas
CREATE OR REPLACE FUNCTION create_notifications_for_alert(alert_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
  alert_record RECORD;
  user_record RECORD;
  notification_count INTEGER := 0;
BEGIN
  -- Buscar dados do alerta
  SELECT sa.*, s.name as supply_name
  FROM supply_alerts sa
  LEFT JOIN supplies s ON sa.supply_id = s.id
  WHERE sa.id = alert_uuid
  INTO alert_record;
  
  IF NOT FOUND THEN
    RETURN 0;
  END IF;
  
  -- Buscar usuários que devem receber notificações
  FOR user_record IN 
    SELECT DISTINCT u.id, u.email, u.full_name
    FROM users u
    WHERE u.role IN ('admin', 'manager', 'therapist')
  LOOP
    -- Criar notificação in-app
    INSERT INTO notifications (
      user_id, title, message, type, priority, channel,
      related_entity_type, related_entity_id, expires_at
    ) VALUES (
      user_record.id,
      CASE alert_record.alert_type
        WHEN 'low_stock' THEN 'Estoque Baixo'
        WHEN 'critical_stock' THEN 'Estoque Crítico'
        WHEN 'expiring' THEN 'Produto Próximo ao Vencimento'
        WHEN 'expired' THEN 'PRODUTO VENCIDO'
        WHEN 'overdue_order' THEN 'Pedido em Atraso'
        ELSE 'Alerta de Insumo'
      END,
      alert_record.message,
      'alert',
      alert_record.severity,
      'in_app',
      'alert',
      alert_record.id,
      NOW() + INTERVAL '7 days'
    );
    
    notification_count := notification_count + 1;
  END LOOP;
  
  RETURN notification_count;
END;
$$ LANGUAGE plpgsql;

-- Trigger para criar notificações automaticamente quando um alerta é criado
CREATE OR REPLACE FUNCTION trigger_create_alert_notifications()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM create_notifications_for_alert(NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_alert_notifications
  AFTER INSERT ON supply_alerts
  FOR EACH ROW EXECUTE FUNCTION trigger_create_alert_notifications();

-- ============================================================================
-- HABILITAR RLS
-- ============================================================================

ALTER TABLE auto_alert_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE alert_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_notification_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheduled_alerts ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- POLÍTICAS RLS
-- ============================================================================

-- Políticas para auto_alert_rules
CREATE POLICY "Users can view all alert rules" ON auto_alert_rules
  FOR SELECT USING (true);

CREATE POLICY "Users can manage alert rules" ON auto_alert_rules
  FOR ALL USING (auth.uid() IS NOT NULL);

-- Políticas para alert_history
CREATE POLICY "Users can view all alert history" ON alert_history
  FOR SELECT USING (true);

CREATE POLICY "Users can insert alert history" ON alert_history
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Políticas para notifications
CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "System can insert notifications" ON notifications
  FOR INSERT WITH CHECK (true);

-- Políticas para user_notification_settings
CREATE POLICY "Users can manage own notification settings" ON user_notification_settings
  FOR ALL USING (user_id = auth.uid());

-- Políticas para scheduled_alerts
CREATE POLICY "Users can view all scheduled alerts" ON scheduled_alerts
  FOR SELECT USING (true);

CREATE POLICY "System can manage scheduled alerts" ON scheduled_alerts
  FOR ALL WITH CHECK (true);

-- ============================================================================
-- DADOS INICIAIS - REGRAS DE ALERTA PADRÃO
-- ============================================================================

-- Inserir regras de alerta padrão
INSERT INTO auto_alert_rules (rule_name, rule_type, conditions, severity, is_active, created_by) VALUES
('Estoque Baixo Padrão', 'low_stock', '{"condition": "current_stock <= minimum_stock", "threshold": 1}', 'medium', true, NULL),
('Estoque Crítico', 'critical_stock', '{"condition": "current_stock = 0", "threshold": 0}', 'critical', true, NULL),
('Vencimento em 30 dias', 'expiring_soon', '{"condition": "expiration_date <= CURRENT_DATE + INTERVAL ''30 days''", "threshold": 30}', 'low', true, NULL),
('Vencimento em 15 dias', 'expiring_soon', '{"condition": "expiration_date <= CURRENT_DATE + INTERVAL ''15 days''", "threshold": 15}', 'medium', true, NULL),
('Vencimento em 7 dias', 'expiring_soon', '{"condition": "expiration_date <= CURRENT_DATE + INTERVAL ''7 days''", "threshold": 7}', 'high', true, NULL),
('Produto Vencido', 'expired', '{"condition": "expiration_date < CURRENT_DATE", "threshold": 0}', 'critical', true, NULL),
('Pedido em Atraso', 'overdue_order', '{"condition": "expected_delivery < CURRENT_DATE AND status IN (''ordered'', ''partial'')", "threshold": 1}', 'medium', true, NULL)
ON CONFLICT DO NOTHING;

-- Configurações de notificação padrão para usuários
INSERT INTO user_notification_settings (user_id, notification_type, channel, is_enabled, frequency) 
SELECT 
  u.id,
  'alert',
  'in_app',
  true,
  'immediate'
FROM users u
WHERE u.role IN ('admin', 'manager', 'therapist')
ON CONFLICT (user_id, notification_type, channel) DO NOTHING;

COMMIT;
