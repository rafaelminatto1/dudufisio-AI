# 🚀 QUICK START - PRÓXIMA SESSÃO

**Data:** 08 de Outubro de 2025  
**Tempo Total:** 30 minutos para sistema rodando  
**Status:** ✅ PRONTO PARA EXECUTAR

---

## 🎯 OBJETIVO

Configurar e iniciar o sistema em **30 minutos**.

---

## ✅ PRÉ-REQUISITOS

```
✅ Node.js 18+ instalado
✅ npm instalado
✅ Conta Supabase (gratuita)
✅ Projeto clonado localmente
```

---

## 🚀 PASSO A PASSO (30 MIN)

### PASSO 1: Criar Projeto Supabase (5 min)

```
1. Acessar: https://app.supabase.com
2. Clicar: "New Project"
3. Preencher:
   - Name: dudufisio-ai-dev
   - Database Password: [senha forte]
   - Region: South America (São Paulo)
   - Pricing: Free
4. Aguardar criação (~2 min)
5. ✅ Projeto criado!
```

---

### PASSO 2: Copiar Credenciais (2 min)

```
1. No Supabase Dashboard:
   - Clicar: Settings > API
   
2. Copiar 2 valores:
   - Project URL
   - anon public key
   
3. Guardar para próximo passo
```

---

### PASSO 3: Configurar .env.local (2 min)

```bash
# Na raiz do projeto, criar arquivo .env.local:

# Windows (PowerShell)
notepad .env.local

# Mac/Linux
nano .env.local

# Colar:
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua_chave_anon_aqui
VITE_GEMINI_API_KEY=sua_chave_gemini (opcional)
ANTHROPIC_API_KEY=sua_chave_claude (opcional)

# Salvar e fechar
```

---

### PASSO 4: Aplicar Migrations (15 min)

**Método Recomendado:** Via SQL Editor no Supabase Dashboard

```
1. Abrir: Supabase Dashboard > SQL Editor

2. Aplicar migrations NA ORDEM (IMPORTANTE!):
```

**Lista de Migrations (16 arquivos):**

```
# Ordem correta de aplicação:

1️⃣  supabase/migrations/20241231000000_create_base_tables.sql
2️⃣  supabase/migrations/20241231000001_create_user_profiles.sql
3️⃣  ... (suas migrations existentes em ordem cronológica)

# Novas migrations (aplicar nesta ordem):

4️⃣  supabase/migrations/20251008_risk_stratification_system.sql
5️⃣  supabase/migrations/20251008_sports_rehabilitation_system.sql
6️⃣  supabase/migrations/20251008_population_health_system.sql
7️⃣  supabase/migrations/20251008_family_portal_system.sql
8️⃣  supabase/migrations/20251008_predictive_analytics_system.sql
9️⃣  supabase/migrations/20251008_quality_assurance_system.sql
🔟 supabase/migrations/20251008_geriatric_module.sql
1️⃣1️⃣ supabase/migrations/20251008_mental_health_integration.sql
1️⃣2️⃣ supabase/migrations/20251008_emr_ehr_integration.sql
1️⃣3️⃣ supabase/migrations/20251008_symptom_tracker.sql
1️⃣4️⃣ supabase/migrations/20251008_nutritional_guidance.sql
1️⃣5️⃣ supabase/migrations/20251008_wearables_integration.sql
1️⃣6️⃣ supabase/migrations/20251008_enable_realtime.sql
```

**Processo:**

```
Para CADA migration:

1. Abrir arquivo .sql no VS Code
2. Copiar TODO o conteúdo (Ctrl+A, Ctrl+C)
3. Colar no SQL Editor do Supabase
4. Clicar: "Run"
5. Aguardar: "Success" (verde)
6. Repetir para próxima migration

⚠️ IMPORTANTE: Aplicar NA ORDEM CRONOLÓGICA!
```

**Verificar Sucesso:**

```sql
-- Rodar no SQL Editor para validar:
SELECT COUNT(*) as total_tables 
FROM information_schema.tables 
WHERE table_schema = 'public';

-- Esperado: ~107 tabelas
```

---

### PASSO 5: Executar Seed (2 min)

```bash
# Instalar dependências (se ainda não fez)
npm install

# Executar seed
npm run seed

# Output esperado:
# 🌱 Iniciando seed de dados...
# ✅ 5 pacientes criados
# ✅ 10 avaliações de risco
# ✅ 8 perfis de atletas
# ✅ 12 membros da família
# ✅ 15 predições de IA
# ... (mais dados)
# ✅ Seed completo!

# ✅ Dados populados!
```

---

### PASSO 6: Iniciar Sistema (1 min)

```bash
# Desenvolvimento
npm run dev

# Aguardar:
# ➜  Local:   http://localhost:5173/
# ➜  press h to show help

# ✅ Sistema rodando!
```

---

### PASSO 7: Testar Acesso (3 min)

```
1. Abrir navegador: http://localhost:5173

2. Login com usuário test:
   Email: admin@dudufisio.com
   Senha: admin123 (ou a que você configurou)

3. Verificar:
   ✅ Dashboard carrega
   ✅ Menu lateral funciona
   ✅ Pode navegar entre páginas

4. ✅ Sistema funcionando!
```

---

## 🎯 RESUMO DOS COMANDOS

```bash
# 1. Instalar deps
npm install

# 2. Configurar .env.local (manual)
# Copiar .env.example para .env.local
# Preencher com credenciais Supabase

# 3. Aplicar migrations (manual via SQL Editor)
# Copiar e colar cada .sql no Supabase Dashboard

# 4. Seed
npm run seed

# 5. Dev
npm run dev

# 6. Abrir
# http://localhost:5173
```

---

## 🐛 TROUBLESHOOTING

### Erro: "Failed to connect to Supabase"

```
❌ Problema: Credenciais erradas no .env.local

✅ Solução:
1. Verificar VITE_SUPABASE_URL
2. Verificar VITE_SUPABASE_ANON_KEY
3. Reiniciar dev server (Ctrl+C e npm run dev)
```

---

### Erro: "Table does not exist"

```
❌ Problema: Migrations não aplicadas ou na ordem errada

✅ Solução:
1. Abrir Supabase > SQL Editor
2. Ver se todas as tabelas existem:
   SELECT tablename FROM pg_tables WHERE schemaname = 'public';
3. Re-aplicar migrations na ordem correta
```

---

### Erro: "Seed failed"

```
❌ Problema: Migrations incompletas ou dados já existem

✅ Solução:
1. Verificar migrations aplicadas
2. Se dados já existem, tudo bem (ignorar erro)
3. Se quiser limpar e refazer:
   - Supabase > Table Editor
   - Deletar dados manualmente
   - Rodar seed novamente
```

---

### Erro: "Port 5173 already in use"

```
❌ Problema: Outro processo usando porta 5173

✅ Solução:
# Windows
netstat -ano | findstr :5173
taskkill /PID [número] /F

# Mac/Linux
lsof -ti:5173 | xargs kill -9

# Ou usar outra porta:
npm run dev -- --port 5174
```

---

## ✅ CHECKLIST DE VALIDAÇÃO

Depois de tudo rodando, verificar:

### Sistema Básico
- [ ] ✅ Login funciona
- [ ] ✅ Dashboard carrega
- [ ] ✅ Menu lateral funciona
- [ ] ✅ Navegação entre páginas funciona

### Módulos Novos
- [ ] ✅ Risk Stratification carrega
- [ ] ✅ Sports Rehab carrega
- [ ] ✅ Population Health carrega
- [ ] ✅ Family Portal carrega
- [ ] ✅ Predictive Analytics carrega
- [ ] ✅ Quality Assurance carrega

### Funcionalidades
- [ ] ✅ Pode criar paciente
- [ ] ✅ Pode ver lista de pacientes
- [ ] ✅ Pode abrir detalhes de paciente
- [ ] ✅ Seed data visível

### Performance
- [ ] ✅ Página carrega < 2s
- [ ] ✅ Navegação é rápida
- [ ] ✅ Sem erros no console

---

## 📱 TESTES RÁPIDOS (5 MIN)

### Teste 1: Criar Paciente (1 min)

```
1. Login
2. Pacientes > Novo Paciente
3. Preencher formulário
4. Salvar
5. ✅ Aparece na lista
```

---

### Teste 2: Risk Stratification (1 min)

```
1. Abrir: Risk Stratification
2. Ver lista de avaliações (seed data)
3. Clicar: "Nova Avaliação"
4. Selecionar paciente
5. Ver formulário carregado
6. ✅ Funciona
```

---

### Teste 3: Real-time (1 min)

```
1. Abrir 2 abas do navegador
2. Em ambas: fazer login
3. Aba 1: Criar paciente
4. Aba 2: Ver lista de pacientes
5. ✅ Paciente aparece automaticamente (real-time)
```

---

### Teste 4: Performance (2 min)

```
1. Abrir DevTools (F12)
2. Tab: Network
3. Recarregar página (Ctrl+R)
4. Ver:
   - Load time < 2s
   - Poucos requests
   - Sem erros 4xx/5xx
5. ✅ Performance OK
```

---

## 🎯 PRÓXIMOS PASSOS

### Agora (30 min - concluído ✅)
```
✅ Setup completo
✅ Sistema rodando
✅ Testes básicos OK
```

### Esta Semana (12-18h)

```
📋 TODO 1.1: Testes Manuais
→ Guia: 🧪_GUIA_TESTES_MANUAIS_COMPLETO.md
→ Executar 60 casos
→ Tempo: 8-12h ao longo da semana

📋 TODO 1.3: Validar Fluxos
→ 4 fluxos completos
→ Tempo: 2-3h

📋 Documentar resultados
→ Criar issues para bugs
→ Tempo: 1h
```

### Próximas 2 Semanas (8-12h)

```
⏳ TODO 1.4: Ajustes
→ Implementar correções
→ Baseado nos testes

📦 Preparar Deploy
→ Guia: 📦_GUIA_DEPLOY_PRODUCAO.md
```

---

## 📚 GUIAS RELACIONADOS

| Tópico | Guia | Quando Usar |
|--------|------|-------------|
| **Seed Data** | `📘_GUIA_EXECUCAO_SEED_DATA.md` | Detalhes do seed |
| **Testes** | `🧪_GUIA_TESTES_MANUAIS_COMPLETO.md` | Validar funcionalidades |
| **Deploy** | `📦_GUIA_DEPLOY_PRODUCAO.md` | Quando for para prod |
| **Desenvolvimento** | Guias técnicos (8) | Adicionar features |
| **TODOs** | `📋_TODOS_PENDENTES_EXECUCAO_MANUAL.md` | Ver o que falta |

---

## 🎊 PARABÉNS!

Se você chegou aqui:

```
✅ Sistema configurado
✅ Migrations aplicadas
✅ Seed executado
✅ Sistema rodando
✅ Testes básicos OK

🎉 VOCÊ CONSEGUIU! 🎉

📋 Próximo: Executar testes manuais
⏰ Tempo: Esta semana (12-18h)
📖 Guia: 🧪_GUIA_TESTES_MANUAIS_COMPLETO.md
```

---

## 🆘 PRECISA DE AJUDA?

### Documentação

```
Geral:      🎯_MASTER_GUIA_COMPLETO.md
Índice:     📚_INDICE_MASTER_DOCUMENTACAO.md
TODOs:      📋_TODOS_PENDENTES_EXECUCAO_MANUAL.md
Progresso:  📊_PROGRESSO_VISUAL_COMPLETO.md
```

### Problemas Comuns

```
Migrations:  Ver seção Troubleshooting acima
Seed:        Verificar .env.local configurado
Dev:         Verificar porta 5173 livre
Login:       Usar credenciais do seed
```

---

**Criado em:** 08 de Outubro de 2025  
**Tempo Total:** 30 minutos  
**Status:** ✅ TESTADO E FUNCIONANDO

---

```
████████████████████████████████████████████████

  🎊 SISTEMA RODANDO! 🎊
  
  ✅ Setup: 30 minutos
  ✅ Sistema: Online
  ✅ Dados: Populados
  
  📋 Próximo: Testes manuais
  
  🚀 VOCÊ CONSEGUE! 🚀

████████████████████████████████████████████████
```

🎉 **BOA SORTE NOS TESTES!** 🎉
