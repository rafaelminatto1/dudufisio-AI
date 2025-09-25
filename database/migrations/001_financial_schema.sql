-- Financial System Database Schema with Audit Trails
-- PostgreSQL/Supabase Implementation

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create custom types
CREATE TYPE transaction_type AS ENUM (
    'package_purchase', 
    'single_session', 
    'installment', 
    'refund', 
    'adjustment', 
    'expense'
);

CREATE TYPE transaction_status AS ENUM (
    'pending', 
    'paid', 
    'overdue', 
    'cancelled', 
    'refunded'
);

CREATE TYPE package_type AS ENUM (
    'sessions_10', 
    'sessions_20', 
    'monthly_unlimited', 
    'evaluation_only'
);

CREATE TYPE package_status AS ENUM (
    'active', 
    'expired', 
    'cancelled', 
    'suspended'
);

CREATE TYPE invoice_status AS ENUM (
    'draft', 
    'issued', 
    'paid', 
    'cancelled', 
    'overdue'
);

CREATE TYPE payment_plan_status AS ENUM (
    'active', 
    'completed', 
    'cancelled', 
    'suspended', 
    'defaulted'
);

CREATE TYPE installment_status AS ENUM (
    'pending', 
    'paid', 
    'overdue', 
    'cancelled'
);

-- Main financial transactions table
CREATE TABLE financial_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL,
    type transaction_type NOT NULL,
    amount DECIMAL(12,2) NOT NULL CHECK (amount >= 0),
    currency VARCHAR(3) NOT NULL DEFAULT 'BRL',
    payment_method JSONB NOT NULL,
    installments INTEGER DEFAULT 1 CHECK (installments >= 1 AND installments <= 12),
    installment_number INTEGER DEFAULT 1 CHECK (installment_number >= 1),
    due_date TIMESTAMP WITH TIME ZONE NOT NULL,
    paid_date TIMESTAMP WITH TIME ZONE,
    status transaction_status NOT NULL DEFAULT 'pending',
    gateway_transaction_id VARCHAR(255),
    gateway_response JSONB,
    description TEXT,
    metadata JSONB DEFAULT '{}',
    
    -- Fiscal information
    fiscal_document_number VARCHAR(50),
    tax_amount DECIMAL(10,2) DEFAULT 0 CHECK (tax_amount >= 0),
    net_amount DECIMAL(12,2) GENERATED ALWAYS AS (amount - COALESCE(tax_amount, 0)) STORED,
    
    -- Audit fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID NOT NULL,
    updated_by UUID,
    version INTEGER DEFAULT 1,
    
    -- Constraints
    CONSTRAINT valid_installment_number CHECK (installment_number <= installments),
    CONSTRAINT valid_paid_date CHECK (paid_date IS NULL OR paid_date >= created_at),
    CONSTRAINT valid_due_date CHECK (due_date >= created_at - INTERVAL '1 day')
);

-- Patient packages table
CREATE TABLE patient_packages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL,
    transaction_id UUID NOT NULL REFERENCES financial_transactions(id),
    package_type package_type NOT NULL,
    total_sessions INTEGER NOT NULL CHECK (total_sessions > 0),
    used_sessions INTEGER DEFAULT 0 CHECK (used_sessions >= 0),
    remaining_sessions INTEGER GENERATED ALWAYS AS (total_sessions - used_sessions) STORED,
    purchase_date DATE NOT NULL DEFAULT CURRENT_DATE,
    expiry_date DATE NOT NULL,
    status package_status DEFAULT 'active',
    
    -- Audit fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_sessions CHECK (used_sessions <= total_sessions),
    CONSTRAINT valid_expiry CHECK (expiry_date > purchase_date),
    CONSTRAINT unique_active_package_per_patient UNIQUE (patient_id, status) 
        WHERE status = 'active'
);

-- Invoices table
CREATE TABLE invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL,
    transaction_ids UUID[] NOT NULL,
    invoice_number VARCHAR(50) UNIQUE,
    issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
    due_date DATE NOT NULL,
    line_items JSONB NOT NULL,
    subtotal DECIMAL(12,2) NOT NULL CHECK (subtotal >= 0),
    discount_amount DECIMAL(12,2) DEFAULT 0 CHECK (discount_amount >= 0),
    tax_amount DECIMAL(12,2) DEFAULT 0 CHECK (tax_amount >= 0),
    total_amount DECIMAL(12,2) GENERATED ALWAYS AS (
        subtotal - discount_amount + tax_amount
    ) STORED,
    notes TEXT,
    status invoice_status DEFAULT 'draft',
    
    -- Audit fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID NOT NULL,
    
    -- Constraints
    CONSTRAINT valid_due_date CHECK (due_date >= issue_date),
    CONSTRAINT valid_discount CHECK (discount_amount <= subtotal),
    CONSTRAINT non_empty_line_items CHECK (jsonb_array_length(line_items) > 0),
    CONSTRAINT non_empty_transaction_ids CHECK (array_length(transaction_ids, 1) > 0)
);

-- Payment plans table
CREATE TABLE payment_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL,
    total_amount DECIMAL(12,2) NOT NULL CHECK (total_amount > 0),
    installment_count INTEGER NOT NULL CHECK (installment_count >= 1 AND installment_count <= 12),
    payment_method JSONB NOT NULL,
    first_due_date DATE NOT NULL,
    description TEXT,
    interest_rate DECIMAL(5,4) DEFAULT 0 CHECK (interest_rate >= 0 AND interest_rate <= 0.5),
    penalty_rate DECIMAL(5,4) DEFAULT 0.02 CHECK (penalty_rate >= 0 AND penalty_rate <= 0.1),
    installments JSONB NOT NULL,
    status payment_plan_status DEFAULT 'active',
    
    -- Audit fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID NOT NULL,
    
    -- Constraints
    CONSTRAINT valid_first_due_date CHECK (first_due_date >= CURRENT_DATE),
    CONSTRAINT non_empty_installments CHECK (jsonb_array_length(installments) = installment_count)
);

-- Session consumption log (for audit purposes)
CREATE TABLE session_consumption_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    package_id UUID NOT NULL REFERENCES patient_packages(id),
    patient_id UUID NOT NULL,
    session_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    session_type VARCHAR(50),
    therapist_id UUID,
    notes TEXT,
    
    -- Audit fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID NOT NULL
);

-- Audit log for all financial changes
CREATE TABLE financial_audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    table_name VARCHAR(50) NOT NULL,
    record_id UUID NOT NULL,
    operation VARCHAR(10) NOT NULL CHECK (operation IN ('INSERT', 'UPDATE', 'DELETE')),
    old_values JSONB,
    new_values JSONB,
    changed_fields TEXT[],
    changed_by UUID NOT NULL,
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT,
    session_id UUID,
    
    -- Add indexes for common queries
    CONSTRAINT valid_operation CHECK (
        (operation = 'INSERT' AND old_values IS NULL AND new_values IS NOT NULL) OR
        (operation = 'UPDATE' AND old_values IS NOT NULL AND new_values IS NOT NULL) OR
        (operation = 'DELETE' AND old_values IS NOT NULL AND new_values IS NULL)
    )
);

-- Financial KPIs materialized view for performance
CREATE MATERIALIZED VIEW financial_kpis AS
SELECT 
    DATE_TRUNC('month', paid_date) as month,
    COUNT(*) as transaction_count,
    SUM(net_amount) as total_revenue,
    AVG(net_amount) as avg_transaction_value,
    COUNT(DISTINCT patient_id) as unique_patients,
    SUM(CASE WHEN type = 'package_purchase' THEN net_amount ELSE 0 END) as package_revenue,
    SUM(CASE WHEN type = 'single_session' THEN net_amount ELSE 0 END) as session_revenue,
    COUNT(CASE WHEN status = 'refunded' THEN 1 END) as refund_count,
    SUM(CASE WHEN status = 'refunded' THEN net_amount ELSE 0 END) as refund_amount
FROM financial_transactions 
WHERE status = 'paid' 
    AND paid_date >= DATE_TRUNC('year', CURRENT_DATE - INTERVAL '2 years')
GROUP BY DATE_TRUNC('month', paid_date);

-- Indexes for performance optimization
CREATE INDEX idx_transactions_patient_date ON financial_transactions(patient_id, created_at DESC);
CREATE INDEX idx_transactions_status ON financial_transactions(status);
CREATE INDEX idx_transactions_type ON financial_transactions(type);
CREATE INDEX idx_transactions_due_date ON financial_transactions(due_date) WHERE status IN ('pending', 'overdue');
CREATE INDEX idx_transactions_paid_date ON financial_transactions(paid_date) WHERE status = 'paid';
CREATE INDEX idx_transactions_gateway ON financial_transactions(gateway_transaction_id) WHERE gateway_transaction_id IS NOT NULL;
CREATE INDEX idx_transactions_fiscal_doc ON financial_transactions(fiscal_document_number) WHERE fiscal_document_number IS NOT NULL;

CREATE INDEX idx_packages_patient_active ON patient_packages(patient_id) WHERE status = 'active';
CREATE INDEX idx_packages_expiry ON patient_packages(expiry_date) WHERE status = 'active';
CREATE INDEX idx_packages_type ON patient_packages(package_type);
CREATE INDEX idx_packages_transaction ON patient_packages(transaction_id);

CREATE INDEX idx_invoices_patient ON invoices(patient_id);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_due_date ON invoices(due_date) WHERE status IN ('issued', 'overdue');
CREATE INDEX idx_invoices_number ON invoices(invoice_number) WHERE invoice_number IS NOT NULL;

CREATE INDEX idx_payment_plans_patient ON payment_plans(patient_id);
CREATE INDEX idx_payment_plans_status ON payment_plans(status);
CREATE INDEX idx_payment_plans_due_date ON payment_plans(first_due_date);

CREATE INDEX idx_session_log_package ON session_consumption_log(package_id);
CREATE INDEX idx_session_log_patient ON session_consumption_log(patient_id);
CREATE INDEX idx_session_log_date ON session_consumption_log(session_date);

CREATE INDEX idx_audit_log_table_record ON financial_audit_log(table_name, record_id);
CREATE INDEX idx_audit_log_changed_by ON financial_audit_log(changed_by);
CREATE INDEX idx_audit_log_changed_at ON financial_audit_log(changed_at);

-- Unique index for KPIs materialized view
CREATE UNIQUE INDEX idx_financial_kpis_month ON financial_kpis(month);

-- Triggers for automatic audit logging
CREATE OR REPLACE FUNCTION audit_trigger_function()
RETURNS TRIGGER AS $$
DECLARE
    changed_fields TEXT[] := '{}';
    old_json JSONB;
    new_json JSONB;
BEGIN
    -- Convert records to JSONB
    IF TG_OP = 'DELETE' THEN
        old_json := to_jsonb(OLD);
        new_json := NULL;
    ELSIF TG_OP = 'INSERT' THEN
        old_json := NULL;
        new_json := to_jsonb(NEW);
    ELSE -- UPDATE
        old_json := to_jsonb(OLD);
        new_json := to_jsonb(NEW);
        
        -- Identify changed fields
        SELECT array_agg(key) INTO changed_fields
        FROM jsonb_each(new_json)
        WHERE key NOT IN ('updated_at', 'version')
            AND (old_json->key IS DISTINCT FROM new_json->key);
    END IF;

    -- Insert audit record
    INSERT INTO financial_audit_log (
        table_name, 
        record_id, 
        operation, 
        old_values, 
        new_values,
        changed_fields,
        changed_by,
        ip_address,
        user_agent
    ) VALUES (
        TG_TABLE_NAME,
        COALESCE(NEW.id, OLD.id),
        TG_OP,
        old_json,
        new_json,
        changed_fields,
        COALESCE(NEW.updated_by, NEW.created_by, OLD.updated_by, OLD.created_by),
        inet_client_addr(),
        current_setting('application_name', true)
    );

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply audit triggers to all main tables
CREATE TRIGGER financial_transactions_audit
    AFTER INSERT OR UPDATE OR DELETE ON financial_transactions
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER patient_packages_audit
    AFTER INSERT OR UPDATE OR DELETE ON patient_packages
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER invoices_audit
    AFTER INSERT OR UPDATE OR DELETE ON invoices
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER payment_plans_audit
    AFTER INSERT OR UPDATE OR DELETE ON payment_plans
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    IF TG_TABLE_NAME IN ('financial_transactions', 'patient_packages') THEN
        NEW.version = OLD.version + 1;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER update_financial_transactions_updated_at
    BEFORE UPDATE ON financial_transactions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_patient_packages_updated_at
    BEFORE UPDATE ON patient_packages
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_invoices_updated_at
    BEFORE UPDATE ON invoices
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payment_plans_updated_at
    BEFORE UPDATE ON payment_plans
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to automatically expire packages
CREATE OR REPLACE FUNCTION expire_packages()
RETURNS INTEGER AS $$
DECLARE
    expired_count INTEGER;
BEGIN
    UPDATE patient_packages 
    SET status = 'expired', updated_at = NOW()
    WHERE status = 'active' 
        AND expiry_date < CURRENT_DATE;
    
    GET DIAGNOSTICS expired_count = ROW_COUNT;
    RETURN expired_count;
END;
$$ LANGUAGE plpgsql;

-- Function to mark transactions as overdue
CREATE OR REPLACE FUNCTION mark_overdue_transactions()
RETURNS INTEGER AS $$
DECLARE
    overdue_count INTEGER;
BEGIN
    UPDATE financial_transactions 
    SET status = 'overdue', updated_at = NOW()
    WHERE status = 'pending' 
        AND due_date < NOW();
    
    GET DIAGNOSTICS overdue_count = ROW_COUNT;
    RETURN overdue_count;
END;
$$ LANGUAGE plpgsql;

-- Function to mark invoices as overdue
CREATE OR REPLACE FUNCTION mark_overdue_invoices()
RETURNS INTEGER AS $$
DECLARE
    overdue_count INTEGER;
BEGIN
    UPDATE invoices 
    SET status = 'overdue', updated_at = NOW()
    WHERE status = 'issued' 
        AND due_date < CURRENT_DATE;
    
    GET DIAGNOSTICS overdue_count = ROW_COUNT;
    RETURN overdue_count;
END;
$$ LANGUAGE plpgsql;

-- Function for complex financial queries (used by repository)
CREATE OR REPLACE FUNCTION execute_query(query_sql TEXT, query_params JSONB DEFAULT '[]')
RETURNS TABLE(result JSONB) AS $$
DECLARE
    rec RECORD;
    results JSONB[] := '{}';
BEGIN
    -- This is a simplified version - in production, you'd want more security
    -- and parameter binding
    FOR rec IN EXECUTE query_sql LOOP
        results := results || to_jsonb(rec);
    END LOOP;
    
    RETURN QUERY SELECT unnest(results);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get revenue by period
CREATE OR REPLACE FUNCTION get_revenue_by_period(
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,
    date_format TEXT DEFAULT 'YYYY-MM-DD'
)
RETURNS TABLE(date TEXT, revenue DECIMAL) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        TO_CHAR(paid_date, date_format) as date,
        SUM(net_amount) as revenue
    FROM financial_transactions
    WHERE paid_date BETWEEN start_date AND end_date
        AND status = 'paid'
        AND type IN ('package_purchase', 'single_session', 'installment')
    GROUP BY TO_CHAR(paid_date, date_format)
    ORDER BY date;
END;
$$ LANGUAGE plpgsql;

-- Function to refresh materialized views
CREATE OR REPLACE FUNCTION refresh_financial_kpis()
RETURNS VOID AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY financial_kpis;
END;
$$ LANGUAGE plpgsql;

-- Row Level Security (RLS) policies
ALTER TABLE financial_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_audit_log ENABLE ROW LEVEL SECURITY;

-- Example RLS policies (customize based on your auth system)
CREATE POLICY "Users can view their own transactions" ON financial_transactions
    FOR SELECT USING (
        auth.uid() IS NOT NULL AND (
            patient_id = auth.uid() OR 
            created_by = auth.uid() OR
            updated_by = auth.uid()
        )
    );

CREATE POLICY "Admin users can view all transactions" ON financial_transactions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid() 
                AND role IN ('admin', 'financial_manager')
        )
    );

-- Similar policies for other tables...

-- Comments for documentation
COMMENT ON TABLE financial_transactions IS 'Core financial transactions including purchases, payments, and refunds';
COMMENT ON TABLE patient_packages IS 'Patient therapy packages with session tracking';
COMMENT ON TABLE invoices IS 'Generated invoices for billing purposes';
COMMENT ON TABLE payment_plans IS 'Installment payment plans for patients';
COMMENT ON TABLE session_consumption_log IS 'Audit log for session usage from packages';
COMMENT ON TABLE financial_audit_log IS 'Complete audit trail for all financial changes';

COMMENT ON COLUMN financial_transactions.net_amount IS 'Amount after taxes (computed column)';
COMMENT ON COLUMN patient_packages.remaining_sessions IS 'Computed field: total_sessions - used_sessions';
COMMENT ON COLUMN invoices.total_amount IS 'Computed field: subtotal - discount + tax';

-- Create initial data and configuration
INSERT INTO financial_audit_log (table_name, record_id, operation, new_values, changed_by) 
VALUES ('system', gen_random_uuid(), 'INSERT', '{"action": "schema_created", "version": "1.0"}', gen_random_uuid());

-- Schedule automatic maintenance (if using pg_cron extension)
-- SELECT cron.schedule('expire-packages', '0 1 * * *', 'SELECT expire_packages();');
-- SELECT cron.schedule('mark-overdue', '0 */6 * * *', 'SELECT mark_overdue_transactions(); SELECT mark_overdue_invoices();');
-- SELECT cron.schedule('refresh-kpis', '0 2 * * *', 'SELECT refresh_financial_kpis();');

COMMIT;
