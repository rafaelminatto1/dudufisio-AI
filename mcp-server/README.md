# 🏥 DuduFisio-AI MCP Server

Servidor MCP (Model Context Protocol) que expõe funcionalidades do sistema DuduFisio-AI para assistentes de IA, com monitoramento completo via **Sentry**.

## 🎯 Funcionalidades

### 📋 Gestão de Pacientes
- `list_patients` - Lista todos os pacientes
- `search_patient` - Busca pacientes por nome, CPF ou email
- `get_patient_details` - Detalhes completos de um paciente
- `get_patient_history` - Histórico de atendimentos

### 📅 Agendamentos
- `list_appointments` - Lista agendamentos
- `create_appointment` - Cria novo agendamento

### 🤖 Análises de IA (Google Gemini)
- `analyze_patient_progress` - Análise de progresso do paciente
- `generate_soap_note` - Gera notas SOAP automáticas
- `suggest_treatment_protocol` - Sugere protocolos de tratamento

### 💪 Exercícios e Protocolos
- `search_exercises` - Busca exercícios terapêuticos
- `create_exercise_protocol` - Cria protocolo de exercícios

### 📊 Analytics e Relatórios
- `get_clinic_stats` - Estatísticas da clínica
- `generate_patient_report` - Relatório completo de evolução

## 🚀 Instalação

### 1. Instalar Dependências

```bash
cd mcp-server
npm install
```

### 2. Compilar TypeScript

```bash
npm run build
```

### 3. Configurar Variáveis de Ambiente (Opcional)

```bash
cp .env.example .env
# Edite .env conforme necessário
```

## ▶️ Executar o Servidor

### Modo Desenvolvimento
```bash
npm run dev
```

### Modo Produção
```bash
npm start
```

## 📊 Monitoramento com Sentry

O servidor está totalmente instrumentado com **Sentry** para monitoramento:

### O que é monitorado:
- ✅ **Performance de cada ferramenta** - Tempo de resposta de todas as chamadas
- ✅ **Erros e exceções** - Captura automática de todos os erros
- ✅ **Transações MCP** - Rastreamento completo de cada requisição
- ✅ **Breadcrumbs** - Histórico de ações para debug
- ✅ **Argumentos das ferramentas** - Parâmetros usados (com opt-in via `sendDefaultPii`)

### Acessar Dashboard Sentry

1. Acesse: [https://sentry.io/orgredirect/organizations/:orgslug/insights/ai/mcp/](https://sentry.io/orgredirect/organizations/:orgslug/insights/ai/mcp/)

2. **Métricas disponíveis:**
   - 📈 Traffic - Requisições MCP ao longo do tempo
   - 🔍 Traffic by Client - Clientes conectados (cursor-vscode, etc.)
   - 🌐 Transport Distribution - Protocolos usados
   - ⚡ Most Used Tools - Ferramentas mais chamadas
   - 🐌 Slowest Tools - Ferramentas mais lentas
   - ❌ Most Failing Tools - Ferramentas com mais erros

### Configuração do Sentry

```typescript
Sentry.init({
  dsn: "your-sentry-dsn",
  tracesSampleRate: 1.0,        // 100% das transações
  sendDefaultPii: true,          // Captura argumentos (pode ter dados sensíveis)
  environment: "development",
});
```

⚠️ **Importante:** `sendDefaultPii: true` captura argumentos das ferramentas que podem conter dados sensíveis dos pacientes. Em produção, considere:
- Desabilitar (`sendDefaultPii: false`)
- Implementar filtros customizados com `beforeSend()`
- Sanitizar dados antes de enviar

## 🔧 Integração com Cliente MCP

### Cursor / Claude Desktop

Adicione ao arquivo de configuração MCP:

```json
{
  "mcpServers": {
    "dudufisio-ai": {
      "command": "node",
      "args": ["/path/to/dudufisio-mcp-server/dist/server.js"],
      "env": {
        "SENTRY_DSN": "your-sentry-dsn"
      }
    }
  }
}
```

### Exemplo de Uso

```typescript
// Listar pacientes ativos
await callTool("list_patients", { status: "Active" });

// Buscar paciente
await callTool("search_patient", { query: "João Silva" });

// Analisar progresso
await callTool("analyze_patient_progress", { 
  patientId: "1",
  context: "Paciente com lesão no joelho" 
});

// Criar agendamento
await callTool("create_appointment", {
  patientId: "1",
  date: "2024-01-20",
  time: "09:00",
  therapist: "Dr. Roberto"
});
```

## 📁 Estrutura do Projeto

```
mcp-server/
├── server.ts           # Código principal do servidor
├── package.json        # Dependências e scripts
├── tsconfig.json       # Configuração TypeScript
├── .env.example        # Exemplo de variáveis de ambiente
├── README.md           # Esta documentação
└── dist/              # Código compilado (gerado)
    └── server.js
```

## 🔄 Integração com DuduFisio-AI Real

Atualmente o servidor usa **mock data** para demonstração. Para integrar com os serviços reais:

1. **Importar serviços reais:**
```typescript
import { patientService } from '../services/patientService';
import { appointmentService } from '../services/appointmentService';
import { geminiService } from '../services/geminiService';
```

2. **Substituir mock data** pelas chamadas aos serviços:
```typescript
case "list_patients": {
  const patients = await patientService.getAllPatients();
  return { patients };
}
```

3. **Configurar variáveis de ambiente** (Supabase, Gemini API)

## 🧪 Testes

Para testar o servidor localmente:

```bash
# Terminal 1: Iniciar servidor
npm run dev

# Terminal 2: Enviar requisição de teste
echo '{"jsonrpc": "2.0", "method": "tools/list", "id": 1}' | node dist/server.js
```

## 📈 Métricas de Performance

O Sentry MCP Dashboard mostra:

| Métrica | Descrição |
|---------|-----------|
| **Request Count** | Total de chamadas por ferramenta |
| **Error Rate** | Taxa de erro de cada ferramenta |
| **Avg Duration** | Tempo médio de resposta |
| **P95 Latency** | 95% das requisições respondem em X ms |

## 🛠️ Troubleshooting

### Erro: "Cannot find module"
```bash
npm run rebuild
```

### Servidor não inicia
- Verificar se porta não está em uso
- Verificar logs: `npm start 2>&1 | tee server.log`

### Não vejo dados no Sentry
- Verificar se `SENTRY_DSN` está configurado
- Aguardar até 1 minuto para dados aparecerem
- Verificar se está usando a org/projeto correto

## 📚 Referências

- [MCP Specification](https://github.com/modelcontextprotocol/specification)
- [Sentry MCP Documentation](https://docs.sentry.io/product/insights/ai/mcp/)
- [DuduFisio-AI Documentation](../AI_CONTEXT.md)

## 📝 Licença

MIT License - DuduFisio Team

---

**Status:** ✅ Totalmente funcional com monitoramento Sentry completo

**Última atualização:** Janeiro 2025

