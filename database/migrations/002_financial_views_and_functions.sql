-- Additional views and functions for financial reporting and analytics

-- View for active patient packages with remaining sessions
CREATE VIEW active_patient_packages AS
SELECT 
    pp.*,
    ft.amount as package_price,
    ft.net_amount as package_net_price,
    ft.payment_method,
    ft.paid_date,
    ROUND((pp.used_sessions::DECIMAL / pp.total_sessions) * 100, 2) as usage_percentage,
    CASE 
        WHEN pp.expiry_date < CURRENT_DATE THEN 'expired'
        WHEN pp.expiry_date <= CURRENT_DATE + INTERVAL '7 days' THEN 'expiring_soon'
        WHEN pp.remaining_sessions = 0 THEN 'sessions_exhausted'
        ELSE 'active'
    END as package_health_status
FROM patient_packages pp
JOIN financial_transactions ft ON pp.transaction_id = ft.id
WHERE pp.status = 'active';

-- View for overdue financial obligations
CREATE VIEW overdue_obligations AS
SELECT 
    'transaction' as obligation_type,
    ft.id,
    ft.patient_id,
    ft.amount,
    ft.net_amount,
    ft.due_date,
    ft.status,
    CURRENT_DATE - ft.due_date::DATE as days_overdue,
    ft.description,
    ft.payment_method
FROM financial_transactions ft
WHERE ft.status IN ('pending', 'overdue') 
    AND ft.due_date < NOW()

UNION ALL

SELECT 
    'invoice' as obligation_type,
    i.id,
    i.patient_id,
    i.total_amount as amount,
    i.total_amount as net_amount,
    i.due_date::TIMESTAMP WITH TIME ZONE,
    i.status::TEXT,
    CURRENT_DATE - i.due_date as days_overdue,
    COALESCE(i.notes, 'Invoice #' || i.invoice_number) as description,
    NULL as payment_method
FROM invoices i
WHERE i.status IN ('issued', 'overdue') 
    AND i.due_date < CURRENT_DATE;

-- View for patient financial summary
CREATE VIEW patient_financial_summary AS
SELECT 
    patient_id,
    COUNT(DISTINCT CASE WHEN type = 'package_purchase' THEN id END) as packages_purchased,
    COUNT(DISTINCT CASE WHEN type = 'single_session' THEN id END) as single_sessions,
    SUM(CASE WHEN status = 'paid' THEN net_amount ELSE 0 END) as total_paid,
    SUM(CASE WHEN status IN ('pending', 'overdue') THEN net_amount ELSE 0 END) as total_pending,
    SUM(CASE WHEN status = 'refunded' THEN net_amount ELSE 0 END) as total_refunded,
    MAX(CASE WHEN status = 'paid' THEN paid_date END) as last_payment_date,
    MIN(created_at) as first_transaction_date,
    AVG(CASE WHEN status = 'paid' THEN net_amount END) as avg_transaction_value,
    COUNT(CASE WHEN status IN ('pending', 'overdue') AND due_date < NOW() THEN 1 END) as overdue_count
FROM financial_transactions
GROUP BY patient_id;

-- View for monthly revenue analysis
CREATE VIEW monthly_revenue_analysis AS
SELECT 
    DATE_TRUNC('month', paid_date) as month,
    COUNT(*) as transaction_count,
    COUNT(DISTINCT patient_id) as unique_patients,
    SUM(net_amount) as total_revenue,
    AVG(net_amount) as avg_transaction_value,
    SUM(CASE WHEN type = 'package_purchase' THEN net_amount ELSE 0 END) as package_revenue,
    SUM(CASE WHEN type = 'single_session' THEN net_amount ELSE 0 END) as session_revenue,
    SUM(CASE WHEN type = 'installment' THEN net_amount ELSE 0 END) as installment_revenue,
    COUNT(CASE WHEN type = 'package_purchase' THEN 1 END) as package_sales,
    COUNT(CASE WHEN type = 'single_session' THEN 1 END) as session_sales,
    SUM(tax_amount) as total_taxes_collected,
    LAG(SUM(net_amount)) OVER (ORDER BY DATE_TRUNC('month', paid_date)) as previous_month_revenue,
    CASE 
        WHEN LAG(SUM(net_amount)) OVER (ORDER BY DATE_TRUNC('month', paid_date)) IS NOT NULL
        THEN ROUND(
            ((SUM(net_amount) - LAG(SUM(net_amount)) OVER (ORDER BY DATE_TRUNC('month', paid_date))) 
            / LAG(SUM(net_amount)) OVER (ORDER BY DATE_TRUNC('month', paid_date))) * 100, 2
        )
        ELSE NULL
    END as growth_rate_percent
FROM financial_transactions
WHERE status = 'paid'
    AND paid_date >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '24 months')
GROUP BY DATE_TRUNC('month', paid_date)
ORDER BY month DESC;

-- View for payment method performance
CREATE VIEW payment_method_performance AS
SELECT 
    payment_method->>'type' as payment_method_type,
    COUNT(*) as transaction_count,
    SUM(net_amount) as total_revenue,
    AVG(net_amount) as avg_transaction_value,
    COUNT(CASE WHEN status = 'paid' THEN 1 END) as successful_payments,
    COUNT(CASE WHEN status IN ('cancelled', 'refunded') THEN 1 END) as failed_payments,
    ROUND(
        (COUNT(CASE WHEN status = 'paid' THEN 1 END)::DECIMAL / COUNT(*)) * 100, 2
    ) as success_rate_percent,
    MIN(created_at) as first_used,
    MAX(created_at) as last_used
FROM financial_transactions
WHERE created_at >= CURRENT_DATE - INTERVAL '12 months'
GROUP BY payment_method->>'type'
ORDER BY total_revenue DESC;

-- Function to calculate customer lifetime value
CREATE OR REPLACE FUNCTION calculate_customer_ltv(p_patient_id UUID)
RETURNS TABLE(
    patient_id UUID,
    total_revenue DECIMAL,
    transaction_count INTEGER,
    avg_transaction_value DECIMAL,
    months_active INTEGER,
    monthly_avg_revenue DECIMAL,
    estimated_ltv DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p_patient_id,
        COALESCE(SUM(ft.net_amount), 0) as total_revenue,
        COUNT(ft.id)::INTEGER as transaction_count,
        COALESCE(AVG(ft.net_amount), 0) as avg_transaction_value,
        GREATEST(1, DATE_PART('month', AGE(MAX(ft.created_at), MIN(ft.created_at)))::INTEGER + 1) as months_active,
        COALESCE(SUM(ft.net_amount) / GREATEST(1, DATE_PART('month', AGE(MAX(ft.created_at), MIN(ft.created_at))) + 1), 0) as monthly_avg_revenue,
        -- Simple LTV calculation: monthly_avg * 24 months (estimated lifetime)
        COALESCE(SUM(ft.net_amount) / GREATEST(1, DATE_PART('month', AGE(MAX(ft.created_at), MIN(ft.created_at))) + 1) * 24, 0) as estimated_ltv
    FROM financial_transactions ft
    WHERE ft.patient_id = p_patient_id
        AND ft.status = 'paid'
    GROUP BY p_patient_id;
END;
$$ LANGUAGE plpgsql;

-- Function to get financial health score for a patient
CREATE OR REPLACE FUNCTION get_patient_financial_health(p_patient_id UUID)
RETURNS TABLE(
    patient_id UUID,
    health_score INTEGER,
    health_status TEXT,
    total_paid DECIMAL,
    total_overdue DECIMAL,
    overdue_days INTEGER,
    payment_consistency DECIMAL,
    risk_level TEXT
) AS $$
DECLARE
    v_total_paid DECIMAL := 0;
    v_total_overdue DECIMAL := 0;
    v_avg_overdue_days INTEGER := 0;
    v_payment_consistency DECIMAL := 0;
    v_health_score INTEGER := 100;
    v_health_status TEXT;
    v_risk_level TEXT;
BEGIN
    -- Get payment totals
    SELECT 
        COALESCE(SUM(CASE WHEN status = 'paid' THEN net_amount ELSE 0 END), 0),
        COALESCE(SUM(CASE WHEN status IN ('pending', 'overdue') AND due_date < NOW() THEN net_amount ELSE 0 END), 0),
        COALESCE(AVG(CASE WHEN status = 'overdue' THEN EXTRACT(DAY FROM NOW() - due_date) END), 0)
    INTO v_total_paid, v_total_overdue, v_avg_overdue_days
    FROM financial_transactions
    WHERE financial_transactions.patient_id = p_patient_id;
    
    -- Calculate payment consistency (percentage of on-time payments)
    SELECT 
        CASE 
            WHEN COUNT(*) = 0 THEN 100
            ELSE (COUNT(CASE WHEN paid_date <= due_date THEN 1 END)::DECIMAL / COUNT(*)) * 100
        END
    INTO v_payment_consistency
    FROM financial_transactions
    WHERE financial_transactions.patient_id = p_patient_id
        AND status = 'paid';
    
    -- Calculate health score
    IF v_total_overdue > 0 THEN
        v_health_score := v_health_score - LEAST(50, (v_total_overdue / GREATEST(v_total_paid, 1) * 100)::INTEGER);
    END IF;
    
    IF v_avg_overdue_days > 0 THEN
        v_health_score := v_health_score - LEAST(30, v_avg_overdue_days);
    END IF;
    
    v_health_score := v_health_score - (100 - v_payment_consistency::INTEGER);
    v_health_score := GREATEST(0, v_health_score);
    
    -- Determine health status and risk level
    CASE 
        WHEN v_health_score >= 80 THEN 
            v_health_status := 'Excellent';
            v_risk_level := 'Low';
        WHEN v_health_score >= 60 THEN 
            v_health_status := 'Good';
            v_risk_level := 'Low';
        WHEN v_health_score >= 40 THEN 
            v_health_status := 'Fair';
            v_risk_level := 'Medium';
        WHEN v_health_score >= 20 THEN 
            v_health_status := 'Poor';
            v_risk_level := 'High';
        ELSE 
            v_health_status := 'Critical';
            v_risk_level := 'Very High';
    END CASE;
    
    RETURN QUERY SELECT 
        p_patient_id,
        v_health_score,
        v_health_status,
        v_total_paid,
        v_total_overdue,
        v_avg_overdue_days,
        v_payment_consistency,
        v_risk_level;
END;
$$ LANGUAGE plpgsql;

-- Function to generate financial dashboard data
CREATE OR REPLACE FUNCTION get_financial_dashboard_data(
    p_start_date DATE DEFAULT CURRENT_DATE - INTERVAL '30 days',
    p_end_date DATE DEFAULT CURRENT_DATE
)
RETURNS TABLE(
    metric_name TEXT,
    metric_value DECIMAL,
    metric_change DECIMAL,
    metric_unit TEXT
) AS $$
BEGIN
    RETURN QUERY
    WITH current_period AS (
        SELECT 
            COUNT(*) as transaction_count,
            SUM(CASE WHEN status = 'paid' THEN net_amount ELSE 0 END) as revenue,
            COUNT(DISTINCT patient_id) as unique_patients,
            AVG(CASE WHEN status = 'paid' THEN net_amount END) as avg_transaction,
            COUNT(CASE WHEN status IN ('pending', 'overdue') AND due_date < NOW() THEN 1 END) as overdue_count
        FROM financial_transactions
        WHERE created_at::DATE BETWEEN p_start_date AND p_end_date
    ),
    previous_period AS (
        SELECT 
            COUNT(*) as transaction_count,
            SUM(CASE WHEN status = 'paid' THEN net_amount ELSE 0 END) as revenue,
            COUNT(DISTINCT patient_id) as unique_patients,
            AVG(CASE WHEN status = 'paid' THEN net_amount END) as avg_transaction,
            COUNT(CASE WHEN status IN ('pending', 'overdue') AND due_date < NOW() THEN 1 END) as overdue_count
        FROM financial_transactions
        WHERE created_at::DATE BETWEEN 
            p_start_date - (p_end_date - p_start_date) AND 
            p_start_date - INTERVAL '1 day'
    )
    SELECT 'Total Revenue'::TEXT, 
           cp.revenue, 
           CASE WHEN pp.revenue > 0 THEN ((cp.revenue - pp.revenue) / pp.revenue) * 100 ELSE 0 END,
           'BRL'::TEXT
    FROM current_period cp, previous_period pp
    
    UNION ALL
    
    SELECT 'Transaction Count'::TEXT, 
           cp.transaction_count::DECIMAL, 
           CASE WHEN pp.transaction_count > 0 THEN ((cp.transaction_count - pp.transaction_count)::DECIMAL / pp.transaction_count) * 100 ELSE 0 END,
           'count'::TEXT
    FROM current_period cp, previous_period pp
    
    UNION ALL
    
    SELECT 'Unique Patients'::TEXT, 
           cp.unique_patients::DECIMAL, 
           CASE WHEN pp.unique_patients > 0 THEN ((cp.unique_patients - pp.unique_patients)::DECIMAL / pp.unique_patients) * 100 ELSE 0 END,
           'count'::TEXT
    FROM current_period cp, previous_period pp
    
    UNION ALL
    
    SELECT 'Average Transaction'::TEXT, 
           COALESCE(cp.avg_transaction, 0), 
           CASE WHEN pp.avg_transaction > 0 THEN ((COALESCE(cp.avg_transaction, 0) - pp.avg_transaction) / pp.avg_transaction) * 100 ELSE 0 END,
           'BRL'::TEXT
    FROM current_period cp, previous_period pp
    
    UNION ALL
    
    SELECT 'Overdue Count'::TEXT, 
           cp.overdue_count::DECIMAL, 
           CASE WHEN pp.overdue_count > 0 THEN ((cp.overdue_count - pp.overdue_count)::DECIMAL / pp.overdue_count) * 100 ELSE 0 END,
           'count'::TEXT
    FROM current_period cp, previous_period pp;
END;
$$ LANGUAGE plpgsql;

-- Function to automatically consume package sessions
CREATE OR REPLACE FUNCTION consume_package_session(
    p_package_id UUID,
    p_session_type VARCHAR(50) DEFAULT 'regular',
    p_therapist_id UUID DEFAULT NULL,
    p_notes TEXT DEFAULT NULL,
    p_consumed_by UUID DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
    v_package patient_packages%ROWTYPE;
    v_can_consume BOOLEAN := FALSE;
BEGIN
    -- Get package details
    SELECT * INTO v_package
    FROM patient_packages
    WHERE id = p_package_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Package not found';
    END IF;
    
    -- Check if session can be consumed
    SELECT 
        status = 'active' AND 
        remaining_sessions > 0 AND 
        expiry_date >= CURRENT_DATE
    INTO v_can_consume
    FROM patient_packages
    WHERE id = p_package_id;
    
    IF NOT v_can_consume THEN
        RETURN FALSE;
    END IF;
    
    -- Update package
    UPDATE patient_packages 
    SET 
        used_sessions = used_sessions + 1,
        updated_at = NOW(),
        status = CASE 
            WHEN used_sessions + 1 >= total_sessions THEN 'expired'::package_status
            ELSE status
        END
    WHERE id = p_package_id;
    
    -- Log session consumption
    INSERT INTO session_consumption_log (
        package_id,
        patient_id,
        session_type,
        therapist_id,
        notes,
        created_by
    ) VALUES (
        p_package_id,
        v_package.patient_id,
        p_session_type,
        p_therapist_id,
        p_notes,
        COALESCE(p_consumed_by, v_package.patient_id)
    );
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Function to generate invoice number
CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS TEXT AS $$
DECLARE
    v_year INTEGER := EXTRACT(YEAR FROM CURRENT_DATE);
    v_sequence INTEGER;
    v_invoice_number TEXT;
BEGIN
    -- Get next sequence number for the year
    SELECT COALESCE(MAX(
        CASE 
            WHEN invoice_number ~ (v_year::TEXT || '[0-9]{6}$') 
            THEN SUBSTRING(invoice_number FROM '[0-9]{6}$')::INTEGER 
        END
    ), 0) + 1 INTO v_sequence
    FROM invoices
    WHERE invoice_number IS NOT NULL;
    
    -- Format: YYYY000001
    v_invoice_number := v_year::TEXT || LPAD(v_sequence::TEXT, 6, '0');
    
    RETURN v_invoice_number;
END;
$$ LANGUAGE plpgsql;

-- Create indexes for the new views
CREATE INDEX IF NOT EXISTS idx_ft_paid_date_status ON financial_transactions(paid_date, status) WHERE status = 'paid';
CREATE INDEX IF NOT EXISTS idx_ft_created_month ON financial_transactions(DATE_TRUNC('month', created_at));
CREATE INDEX IF NOT EXISTS idx_ft_payment_method_type ON financial_transactions((payment_method->>'type'));

-- Grant appropriate permissions (customize based on your role system)
-- GRANT SELECT ON active_patient_packages TO financial_readers;
-- GRANT SELECT ON overdue_obligations TO financial_managers;
-- GRANT SELECT ON patient_financial_summary TO financial_managers;
-- GRANT SELECT ON monthly_revenue_analysis TO financial_analysts;
-- GRANT SELECT ON payment_method_performance TO financial_analysts;

-- Add comments for documentation
COMMENT ON VIEW active_patient_packages IS 'Active patient packages with usage statistics and health status';
COMMENT ON VIEW overdue_obligations IS 'All overdue financial obligations (transactions and invoices)';
COMMENT ON VIEW patient_financial_summary IS 'Financial summary for each patient including totals and payment history';
COMMENT ON VIEW monthly_revenue_analysis IS 'Monthly revenue analysis with growth rates and breakdowns';
COMMENT ON VIEW payment_method_performance IS 'Performance metrics for different payment methods';

COMMENT ON FUNCTION calculate_customer_ltv(UUID) IS 'Calculate customer lifetime value for a specific patient';
COMMENT ON FUNCTION get_patient_financial_health(UUID) IS 'Get financial health score and risk assessment for a patient';
COMMENT ON FUNCTION get_financial_dashboard_data(DATE, DATE) IS 'Generate key financial metrics for dashboard display';
COMMENT ON FUNCTION consume_package_session(UUID, VARCHAR, UUID, TEXT, UUID) IS 'Consume a session from a patient package with audit logging';
COMMENT ON FUNCTION generate_invoice_number() IS 'Generate sequential invoice number for the current year';

COMMIT;