# 📘 Guia Rápido - Sistema de Acompanhamento de Pacientes

## 🎯 Visão Geral

Sistema completo para acompanhamento profissional de pacientes de fisioterapia com:
- Observações cronológicas
- Avaliações customizadas
- Testes obrigatórios automáticos
- Relatórios gráficos de evolução

---

## 🚀 Início Rápido (3 Passos)

### 1️⃣ APLICAR MIGRATIONS (Apenas uma vez)

No **Supabase SQL Editor**, executar:

```sql
-- Primeiro arquivo:
supabase/migrations/20251010_patient_tracking_system.sql

-- Depois:
supabase/migrations/20251010_seed_clinical_categories.sql
```

✅ Isso criará 5 tabelas + 10 categorias com 40+ templates prontos!

### 2️⃣ ACESSAR PÁGINA DO PACIENTE

```
Menu > Pacientes > [Selecionar Paciente]
```

### 3️⃣ USAR AS 4 TABS

- 📋 **Visão Geral** - Protocolos e exercícios
- 💬 **Acompanhamento** - Observações
- 📊 **Avaliações** - Medições e configuração
- 📈 **Relatórios** - Gráficos e exports

---

## 📝 COMO USAR: Observações

### Adicionar Observação Rápida:

1. Tab **"Acompanhamento"**
2. Botão **"Nova Observação"**
3. Preencher:
   - Tipo: Escolher (Geral/Clínico/Evolução/etc)
   - Conteúdo: Descrever observação
   - Tags (opcional): Ex: "primeira-sessão", "melhora"
   - ☑️ Marcar como importante (opcional)
4. **Salvar**

### Ver Histórico:

- Feed mostra **todas as observações** em ordem cronológica
- Agrupadas por dia
- Filtrar por: tipo, data, tags
- Expandir observações longas

---

## 📊 COMO USAR: Avaliações

### Realizar Avaliação:

1. Tab **"Avaliações"**
2. Selecionar categoria (ex: "Pós-operatório LCA")
3. Escolher momento:
   - Pré-Sessão
   - Pós-Sessão
   - Independente
4. Preencher campos (formulário dinâmico)
   - Números, ângulos → input numérico
   - Escalas → slider visual
   - Testes → select
5. **Salvar Avaliações**

### Ver Histórico e Tendências:

- Dashboard mostra **cards com métricas principais**
- Mini-gráficos (sparklines)
- Cores:
  - 🟢 Verde = Melhorando
  - 🔵 Azul = Estável
  - 🔴 Vermelho = Piorando

---

## ⚙️ COMO USAR: Testes Obrigatórios

### Configurar Teste Obrigatório:

1. Tab **"Avaliações"** > Rolar até **"Testes Obrigatórios"**
2. Botão **"Novo Teste"**
3. Configurar:
   - **Categoria:** Ex: "Pós-operatório LCA" (opcional)
   - **Teste:** Ex: "Ângulo de Flexão do Joelho"
   - **Frequência:** Escolher opção:
     - ✅ Toda sessão
     - ✅ A cada 3 sessões
     - ✅ Milestones: 1, 5, 10, 20 ⭐ **Recomendado para pós-op**
   - **Momento:** Pré-sessão, Pós-sessão (ou ambos)
   - **Datas:** Início/Fim (opcional)
4. **Salvar**

### Exemplo Real - LCA:

Configure 3 testes:

**Teste 1:**
- Campo: Ângulo de Flexão
- Frequência: Milestones → 1, 5, 10, 20
- Timing: Pré E Pós

**Teste 2:**
- Campo: Dor (EVA)
- Frequência: Toda sessão
- Timing: Pré E Pós

**Teste 3:**
- Campo: Força de Quadríceps
- Frequência: A cada 5 sessões
- Timing: Pós

### Durante a Sessão:

O sistema **mostra automaticamente** um checklist com os testes pendentes!

---

## 📈 COMO USAR: Relatórios

### Gerar Relatório de Evolução:

1. Tab **"Relatórios"**
2. **Selecionar período:**
   - 1 Semana
   - 1 Mês ⭐ **Padrão**
   - 3 Meses
   - 6 Meses
   - Tudo
   - Personalizado (escolher datas)
3. **Selecionar tipo de gráfico:**
   - Linha (evolução temporal) ⭐ **Recomendado**
   - Barra (comparação sessões)
   - Composto (linha + barra)
4. **Escolher métricas a exibir** (badges)
5. **Visualizar:**
   - Gráficos interativos
   - Tabela de estatísticas
   - Cards de resumo

### Exportar:

Botões no topo do relatório:

- 📄 **PDF** - Relatório formatado para impressão
- 📊 **Excel (Dados)** - Todas as medições em CSV
- 📈 **Excel (Stats)** - Tabela de estatísticas
- 📋 **Copiar** - Texto formatado para WhatsApp/Email

---

## ⚠️ ALERTAS AUTOMÁTICOS

O sistema mostra alertas no **topo da página** automaticamente:

### Tipos de Alertas:

**🔴 Alta Prioridade:**
- Testes obrigatórios vencidos
- Regressão significativa (>10%)

**🟡 Média Prioridade:**
- Marco de avaliação (milestone)

**🔵 Baixa Prioridade:**
- Lembrete: próxima sessão tem teste

### Ações:
- **Ver Detalhes** - Ir para seção relacionada
- **Dismiss** - Fechar alerta (X)

---

## 🎓 EXEMPLOS PRÁTICOS

### Exemplo 1: Paciente Pós-op LCA - Sessão 1

**Antes da Sessão:**
1. Alertas mostram: "Marco de Avaliação - Sessão 1"
2. Tab Avaliações > Pré-Sessão:
   - Flexão: 45°
   - Dor: 7/10

**Durante:**
3. Tab Acompanhamento > Nova Observação:
   - "Paciente ansioso mas cooperativo. Boa compreensão."

**Depois:**
4. Tab Avaliações > Pós-Sessão:
   - Flexão: 50°
   - Dor: 5/10
   - Força: 2/5

**Resultado:**
- ✅ Dados salvos
- ✅ Aparecem no dashboard
- ✅ Baseline criado para gráficos

### Exemplo 2: Tendinite de Ombro - Acompanhamento

**Sessão 3:**
- Amplitude abdução: 110°
- Teste Neer: Positivo
- Dor: 6/10

**Sessão 6:**
- Amplitude: 140° (+27% 🟢)
- Teste Neer: Negativo ✅
- Dor: 3/10 (-50% 🟢)

**Tab Relatórios:**
- Gráfico mostra melhora clara
- Export PDF para médico
- Dashboard: "Melhorando" em todos

### Exemplo 3: Detectar Regressão

**Sessões 1-5:** Flexão joelho: 45° → 120°

**Sessão 6:** Flexão: 100° (queda de 16%)

**Sistema alerta:**
- ⚠️ "Regressão Detectada: Ângulo de Flexão"
- "Piora de 16.7%"
- Botão "Ver Detalhes"

**Fisioterapeuta:**
1. Clica "Ver Detalhes"
2. Analisa gráfico
3. Tab Acompanhamento > Nova Observação:
   - "Paciente relatou dor após exercícios em casa. Ajustar carga."
4. Modifica protocolo

---

## 💡 DICAS PRO

### Observações:
- Use **tags** para facilitar busca (ex: "melhora", "dor", "exercício-x")
- Marque como **importante** informações críticas
- Use **timing** para contextualizar

### Avaliações:
- Configure testes **antes da primeira sessão**
- Use **milestones** para pós-operatórios (1, 5, 10, 20)
- Use **toda sessão** para acompanhamento de dor
- Combine **pré E pós** para ver efeito imediato

### Relatórios:
- **1 Mês** é bom para acompanhamento regular
- **3-6 Meses** para ver evolução completa
- **Exportar Excel** para análises externas
- **Exportar PDF** para compartilhar com médicos

### Performance:
- Crie categorias para **organizar templates**
- Desative testes obrigatórios quando não precisar mais
- Use filtros de data nos relatórios
- Selecione apenas métricas relevantes no gráfico

---

## ❓ FAQ

**P: Como adicionar novo tipo de avaliação?**  
R: Tab Avaliações > escolha categoria > os templates aparecem automaticamente

**P: Posso criar minha própria categoria?**  
R: Sim! Use o serviço `createCategory()` (futuro: UI para criar)

**P: O que são milestones?**  
R: Sessões específicas onde testes são obrigatórios. Ex: 1, 5, 10, 20

**P: Como desativar um teste obrigatório?**  
R: Tab Avaliações > Testes Obrigatórios > ícone lixeira

**P: Os gráficos atualizam automaticamente?**  
R: Sim! Sempre que adicionar novas medições

**P: Posso exportar para Excel?**  
R: Sim! 2 formatos: dados brutos ou estatísticas

**P: Como funciona a detecção de regressão?**  
R: Compara últimos 3 valores. Se piorar >10%, alerta aparece

---

## 🆘 TROUBLESHOOTING

**Problema:** Não aparecem testes obrigatórios  
**Solução:** Verificar se configurou em "Avaliações" > "Testes Obrigatórios"

**Problema:** Gráfico vazio  
**Solução:** Precisa ter pelo menos 2 medições da mesma métrica

**Problema:** Alerta de regressão incorreto  
**Solução:** Para dor/edema, diminuir é melhorar (lógica automática)

**Problema:** Export Excel não abre  
**Solução:** Abrir no Excel e escolher "Delimitador ponto-e-vírgula"

---

## 📚 RECURSOS ADICIONAIS

- `SISTEMA_ACOMPANHAMENTO_IMPLEMENTADO.md` - Documentação técnica completa
- `🎉_SISTEMA_ACOMPANHAMENTO_COMPLETO.md` - Resumo executivo
- `AI_CONTEXT.md` - Contexto do projeto
- `DEVELOPER_GUIDE.md` - Guia para desenvolvedores

---

**Desenvolvido para DuduFisio-AI | v1.0.0 | 10/10/2025**




