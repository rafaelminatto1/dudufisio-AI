# 📊 Guia de Monitoramento - DuduFisio AI

**Versão**: 1.0  
**Data**: 24 de Outubro de 2025

---

## 📋 Visão Geral

Este guia explica como usar o sistema de monitoramento automatizado implementado no projeto.

---

## 🔧 Comandos Disponíveis

### Segurança

#### `npm run security:audit`
Executa auditoria completa de segurança com análise de risco real.

```bash
npm run security:audit
```

**O que faz**:
- Executa `npm audit --json`
- Analisa vulnerabilidades com contexto do projeto
- Categoriza por risco real (não apenas severidade reportada)
- Gera relatório markdown em `security-audits/`
- Exit code 1 se vulnerabilidades de alto risco

**Quando usar**: Semanalmente (toda segunda-feira)

---

#### `npm run security:check`
Verificação rápida de segurança.

```bash
npm run security:check
```

**O que faz**:
- Executa `npm audit` padrão
- Verifica se @vercel/node tem atualizações
- Mostra resultado no console

**Quando usar**: Antes de fazer deploy

---

### Dependências

#### `npm run check:dependencies`
Verifica versões de dependências críticas.

```bash
npm run check:dependencies
```

**O que faz**:
- Lista versões de pacotes críticos
- Compara com versões seguras conhecidas
- Alerta se pacotes desatualizados
- Exit code 1 se vulnerabilidades

**Quando usar**: Semanalmente

---

### Monitoramento de Saúde

#### `npm run monitor:health`
Monitora saúde geral do sistema.

```bash
npm run monitor:health
```

**O que faz**:
- Verifica bundle size
- Testa conexão com Supabase
- Valida variáveis de ambiente
- Verifica dependências críticas
- Gera relatório JSON em `reports/daily/`

**Quando usar**: Diariamente ou antes de deploy

---

### Alertas

#### `npm run alert:vulnerabilities`
Alerta sobre vulnerabilidades pendentes.

```bash
npm run alert:vulnerabilities
```

**O que faz**:
- Lê histórico de relatórios de auditoria
- Calcula há quantos dias vulnerabilidades existem
- Alerta se > 7 dias com vulnerabilidades HIGH/CRITICAL
- Exit code 1 se ação necessária

**Quando usar**: Automático via GitHub Actions

---

### Relatórios

#### `npm run report:daily`
Gera resumo diário de atividades.

```bash
npm run report:daily
```

**O que faz**:
- Lista commits do dia
- Status do último build
- Contagem de testes
- Gera relatório em `reports/daily/`

**Quando usar**: Final do dia de trabalho

---

## 📅 Cronograma Recomendado

### Diário
- [ ] `npm run monitor:health` (ao iniciar trabalho)
- [ ] `npm run report:daily` (ao final do dia)

### Semanal (Segunda-feira)
- [ ] `npm run security:audit`
- [ ] `npm run check:dependencies`
- [ ] Revisar relatórios em `security-audits/`

### Antes de Deploy
- [ ] `npm run security:check`
- [ ] `npm run monitor:health`
- [ ] `npm run build:check`

### Automático (GitHub Actions)
- ✅ Auditoria semanal (toda segunda às 9h)
- ✅ E2E após deploy
- ✅ Bundle check em PRs

---

## 📊 Interpretando Relatórios

### Relatório de Auditoria (`security-audits/audit-*.md`)

**Seções importantes**:

1. **Resumo por Severidade**
   - Compare "Reportado" vs "Risco Real"
   - Foco no "Risco Real"

2. **Vulnerabilidades por Categoria**
   - CRITICAL: Ação imediata
   - HIGH: Ação em 1 semana
   - MODERATE: Monitorar
   - LOW: Apenas informativo

3. **Recomendações**
   - Seguir ordem de prioridade
   - Verificar se breaking changes

4. **Status Geral**
   - ✅ SEGURO: Tudo OK
   - ⚠️ ATENÇÃO: Revisar
   - 🔴 URGENTE: Agir!

---

### Relatório de Saúde (`reports/daily/health-*.json`)

**Estrutura**:
```json
{
  "timestamp": "...",
  "checks": [
    {
      "name": "Bundle Size",
      "status": "PASS|FAIL|WARN",
      "details": { ... }
    }
  ]
}
```

**Status possíveis**:
- `PASS`: Tudo OK
- `FAIL`: Requer ação
- `WARN`: Atenção
- `SKIP`: Não executado
- `INFO`: Apenas informativo

---

### Alertas de Vulnerabilidades

**Saídas possíveis**:

```bash
✅ Nenhuma vulnerabilidade de alto risco
# Exit code 0

⚠️ ATENÇÃO: X dias restantes até ação obrigatória
# Exit code 0

🔴 ALERTA: AÇÃO NECESSÁRIA!
# Exit code 1
```

---

## ⚠️ Quando Agir

### Vulnerabilidades CRITICAL
- **Prazo**: Imediato
- **Ação**: Aplicar correção hoje
- **Processo**: 
  1. Ler relatório completo
  2. Testar correção em branch
  3. Deploy em preview
  4. Merge se OK

### Vulnerabilidades HIGH
- **Prazo**: 1 semana
- **Ação**: Planejar correção
- **Processo**:
  1. Investigar impacto
  2. Criar issue no GitHub
  3. Agendar correção
  4. Testar antes de aplicar

### Vulnerabilidades MODERATE
- **Prazo**: 1 mês
- **Ação**: Monitorar
- **Processo**:
  1. Verificar se persiste
  2. Aguardar atualização upstream
  3. Aplicar quando não-breaking

### Vulnerabilidades LOW
- **Prazo**: Sem pressa
- **Ação**: Informativo apenas
- **Processo**: Nenhum

---

## 🔍 Troubleshooting

### "Erro ao executar npm audit"
```bash
# Limpar cache
npm cache clean --force

# Reinstalar
rm -rf node_modules package-lock.json
npm install
```

### "Relatório não foi gerado"
```bash
# Verificar diretórios existem
ls -la security-audits/
ls -la reports/daily/

# Criar se necessário
mkdir -p security-audits reports/daily
```

### "Bundle size check falhou mas build está OK"
```bash
# Executar manualmente
npm run build:check

# Ver detalhes
cat dist/*.txt
```

---

## 📈 Métricas Importantes

### Bundle Size
- **Limite total**: 12 MB
- **Limite por chunk**: 500 KB
- **Ideal**: < 50% do limite

### Performance
- **Tempo de build**: < 15 minutos
- **Tamanho gzip CSS**: < 30 KB
- **Chunks otimizados**: > 200

### Segurança
- **Vulnerabilidades CRITICAL**: 0
- **Vulnerabilidades HIGH**: 0
- **Tempo de resposta**: < 7 dias

---

## 🔗 Links Úteis

### Relatórios
- Security Audits: `security-audits/`
- Daily Reports: `reports/daily/`

### GitHub Actions
- Workflows: `.github/workflows/`
- Actions: https://github.com/rafaelminatto1/dudufisio-AI/actions

### Análises Detalhadas
- `ANALISE_VULNERABILIDADES_NPM.md` - Análise técnica
- `VULNERABILIDADES_RESUMO_EXECUTIVO.md` - Resumo executivo

---

## 🎯 Checklist Semanal

```
Segunda-feira:
[ ] npm run security:audit
[ ] npm run check:dependencies
[ ] Revisar relatórios gerados
[ ] Verificar GitHub Actions executaram
[ ] Agir se vulnerabilidades > 7 dias

Durante a semana:
[ ] npm run monitor:health (diariamente)
[ ] npm run report:daily (final do dia)

Antes de deploy:
[ ] npm run security:check
[ ] npm run build:check
[ ] npm run test:critical
```

---

## ❓ FAQ

**P: Com que frequência devo executar auditoria?**  
R: Semanalmente (segunda-feira). GitHub Actions executa automaticamente.

**P: O que fazer se auditoria falhar?**  
R: Ler o relatório em `security-audits/`, verificar risco real, agir conforme prioridade.

**P: Posso desabilitar os workflows?**  
R: Sim, mas não recomendado. Edite os arquivos em `.github/workflows/`.

**P: Como ver histórico de auditorias?**  
R: Todos os relatórios ficam em `security-audits/` com timestamp.

---

*Guia mantido por: Scripts de monitoramento automatizados*

