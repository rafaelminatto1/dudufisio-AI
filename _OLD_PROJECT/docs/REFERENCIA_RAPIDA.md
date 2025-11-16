# 🎴 Cartão de Referência Rápida - Evolução de Sessão

## ⚡ Atalhos Essenciais

| Ação | Como Fazer |
|------|------------|
| **Configurar Modo** | `/session-evolution-settings` → Clicar card → Salvar |
| **Popular Mocks** | Configurações → Digitar ID → "Popular Dados Mock" |
| **Limpar Mocks** | Configurações → "Limpar Mocks" → Confirmar 2x |
| **Iniciar Atendimento** | Agenda → Agendamento → "Iniciar Atendimento" |
| **Ver Fonte de Dados** | Badge canto inferior direito (🟢/🟡/🔴) |

---

## 🎨 As 4 Opções

| Modo | Símbolo | Rota | Uso |
|------|---------|------|-----|
| Existente | 🏠 | `/atendimento/:id` | Diário |
| Página Nova | 📄 | `/session-evolution/:id` | Complexo |
| Modal | 🪟 | Modal sobre agenda | Rápido |
| Expansão | ➕ | Híbrido | Transição |

---

## 📊 Layout 4 Colunas

```
┌──────┬──────┬──────┬──────┐
│ SOAP │Histór│Evolução│Objet│
│  30% │  25% │  25% │ 20% │
└──────┴──────┴──────┴──────┘
```

**Col 1:** Formulário SOAP + Dor  
**Col 2:** Sessões + Cirurgias + Tempo  
**Col 3:** Alertas + Patologias + Gráficos  
**Col 4:** Objetivos + Countdown + Métricas  

---

## ⚠️ Alertas

| Nível | Ícone | Comportamento |
|-------|-------|---------------|
| Crítico | 🚨 | **Bloqueia** salvamento |
| Importante | ⚠️ | Avisa mas permite |
| Leve | ℹ️ | Apenas sugestão |

**Exemplo:** LCA → Amplitude obrigatória (🚨)

---

## 🎯 CRUD Rápido

### Cirurgia
➕ Col 2 → "+" → Preencher → Salvar  
✏️ Ícone lápis → Editar  
🗑️ Ícone lixeira → Confirmar  

### Objetivo
➕ Col 4 → "+" → Data alvo → Salvar  
⏰ Countdown aparece automático  
✓ Ícone check → Marcar 100%  

### Patologia
➕ Col 3 → "+" → Nome + CID → Salvar  
✓ Check → Move para "Tratadas"  
🔄 Alerta → Reativa  

---

## 📈 Gráficos

**Escolher Tipo:**  
📊 Barras | 📈 Linha | 📉 Área

**Actions:**  
- Tooltip: Passar mouse
- Alternar: Botões acima do gráfico
- Export: Botão "Exportar CSV"

---

## 💡 Insights

**Geração:** Automática  
**Copiar:** Botão ao lado de cada  
**Export:** Botão "Exportar Relatório"  

**Exemplos:**
- "Dor 9→0 em 5 sessões"
- "Amplitude +50° (+83%)"
- "Força grau 3→5"

---

## 🔧 Config Rápida

### Forçar Mock:
```ts
// supabaseTablesConfig.ts
FORCE_MOCK_MODE = true
```

### Desativar Logs:
```ts
DEBUG_DATA_SOURCE = false
```

### Mudar Auto-save:
```ts
// sessionEvolutionConfig.ts
autoSaveInterval = 60 // segundos
```

---

## 🐛 Troubleshooting

| Problema | Solução |
|----------|---------|
| Modo não muda | Clicar "Salvar Config" |
| Sem dados | Popular mocks |
| Não salva | Ver alertas críticos |
| Indicador vermelho | Verificar Supabase |

---

## 📁 Arquivos Importantes

| O Que | Onde |
|-------|------|
| Guia Completo | `SISTEMA_EVOLUCAO_SESSAO.md` |
| Início Rápido | `INICIO_RAPIDO_EVOLUCAO.md` |
| Testes | `GUIA_TESTES_EVOLUCAO.md` |
| Migrations | `supabase/migrations/README...` |
| Índice | `INDEX_EVOLUCAO.md` |

---

## ✅ Checklist Rápido

Primeira Vez:
- [ ] Ir em `/session-evolution-settings`
- [ ] Escolher modo
- [ ] Salvar
- [ ] Popular mocks (ID: patient_1)
- [ ] Testar em `/agenda`

---

**Imprima este cartão e mantenha por perto!** 📋

*Atualizado: 22/10/2025*

