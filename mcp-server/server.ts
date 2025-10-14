#!/usr/bin/env node
/**
 * DuduFisio-AI MCP Server
 * 
 * Servidor MCP que expõe funcionalidades do sistema de gestão de fisioterapia
 * com monitoramento completo via Sentry.
 * 
 * Ferramentas disponíveis:
 * - Gestão de Pacientes
 * - Agendamentos
 * - Análise de IA
 * - Exercícios e Protocolos
 */

import * as Sentry from "@sentry/node";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ErrorCode,
  McpError,
} from "@modelcontextprotocol/sdk/types.js";

// ===== SENTRY INITIALIZATION =====
// IMPORTANTE: Sentry init DEVE estar no topo, antes de tudo
Sentry.init({
  dsn: "https://ed8c685723abb975493f2c73a17122bb@o4509108057341952.ingest.us.sentry.io/4510185005973504",
  
  // Performance Monitoring
  tracesSampleRate: 1.0, // Captura 100% das transações para monitoramento
  
  // Enable MCP-specific features
  sendDefaultPii: true, // Captura argumentos e resultados das ferramentas (pode conter dados sensíveis)
  
  // Environment
  environment: process.env.NODE_ENV || "development",
  
  // Release tracking
  release: `dudufisio-mcp@${process.env.npm_package_version || "1.0.0"}`,
  
  // Additional integrations para debug
  // integrations: [] // Opcional: adicionar integrações customizadas
  
  // Configurações de amostragem
  beforeSend(event, hint) {
    // Aqui você pode filtrar eventos antes de enviar ao Sentry
    // Por exemplo, não enviar erros de validação simples
    return event;
  },
});

// ===== TYPES & INTERFACES =====
interface Patient {
  id: string;
  name: string;
  cpf: string;
  email: string;
  phone: string;
  status: string;
  lastVisit: string;
}

interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  date: string;
  time: string;
  therapist: string;
  status: string;
}

interface Exercise {
  id: string;
  name: string;
  category: string;
  description: string;
  videoUrl?: string;
}

// ===== MOCK DATA (Simulando integração com os serviços reais) =====
const mockPatients: Patient[] = [
  {
    id: "1",
    name: "João Silva",
    cpf: "123.456.789-00",
    email: "joao@email.com",
    phone: "(11) 98765-4321",
    status: "Active",
    lastVisit: "2024-01-15",
  },
  {
    id: "2",
    name: "Maria Santos",
    cpf: "987.654.321-00",
    email: "maria@email.com",
    phone: "(11) 98765-1234",
    status: "Active",
    lastVisit: "2024-01-14",
  },
];

const mockAppointments: Appointment[] = [
  {
    id: "1",
    patientId: "1",
    patientName: "João Silva",
    date: "2024-01-20",
    time: "09:00",
    therapist: "Dr. Roberto",
    status: "scheduled",
  },
];

const mockExercises: Exercise[] = [
  {
    id: "1",
    name: "Alongamento de Isquiotibiais",
    category: "Alongamento",
    description: "Exercício para alongar a musculatura posterior da coxa",
    videoUrl: "https://example.com/video1",
  },
  {
    id: "2",
    name: "Fortalecimento de Quadríceps",
    category: "Fortalecimento",
    description: "Exercício para fortalecer a musculatura anterior da coxa",
    videoUrl: "https://example.com/video2",
  },
];

// ===== MCP SERVER SETUP =====
const server = new Server(
  {
    name: "dudufisio-ai-mcp",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// ===== TOOL DEFINITIONS =====
const TOOLS = [
  // ========== GESTÃO DE PACIENTES ==========
  {
    name: "list_patients",
    description: "Lista todos os pacientes cadastrados no sistema",
    inputSchema: {
      type: "object",
      properties: {
        status: {
          type: "string",
          description: "Filtrar por status: Active, Inactive, Discharged",
          enum: ["Active", "Inactive", "Discharged"],
        },
        limit: {
          type: "number",
          description: "Número máximo de resultados (padrão: 50)",
          default: 50,
        },
      },
    },
  },
  {
    name: "search_patient",
    description: "Busca pacientes por nome, CPF ou email",
    inputSchema: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "Termo de busca (nome, CPF ou email)",
        },
      },
      required: ["query"],
    },
  },
  {
    name: "get_patient_details",
    description: "Obtém detalhes completos de um paciente específico",
    inputSchema: {
      type: "object",
      properties: {
        patientId: {
          type: "string",
          description: "ID do paciente",
        },
      },
      required: ["patientId"],
    },
  },
  {
    name: "get_patient_history",
    description: "Obtém histórico de atendimentos e evolução de um paciente",
    inputSchema: {
      type: "object",
      properties: {
        patientId: {
          type: "string",
          description: "ID do paciente",
        },
        startDate: {
          type: "string",
          description: "Data inicial (YYYY-MM-DD)",
        },
        endDate: {
          type: "string",
          description: "Data final (YYYY-MM-DD)",
        },
      },
      required: ["patientId"],
    },
  },

  // ========== AGENDAMENTOS ==========
  {
    name: "list_appointments",
    description: "Lista agendamentos do sistema",
    inputSchema: {
      type: "object",
      properties: {
        date: {
          type: "string",
          description: "Data específica (YYYY-MM-DD)",
        },
        therapist: {
          type: "string",
          description: "Nome do terapeuta",
        },
        status: {
          type: "string",
          description: "Status do agendamento",
          enum: ["scheduled", "completed", "cancelled", "no-show"],
        },
      },
    },
  },
  {
    name: "create_appointment",
    description: "Cria um novo agendamento",
    inputSchema: {
      type: "object",
      properties: {
        patientId: {
          type: "string",
          description: "ID do paciente",
        },
        date: {
          type: "string",
          description: "Data do agendamento (YYYY-MM-DD)",
        },
        time: {
          type: "string",
          description: "Hora do agendamento (HH:MM)",
        },
        therapist: {
          type: "string",
          description: "Nome do terapeuta",
        },
        notes: {
          type: "string",
          description: "Observações sobre o agendamento",
        },
      },
      required: ["patientId", "date", "time"],
    },
  },

  // ========== ANÁLISES DE IA ==========
  {
    name: "analyze_patient_progress",
    description: "Analisa o progresso do paciente usando IA (Google Gemini)",
    inputSchema: {
      type: "object",
      properties: {
        patientId: {
          type: "string",
          description: "ID do paciente",
        },
        context: {
          type: "string",
          description: "Contexto adicional para análise",
        },
      },
      required: ["patientId"],
    },
  },
  {
    name: "generate_soap_note",
    description: "Gera uma nota SOAP (Subjetivo, Objetivo, Avaliação, Plano) usando IA",
    inputSchema: {
      type: "object",
      properties: {
        patientId: {
          type: "string",
          description: "ID do paciente",
        },
        subjective: {
          type: "string",
          description: "Queixas e sintomas relatados pelo paciente",
        },
        objective: {
          type: "string",
          description: "Observações objetivas do terapeuta",
        },
      },
      required: ["patientId", "subjective", "objective"],
    },
  },
  {
    name: "suggest_treatment_protocol",
    description: "Sugere protocolo de tratamento baseado no diagnóstico usando IA",
    inputSchema: {
      type: "object",
      properties: {
        diagnosis: {
          type: "string",
          description: "Diagnóstico ou condição do paciente",
        },
        patientAge: {
          type: "number",
          description: "Idade do paciente",
        },
        limitations: {
          type: "string",
          description: "Limitações ou restrições do paciente",
        },
      },
      required: ["diagnosis"],
    },
  },

  // ========== EXERCÍCIOS E PROTOCOLOS ==========
  {
    name: "search_exercises",
    description: "Busca exercícios terapêuticos na biblioteca",
    inputSchema: {
      type: "object",
      properties: {
        category: {
          type: "string",
          description: "Categoria do exercício",
          enum: [
            "Alongamento",
            "Fortalecimento",
            "Mobilidade",
            "Equilíbrio",
            "Cardio",
          ],
        },
        bodyPart: {
          type: "string",
          description: "Parte do corpo alvo",
        },
        difficulty: {
          type: "string",
          description: "Nível de dificuldade",
          enum: ["Iniciante", "Intermediário", "Avançado"],
        },
      },
    },
  },
  {
    name: "create_exercise_protocol",
    description: "Cria um protocolo de exercícios para um paciente",
    inputSchema: {
      type: "object",
      properties: {
        patientId: {
          type: "string",
          description: "ID do paciente",
        },
        exerciseIds: {
          type: "array",
          items: { type: "string" },
          description: "IDs dos exercícios a incluir",
        },
        frequency: {
          type: "string",
          description: "Frequência recomendada (ex: '3x por semana')",
        },
        duration: {
          type: "string",
          description: "Duração do protocolo (ex: '4 semanas')",
        },
      },
      required: ["patientId", "exerciseIds"],
    },
  },

  // ========== ANALYTICS E RELATÓRIOS ==========
  {
    name: "get_clinic_stats",
    description: "Obtém estatísticas gerais da clínica",
    inputSchema: {
      type: "object",
      properties: {
        period: {
          type: "string",
          description: "Período para análise",
          enum: ["today", "week", "month", "year"],
          default: "month",
        },
      },
    },
  },
  {
    name: "generate_patient_report",
    description: "Gera relatório completo de evolução do paciente",
    inputSchema: {
      type: "object",
      properties: {
        patientId: {
          type: "string",
          description: "ID do paciente",
        },
        includeExercises: {
          type: "boolean",
          description: "Incluir histórico de exercícios",
          default: true,
        },
        includeMeasurements: {
          type: "boolean",
          description: "Incluir medições físicas",
          default: true,
        },
      },
      required: ["patientId"],
    },
  },
];

// ===== TOOL HANDLERS =====
async function handleToolCall(name: string, args: any) {
  // Criar uma transação do Sentry para cada tool call usando startSpan (v8 API)
  return await Sentry.startSpan(
    {
      op: "mcp.tool",
      name: `MCP Tool: ${name}`,
    },
    async (span) => {
      try {
        // Criar um span filho para o processamento da ferramenta
        return await Sentry.startSpan(
          {
            op: "tool.execute",
            name: `Executing ${name}`,
          },
          async () => {

    let result: any;

    switch (name) {
      // ===== PACIENTES =====
      case "list_patients": {
        const { status, limit = 50 } = args;
        let patients = [...mockPatients];

        if (status) {
          patients = patients.filter((p) => p.status === status);
        }

        result = {
          patients: patients.slice(0, limit),
          total: patients.length,
          filtered: !!status,
        };
        break;
      }

      case "search_patient": {
        const { query } = args;
        const searchTerm = query.toLowerCase();

        const results = mockPatients.filter(
          (p) =>
            p.name.toLowerCase().includes(searchTerm) ||
            p.cpf.includes(searchTerm) ||
            p.email.toLowerCase().includes(searchTerm)
        );

        result = {
          results,
          count: results.length,
          query,
        };
        break;
      }

      case "get_patient_details": {
        const { patientId } = args;
        const patient = mockPatients.find((p) => p.id === patientId);

        if (!patient) {
          throw new McpError(
            ErrorCode.InvalidRequest,
            `Paciente não encontrado: ${patientId}`
          );
        }

        result = {
          patient,
          appointments: mockAppointments.filter(
            (a) => a.patientId === patientId
          ),
          lastUpdate: new Date().toISOString(),
        };
        break;
      }

      case "get_patient_history": {
        const { patientId, startDate, endDate } = args;
        const patient = mockPatients.find((p) => p.id === patientId);

        if (!patient) {
          throw new McpError(
            ErrorCode.InvalidRequest,
            `Paciente não encontrado: ${patientId}`
          );
        }

        result = {
          patient,
          history: [
            {
              date: "2024-01-15",
              type: "Consulta",
              notes: "Paciente apresentou melhora significativa",
              therapist: "Dr. Roberto",
            },
          ],
          period: { startDate, endDate },
        };
        break;
      }

      // ===== AGENDAMENTOS =====
      case "list_appointments": {
        const { date, therapist, status } = args;
        let appointments = [...mockAppointments];

        if (date) {
          appointments = appointments.filter((a) => a.date === date);
        }
        if (therapist) {
          appointments = appointments.filter((a) => a.therapist === therapist);
        }
        if (status) {
          appointments = appointments.filter((a) => a.status === status);
        }

        result = {
          appointments,
          count: appointments.length,
          filters: { date, therapist, status },
        };
        break;
      }

      case "create_appointment": {
        const { patientId, date, time, therapist, notes } = args;
        const patient = mockPatients.find((p) => p.id === patientId);

        if (!patient) {
          throw new McpError(
            ErrorCode.InvalidRequest,
            `Paciente não encontrado: ${patientId}`
          );
        }

        const newAppointment: Appointment = {
          id: `apt-${Date.now()}`,
          patientId,
          patientName: patient.name,
          date,
          time,
          therapist: therapist || "Dr. Roberto",
          status: "scheduled",
        };

        result = {
          appointment: newAppointment,
          created: true,
          message: `Agendamento criado com sucesso para ${patient.name}`,
        };
        break;
      }

      // ===== IA =====
      case "analyze_patient_progress": {
        const { patientId, context } = args;
        const patient = mockPatients.find((p) => p.id === patientId);

        if (!patient) {
          throw new McpError(
            ErrorCode.InvalidRequest,
            `Paciente não encontrado: ${patientId}`
          );
        }

        // Simulando análise de IA
        result = {
          patientName: patient.name,
          analysis: `📊 Análise de Progresso - ${patient.name}

🎯 Status Geral: POSITIVO

📈 Evolução:
- Redução de 40% na dor reportada
- Aumento de 25% na amplitude de movimento
- Melhora significativa na força muscular

💡 Recomendações:
- Continuar protocolo atual por mais 2 semanas
- Adicionar exercícios de propriocepção
- Avaliar possibilidade de alta em 4 semanas

⚠️ Pontos de Atenção:
- Manter acompanhamento da evolução da dor
- Reforçar exercícios domiciliares`,
          confidence: 0.85,
          generatedAt: new Date().toISOString(),
        };
        break;
      }

      case "generate_soap_note": {
        const { patientId, subjective, objective } = args;
        const patient = mockPatients.find((p) => p.id === patientId);

        if (!patient) {
          throw new McpError(
            ErrorCode.InvalidRequest,
            `Paciente não encontrado: ${patientId}`
          );
        }

        result = {
          patientName: patient.name,
          soap: `📋 SOAP Note - ${patient.name}

S (SUBJETIVO):
${subjective}

O (OBJETIVO):
${objective}

A (AVALIAÇÃO):
Paciente apresenta evolução satisfatória do quadro. Mantém aderência ao tratamento.
Redução progressiva de sintomas álgicos.

P (PLANO):
- Continuar com protocolo atual
- Reavaliar em 1 semana
- Orientações de exercícios domiciliares
- Agendar nova sessão`,
          generatedAt: new Date().toISOString(),
        };
        break;
      }

      case "suggest_treatment_protocol": {
        const { diagnosis, patientAge, limitations } = args;

        result = {
          diagnosis,
          protocol: `🔬 Protocolo de Tratamento Sugerido

📋 Diagnóstico: ${diagnosis}
👤 Idade: ${patientAge || "Não especificada"}
⚠️ Limitações: ${limitations || "Nenhuma reportada"}

📅 Fase 1 (Semanas 1-2): Controle da Dor
- Crioterapia 20min
- TENS para analgesia
- Mobilização passiva
- Alongamentos leves

📅 Fase 2 (Semanas 3-4): Restauração da Função
- Exercícios ativos assistidos
- Fortalecimento isométrico
- Propriocepção inicial
- Treino funcional básico

📅 Fase 3 (Semanas 5-6): Fortalecimento
- Exercícios resistidos
- Treino de equilíbrio avançado
- Retorno gradual às atividades

🎯 Objetivos:
- Redução completa da dor
- Restauração da amplitude de movimento
- Retorno às atividades diárias sem limitações`,
          confidence: 0.80,
          generatedAt: new Date().toISOString(),
        };
        break;
      }

      // ===== EXERCÍCIOS =====
      case "search_exercises": {
        const { category, bodyPart, difficulty } = args;
        let exercises = [...mockExercises];

        if (category) {
          exercises = exercises.filter((e) => e.category === category);
        }

        result = {
          exercises,
          count: exercises.length,
          filters: { category, bodyPart, difficulty },
        };
        break;
      }

      case "create_exercise_protocol": {
        const { patientId, exerciseIds, frequency, duration } = args;
        const patient = mockPatients.find((p) => p.id === patientId);

        if (!patient) {
          throw new McpError(
            ErrorCode.InvalidRequest,
            `Paciente não encontrado: ${patientId}`
          );
        }

        const exercises = mockExercises.filter((e) =>
          exerciseIds.includes(e.id)
        );

        result = {
          protocol: {
            id: `prot-${Date.now()}`,
            patientId,
            patientName: patient.name,
            exercises,
            frequency: frequency || "3x por semana",
            duration: duration || "4 semanas",
            createdAt: new Date().toISOString(),
          },
          message: `Protocolo criado com ${exercises.length} exercícios para ${patient.name}`,
        };
        break;
      }

      // ===== ANALYTICS =====
      case "get_clinic_stats": {
        const { period = "month" } = args;

        result = {
          period,
          stats: {
            totalPatients: mockPatients.length,
            activePatients: mockPatients.filter((p) => p.status === "Active")
              .length,
            totalAppointments: mockAppointments.length,
            completionRate: 0.92,
            averageSatisfaction: 4.7,
            revenueGrowth: "+15%",
          },
          generatedAt: new Date().toISOString(),
        };
        break;
      }

      case "generate_patient_report": {
        const { patientId, includeExercises, includeMeasurements } = args;
        const patient = mockPatients.find((p) => p.id === patientId);

        if (!patient) {
          throw new McpError(
            ErrorCode.InvalidRequest,
            `Paciente não encontrado: ${patientId}`
          );
        }

        result = {
          patient,
          report: `📊 Relatório de Evolução - ${patient.name}

👤 Dados do Paciente:
- Nome: ${patient.name}
- CPF: ${patient.cpf}
- Status: ${patient.status}
- Última Visita: ${patient.lastVisit}

📈 Evolução do Tratamento:
- Sessões Realizadas: 12
- Progresso Geral: 75%
- Taxa de Comparecimento: 95%

${
  includeExercises
    ? `
💪 Exercícios Realizados:
- Alongamento de Isquiotibiais: 24 sessões
- Fortalecimento de Quadríceps: 20 sessões
`
    : ""
}

${
  includeMeasurements
    ? `
📏 Medições Físicas:
- Amplitude de Movimento: +30% melhora
- Força Muscular: +25% melhora
- EVA (Escala de Dor): 8 → 3
`
    : ""
}`,
          generatedAt: new Date().toISOString(),
        };
        break;
      }

      default:
        throw new McpError(
          ErrorCode.MethodNotFound,
          `Ferramenta desconhecida: ${name}`
        );
    }

            // Adicionar breadcrumb de sucesso
            Sentry.addBreadcrumb({
              category: "mcp.tool",
              message: `Tool ${name} executed successfully`,
              level: "info",
              data: { toolName: name, argsKeys: Object.keys(args) },
            });

            return result;
          }
        );
      } catch (error) {
        // Capturar erro no Sentry
        Sentry.captureException(error, {
          tags: {
            tool: name,
            mcp_version: "1.0.0",
          },
          contexts: {
            tool: {
              name,
              arguments: args,
            },
          },
        });

        throw error;
      }
    }
  );
}

// ===== REQUEST HANDLERS =====
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return { tools: TOOLS };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  try {
    const result = await handleToolCall(request.params.name, request.params.arguments || {});

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  } catch (error) {
    if (error instanceof McpError) {
      throw error;
    }

    throw new McpError(
      ErrorCode.InternalError,
      `Erro ao executar ferramenta: ${error}`
    );
  }
});

// ===== SERVER STARTUP =====
async function main() {
  console.error("🚀 Iniciando DuduFisio-AI MCP Server...");
  console.error(`📊 Sentry DSN configurado: ${Sentry.getCurrentHub().getClient()?.getDsn()}`);
  console.error(`🔧 ${TOOLS.length} ferramentas disponíveis`);
  console.error("");

  const transport = new StdioServerTransport();
  await server.connect(transport);

  console.error("✅ Servidor MCP iniciado com sucesso!");
  console.error("📡 Aguardando requisições...");
  console.error("");

  // Enviar evento de inicialização para o Sentry
  Sentry.captureMessage("DuduFisio MCP Server Started", "info");
}

// ===== ERROR HANDLING =====
process.on("unhandledRejection", (reason, promise) => {
  console.error("❌ Unhandled Rejection:", reason);
  Sentry.captureException(reason);
});

process.on("uncaughtException", (error) => {
  console.error("❌ Uncaught Exception:", error);
  Sentry.captureException(error);
  process.exit(1);
});

// Graceful shutdown
process.on("SIGINT", async () => {
  console.error("\n⏹️  Encerrando servidor...");
  await Sentry.close(2000);
  process.exit(0);
});

process.on("SIGTERM", async () => {
  console.error("\n⏹️  Encerrando servidor...");
  await Sentry.close(2000);
  process.exit(0);
});

// ===== START SERVER =====
main().catch((error) => {
  console.error("❌ Erro fatal ao iniciar servidor:", error);
  Sentry.captureException(error);
  process.exit(1);
});

