#!/bin/bash

echo "Conectando ao Supabase remoto..."
echo "Aplicando migrações 001, 002, 003..."

# Migração 001
echo "=== Aplicando 001_auth_setup.sql ==="
supabase db execute --file supabase/migrations/20250117000001_auth_setup.sql --linked 2>&1

echo ""
echo "=== Aplicando 002_core_tables.sql ==="
supabase db execute --file supabase/migrations/20250117000002_core_tables.sql --linked 2>&1

echo ""
echo "=== Aplicando 003_exercises_and_financials.sql ==="
supabase db execute --file supabase/migrations/20250117000003_exercises_and_financials.sql --linked 2>&1

echo ""
echo "✅ Migrações aplicadas!"
