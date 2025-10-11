# 🚀 Guia Rápido - Página BI Integration Test

## Como Acessar

1. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

2. Acesse no navegador:
   ```
   http://localhost:5175/bi-integration-test
   ```

## 🎯 Início Rápido (Modo Demo)

### Opção 1: Usar Modo Demo Automaticamente
Se você não tiver credenciais do Supabase configuradas, o sistema automaticamente entra em **Modo Demo** com dados simulados.

**Passos:**
1. Acesse a página
2. Clique em "Inicializar Sistema BI"
3. Clique em "Executar Verificação"
4. Explore as abas: Visão Geral, Testes, Performance, Dados, Configuração

### Opção 2: Ativar Modo Demo Manualmente
1. Acesse a página
2. Vá para a aba **"Configuração"**
3. Ative o toggle **"Modo Demonstração"**
4. Volte para a aba **"Visão Geral"**
5. Use todas as funcionalidades com dados simulados

## 🔧 Configuração com Supabase Real

Para usar o sistema BI com dados reais do Supabase:

1. Crie um arquivo `.env.local` na raiz do projeto:
   ```env
   VITE_SUPABASE_URL=https://seu-projeto.supabase.co
   VITE_SUPABASE_ANON_KEY=sua_chave_anon_aqui
   ```

2. Reinicie o servidor:
   ```bash
   npm run dev
   ```

3. Acesse a página e clique em **"Inicializar Sistema BI"**

## 📚 Explorando as Abas

### 1️⃣ Visão Geral
**O que você encontra:**
- Cards de status do sistema
- Ações rápidas (Inicializar, Verificar, Demo, Downloads)
- Gráficos de tendência de receita
- Monitor de performance em tempo real
- Alertas de anomalias
- Log de execução

**Ações principais:**
- 🟢 **Inicializar Sistema BI** - Primeiro passo
- 🔵 **Executar Verificação** - Testa 5 componentes principais
- 🟣 **Demo Completa** - Executa demonstração completa
- 📥 **Baixar Logs** - Download dos logs em TXT
- 📄 **Relatório** - Download do relatório em JSON
- 🗑️ **Limpar** - Limpa histórico e dados

### 2️⃣ Testes
**O que você encontra:**
- Dashboard com resumo de testes (Total, Passou, Falhou, Taxa)
- 7 botões de testes avançados
- Histórico completo de testes executados

**Testes disponíveis:**
1. **ETL** - Testa pipeline de ETL
2. **Data Warehouse** - Testa queries do warehouse
3. **ML Models** - Testa modelos de machine learning
4. **Charts** - Testa geração de gráficos
5. **Export** - Testa exportação de dados
6. **Performance** - Mede performance do sistema
7. **Data Quality** - Valida qualidade dos dados

**Como usar:**
- Clique em qualquer botão de teste
- Aguarde a execução (1-3 segundos)
- Veja o resultado no dashboard e histórico
- Logs aparecem na aba "Visão Geral"

### 3️⃣ Performance
**O que você encontra:**
- Monitor de performance detalhado
- Gráficos de:
  - Performance de Queries (tempo médio)
  - Uso de Memória ao longo do tempo

**Métricas monitoradas:**
- ⏱️ Tempo médio de query
- ⚡ Taxa de cache hit
- 💾 Uso de memória
- 🔥 Uso de CPU
- 📊 Total de queries
- 🔗 Conexões ativas

**Dica:** Ative "Atualização Automática" na aba Configuração para ver as métricas em tempo real!

### 4️⃣ Dados
**O que você encontra:**
- Preview das tabelas do Data Warehouse
- Lista de tabelas com:
  - Nome da tabela
  - Número de registros
  - Lista de colunas
  - Data da última atualização

**Tabelas disponíveis (modo demo):**
- `dim_patients` - 450 registros
- `dim_therapists` - 12 registros
- `fact_appointments` - 3.200 registros
- `fact_financial_transactions` - 2.800 registros

**Como usar:**
- Clique na seta para expandir e ver colunas
- Clique em "Ver Dados" para visualizar (em desenvolvimento)

### 5️⃣ Configuração
**O que você encontra:**
- 3 toggles de configuração
- Documentação sobre configuração do Supabase

**Configurações disponíveis:**

1. **Modo Demonstração** 🎭
   - Liga: Usa dados simulados
   - Desliga: Usa Supabase real (se configurado)
   
2. **Logs Detalhados** 📝
   - Liga: Logs mais verbosos
   - Desliga: Apenas logs essenciais
   
3. **Atualização Automática** 🔄
   - Liga: Métricas atualizam a cada 5 segundos
   - Desliga: Métricas estáticas

## 💡 Dicas de Uso

### Para Demonstrações
1. Ative "Modo Demonstração"
2. Execute "Demo Completa"
3. Mostre os gráficos na aba Performance
4. Mostre as anomalias (se houver)
5. Exporte o relatório

### Para Testes Reais
1. Configure Supabase
2. Desative "Modo Demonstração"
3. Execute "Inicializar Sistema BI"
4. Execute "Executar Verificação"
5. Execute testes específicos na aba Testes
6. Analise performance

### Para Debug
1. Ative "Logs Detalhados"
2. Execute os testes
3. Observe o Log de Execução
4. Baixe os logs para análise

## 🎨 Recursos Visuais

### Badges de Status
- 🟢 Verde = OK/Sucesso
- 🔴 Vermelho = Erro/Falha
- 🟡 Amarelo = Aviso/Médio
- 🔵 Azul = Info/Baixo

### Barras de Progresso
- **Verde**: Bom (dentro do esperado)
- **Amarelo**: Atenção (próximo do limite)
- **Vermelho**: Crítico (acima do limite)

### Ícones de Tendência
- ↗️ **TrendingUp**: Subindo
- ↘️ **TrendingDown**: Descendo
- ➡️ **Minus**: Estável

## 📊 Interpretando os Resultados

### Taxa de Sucesso dos Testes
- **90-100%**: Sistema excelente ✅
- **70-89%**: Sistema bom com alguns problemas ⚠️
- **Abaixo de 70%**: Verificar configuração ❌

### Performance de Queries
- **< 200ms**: Excelente 🟢
- **200-500ms**: Bom 🟡
- **> 500ms**: Precisa otimização 🔴

### Taxa de Cache Hit
- **> 80%**: Excelente cache
- **60-80%**: Cache médio
- **< 60%**: Cache precisa melhoria

### Uso de Memória
- **< 400MB**: Excelente
- **400-600MB**: Bom
- **> 600MB**: Alto

### Uso de CPU
- **< 50%**: Baixo
- **50-75%**: Médio
- **> 75%**: Alto

## 🚨 Solução de Problemas

### "Sistema BI não inicializado"
**Solução**: Clique em "Inicializar Sistema BI" primeiro

### "Modo Demo ativo automaticamente"
**Motivo**: Sem credenciais Supabase
**Solução**: Configure `.env.local` com suas credenciais

### "Nenhum dado disponível"
**Solução**: 
1. Ative "Modo Demonstração" OU
2. Configure Supabase e inicialize o sistema

### Gráficos não aparecem
**Solução**:
1. Execute "Executar Verificação" primeiro
2. Aguarde o carregamento dos dados
3. Verifique se está em modo demo ou com Supabase configurado

## 📥 Exportações

### Baixar Logs (.txt)
- Contém todos os logs da sessão
- Formato: texto simples
- Nome: `bi-test-logs-[timestamp].txt`

### Baixar Relatório (.json)
- Contém relatório completo de testes
- Formato: JSON estruturado
- Nome: `bi-test-report-[timestamp].json`
- Inclui:
  - Status do sistema
  - Histórico de testes
  - Métricas de performance
  - Resumo estatístico

## 🎯 Casos de Uso

### Caso 1: Verificação Rápida
```
1. Acessar página
2. Clicar "Inicializar Sistema BI"
3. Clicar "Executar Verificação"
4. Ver resultados nos cards
```

### Caso 2: Análise Completa
```
1. Acessar página
2. Ir para aba "Configuração"
3. Ativar "Modo Demonstração" e "Atualização Automática"
4. Voltar para "Visão Geral"
5. Clicar "Demo Completa"
6. Ir para aba "Testes" e executar todos
7. Ir para aba "Performance" e analisar
8. Baixar relatório
```

### Caso 3: Teste de Performance
```
1. Acessar página
2. Ir para aba "Testes"
3. Clicar em "Performance"
4. Ir para aba "Performance"
5. Analisar gráficos e métricas
```

### Caso 4: Debug de Problema
```
1. Ativar "Logs Detalhados"
2. Executar teste específico
3. Observar logs em tempo real
4. Baixar logs para análise
```

## ✨ Próximos Passos

Depois de explorar a página, você pode:

1. **Integrar com Supabase real** para dados reais
2. **Configurar alertas** para anomalias críticas
3. **Agendar testes automáticos** periodicamente
4. **Expandir os testes** com casos específicos
5. **Criar dashboards customizados** baseado nos dados

## 🆘 Precisa de Ajuda?

- Consulte `BI_INTEGRATION_IMPLEMENTATION_COMPLETE.md` para detalhes técnicos
- Verifique os logs na aba "Visão Geral"
- Teste no modo demo primeiro para familiarização
- Use os badges e cores como guia visual

---

**Aproveite o sistema BI Integration Test! 🚀**

