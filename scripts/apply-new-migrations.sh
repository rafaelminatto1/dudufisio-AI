#!/bin/bash

# =====================================================
# Script para Aplicar Novas Migrations no Supabase
# Data: 2025-10-08
# =====================================================

echo "🚀 Aplicando migrations dos novos módulos no Supabase..."
echo ""

# Cores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Verificar se Supabase CLI está instalado
if ! command -v supabase &> /dev/null; then
    echo -e "${RED}❌ Supabase CLI não está instalado${NC}"
    echo "Instalar com: npm install -g supabase"
    exit 1
fi

echo -e "${GREEN}✅ Supabase CLI encontrado${NC}"
echo ""

# Lista de migrations
migrations=(
    "20251008_risk_stratification_system.sql"
    "20251008_sports_rehabilitation_system.sql"
    "20251008_population_health_system.sql"
    "20251008_family_portal_system.sql"
    "20251008_predictive_analytics_system.sql"
    "20251008_quality_assurance_system.sql"
)

echo "📋 Migrations a aplicar:"
for migration in "${migrations[@]}"; do
    echo "  - $migration"
done
echo ""

echo -e "${YELLOW}⚠️  IMPORTANTE: Este script aplicará as migrations no banco de dados conectado${NC}"
echo -e "${YELLOW}   Certifique-se de que está no projeto correto!${NC}"
echo ""

read -p "Deseja continuar? (s/N) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Ss]$ ]]; then
    echo "Operação cancelada."
    exit 1
fi

echo ""
echo "🔄 Aplicando migrations..."
echo ""

# Aplicar cada migration
for migration in "${migrations[@]}"; do
    echo -e "${YELLOW}⏳ Aplicando: $migration${NC}"
    
    migration_path="supabase/migrations/$migration"
    
    if [ -f "$migration_path" ]; then
        # Tentar aplicar migration
        if supabase db push --db-url "$SUPABASE_DB_URL" --file "$migration_path" 2>/dev/null; then
            echo -e "${GREEN}✅ $migration aplicada com sucesso${NC}"
        else
            echo -e "${RED}⚠️  $migration pode já estar aplicada ou houve um erro${NC}"
            echo "   Verifique manualmente no Supabase Dashboard"
        fi
    else
        echo -e "${RED}❌ Arquivo não encontrado: $migration_path${NC}"
    fi
    
    echo ""
done

echo ""
echo -e "${GREEN}✨ Processo concluído!${NC}"
echo ""
echo "📊 Próximos passos:"
echo "  1. Verificar no Supabase Dashboard se todas as tabelas foram criadas"
echo "  2. Executar o script de seed: npx ts-node scripts/seed-new-modules.ts"
echo "  3. Testar as funcionalidades nos módulos"
echo ""
echo "📁 Verificar tabelas criadas:"
echo "  - Dashboard > Database > Tables"
echo ""
echo "🔍 Tabelas esperadas (47 novas):"
echo "  Risk Stratification: 10 tabelas"
echo "  Sports Rehab: 15 tabelas"
echo "  Population Health: 11 tabelas"
echo "  Family Portal: 11 tabelas"  
echo "  Predictive Analytics: 12 tabelas"
echo "  Quality Assurance: 13 tabelas"
echo ""



