# 🔧 Setup Git via CLI - Monorepo Vercel

## ⚠️ Importante: Limitações do CLI para Monorepos

O comando `vercel git connect` **não funciona bem com monorepos** porque:
- Ele espera um projeto por repositório
- Não suporta múltiplos Root Directories no mesmo repo
- A configuração de monorepo precisa ser feita via Dashboard

## ✅ O Que Já Foi Feito

```bash
✅ agenda-pacientes: Linked to rafael-minattos-projects/agenda-pacientes
✅ Repositório Git identificado: https://github.com/rafaelminatto1/dudufisio-AI.git
```

## 🎯 Solução Híbrida (CLI + Dashboard)

### Passo 1: Link dos Projetos via CLI ✅

```bash
# Agenda-Pacientes (JÁ FEITO)
cd packages/agenda-pacientes
vercel link --yes
✅ Linked to rafael-minattos-projects/agenda-pacientes

# Tratamentos
cd ../tratamentos
vercel link --yes

# Financeiro
cd ../financeiro
vercel link --yes

# Host
cd ../host
vercel link --yes
```

### Passo 2: Conexão Git via Dashboard (NECESSÁRIO)

Para cada projeto, acesse o Dashboard e configure:

#### Agenda-Pacientes
URL: https://vercel.com/rafael-minattos-projects/agenda-pacientes/settings/git

**Configuração:**
```json
{
  "gitRepository": {
    "repo": "rafaelminatto1/dudufisio-AI",
    "type": "github"
  },
  "rootDirectory": "packages/agenda-pacientes",
  "productionBranch": "main"
}
```

1. Clique em **"Connect Git Repository"**
2. Selecione: `rafaelminatto1/dudufisio-AI`
3. Configure Root Directory: `packages/agenda-pacientes`
4. Salve

#### Tratamentos
URL: https://vercel.com/rafael-minattos-projects/tratamentos/settings/git

**Root Directory:** `packages/tratamentos`

#### Financeiro
URL: https://vercel.com/rafael-minattos-projects/financeiro/settings/git

**Root Directory:** `packages/financeiro`

#### Host
URL: https://vercel.com/rafael-minattos-projects/host/settings/git

**Root Directory:** `packages/host`

## 🚀 Automatizando os Links via CLI

Vou executar os links para todos os projetos:

```bash
# Script automático
cd packages/tratamentos && vercel link --yes && \
cd ../financeiro && vercel link --yes && \
cd ../host && vercel link --yes
```

## 📋 Status Atual

### ✅ Completo
- [x] Git repository configurado: `https://github.com/rafaelminatto1/dudufisio-AI.git`
- [x] Agenda-Pacientes linked via CLI
- [x] Ignore build step configurado em todos os vercel.json

### ⏳ Pendente (Manual via Dashboard)
- [ ] Conectar agenda-pacientes ao Git (Dashboard)
- [ ] Link tratamentos via CLI
- [ ] Conectar tratamentos ao Git (Dashboard)
- [ ] Link financeiro via CLI
- [ ] Conectar financeiro ao Git (Dashboard)
- [ ] Link host via CLI
- [ ] Conectar host ao Git (Dashboard)

## 🎯 Por Que Dashboard é Necessário?

### Monorepo = Múltiplos Root Directories

```
github.com/rafaelminatto1/dudufisio-AI
├── packages/
│   ├── agenda-pacientes/   → Projeto Vercel 1 (Root: packages/agenda-pacientes)
│   ├── tratamentos/        → Projeto Vercel 2 (Root: packages/tratamentos)
│   ├── financeiro/         → Projeto Vercel 3 (Root: packages/financeiro)
│   └── host/              → Projeto Vercel 4 (Root: packages/host)
```

O CLI não consegue configurar isso automaticamente. Você precisa:
1. **CLI:** `vercel link` → Conecta projeto ao time/org
2. **Dashboard:** Configurar Git + Root Directory → Conecta ao repositório com path correto

## 🔄 Workflow Completo

### 1. Via CLI (Agora)
```bash
# Executar para cada package
cd packages/[nome]
vercel link --yes
```

### 2. Via Dashboard (15 min - Manual)
Para cada projeto:
1. Acessar Settings → Git
2. Connect Git Repository
3. Selecionar: rafaelminatto1/dudufisio-AI
4. Root Directory: packages/[nome]
5. Production Branch: main
6. Salvar

### 3. Resultado
```
git push → Vercel detecta mudanças no repo
         → Verifica Root Directory de cada projeto
         → Build apenas os que mudaram
         → Deploy automático! 🚀
```

## 📚 Links Úteis

- **Seu Repositório:** https://github.com/rafaelminatto1/dudufisio-AI.git
- **Vercel Team:** https://vercel.com/rafael-minattos-projects
- **Documentação Vercel Monorepos:** https://vercel.com/docs/monorepos

---

**Próximo Passo:** Vou executar os links CLI para os 3 projetos restantes agora!

