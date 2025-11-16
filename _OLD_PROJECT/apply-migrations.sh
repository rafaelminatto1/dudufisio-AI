#!/bin/bash

echo ""
echo "╔════════════════════════════════════════════════════════════════════════════╗"
echo "║                                                                            ║"
echo "║   🗄️  APLICADOR DE MIGRATIONS SUPABASE                                     ║"
echo "║                                                                            ║"
echo "╚════════════════════════════════════════════════════════════════════════════╝"
echo ""

# Cores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}📊 SUPABASE PROJECT INFO:${NC}"
echo "   Projeto: dudufisio-AI"
echo "   ID: urfxniitfbbvsaskicfo"
echo "   Dashboard: https://supabase.com/dashboard/project/urfxniitfbbvsaskicfo"
echo "   SQL Editor: https://supabase.com/dashboard/project/urfxniitfbbvsaskicfo/editor"
echo ""

echo -e "${YELLOW}📋 MIGRATIONS DISPONÍVEIS:${NC}"

# Listar migrations por grupo
echo ""
echo "🟩 GRUPO 1 - BASE (4 migrations) - CRÍTICO:"
echo "   1. 20241231000000_create_base_tables.sql"
echo "   2. 20241231000001_create_user_profiles.sql"
echo "   3. 20251008000001_consolidate_users_table.sql"
echo "   4. 20251008000002_create_clinics_multi_tenant.sql"

echo ""
echo "🟨 GRUPO 2 - CORE FEATURES (6 migrations):"
echo "   5. 20241201_session_crud_tables.sql"
echo "   6. 20250103000000_create_medical_records_schema.sql"
echo "   7. 20250926000100_create_advanced_scheduling_features.sql"
echo "   8. 20250927000002_create_exercises_and_protocols_tables.sql"
echo "   9. 20251009_complete_patients_management_system.sql"
echo "   10. 20251009202741_patients_system_complete_final.sql"

echo ""
echo "🟪 GRUPO 3 - CRM & AUTOMATIONS (7 migrations) - ⭐ IMPORTANTE:"
echo "   11. 20251008100001_create_crm_tables.sql ⭐"
echo "   12. 20251009_create_leads_crm_integration.sql"
echo "   13. 20251009_create_automation_system.sql"
echo "   14. 20251009_seed_automation_defaults.sql"
echo "   15. 20251008_whatsapp_automations.sql"
echo "   16. 20251015_create_whatsapp_message_queue.sql"
echo "   17. 20251015_automations_triggers.sql"

echo ""
echo "🟧 GRUPO 4-6 - FEATURES AVANÇADAS (19 migrations):"
echo "   18-36. Body map, Analytics, Sports, Mental health, etc."

echo ""
echo "🟥 GRUPO 7 - SECURITY & RLS (13 migrations) - ⭐ CRÍTICO:"
echo "   37-49. RLS policies, Performance, Security"

echo ""
echo "🟦 GRUPO 8 - FINAL (7 migrations):"
echo "   50-58. Integrations, Realtime, Seed data"

echo ""
echo "═══════════════════════════════════════════════════════════════════════════"
echo ""

# Função para abrir arquivos de migration
show_migration() {
    local group=$1
    local file=$2
    
    echo -e "${GREEN}📄 Mostrando conteúdo de: $file${NC}"
    echo ""
    
    if [ -f "supabase/migrations/$file" ]; then
        echo "-- =================================================="
        echo "-- $file"
        echo "-- =================================================="
        head -50 "supabase/migrations/$file"
        echo ""
        echo "... (arquivo pode ter mais conteúdo)"
        echo ""
    else
        echo -e "${YELLOW}⚠️  Arquivo não encontrado: $file${NC}"
    fi
}

# Menu interativo
while true; do
    echo "🎯 OPÇÕES:"
    echo ""
    echo "1. Ver Grupo 1 (Base - CRÍTICO)"
    echo "2. Ver Grupo 2 (Core Features)"
    echo "3. Ver Grupo 3 (CRM - IMPORTANTE)"
    echo "4. Ver Grupo 7 (Security - CRÍTICO)"
    echo "5. Abrir Supabase Dashboard"
    echo "6. Ver guia completo (MIGRATIONS-EXECUTION-ORDER.md)"
    echo "7. Sair"
    echo ""
    read -p "Escolha uma opção (1-7): " option
    echo ""
    
    case $option in
        1)
            echo -e "${GREEN}🟩 GRUPO 1 - BASE (Execute PRIMEIRO no SQL Editor)${NC}"
            echo ""
            for file in "20241231000000_create_base_tables.sql" "20241231000001_create_user_profiles.sql" "20251008000001_consolidate_users_table.sql" "20251008000002_create_clinics_multi_tenant.sql"; do
                echo "📄 $file"
            done
            echo ""
            read -p "Ver conteúdo de qual arquivo? (nome completo ou Enter para voltar): " filename
            if [ ! -z "$filename" ]; then
                show_migration "1" "$filename"
            fi
            ;;
        2)
            echo -e "${YELLOW}🟨 GRUPO 2 - CORE FEATURES${NC}"
            echo ""
            for file in "20241201_session_crud_tables.sql" "20250103000000_create_medical_records_schema.sql" "20250926000100_create_advanced_scheduling_features.sql" "20250927000002_create_exercises_and_protocols_tables.sql" "20251009_complete_patients_management_system.sql" "20251009202741_patients_system_complete_final.sql"; do
                echo "📄 $file"
            done
            ;;
        3)
            echo -e "${BLUE}🟪 GRUPO 3 - CRM & AUTOMATIONS ⭐${NC}"
            echo ""
            for file in "20251008100001_create_crm_tables.sql" "20251009_create_leads_crm_integration.sql" "20251009_create_automation_system.sql" "20251009_seed_automation_defaults.sql" "20251008_whatsapp_automations.sql" "20251015_create_whatsapp_message_queue.sql" "20251015_automations_triggers.sql"; do
                echo "📄 $file"
            done
            ;;
        4)
            echo -e "${RED}🟥 GRUPO 7 - SECURITY & RLS ⭐${NC}"
            echo ""
            echo "📄 20251013000000_enable_rls_all_tables.sql ⭐ CRÍTICO"
            echo "📄 20251013000002_add_rls_policies_admin.sql"
            echo "📄 20251013000003_add_rls_policies_therapist.sql"
            echo "📄 20251013000004_add_rls_policies_patient.sql"
            echo "📄 E mais 9 arquivos de security..."
            ;;
        5)
            echo -e "${GREEN}🌐 Abrindo Supabase Dashboard...${NC}"
            if command -v xdg-open > /dev/null; then
                xdg-open "https://supabase.com/dashboard/project/urfxniitfbbvsaskicfo/editor"
            elif command -v open > /dev/null; then
                open "https://supabase.com/dashboard/project/urfxniitfbbvsaskicfo/editor"
            else
                echo "   Abra manualmente: https://supabase.com/dashboard/project/urfxniitfbbvsaskicfo/editor"
            fi
            ;;
        6)
            echo -e "${GREEN}📖 Abrindo guia completo...${NC}"
            if [ -f "MIGRATIONS-EXECUTION-ORDER.md" ]; then
                cat "MIGRATIONS-EXECUTION-ORDER.md" | head -100
                echo "... (ver arquivo completo para mais detalhes)"
            else
                echo "Arquivo MIGRATIONS-EXECUTION-ORDER.md não encontrado"
            fi
            ;;
        7)
            echo -e "${GREEN}✅ Script finalizado. Boa sorte com as migrations!${NC}"
            break
            ;;
        *)
            echo -e "${YELLOW}⚠️  Opção inválida. Tente novamente.${NC}"
            ;;
    esac
    
    echo ""
    echo "═══════════════════════════════════════════════════════════════════════════"
    echo ""
done
