# 📘 Guia de Execução - Seed Data dos Novos Módulos

## ✅ Pré-requisitos

Antes de executar o script de seed, você precisa:

### 1. Aplicar as Migrations no Supabase

```bash
# Aplicar todas as migrations
npx supabase db push

# OU aplicar migrations específicas
cd supabase/migrations
# Copiar e colar o conteúdo de cada migration no Supabase SQL Editor
```

**Migrations necessárias (em ordem):**
1. `20251008_risk_stratification_system.sql` ✅ (já existe)
2. `20251008_sports_rehabilitation_system.sql` ✅ (já existe)
3. `20251008_population_health_system.sql` ✅ (nova)
4. `20251008_family_portal_system.sql` ✅ (nova)
5. `20251008_predictive_analytics_system.sql` ✅ (nova)
6. `20251008_quality_assurance_system.sql` ✅ (nova)

### 2. Configurar Variáveis de Ambiente

Criar arquivo `.env.local` na raiz do projeto:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua_chave_anon_aqui
```

**Onde encontrar essas chaves:**
1. Acessar: https://app.supabase.com
2. Selecionar seu projeto
3. Ir em: Settings > API
4. Copiar:
   - `Project URL` → `VITE_SUPABASE_URL`
   - `anon / public key` → `VITE_SUPABASE_ANON_KEY`

### 3. Instalar ts-node (se necessário)

```bash
npm install -D ts-node @types/node
```

---

## 🚀 Executando o Script de Seed

### Opção 1: Executar Diretamente

```bash
npx ts-node scripts/seed-new-modules.ts
```

### Opção 2: Adicionar ao package.json

Adicionar script em `package.json`:

```json
{
  "scripts": {
    "seed": "ts-node scripts/seed-new-modules.ts",
    "seed:modules": "ts-node scripts/seed-new-modules.ts"
  }
}
```

Depois executar:

```bash
npm run seed
```

---

## 📊 O que o Script Cria

### 1. Pacientes de Exemplo (5)
- João Silva (1985, masculino)
- Maria Santos (1992, feminino)
- Carlos Oliveira (1978, masculino)
- Ana Paula Costa (1995, feminino)
- Roberto Mendes (1988, masculino)

### 2. Avaliações de Risco (5)
- 1 avaliação de risco por paciente
- Tipos: cardiovascular, respiratory, fall_risk, pressure_ulcer
- Scores aleatórios entre 0-100
- Níveis de risco variados

### 3. Perfis de Atletas (2)
- 2 primeiros pacientes como atletas
- Esportes: Futebol e Vôlei
- Lesões associadas com dados de recuperação
- Testes funcionais (Hop Test, T-Test)

### 4. Membros da Família (3)
- Cônjuge, pai/mãe, filho/filha
- Permissões configuradas
- Consentimento LGPD dado

### 5. Predições de IA (5)
- 1 predição por paciente
- Tipo: treatment_outcome
- Confidence scores: 0.75 - 0.95
- Recomendações e fatores analisados

### 6. Dados de Compliance (1)
- Auditoria abrangente
- Score: 95/100
- 2 issues encontrados (low severity)
- Próxima auditoria agendada

---

## ✅ Verificação dos Dados

Após executar o seed, verificar no Supabase:

```sql
-- Verificar pacientes
SELECT COUNT(*) FROM patients WHERE name LIKE '%Silva%' OR name LIKE '%Santos%';

-- Verificar avaliações de risco
SELECT COUNT(*) FROM risk_assessments;

-- Verificar perfis de atletas
SELECT COUNT(*) FROM athlete_profiles;

-- Verificar membros da família
SELECT COUNT(*) FROM family_members;

-- Verificar predições
SELECT COUNT(*) FROM ai_predictions;

-- Verificar compliance
SELECT COUNT(*) FROM compliance_audits;
```

**Resultado esperado:**
- ✅ 5 pacientes
- ✅ 5 avaliações de risco
- ✅ 2 perfis de atletas
- ✅ 3 membros da família
- ✅ 5 predições de IA
- ✅ 1 auditoria de compliance

---

## 🔧 Troubleshooting

### Erro: "VITE_SUPABASE_URL não definida"
**Solução:** Criar arquivo `.env.local` com as variáveis corretas (ver seção 2)

### Erro: "relation 'patients' does not exist"
**Solução:** Aplicar as migrations base do sistema primeiro:
```bash
# Aplicar TODAS as migrations
npx supabase db push
```

### Erro: "duplicate key value violates unique constraint"
**Solução:** Os dados já existem. Para recriar:
```sql
-- Deletar dados existentes
DELETE FROM compliance_audits;
DELETE FROM ai_predictions;
DELETE FROM family_members;
DELETE FROM athlete_profiles;
DELETE FROM risk_assessments;
DELETE FROM patients WHERE cpf IN ('123.456.789-00', '987.654.321-00', '456.789.123-00', '321.654.987-00', '789.123.456-00');
```

Depois executar o seed novamente.

### Erro: "permission denied"
**Solução:** Verificar RLS (Row Level Security) policies no Supabase. Temporariamente desabilitar:
```sql
ALTER TABLE patients DISABLE ROW LEVEL SECURITY;
ALTER TABLE risk_assessments DISABLE ROW LEVEL SECURITY;
-- ... repetir para outras tabelas necessárias
```

**⚠️ IMPORTANTE:** Re-habilitar RLS após o seed em produção!

---

## 📝 Próximos Passos

Depois de executar o seed com sucesso:

1. ✅ Acessar o sistema e verificar os dados nas páginas:
   - `/risk-stratification/:patientId`
   - `/sports-rehab/:patientId`
   - `/population-health`
   - `/family-portal/:patientId`
   - `/predictive-analytics/:patientId`
   - `/quality-assurance`

2. ✅ Testar cada funcionalidade (TODO 1.1)

3. ✅ Validar fluxos completos (TODO 1.3)

---

## 📞 Suporte

Se encontrar problemas:

1. Verificar logs do script (mensagens de erro detalhadas)
2. Verificar no Supabase Dashboard:
   - Database > Tables (estrutura)
   - Database > Migrations (aplicadas)
   - Table Editor (dados)
3. Verificar logs do Supabase:
   - Dashboard > Logs

---

**Criado em:** 08 de Outubro de 2025  
**Versão:** 1.0  
**Status:** ✅ PRONTO PARA USO



