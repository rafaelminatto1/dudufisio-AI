# 🔧 Guia de Manutenção - DuduFisio-AI Supabase

## 📋 Índice
- [Visão Geral](#visão-geral)
- [Checklist Semanal](#checklist-semanal)
- [Checklist Mensal](#checklist-mensal)
- [Monitoramento Automatizado](#monitoramento-automatizado)
- [Interpretando Resultados](#interpretando-resultados)
- [Procedimentos de Correção](#procedimentos-de-correção)
- [Contatos e Escalação](#contatos-e-escalação)

---

## 🎯 Visão Geral

Este guia fornece procedimentos padronizados para manutenção do banco de dados Supabase do DuduFisio-AI.

### Objetivos da Manutenção
- Manter score de saúde ≥ 95%
- Prevenir degradação de performance
- Identificar problemas antes que afetem usuários
- Garantir integridade dos dados

### Ferramentas Disponíveis
- **Scripts locais:** Executar manualmente ou via CI/CD
- **GitHub Actions:** Verificações automatizadas semanais
- **Dashboard Supabase:** Monitoramento em tempo real

---

## ✅ Checklist Semanal

### 🗓️ Toda Sexta-Feira (17h)

#### 1. Executar Revisão Completa
```bash
npx tsx scripts/revisao-completa.ts
```

**O que verificar:**
- [ ] Score ≥ 95%
- [ ] Todas as tabelas acessíveis
- [ ] Zero foreign keys inválidas
- [ ] Storage buckets funcionando
- [ ] RLS ativo em todas as tabelas

#### 2. Verificar Integridade de Dados
```bash
npx tsx scripts/verificar-fk-invalidas.ts
```

**Ação se houver problemas:**
- Se < 5 referências inválidas: Agendar correção para próxima semana
- Se ≥ 5 referências inválidas: Corrigir imediatamente

#### 3. Revisar Logs
- Acessar Dashboard Supabase → Logs
- Verificar erros nas últimas 7 dias
- Identificar queries lentas (> 1s)

#### 4. Verificar Uso de Recursos
- Storage: Deve estar < 80%
- Conexões DB: Deve estar < 80%
- API calls: Revisar picos anormais

#### 5. Documentar Resultado
- Registrar score no log
- Anotar problemas identificados
- Atualizar issues no GitHub se necessário

---

## 📅 Checklist Mensal

### 🗓️ Primeira Segunda-Feira do Mês

#### 1. Análise de Performance
- Revisar queries mais lentas do mês
- Identificar candidatos para novos índices
- Avaliar necessidade de otimizações

#### 2. Revisão de Policies RLS
- Verificar se policies estão adequadas
- Testar permissões de cada role
- Atualizar se necessário

#### 3. Limpeza de Dados
- Identificar registros órfãos
- Limpar dados temporários antigos
- Arquivar dados inativos (se aplicável)

#### 4. Backup e Restore
- Verificar backups automáticos
- Testar procedimento de restore (em dev)
- Validar integridade dos backups

#### 5. Atualização de Documentação
- Atualizar diagramas se houver mudanças
- Revisar documentação de procedures
- Atualizar guias se necessário

#### 6. Revisão de Segurança
```bash
npm run security:audit
```

- Verificar vulnerabilidades
- Atualizar dependências críticas
- Revisar logs de acesso suspeitos

---

## 🤖 Monitoramento Automatizado

### GitHub Actions - Weekly Health Check

**Agenda:** Toda segunda-feira às 9h (UTC)

**O que faz:**
1. Executa `monitor-health-log.ts`
2. Gera relatório JSON com métricas
3. Cria GitHub Issue se score < 95%
4. Salva artefatos por 30 dias

**Como ver resultados:**
1. GitHub → Actions → Weekly Supabase Health Check
2. Click no run mais recente
3. Download do artefato `health-report-*`

**Alertas automáticos:**
- Score < 95%: Cria issue com label `supabase-health`
- Score < 80%: Adiciona label `priority`
- Falha crítica: Cria issue com label `critical`

### Script Local - Monitoramento Manual

```bash
# Executar monitoramento com logs
npx tsx scripts/monitor-health-log.ts

# Ver último relatório
cat logs/latest-health-check.txt

# Ver histórico de relatórios
ls -la logs/
```

---

## 📊 Interpretando Resultados

### Scores e Status

| Score | Status | Ação |
|-------|--------|------|
| 95-100% | ✅ Healthy | Nenhuma ação necessária |
| 80-94% | ⚠️ Warning | Investigar e agendar correções |
| < 80% | ❌ Critical | **Ação imediata necessária** |

### Problemas Comuns

#### Score 96-98%
**Causa típica:** 1-2 tabelas secundárias vazias ou inacessíveis

**Ação:**
- Verificar se são tabelas realmente necessárias
- Popular com dados se apropriado
- Não é urgente, mas deve ser resolvido

#### Score 85-95%
**Causa típica:** Alguns registros com foreign keys inválidas

**Ação:**
1. Executar `verificar-fk-invalidas.ts`
2. Identificar registros problemáticos
3. Corrigir com `fix-fk-problem-cascade.ts`

#### Score < 85%
**Causa típica:** Múltiplos problemas simultâneos

**Ação imediata:**
1. Executar revisão completa
2. Listar todos os problemas
3. Priorizar por impacto
4. Corrigir um por um
5. Re-executar verificação após cada correção

---

## 🛠️ Procedimentos de Correção

### 1. Foreign Keys Inválidas

**Identificação:**
```bash
npx tsx scripts/verificar-fk-invalidas.ts
```

**Correção:**
```bash
npx tsx scripts/fix-fk-problem-cascade.ts
```

**Verificação:**
```bash
npx tsx scripts/verificar-fk-invalidas.ts
# Deve mostrar: "Todas as referências estão válidas!"
```

### 2. Tabela Inacessível

**Diagnóstico:**
1. Verificar no Dashboard se tabela existe
2. Verificar policies RLS
3. Verificar se nome está correto

**Correção:**
- Se RLS muito restritivo: Ajustar policies
- Se tabela não existe: Criar via migration
- Se problema de nome: Atualizar scripts

### 3. Storage Bucket Inacessível

**Diagnóstico:**
1. Dashboard → Storage → Verificar bucket
2. Testar upload manual
3. Verificar policies de acesso

**Correção:**
```sql
-- No SQL Editor do Supabase
-- Verificar policies do bucket
SELECT * FROM storage.objects WHERE bucket_id = 'nome-do-bucket';

-- Recriar policy se necessário
CREATE POLICY "Allow authenticated access"
ON storage.objects FOR ALL
TO authenticated
USING (bucket_id = 'nome-do-bucket');
```

### 4. Performance Degradada

**Identificação:**
- Dashboard → Logs → Queries lentas
- Filtrar por duration > 1s

**Correção:**
1. Identificar query problemática
2. Analisar execution plan
3. Adicionar índice se necessário:

```sql
-- Criar índice
CREATE INDEX idx_nome_coluna 
ON tabela(coluna);

-- Verificar uso
EXPLAIN ANALYZE SELECT ...;
```

### 5. Uso Alto de Conexões

**Diagnóstico:**
- Dashboard → Database → Connection Pooling

**Correção imediata:**
```sql
-- Terminar conexões idle
SELECT pg_terminate_backend(pid)
FROM pg_stat_activity
WHERE state = 'idle'
AND query_start < NOW() - INTERVAL '30 minutes';
```

**Correção permanente:**
- Revisar código para fechar conexões
- Configurar connection pooling
- Usar Supabase Pooler

---

## 📞 Contatos e Escalação

### Níveis de Severidade

#### 🟢 Baixa (Score 95-98%)
- **Ação:** Registrar no log, corrigir em até 1 semana
- **Contato:** Equipe de desenvolvimento
- **Horário:** Horário comercial

#### 🟡 Média (Score 80-94%)
- **Ação:** Investigar em até 24h, corrigir em até 3 dias
- **Contato:** Tech Lead + Equipe dev
- **Horário:** Horário comercial + disponibilidade extra

#### 🔴 Alta (Score < 80%)
- **Ação:** Ação imediata (< 4h)
- **Contato:** Tech Lead + DevOps + CTO
- **Horário:** 24/7

#### 🚨 Crítica (Sistema Indisponível)
- **Ação:** Ação imediata (< 1h)
- **Contato:** Todos + Supabase Support
- **Horário:** 24/7
- **Escalação:** Supabase Support (support@supabase.io)

### Fluxo de Escalação

```
1. Problema Detectado
   ↓
2. Executar diagnóstico inicial (scripts)
   ↓
3. Avaliar severidade
   ↓
4. Notificar equipe apropriada
   ↓
5. Aplicar correção
   ↓
6. Verificar resolução
   ↓
7. Documentar no log
   ↓
8. Atualizar runbook se necessário
```

### Templates de Comunicação

#### Email - Problema Identificado
```
Assunto: [SUPABASE] Problema {SEVERIDADE} - Score {XX}%

Problema detectado no monitoramento do Supabase:
- Score atual: XX%
- Status: {healthy|warning|critical}
- Problemas identificados:
  • {problema 1}
  • {problema 2}

Ação necessária: {descrever}
Prazo: {urgência}

Relatório completo: {link}
```

#### Slack - Alerta Crítico
```
🚨 ALERTA CRÍTICO - SUPABASE

Score: XX% (< 80%)
Impacto: {descrever impacto nos usuários}

Ação imediata necessária:
1. {ação 1}
2. {ação 2}

@tech-lead @devops
```

---

## 📚 Recursos Adicionais

### Documentação
- [Supabase Dashboard](https://supabase.com/dashboard/project/urfxniitfbbvsaskicfo)
- [SQL Editor](https://supabase.com/dashboard/project/urfxniitfbbvsaskicfo/sql)
- [Logs](https://supabase.com/dashboard/project/urfxniitfbbvsaskicfo/logs)

### Scripts Disponíveis
- `scripts/revisao-completa.ts` - Revisão completa
- `scripts/verificar-fk-invalidas.ts` - Verificar integridade
- `scripts/monitor-health-log.ts` - Monitoramento com log
- `scripts/check-table-structure.ts` - Ver estrutura de tabelas
- `scripts/fix-fk-problem-cascade.ts` - Corrigir FKs

### Links Úteis
- README_VERIFICACAO.md - Visão geral do sistema
- RELATORIO_SUPABASE_PRODUCAO.md - Relatório completo inicial
- SUCESSO_CORRECAO.md - Histórico de correções

---

**Última atualização:** 3 de Novembro de 2025  
**Responsável pela manutenção:** Equipe DuduFisio-AI  
**Revisão recomendada:** Trimestral

