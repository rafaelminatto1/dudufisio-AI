# Auditoria de Integrações Supabase (14/11/2025)

## Database Webhooks
- Integração instalada, porém não há configuração de *database webhooks* nas migrações (`supabase/migrations`) ou scripts (`supabase/sql`).  
- Nenhuma tabela possui `create webhook` ou chamadas para endpoints registrados.  
- Edge Functions existentes (`supabase/functions/*`) tratam notificações via invocações diretas (`supabase.functions.invoke`) sem depender de webhooks.  
**Ação sugerida:** mapear eventos críticos (ex.: `appointments`, `notification_schedules`) e registrar webhooks via CLI (`supabase db webhooks`) apontando para automações (Zapier/n8n) ou funções internas.

## GraphQL
- Integração habilita o endpoint `graphql_public`, mas o código do monorepo não consome GraphQL.  
- `supabase/config.toml` apenas inclui o schema `graphql_public`; não há consultas ou mutations `fetch('/graphql')` no frontend ou mobile.  
**Ação sugerida:** avaliar ganho real; se for usar, gerar *typed documents* via `graphql-codegen` e criar camada de acesso (`src/lib/graphqlClient.ts`).

## Vault
- Vault instalado, mas não há leituras de segredos via `select vault.*` ou chamadas `Deno.env.get('SUPABASE_VAULT_...')`.  
- Secrets sensíveis (chaves Stripe, WhatsApp, Firebase) continuam definidos via variáveis de ambiente tradicionais (.env/Edge Functions).  
**Ação sugerida:** migrar chaves críticas para Vault e ajustar funções (`supabase/functions/send-push-notification`, `stripe-payment`, `send-whatsapp`) para buscar segredos com `select vault.get_secret(...)`.

---
### Próximos Passos Prioritários
1. Especificar eventos/tabelas que devem disparar webhooks (consultas, pagamentos, logs).  
2. Definir se GraphQL trará benefício (ex.: dashboards analíticos) ou desabilitar para simplificar superfície de ataque.  
3. Criar plano de migração gradual de segredos para Vault com rotação automática.

