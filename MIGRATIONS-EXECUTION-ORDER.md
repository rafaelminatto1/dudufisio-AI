# 🗄️ Ordem de Execução das Migrations Supabase

**Total:** 58 migrations
**Projeto:** dudufisio-AI (urfxniitfbbvsaskicfo)
**Dashboard:** https://supabase.com/dashboard/project/urfxniitfbbvsaskicfo/editor

---

## ✅ Grupo 1: Base (Essencial) - 4 migrations

Execute estas PRIMEIRO, na ordem:

1. `20241231000000_create_base_tables.sql`
2. `20241231000001_create_user_profiles.sql`
3. `20251008000001_consolidate_users_table.sql`
4. `20251008000002_create_clinics_multi_tenant.sql`

**Por que:** Criam estrutura base de usuários e clínicas necessária para todo o resto

---

## ✅ Grupo 2: Core Features - 6 migrations

5. `20241201_session_crud_tables.sql`
6. `20250103000000_create_medical_records_schema.sql`
7. `20250926000100_create_advanced_scheduling_features.sql`
8. `20250927000002_create_exercises_and_protocols_tables.sql`
9. `20251009_complete_patients_management_system.sql`
10. `20251009202741_patients_system_complete_final.sql`

**Por que:** Funcionalidades core de sessões, pacientes e agendamentos

---

## ✅ Grupo 3: CRM & Automations ⭐ - 7 migrations

11. `20251008100001_create_crm_tables.sql` ⭐ IMPORTANTE
12. `20251009_create_leads_crm_integration.sql`
13. `20251009_create_automation_system.sql`
14. `20251009_seed_automation_defaults.sql`
15. `20251008_whatsapp_automations.sql`
16. `20251015_create_whatsapp_message_queue.sql`
17. `20251015_automations_triggers.sql`

**Por que:** Sistema CRM e automações WhatsApp

---

## ✅ Grupo 4: Advanced Features - 6 migrations

18. `20250101000000_create_professional_body_map_schema.sql`
19. `20251013_body_map_system.sql`
20. `20251008100002_create_gamification_tables.sql`
21. `20250127000001_create_supplies_management_schema.sql`
22. `20250127000002_create_tasks_integration_schema.sql`
23. `20250103000001_create_communication_schema.sql`

**Por que:** Recursos avançados (body map, gamification, supplies)

---

## ✅ Grupo 5: Analytics & Reporting - 5 migrations

24. `20250927000001_create_analytics_and_financial_tables.sql`
25. `20250127000004_create_reports_analytics_schema.sql`
26. `20251010_patient_tracking_system.sql`
27. `20251008_predictive_analytics_system.sql`
28. `20251008_population_health_system.sql`

**Por que:** Analytics, relatórios e dashboards

---

## ✅ Grupo 6: Specialized Modules - 10 migrations

29. `20251008_sports_rehabilitation_system.sql`
30. `20251008_risk_stratification_system.sql`
31. `20251008_quality_assurance_system.sql`
32. `20251008_geriatric_module.sql`
33. `20251008_mental_health_integration.sql`
34. `20251008_symptom_tracker.sql`
35. `20251008_nutritional_guidance.sql`
36. `20251008_wearables_integration.sql`
37. `20251008_emr_ehr_integration.sql`
38. `20250102000000_create_calendar_integration_schema.sql`

**Por que:** Módulos especializados por especialidade

---

## ✅ Grupo 7: Security & Performance ⭐ - 13 migrations

39. `20251013000000_enable_rls_all_tables.sql` ⭐ CRÍTICO
40. `20251013000001_fix_security_definer_views.sql`
41. `20251013000002_add_rls_policies_admin.sql`
42. `20251013000003_add_rls_policies_therapist.sql`
43. `20251013000004_add_rls_policies_patient.sql`
44. `20251013100000_consolidate_rls_policies.sql`
45. `20250104000000_performance_optimizations.sql`
46. `20251008000004_add_performance_indexes.sql`
47. `20251008000003_add_data_validations.sql`
48. `20251008000005_expand_audit_system.sql`
49. `20251008000006_implement_soft_delete.sql`
50. `20251013000005_fix_function_search_paths.sql`
51. `20251013000006_move_extensions.sql`

**Por que:** RLS (segurança), performance e audit

---

## ✅ Grupo 8: Integrations & Final - 7 migrations

52. `20250924000000_create_checkin_system_schema.sql`
53. `20250127000003_create_advanced_alerts_system.sql`
54. `20251008000007_family_portal_system.sql`
55. `20251009191916_integrate_vercel_supabase.sql`
56. `20251008_enable_realtime.sql`
57. `20251010_seed_clinical_categories.sql`
58. `20250927000003_remove_insurance_tables.sql`

**Por que:** Integrações finais, realtime e seed data

---

## 📋 Como Executar

### Opção 1: Manual (Recomendado para Primeira Vez)

1. Acessar: https://supabase.com/dashboard/project/urfxniitfbbvsaskicfo/editor
2. Copiar conteúdo de cada arquivo acima (NA ORDEM)
3. Colar no SQL Editor
4. Clicar em "Run"
5. Verificar mensagens de erro antes de prosseguir
6. Repetir para próxima migration

### Opção 2: Script Consolidado (Mais Rápido)

Ver arquivo `migrations-consolidated.sql` (será criado)

### Opção 3: Via Supabase CLI (Avançado)

```bash
# Se tiver Supabase CLI instalado
supabase db push
```

---

## ⚠️ Avisos Importantes

1. **Ordem Importa:** Siga EXATAMENTE a ordem acima
2. **Verificar Erros:** Pare se houver erro e corrija antes de prosseguir
3. **Backup:** Supabase faz backup automático, mas é bom confirmar
4. **Tempo:** ~30-60 minutos para executar tudo manualmente
5. **Dependencies:** Algumas migrations dependem de outras

---

## ✅ Validação

Após executar TODAS as migrations, execute:

```sql
-- Arquivo: verify_crm_migrations.sql
-- Verifica se tudo foi criado corretamente
```

Esperado:
- ~50+ tabelas criadas
- ~20+ funções SQL
- ~10+ views
- RLS habilitado em todas as tabelas
- Dados seed inseridos

---

**Gerado automaticamente em:** $(date)

