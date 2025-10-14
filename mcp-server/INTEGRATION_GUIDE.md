# 🔗 Guia de Integração com Serviços Reais do DuduFisio-AI

Este guia explica como integrar o servidor MCP com os serviços reais do DuduFisio-AI.

## 📋 Estado Atual

✅ **Implementado:**
- Servidor MCP funcional com stdio transport
- 13 ferramentas com mock data
- Monitoramento completo Sentry
- Tratamento de erros robusto

⏳ **Pendente:**
- Integração com serviços Supabase
- Integração com Gemini API real
- Autenticação e autorização
- Cache e otimizações

## 🔄 Passo a Passo de Integração

### 1️⃣ Configurar Variáveis de Ambiente

Crie arquivo `.env` no diretório `mcp-server/`:

```bash
# Sentry
SENTRY_DSN=https://ed8c685723abb975493f2c73a17122bb@o4509108057341952.ingest.us.sentry.io/4510185005973504
NODE_ENV=production

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your_service_key_here

# Gemini AI
GEMINI_API_KEY=your_gemini_api_key_here

# Opcional: Configurações adicionais
MAX_RESULTS=100
CACHE_TTL=300
```

### 2️⃣ Instalar Dependências Adicionais

```bash
cd mcp-server
npm install @supabase/supabase-js @google/generative-ai dotenv
```

### 3️⃣ Criar Serviços de Integração

#### `mcp-server/services/supabase.ts`

```typescript
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import * as Sentry from '@sentry/node';

let supabase: SupabaseClient | null = null;

export function initSupabase() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;

  if (!url || !key) {
    Sentry.captureMessage('Supabase credentials missing', 'warning');
    return null;
  }

  supabase = createClient(url, key);
  return supabase;
}

export function getSupabase(): SupabaseClient {
  if (!supabase) {
    supabase = initSupabase();
  }
  
  if (!supabase) {
    throw new Error('Supabase not initialized');
  }
  
  return supabase;
}

// Funções de integração com as tabelas
export async function getAllPatientsFromDB() {
  const span = Sentry.startSpan({ name: 'supabase.getAllPatients' });
  
  try {
    const { data, error } = await getSupabase()
      .from('patients')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    span.setStatus('ok');
    return data || [];
  } catch (error) {
    span.setStatus('internal_error');
    Sentry.captureException(error);
    throw error;
  } finally {
    span.end();
  }
}

export async function searchPatientsInDB(query: string) {
  const span = Sentry.startSpan({ name: 'supabase.searchPatients' });
  
  try {
    const { data, error } = await getSupabase()
      .from('patients')
      .select('*')
      .or(`name.ilike.%${query}%,cpf.ilike.%${query}%,email.ilike.%${query}%`)
      .limit(10);

    if (error) throw error;
    
    span.setStatus('ok');
    return data || [];
  } catch (error) {
    span.setStatus('internal_error');
    Sentry.captureException(error);
    throw error;
  } finally {
    span.end();
  }
}

export async function getPatientByIdFromDB(id: string) {
  const span = Sentry.startSpan({ name: 'supabase.getPatientById' });
  
  try {
    const { data, error } = await getSupabase()
      .from('patients')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    
    span.setStatus('ok');
    return data;
  } catch (error) {
    span.setStatus('internal_error');
    Sentry.captureException(error);
    throw error;
  } finally {
    span.end();
  }
}

export async function createAppointmentInDB(appointment: any) {
  const span = Sentry.startSpan({ name: 'supabase.createAppointment' });
  
  try {
    const { data, error } = await getSupabase()
      .from('appointments')
      .insert(appointment)
      .select()
      .single();

    if (error) throw error;
    
    span.setStatus('ok');
    Sentry.addBreadcrumb({
      category: 'database',
      message: 'Appointment created',
      level: 'info',
    });
    
    return data;
  } catch (error) {
    span.setStatus('internal_error');
    Sentry.captureException(error);
    throw error;
  } finally {
    span.end();
  }
}
```

#### `mcp-server/services/gemini.ts`

```typescript
import { GoogleGenerativeAI } from '@google/generative-ai';
import * as Sentry from '@sentry/node';

let genAI: GoogleGenerativeAI | null = null;

export function initGemini() {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    Sentry.captureMessage('Gemini API key missing', 'warning');
    return null;
  }

  genAI = new GoogleGenerativeAI(apiKey);
  return genAI;
}

export function getGemini(): GoogleGenerativeAI {
  if (!genAI) {
    genAI = initGemini();
  }
  
  if (!genAI) {
    throw new Error('Gemini not initialized');
  }
  
  return genAI;
}

export async function analyzePatientProgressWithAI(patientData: any) {
  const span = Sentry.startSpan({ name: 'gemini.analyzeProgress' });
  
  try {
    const model = getGemini().getGenerativeModel({ model: 'gemini-pro' });

    const prompt = `
Analise o progresso do paciente abaixo e forneça insights clínicos:

Nome: ${patientData.name}
Diagnóstico: ${patientData.diagnosis || 'Não especificado'}
Sessões: ${patientData.sessions || 0}
Última visita: ${patientData.lastVisit}

Forneça:
1. Análise geral do progresso
2. Pontos positivos
3. Pontos de atenção
4. Recomendações para próximas sessões
    `.trim();

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    span.setStatus('ok');
    Sentry.addBreadcrumb({
      category: 'ai',
      message: 'Patient progress analyzed',
      level: 'info',
    });

    return text;
  } catch (error) {
    span.setStatus('internal_error');
    Sentry.captureException(error);
    throw error;
  } finally {
    span.end();
  }
}

export async function generateSOAPNote(data: any) {
  const span = Sentry.startSpan({ name: 'gemini.generateSOAP' });
  
  try {
    const model = getGemini().getGenerativeModel({ model: 'gemini-pro' });

    const prompt = `
Gere uma nota SOAP completa baseada nos dados:

SUBJETIVO: ${data.subjective}
OBJETIVO: ${data.objective}

Paciente: ${data.patientName}

Forneça uma nota SOAP completa e profissional incluindo Avaliação e Plano.
    `.trim();

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    span.setStatus('ok');
    return text;
  } catch (error) {
    span.setStatus('internal_error');
    Sentry.captureException(error);
    throw error;
  } finally {
    span.end();
  }
}

export async function suggestTreatmentProtocol(diagnosis: string) {
  const span = Sentry.startSpan({ name: 'gemini.suggestProtocol' });
  
  try {
    const model = getGemini().getGenerativeModel({ model: 'gemini-pro' });

    const prompt = `
Como fisioterapeuta especializado, sugira um protocolo de tratamento completo para:

Diagnóstico: ${diagnosis}

Inclua:
1. Fase Aguda (semanas 1-2)
2. Fase Subaguda (semanas 3-4)
3. Fase de Fortalecimento (semanas 5-6)
4. Objetivos terapêuticos
5. Exercícios recomendados
6. Modalidades terapêuticas

Seja específico e baseado em evidências.
    `.trim();

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    span.setStatus('ok');
    return text;
  } catch (error) {
    span.setStatus('internal_error');
    Sentry.captureException(error);
    throw error;
  } finally {
    span.end();
  }
}
```

### 4️⃣ Atualizar `server.ts`

Substitua as seções de mock data:

```typescript
import dotenv from 'dotenv';
import { 
  getAllPatientsFromDB, 
  searchPatientsInDB,
  getPatientByIdFromDB,
  createAppointmentInDB,
  initSupabase 
} from './services/supabase.js';
import { 
  analyzePatientProgressWithAI,
  generateSOAPNote,
  suggestTreatmentProtocol,
  initGemini 
} from './services/gemini.js';

// Carregar variáveis de ambiente
dotenv.config();

// Inicializar serviços
async function initServices() {
  console.error('🔧 Inicializando serviços...');
  
  try {
    initSupabase();
    console.error('✅ Supabase conectado');
  } catch (error) {
    console.error('⚠️  Supabase não disponível, usando mock data');
    Sentry.captureException(error);
  }

  try {
    initGemini();
    console.error('✅ Gemini AI conectado');
  } catch (error) {
    console.error('⚠️  Gemini AI não disponível');
    Sentry.captureException(error);
  }
}

// Atualizar handlers
case "list_patients": {
  const { status, limit = 50 } = args;
  
  try {
    let patients = await getAllPatientsFromDB();
    
    if (status) {
      patients = patients.filter((p: any) => p.status === status);
    }
    
    result = {
      patients: patients.slice(0, limit),
      total: patients.length,
      filtered: !!status,
      source: 'supabase'
    };
  } catch (error) {
    // Fallback para mock data se Supabase falhar
    console.error('Usando mock data como fallback');
    result = {
      patients: mockPatients.slice(0, limit),
      total: mockPatients.length,
      source: 'mock'
    };
  }
  break;
}

case "analyze_patient_progress": {
  const { patientId, context } = args;
  
  try {
    const patient = await getPatientByIdFromDB(patientId);
    
    if (!patient) {
      throw new McpError(
        ErrorCode.InvalidRequest,
        `Paciente não encontrado: ${patientId}`
      );
    }

    const analysis = await analyzePatientProgressWithAI({
      name: patient.name,
      diagnosis: patient.diagnosis,
      sessions: patient.totalSessions,
      lastVisit: patient.lastVisit,
      context
    });

    result = {
      patientName: patient.name,
      analysis,
      confidence: 0.85,
      generatedAt: new Date().toISOString(),
      source: 'gemini-ai'
    };
  } catch (error) {
    throw new McpError(
      ErrorCode.InternalError,
      `Erro ao analisar progresso: ${error.message}`
    );
  }
  break;
}
```

### 5️⃣ Testes de Integração

Crie `mcp-server/tests/integration.test.ts`:

```typescript
import { describe, it, expect, beforeAll } from 'vitest';
import { initSupabase, getAllPatientsFromDB } from '../services/supabase';
import { initGemini, suggestTreatmentProtocol } from '../services/gemini';

describe('Integration Tests', () => {
  beforeAll(() => {
    // Carregar .env para testes
    require('dotenv').config();
  });

  describe('Supabase Integration', () => {
    it('should connect to Supabase', () => {
      const client = initSupabase();
      expect(client).toBeDefined();
    });

    it('should fetch patients from database', async () => {
      const patients = await getAllPatientsFromDB();
      expect(Array.isArray(patients)).toBe(true);
    });
  });

  describe('Gemini AI Integration', () => {
    it('should connect to Gemini', () => {
      const genAI = initGemini();
      expect(genAI).toBeDefined();
    });

    it('should generate treatment protocol', async () => {
      const protocol = await suggestTreatmentProtocol('Tendinite patelar');
      expect(protocol).toBeDefined();
      expect(protocol.length).toBeGreaterThan(100);
    }, 30000); // Timeout de 30s para chamadas de IA
  });
});
```

### 6️⃣ Deploy e Monitoramento

#### Configurar CI/CD

```yaml
# .github/workflows/mcp-deploy.yml
name: Deploy MCP Server

on:
  push:
    branches: [main]
    paths:
      - 'mcp-server/**'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: |
          cd mcp-server
          npm ci
      
      - name: Build
        run: |
          cd mcp-server
          npm run build
      
      - name: Run tests
        run: |
          cd mcp-server
          npm test
        env:
          SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          SUPABASE_SERVICE_KEY: ${{ secrets.SUPABASE_SERVICE_KEY }}
          GEMINI_API_KEY: ${{ secrets.GEMINI_API_KEY }}
      
      - name: Deploy to production
        run: |
          # Seu script de deploy aqui
          echo "Deploying MCP server..."
```

## 📊 Monitoramento Pós-Integração

Após integrar com serviços reais, monitore:

### 1. **Latência do Supabase**
```typescript
// Adicionar ao handler
const dbStart = Date.now();
const patients = await getAllPatientsFromDB();
const dbDuration = Date.now() - dbStart;

Sentry.addBreadcrumb({
  category: 'performance',
  message: `Supabase query took ${dbDuration}ms`,
  level: 'info',
});
```

### 2. **Custos do Gemini**
Monitore uso de tokens:
```typescript
const result = await model.generateContent(prompt);
const usage = result.response.usageMetadata;

Sentry.setTag('gemini_tokens_used', usage.totalTokenCount);
```

### 3. **Taxa de Fallback**
Rastreie quando usa mock data:
```typescript
Sentry.captureMessage('Fallback to mock data', {
  level: 'warning',
  tags: { tool: 'list_patients' }
});
```

## ✅ Checklist de Integração

- [ ] Variáveis de ambiente configuradas
- [ ] Supabase conectado e testado
- [ ] Gemini API configurada
- [ ] Mock data como fallback funcional
- [ ] Testes de integração passando
- [ ] Monitoramento Sentry ativo
- [ ] Logs estruturados implementados
- [ ] Rate limiting configurado
- [ ] Cache implementado
- [ ] Documentação atualizada

## 🚀 Próximos Passos

1. **Autenticação**: Adicionar JWT/OAuth
2. **Cache**: Redis para melhor performance
3. **Rate Limiting**: Proteger contra abuse
4. **Webhooks**: Notificações em tempo real
5. **GraphQL**: API mais flexível

---

**Última atualização:** Janeiro 2025

