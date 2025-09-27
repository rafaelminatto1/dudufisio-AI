# 🚀 Supabase Integration Setup Guide

Este guia detalha como configurar a integração completa com Supabase no DuduFisio-AI.

## 📋 Pré-requisitos

1. **Conta Supabase**: Crie uma conta gratuita em [supabase.com](https://supabase.com)
2. **Node.js 18+**: Para executar o projeto
3. **Git**: Para clonar e versionar o código

## 🔧 Configuração Inicial

### 1. Criar Projeto no Supabase

1. Acesse o dashboard do Supabase
2. Clique em "New Project"
3. Configure:
   - **Name**: `dudufisio-ai`
   - **Database Password**: Use um password seguro
   - **Region**: South America (São Paulo) - `sa-east-1`

### 2. Configurar Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto:

```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# Feature Flags (opcional)
VITE_SUPABASE_REALTIME_ENABLED=true
VITE_SUPABASE_AUTH_ENABLED=true
VITE_SUPABASE_STORAGE_ENABLED=true
VITE_SUPABASE_FUNCTIONS_ENABLED=true

# Performance Settings (opcional)
VITE_SUPABASE_TIMEOUT=30000
VITE_SUPABASE_RETRIES=5
VITE_SUPABASE_BATCHSIZE=200

# AI Integration
GEMINI_API_KEY=your-gemini-api-key
```

### 3. Executar Migrações

Execute as migrações para criar as tabelas:

```bash
# Se você tiver a CLI do Supabase instalada
supabase db push

# Ou execute manualmente no SQL Editor do Supabase
# O arquivo de migração está em: supabase/migrations/20250926000100_create_advanced_scheduling_features.sql
```

### 4. Configurar Row Level Security (RLS)

Execute no SQL Editor do Supabase:

```sql
-- Habilitar RLS em todas as tabelas
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE treatment_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinical_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_trail ENABLE ROW LEVEL SECURITY;

-- Políticas básicas (exemplo)
CREATE POLICY "Users can read own data" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Therapists can read their patients" ON patients
  FOR SELECT USING (therapist_id = auth.uid());

-- Adicione mais políticas conforme necessário
```

## 📊 Estrutura do Banco de Dados

### Tabelas Principais

1. **users** - Usuários do sistema (fisioterapeutas, admins)
2. **patients** - Pacientes cadastrados
3. **appointments** - Consultas agendadas
4. **treatment_sessions** - Sessões de tratamento
5. **clinical_notes** - Anotações clínicas
6. **audit_trail** - Trail de auditoria

### Funcionalidades Avançadas

1. **recurrence_templates** - Templates de recorrência
2. **schedule_blocks** - Bloqueios de agenda
3. **waitlist_entries** - Fila de espera
4. **scheduling_alerts** - Alertas de agendamento

## 🔄 Integração Híbrida

O sistema utiliza um **Integration Manager** inteligente que:

- **Detecta automaticamente** se o Supabase está disponível
- **Faz fallback** para serviços mock em caso de problemas
- **Mantém compatibilidade** total com o desenvolvimento local
- **Permite migração** gradual dos dados

### Como Funciona

```typescript
import { integrationManager } from './services/supabase/integrationManager';

// O Integration Manager decide automaticamente qual serviço usar
const patients = await integrationManager.getAllPatients();
// ✅ Usa Supabase se disponível, senão usa mock

// Verificar status da conexão
const status = integrationManager.getConnectionStatus();
console.log('Provider atual:', status.currentProvider); // 'supabase' ou 'mock'
```

## 🚀 Deploy e Produção

### Vercel (Recomendado)

1. **Configure as variáveis de ambiente** no Vercel Dashboard
2. **Deploy automaticamente** via GitHub integration
3. **Monitore performance** através dos dashboards

```bash
# Deploy via CLI
vercel --prod

# Com variáveis de ambiente
vercel --prod -e VITE_SUPABASE_URL=your-url -e VITE_SUPABASE_ANON_KEY=your-key
```

### Outras Plataformas

O projeto é compatível com:
- **Netlify**
- **AWS Amplify**
- **Railway**
- **Digital Ocean App Platform**

## 🔐 Segurança

### Configurações Recomendadas

1. **RLS Habilitado**: Em todas as tabelas sensíveis
2. **Políticas Granulares**: Por tipo de usuário e operação
3. **API Keys Seguras**: Nunca commitar no código
4. **HTTPS Only**: Sempre em produção
5. **Audit Trail**: Ativado para todas as operações críticas

### Exemplo de Política RLS

```sql
-- Fisioterapeutas só veem seus pacientes
CREATE POLICY "therapist_patients_policy" ON patients
  FOR ALL USING (
    therapist_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role = 'admin'
    )
  );
```

## 📈 Monitoramento e Observabilidade

### Métricas Incluídas

1. **Performance de Queries**: Tempo de resposta do banco
2. **Uso de Recursos**: CPU, memória, conexões
3. **Erros e Logs**: Sistema de logging integrado
4. **Audit Trail**: Todas as operações críticas

### Dashboard de Monitoramento

Acesse via Supabase Dashboard:
- **Database → Metrics**: Métricas de performance
- **Logs**: Logs em tempo real
- **SQL Editor**: Para queries customizadas

## 🛠️ Troubleshooting

### Problemas Comuns

1. **Erro de Conexão**
   ```
   Supabase indisponível - Usando serviços mock
   ```
   - Verifique as variáveis de ambiente
   - Confirme se o projeto Supabase está ativo

2. **Erro de Permissão (RLS)**
   ```
   PGRST116: JWT expired
   ```
   - Configurar políticas RLS adequadas
   - Verificar autenticação do usuário

3. **Performance Lenta**
   - Adicionar índices nas tabelas
   - Otimizar queries complexas
   - Configurar cache quando necessário

### Comandos de Debug

```typescript
// Verificar configuração
import { supabaseConfigManager } from './lib/supabaseConfig';
supabaseConfigManager.logConfigSummary();

// Forçar reconexão
import { integrationManager } from './services/supabase/integrationManager';
await integrationManager.forceReconnection();

// Status detalhado
const status = integrationManager.getConnectionStatus();
console.log(status);
```

## 🔄 Migração de Dados

Para migrar dados existentes do mock para o Supabase:

```typescript
import { integrationManager } from './services/supabase/integrationManager';

// Migração automática (cuidado em produção!)
await integrationManager.migrateDataToSupabase();
```

## 📚 Recursos Adicionais

- [Documentação Oficial Supabase](https://supabase.com/docs)
- [Guia de Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Performance Best Practices](https://supabase.com/docs/guides/platform/performance)
- [Monitoring Guide](https://supabase.com/docs/guides/platform/logs)

## 🎯 Próximos Passos

1. ✅ **Setup Básico**: Configurar projeto e variáveis
2. ✅ **Migrações**: Executar criação de tabelas
3. ✅ **RLS**: Configurar políticas de segurança
4. ⏳ **Autenticação**: Implementar login/logout
5. ⏳ **Real-time**: Configurar subscriptions
6. ⏳ **Storage**: Para arquivos e imagens
7. ⏳ **Functions**: Para lógica serverless

---

💡 **Dica**: O sistema funciona perfeitamente em modo mock durante o desenvolvimento. Configure o Supabase apenas quando estiver pronto para produção!