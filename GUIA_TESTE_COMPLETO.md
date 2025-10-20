# 🧪 Guia de Teste Completo - Sistema de Evolução

## ✅ Servidor Iniciado

O servidor de desenvolvimento está rodando em: **http://localhost:5173**

---

## 🎯 Testes a Realizar

### 1. ✅ Layout 3 Colunas

**Objetivo:** Verificar se o layout em 3 colunas está funcionando corretamente.

**Passos:**
1. Acesse: `http://localhost:5173`
2. Faça login (se necessário)
3. Vá para a **Agenda**
4. Clique em um agendamento
5. Clique em **"Iniciar Atendimento"**
6. Verifique o layout em 3 colunas:
   - **Coluna 1 (40%):** Formulário SOAP
   - **Coluna 2 (35%):** Dados históricos do paciente
   - **Coluna 3 (25%):** Visão geral e métricas

**Resultado Esperado:**
- ✅ Layout responsivo em 3 colunas
- ✅ Dados do paciente visíveis na coluna central
- ✅ Formulário SOAP na coluna esquerda
- ✅ Visão geral na coluna direita

---

### 2. ✅ Replicação de Conduta

**Objetivo:** Testar a funcionalidade de replicar conduta de sessões anteriores.

**Passos:**
1. Na página de atendimento, procure o botão **"Replicar Conduta"**
2. Clique no botão
3. Selecione uma sessão anterior
4. Selecione os campos para replicar:
   - ☑️ Técnicas aplicadas
   - ☑️ Exercícios realizados
   - ☑️ Equipamentos utilizados
   - ☑️ Exercícios domiciliares
5. Clique em **"Aplicar Conduta"**
6. Verifique se os campos foram preenchidos automaticamente

**Resultado Esperado:**
- ✅ Dialog de replicação abre corretamente
- ✅ Lista de sessões anteriores é exibida
- ✅ Campos podem ser selecionados individualmente
- ✅ Preview mostra o conteúdo da sessão selecionada
- ✅ Campos são preenchidos automaticamente após aplicação

---

### 3. ✅ Alertas de Medições Obrigatórias

**Objetivo:** Testar o sistema de alertas em 3 níveis.

**Passos:**

#### Nível A: Alerta Visual
1. Na coluna central, procure por **"Testes Obrigatórios"**
2. Verifique se há alertas vermelhos para medições pendentes

#### Nível B: Bloqueio de Salvamento
1. Tente salvar a sessão sem realizar medições obrigatórias
2. Verifique se um diálogo de bloqueio aparece
3. O diálogo deve mostrar:
   - Lista de medições obrigatórias pendentes
   - Opção "Salvar Mesmo Assim"
   - Opção "Cancelar"

#### Nível C: Registro de Conformidade
1. Escolha **"Salvar Mesmo Assim"**
2. Verifique se a sessão é salva
3. Verifique se a não conformidade é registrada no banco:
   ```sql
   SELECT * FROM assessment_compliance_log 
   WHERE patient_id = 'seu-patient-id'
   ORDER BY recorded_at DESC 
   LIMIT 1;
   ```

**Resultado Esperado:**
- ✅ Alertas vermelhos aparecem para medições pendentes
- ✅ Salvamento é bloqueado se medições obrigatórias não foram realizadas
- ✅ Diálogo de bloqueio aparece com opções claras
- ✅ Não conformidade é registrada no banco de dados

---

### 4. ✅ Gráficos Interativos

**Objetivo:** Testar os gráficos de evolução e exportação.

**Passos:**
1. Na coluna central, procure por **"Evolução"** ou **"Gráficos"**
2. Verifique se há gráficos de evolução
3. Teste diferentes tipos de gráficos:
   - Linha
   - Barra
   - Área
   - Scatter
4. Teste a exportação:
   - Clique no botão **"Exportar"**
   - Escolha o formato: PNG, PDF ou SVG
   - Verifique se o arquivo é baixado

**Resultado Esperado:**
- ✅ Gráficos são renderizados corretamente
- ✅ Dados são exibidos com precisão
- ✅ Tipos de gráfico podem ser alterados
- ✅ Exportação funciona para todos os formatos

---

### 5. ✅ Gráficos Específicos

**Objetivo:** Testar gráficos específicos para protocolos.

**Passos:**
1. Verifique se há gráfico **"Evolução da Dor"**
2. Verifique se há gráfico **"Pós-Operatório LCA"** (se aplicável)
3. Teste as funcionalidades específicas:
   - Comparação pré/pós
   - Threshold de alerta
   - Intervenções realizadas
   - Valores normativos

**Resultado Esperado:**
- ✅ Gráfico de dor mostra evolução ao longo das sessões
- ✅ Gráfico LCA mostra fases do protocolo
- ✅ Valores normativos são exibidos
- ✅ Marcadores de eventos são visíveis

---

### 6. ✅ Relatórios Médicos

**Objetivo:** Testar a geração de relatórios médicos.

**Passos:**
1. Procure por **"Gerar Relatório"** ou **"Relatório Médico"**
2. Clique no botão
3. Verifique se sugestões automáticas aparecem:
   - Métricas relevantes
   - Insights automáticos
   - Comparação com valores normativos
4. Clique em **"Gerar Relatório Completo"**
5. Verifique se o relatório é gerado com:
   - Dados do paciente
   - Evolução em tabela
   - Gráficos
   - Recomendações
6. Teste a exportação do relatório (PDF/Word)

**Resultado Esperado:**
- ✅ Sugestões automáticas são exibidas
- ✅ Relatório é gerado com todos os dados
- ✅ Gráficos são incluídos no relatório
- ✅ Exportação funciona corretamente

---

### 7. ✅ Indicadores de Fase

**Objetivo:** Testar os indicadores de fase pós-cirúrgica.

**Passos:**
1. Na coluna central, procure por **"Histórico Cirúrgico"**
2. Verifique se há indicadores de fase para cada cirurgia
3. Verifique se o indicador mostra:
   - Fase atual (Aguda, Subaguda, Reabilitação, Retorno)
   - Progresso na fase
   - Tempo desde a cirurgia
   - Objetivos da fase

**Resultado Esperado:**
- ✅ Indicadores de fase são exibidos para cada cirurgia
- ✅ Progresso na fase é calculado corretamente
- ✅ Objetivos e marcos são visíveis
- ✅ Cores indicam a fase atual

---

### 8. ✅ Dados Históricos

**Objetivo:** Verificar se todos os dados históricos são exibidos corretamente.

**Passos:**
1. Na coluna central, verifique se há:
   - **Tempo de Tratamento:** Tempo desde o primeiro atendimento
   - **Histórico Cirúrgico:** Lista de cirurgias com datas
   - **Patologias:** Patologias ativas e resolvidas
   - **Metas do Paciente:** Metas com countdown
   - **Testes Obrigatórios:** Lista de testes obrigatórios

**Resultado Esperado:**
- ✅ Tempo de tratamento é calculado corretamente
- ✅ Cirurgias são listadas com datas e fases
- ✅ Patologias são agrupadas corretamente
- ✅ Metas mostram countdown e progresso
- ✅ Testes obrigatórios são exibidos com alertas

---

## 📊 Checklist de Testes

### Layout e UI
- [ ] Layout 3 colunas funciona corretamente
- [ ] Dados são exibidos em todas as colunas
- [ ] Responsividade funciona em diferentes tamanhos de tela
- [ ] Navegação entre colunas é fluida

### Funcionalidades
- [ ] Replicação de conduta funciona
- [ ] Alertas de medição aparecem corretamente
- [ ] Bloqueio de salvamento funciona
- [ ] Registro de conformidade é salvo no banco

### Gráficos
- [ ] Gráficos são renderizados corretamente
- [ ] Tipos de gráfico podem ser alterados
- [ ] Exportação funciona para todos os formatos
- [ ] Gráficos específicos (dor, LCA) funcionam

### Relatórios
- [ ] Sugestões automáticas aparecem
- [ ] Relatório é gerado com todos os dados
- [ ] Exportação do relatório funciona
- [ ] Comparação normativa é exibida

### Indicadores
- [ ] Indicadores de fase são exibidos
- [ ] Progresso na fase é calculado corretamente
- [ ] Objetivos e marcos são visíveis

---

## 🐛 Troubleshooting

### Problema: Layout não está em 3 colunas
**Solução:** Verifique se o arquivo `SessionFormPage.tsx` foi atualizado corretamente.

### Problema: Replicação de conduta não funciona
**Solução:** Verifique se o componente `ConductReplicationDialog.tsx` está importado.

### Problema: Alertas não aparecem
**Solução:** Verifique se a migration foi aplicada e se há testes obrigatórios configurados.

### Problema: Gráficos não aparecem
**Solução:** Verifique se Recharts está instalado: `npm list recharts`

### Problema: Exportação não funciona
**Solução:** Verifique se html2canvas e jspdf estão instalados: `npm list html2canvas jspdf`

---

## 📝 Relatório de Testes

Após realizar os testes, preencha este relatório:

### ✅ Testes Realizados
- [ ] Layout 3 colunas
- [ ] Replicação de conduta
- [ ] Alertas de medição
- [ ] Gráficos interativos
- [ ] Gráficos específicos
- [ ] Relatórios médicos
- [ ] Indicadores de fase
- [ ] Dados históricos

### 🐛 Problemas Encontrados
1. **Problema:** [Descreva o problema]
   **Solução:** [Descreva a solução]

2. **Problema:** [Descreva o problema]
   **Solução:** [Descreva a solução]

### 💡 Sugestões de Melhoria
1. [Sugestão 1]
2. [Sugestão 2]
3. [Sugestão 3]

---

## 🎉 Conclusão

Após realizar todos os testes, o sistema deve estar funcionando perfeitamente!

**Próximos passos:**
1. ✅ Testar todas as funcionalidades
2. ✅ Documentar problemas encontrados
3. ✅ Implementar melhorias sugeridas
4. ✅ Expandir protocolos e métricas normativas

---

**Data do teste:** [Preencher]  
**Testado por:** [Preencher]  
**Status:** [Preencher]

