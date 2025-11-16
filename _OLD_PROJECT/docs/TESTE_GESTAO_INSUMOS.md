# 🧪 GUIA DE TESTE - GESTÃO DE INSUMOS

## ✅ STATUS: SISTEMA 100% IMPLEMENTADO E PRONTO PARA TESTE

---

## 🚀 COMO TESTAR O SISTEMA

### 1️⃣ **ACESSAR A PÁGINA DE INSUMOS**

Após iniciar o servidor (`npm run dev`), acesse:

```
http://localhost:5173/supplies
```

**OU** através do menu lateral:
- Faça login como **Admin**
- Clique em **"Gestão"** no menu
- Selecione **"Insumos"**

---

## 📋 CHECKLIST DE TESTES

### **A. CADASTRO DE FORNECEDORES**

1. **Criar Fornecedor**
   - Acesse a aba **"Fornecedores"**
   - Clique em **"Novo Fornecedor"**
   - Preencha:
     - Nome: "MedSupply Ltda"
     - CNPJ: "12.345.678/0001-90"
     - Email: "contato@medsupply.com"
     - Telefone: "(11) 98765-4321"
     - Prazo de entrega: 7 dias
   - Clique em **"Salvar"**
   - ✅ Verifique se o fornecedor aparece na lista

---

### **B. CADASTRO DE INSUMOS**

2. **Cadastrar Insumo - Eletrodo**
   - Acesse a aba **"Insumos"**
   - Clique em **"Novo Insumo"**
   - Preencha:
     - Nome: "Eletrodo Adesivo 5cm"
     - Categoria: "Materiais Descartáveis"
     - Subcategoria: "Eletrodos"
     - Unidade: "Caixa"
     - Estoque atual: 10
     - Estoque mínimo: 5
     - Custo unitário: R$ 45,00
     - Fornecedor: "MedSupply Ltda"
     - Localização: "Gaveta A1"
   - Clique em **"Salvar"**
   - ✅ Verifique se aparece na lista

3. **Cadastrar Insumo - Theraband**
   - Nome: "Theraband Vermelho"
   - Categoria: "Equipamentos"
   - Subcategoria: "Resistência Elástica"
   - Unidade: "Unidade"
   - Estoque atual: 3
   - Estoque mínimo: 2
   - Custo unitário: R$ 25,00
   - Fornecedor: "MedSupply Ltda"
   - ✅ Verifique se aparece na lista

---

### **C. MOVIMENTAÇÕES DE ESTOQUE**

4. **Entrada de Estoque**
   - Selecione "Eletrodo Adesivo 5cm"
   - Clique em **"Movimentar"**
   - Tipo: **"Entrada"**
   - Quantidade: 20
   - Motivo: "Compra"
   - Custo: R$ 45,00
   - Clique em **"Confirmar"**
   - ✅ Verifique se o estoque atualizou para 30

5. **Saída de Estoque**
   - Selecione "Theraband Vermelho"
   - Clique em **"Movimentar"**
   - Tipo: **"Saída"**
   - Quantidade: 1
   - Motivo: "Uso em atendimento"
   - Clique em **"Confirmar"**
   - ✅ Verifique se o estoque atualizou para 2

---

### **D. ALERTAS DE ESTOQUE BAIXO**

6. **Verificar Alertas**
   - O sistema deve mostrar alerta para "Theraband Vermelho" (estoque = 2, mínimo = 2)
   - ✅ Verifique se aparece o badge vermelho de "Estoque Baixo"
   - Clique no alerta
   - ✅ Verifique se abre opção de "Gerar Pedido Automático"

---

### **E. PEDIDOS DE COMPRA AUTOMATIZADOS**

7. **Gerar Pedido Automático**
   - No alerta de estoque baixo, clique em **"Gerar Pedido"**
   - ✅ Verifique se o sistema calcula automaticamente:
     - Quantidade sugerida (baseada no consumo médio)
     - Fornecedor recomendado
     - Custo estimado
   - Clique em **"Confirmar Pedido"**
   - ✅ Verifique se o pedido aparece em "Pedidos de Compra"

8. **Aprovar Pedido**
   - Acesse a aba **"Pedidos de Compra"**
   - Selecione o pedido gerado
   - Clique em **"Aprovar"**
   - ✅ Verifique se o status muda para "Aprovado"

---

### **F. INTEGRAÇÃO COM TAREFAS**

9. **Vincular Insumo a Tarefa**
   - Acesse uma tarefa existente (ex: "Sessão de Fisioterapia")
   - Clique em **"Editar"**
   - Na seção **"Insumos Necessários"**:
     - Adicione "Eletrodo Adesivo 5cm" - 2 unidades
     - Adicione "Theraband Vermelho" - 1 unidade
   - Salve a tarefa
   - ✅ Verifique se os insumos aparecem vinculados

10. **Consumir Insumos ao Completar Tarefa**
    - Complete a tarefa vinculada
    - ✅ Verifique se o sistema automaticamente:
      - Registra a saída no estoque
      - Atualiza as quantidades
      - Cria registro de movimentação

---

### **G. RELATÓRIOS AVANÇADOS**

11. **Gerar Relatório de Consumo**
    - Acesse a aba **"Relatórios"**
    - Selecione:
      - Tipo: "Consumo por Período"
      - Período: "Último mês"
      - Categoria: "Todas"
    - Clique em **"Gerar Relatório"**
    - ✅ Verifique se mostra:
      - Gráficos de consumo
      - Tabela detalhada
      - Métricas (total consumido, custo total)

12. **Exportar para Excel**
    - No relatório gerado, clique em **"Exportar Excel"**
    - ✅ Verifique se o arquivo .xlsx é baixado
    - Abra o arquivo
    - ✅ Verifique se contém todas as informações

13. **Exportar para PDF**
    - No relatório gerado, clique em **"Exportar PDF"**
    - ✅ Verifique se o arquivo .pdf é baixado
    - Abra o arquivo
    - ✅ Verifique se contém gráficos e formatação

---

### **H. ANÁLISE DE CUSTOS**

14. **Relatório de Custos por Procedimento**
    - Acesse **"Relatórios"**
    - Selecione: "Custos por Procedimento"
    - Período: "Último mês"
    - Clique em **"Gerar"**
    - ✅ Verifique se mostra:
      - Custo médio por tipo de tarefa
      - Margem de lucro
      - Insumos mais utilizados

---

### **I. DASHBOARD E MÉTRICAS**

15. **Verificar Dashboard**
    - Na página principal de insumos
    - ✅ Verifique se mostra:
      - Total de insumos cadastrados
      - Valor total do estoque
      - Alertas de estoque baixo
      - Movimentações recentes
      - Gráfico de consumo

---

## 🐛 POSSÍVEIS PROBLEMAS E SOLUÇÕES

### **Problema 1: Erro ao acessar /supplies**
**Solução:**
- Verifique se você está logado como **Admin**
- Verifique se a rota está configurada em `AppRoutes.tsx`

### **Problema 2: Erro ao salvar insumo**
**Solução:**
- Verifique se as tabelas foram criadas no Supabase
- Verifique se as permissões RLS estão configuradas
- Verifique o console do navegador para erros

### **Problema 3: Alertas não aparecem**
**Solução:**
- Verifique se o trigger `check_stock_alerts` foi criado
- Execute manualmente: `SELECT * FROM stock_alerts WHERE is_active = true;`

### **Problema 4: Pedido automático não gera**
**Solução:**
- Verifique se há histórico de consumo
- Verifique se o fornecedor está ativo
- Verifique os logs no console

---

## 📊 MÉTRICAS DE SUCESSO

Após completar todos os testes, você deve ter:

✅ **Fornecedores:** 1+ cadastrados  
✅ **Insumos:** 5+ cadastrados  
✅ **Movimentações:** 10+ registradas  
✅ **Pedidos:** 1+ gerados e aprovados  
✅ **Relatórios:** 3+ gerados com sucesso  
✅ **Integração:** Tarefas vinculadas a insumos  

---

## 🎯 PRÓXIMOS PASSOS APÓS TESTE

1. **Cadastrar todos os insumos reais da clínica**
2. **Configurar alertas personalizados**
3. **Definir fornecedores preferenciais**
4. **Treinar equipe no uso do sistema**
5. **Configurar backups automáticos**

---

## 📞 SUPORTE

Se encontrar problemas:
1. Verifique o console do navegador (F12)
2. Verifique os logs do Supabase
3. Verifique o terminal do servidor
4. Consulte a documentação em `AI_CONTEXT.md`

---

**✅ Sistema testado e aprovado em:** ________________  
**👤 Testado por:** ________________  
**📝 Observações:** ________________  

