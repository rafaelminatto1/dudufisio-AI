# 📋 Planejamento - Fase Final de Otimização
## DuduFisio-AI - Pós-Segurança

**Estimativa Total**: 6.5 - 8.5 horas
**Prioridade**: Média (sistema já está production-ready)
**Objetivo**: Melhorar qualidade de código e adicionar features avançadas

---

## 🎯 Visão Geral das Tarefas

| # | Tarefa | Tempo | Prioridade | Dependências |
|---|--------|-------|------------|--------------|
| 1 | Corrigir erros TS críticos (possibly undefined) | 4-6h | 🔴 ALTA | Nenhuma |
| 2 | Testar fluxos com Playwright MCP | 30min | 🟡 MÉDIA | Nenhuma |
| 3 | Implementar Redis para rate limiting | 2h | 🟢 BAIXA | Docker |

---

## 📅 Cronograma Recomendado

### Opção A: Execução Sequencial (1 dia)
```
Dia 1:
09:00 - 13:00  Correção de erros TS (Fase 1 - Serviços)
14:00 - 16:00  Correção de erros TS (Fase 2 - Componentes críticos)
16:00 - 16:30  Testes Playwright MCP
16:30 - 18:30  Implementação Redis
```

### Opção B: Execução Incremental (3 dias)
```
Dia 1 (4h): Correção de erros TS - Serviços
Dia 2 (2h): Correção de erros TS - Componentes + Testes MCP
Dia 3 (2h): Implementação Redis
```

---

## 1️⃣ Tarefa 1: Corrigir Erros TS Críticos (373 erros)

### 📊 Contexto
- **Erros totais**: 373 (TS18048 + TS2532)
- **Tipo**: Possibly undefined
- **Impacto**: Runtime errors potenciais
- **Tempo estimado**: 4-6 horas

### 🎯 Estratégia de Correção

#### Fase 1.1: Serviços Críticos (1.5h)
**Prioridade**: 🔴 CRÍTICA

**Arquivos alvo:**
- `services/patientService.ts`
- `services/appointmentService.ts`
- `services/auth/supabaseAuthService.ts`
- `services/ai/aiOrchestratorService.ts`
- `services/geminiService.ts`

**Padrões de correção:**
```typescript
// ❌ ANTES
const total = appointment.price * 1.1;

// ✅ DEPOIS - Opção 1: Nullish coalescing
const total = (appointment.price ?? 0) * 1.1;

// ✅ DEPOIS - Opção 2: Optional chaining + default
const total = appointment.price ? appointment.price * 1.1 : 0;

// ✅ DEPOIS - Opção 3: Type guard
if (appointment.price !== undefined) {
  const total = appointment.price * 1.1;
}
```

**Checklist:**
- [ ] Executar `npm run type-check` e filtrar erros dos serviços
- [ ] Corrigir erros TS18048 em cada serviço
- [ ] Corrigir erros TS2532 em cada serviço
- [ ] Executar testes unitários após cada correção
- [ ] Commit: `fix: resolve possibly undefined errors in critical services`

#### Fase 1.2: Componentes de Agenda (2h)
**Prioridade**: 🟡 ALTA

**Arquivos alvo:**
- `components/agenda/AppointmentCardWithActions.tsx` (~30 erros)
- `components/agenda/ImprovedWeeklyView.tsx` (~15 erros)
- `components/agenda/EnhancedDragDrop.tsx` (~10 erros)
- `components/agenda/ConflictWarningDialog.tsx` (~8 erros)

**Exemplo específico:**
```typescript
// Arquivo: AppointmentCardWithActions.tsx:161
// ❌ ANTES
const formattedPrice = appointment.price.toFixed(2);

// ✅ DEPOIS
const formattedPrice = appointment.price?.toFixed(2) ?? '0.00';
```

**Checklist:**
- [ ] Corrigir erros de `appointment.price` undefined
- [ ] Corrigir erros de `conflict.conflictingAppointments` undefined
- [ ] Corrigir erros de `historyEntry` undefined
- [ ] Testar interface de agenda após correções
- [ ] Commit: `fix: resolve undefined errors in agenda components`

#### Fase 1.3: Admin Dashboard (1h)
**Prioridade**: 🟡 MÉDIA

**Arquivos alvo:**
- `components/admin-dashboard/RevenueEvolutionChart.tsx`
- `components/admin-dashboard/ProfessionalProductivityChart.tsx`

**Padrão comum:**
```typescript
// ❌ ANTES
const maxValue = Math.max(...data.map(d => d.value));
// 'max' is possibly undefined

// ✅ DEPOIS
const maxValue = Math.max(...data.map(d => d.value), 0);
// Garante que sempre há um valor
```

**Checklist:**
- [ ] Corrigir erros de `max` undefined em gráficos
- [ ] Adicionar valores padrão para cálculos
- [ ] Testar renderização de gráficos
- [ ] Commit: `fix: add default values for chart calculations`

#### Fase 1.4: Componentes Restantes (1-1.5h)
**Prioridade**: 🟢 BAIXA

**Arquivos:**
- `components/agenda/EnhancedAgendaPage.tsx`
- `components/agenda/PatientSearchInput.tsx`
- `components/agenda/QuickAddPatientDialog.tsx`
- Outros componentes menores

**Checklist:**
- [ ] Corrigir erros restantes por arquivo
- [ ] Executar `npm run type-check` para validar
- [ ] Testar aplicação completa
- [ ] Commit: `fix: resolve remaining undefined errors`

### 🔍 Processo de Validação

**Após cada fase:**
```bash
# 1. Type check
npm run type-check 2>&1 | grep "error TS\(18048\|2532\)" | wc -l

# 2. Build
npm run build

# 3. Testes
npm run test

# 4. Dev server (testar manualmente)
npm run dev
```

**Critérios de sucesso:**
- ✅ Zero erros TS18048/TS2532 em arquivos críticos
- ✅ Build passa sem erros
- ✅ Aplicação funciona normalmente
- ✅ Sem regressões visuais

### 📝 Template de Commit

```
fix(services): resolve possibly undefined errors in [service-name]

- Add nullish coalescing for optional properties
- Add type guards for undefined checks
- Add default values where appropriate

Fixes: TS18048, TS2532
Files: [list of files]
```

---

## 2️⃣ Tarefa 2: Testar Fluxos com Playwright MCP

### 📊 Contexto
- **Tempo estimado**: 30 minutos
- **Prioridade**: 🟡 MÉDIA
- **Objetivo**: Validar fluxos críticos usando Playwright MCP

### 🎯 Fluxos a Testar

#### Teste 2.1: Login e Navegação Básica (10 min)

**Passos:**
1. Navegar para `http://localhost:5176`
2. Fazer login como admin
3. Navegar para dashboard
4. Capturar screenshot
5. Verificar console sem erros

**Comandos Playwright MCP:**
```bash
# Iniciar se necessário
npm run dev

# Usar Playwright MCP browser
# - Navigate to http://localhost:5176
# - Take screenshot of login page
# - Fill login form
# - Submit and wait for redirect
# - Take screenshot of dashboard
# - Check console messages
```

**Checklist:**
- [ ] Login funciona sem erros
- [ ] Redirect para dashboard
- [ ] Sem erros no console
- [ ] Screenshot capturado

#### Teste 2.2: Módulo de Pacientes (10 min)

**Passos:**
1. Navegar para /patients
2. Verificar carregamento da lista
3. Testar busca de paciente
4. Verificar que dados sensíveis não aparecem nos logs

**Checklist:**
- [ ] Lista de pacientes carrega
- [ ] Busca funciona
- [ ] Sem CPF/email nos console.logs
- [ ] RLS aplicado corretamente

#### Teste 2.3: Módulo de Agendamentos (10 min)

**Passos:**
1. Navegar para /agenda
2. Verificar visualização semanal
3. Tentar criar agendamento
4. Validar conflitos se houver

**Checklist:**
- [ ] Agenda carrega corretamente
- [ ] Visualização semanal funciona
- [ ] Criação de agendamento funciona
- [ ] Validação de conflitos OK

### 📝 Documentar Resultados

**Criar arquivo:** `TESTES_PLAYWRIGHT_MCP_RESULTADOS.md`

```markdown
# Resultados dos Testes Playwright MCP

## Login e Navegação
- Status: ✅ Passou
- Screenshots: `/screenshots/login-*.png`
- Observações: Nenhuma

## Pacientes
- Status: ✅ Passou
- Observações: Nenhuma

## Agendamentos
- Status: ✅ Passou
- Observações: Nenhuma
```

---

## 3️⃣ Tarefa 3: Implementar Redis para Rate Limiting

### 📊 Contexto
- **Tempo estimado**: 2 horas
- **Prioridade**: 🟢 BAIXA
- **Objetivo**: Substituir rate limiting em memória por Redis

### 🎯 Requisitos

**Infraestrutura:**
- Redis instalado ou Docker
- Cliente Redis para Node.js
- Configuração de ambiente

### 📝 Plano de Implementação

#### Fase 3.1: Setup Redis (30 min)

**3.1.1 Instalar Dependências**
```bash
npm install redis
npm install -D @types/redis
```

**3.1.2 Configurar Docker Compose (Opcional)**

Criar/atualizar `docker-compose.yml`:
```yaml
version: '3.8'

services:
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis-data:/data
    command: redis-server --appendonly yes
    restart: unless-stopped

volumes:
  redis-data:
```

**3.1.3 Configurar Variáveis de Ambiente**

Atualizar `.env.local`:
```env
# Redis Configuration
REDIS_URL=redis://localhost:6379
REDIS_ENABLED=true
REDIS_RATE_LIMIT_WINDOW=60000  # 1 minuto
REDIS_RATE_LIMIT_MAX=60        # 60 requests por minuto
```

**Checklist:**
- [ ] Redis instalado/Docker configurado
- [ ] Cliente Redis instalado
- [ ] Variáveis de ambiente configuradas
- [ ] Redis rodando localmente

#### Fase 3.2: Criar Rate Limiter Service (45 min)

**Criar arquivo:** `services/ai/rateLimiter.ts`

```typescript
/**
 * Redis-based Rate Limiter
 * Substitui rate limiting em memória por solução distribuída
 */

import { createClient } from 'redis';
import { secureLogger } from '@/lib/secureLogger';

interface RateLimitConfig {
  windowMs: number;      // Janela de tempo (ms)
  maxRequests: number;   // Máximo de requisições
  keyPrefix?: string;    // Prefixo para chaves Redis
}

class RedisRateLimiter {
  private client: ReturnType<typeof createClient> | null = null;
  private isEnabled: boolean;
  private config: RateLimitConfig;
  private fallbackMemory: Map<string, number[]> = new Map();

  constructor(config: RateLimitConfig) {
    this.config = {
      keyPrefix: 'ratelimit:',
      ...config
    };
    this.isEnabled = import.meta.env.VITE_REDIS_ENABLED === 'true';
    this.initialize();
  }

  private async initialize() {
    if (!this.isEnabled) {
      secureLogger.warn('Redis rate limiter disabled - using memory fallback', {
        component: 'RedisRateLimiter',
        action: 'initialize'
      });
      return;
    }

    try {
      const redisUrl = import.meta.env.VITE_REDIS_URL || 'redis://localhost:6379';

      this.client = createClient({ url: redisUrl });

      this.client.on('error', (err) => {
        secureLogger.error('Redis client error', err, {
          component: 'RedisRateLimiter',
          action: 'initialize'
        });
      });

      await this.client.connect();

      secureLogger.info('Redis rate limiter connected', {
        component: 'RedisRateLimiter',
        action: 'initialize'
      });
    } catch (error) {
      secureLogger.error('Failed to initialize Redis', error, {
        component: 'RedisRateLimiter',
        action: 'initialize'
      });
      this.client = null;
    }
  }

  /**
   * Verifica se requisição está dentro do limite
   */
  async checkLimit(identifier: string): Promise<{
    allowed: boolean;
    remaining: number;
    resetAt: Date;
  }> {
    const key = `${this.config.keyPrefix}${identifier}`;

    // Fallback para memória se Redis não disponível
    if (!this.client) {
      return this.checkLimitMemory(identifier);
    }

    try {
      const now = Date.now();
      const windowStart = now - this.config.windowMs;

      // Remove requisições antigas
      await this.client.zRemRangeByScore(key, 0, windowStart);

      // Conta requisições na janela atual
      const count = await this.client.zCard(key);

      if (count >= this.config.maxRequests) {
        // Limite excedido
        const oldestRequest = await this.client.zRange(key, 0, 0);
        const resetAt = new Date(
          parseInt(oldestRequest[0] || '0') + this.config.windowMs
        );

        return {
          allowed: false,
          remaining: 0,
          resetAt
        };
      }

      // Adiciona nova requisição
      await this.client.zAdd(key, {
        score: now,
        value: `${now}`
      });

      // Define expiração da chave
      await this.client.expire(key, Math.ceil(this.config.windowMs / 1000));

      return {
        allowed: true,
        remaining: this.config.maxRequests - (count + 1),
        resetAt: new Date(now + this.config.windowMs)
      };
    } catch (error) {
      secureLogger.error('Redis rate limit check failed', error, {
        component: 'RedisRateLimiter',
        action: 'checkLimit'
      });

      // Fallback para memória em caso de erro
      return this.checkLimitMemory(identifier);
    }
  }

  /**
   * Fallback: Rate limiting em memória
   */
  private checkLimitMemory(identifier: string): {
    allowed: boolean;
    remaining: number;
    resetAt: Date;
  } {
    const now = Date.now();
    const windowStart = now - this.config.windowMs;

    // Obtém requisições do identificador
    let requests = this.fallbackMemory.get(identifier) || [];

    // Remove requisições antigas
    requests = requests.filter(timestamp => timestamp > windowStart);

    if (requests.length >= this.config.maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        resetAt: new Date(requests[0] + this.config.windowMs)
      };
    }

    // Adiciona nova requisição
    requests.push(now);
    this.fallbackMemory.set(identifier, requests);

    return {
      allowed: true,
      remaining: this.config.maxRequests - requests.length,
      resetAt: new Date(now + this.config.windowMs)
    };
  }

  /**
   * Limpa limite para um identificador
   */
  async resetLimit(identifier: string): Promise<void> {
    const key = `${this.config.keyPrefix}${identifier}`;

    if (this.client) {
      await this.client.del(key);
    }

    this.fallbackMemory.delete(identifier);
  }

  /**
   * Fecha conexão Redis
   */
  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.quit();
    }
  }
}

// Instância global para AI rate limiting
export const aiRateLimiter = new RedisRateLimiter({
  windowMs: parseInt(import.meta.env.VITE_REDIS_RATE_LIMIT_WINDOW || '60000'),
  maxRequests: parseInt(import.meta.env.VITE_REDIS_RATE_LIMIT_MAX || '60'),
  keyPrefix: 'ai:'
});

// Instância para API geral
export const apiRateLimiter = new RedisRateLimiter({
  windowMs: 60000, // 1 minuto
  maxRequests: 100,
  keyPrefix: 'api:'
});

export default RedisRateLimiter;
```

**Checklist:**
- [ ] Arquivo `rateLimiter.ts` criado
- [ ] Lógica Redis implementada
- [ ] Fallback em memória mantido
- [ ] secureLogger integrado

#### Fase 3.3: Integrar com AI Orchestrator (30 min)

**Atualizar:** `services/ai/aiOrchestratorService.ts`

```typescript
import { aiRateLimiter } from './rateLimiter';

export class AiOrchestratorService {
  // ... código existente ...

  async query(prompt: string, provider?: string): Promise<AIResponse> {
    // Substituir rate limit em memória por Redis
    const userId = this.getCurrentUserId(); // Implementar método
    const rateLimitCheck = await aiRateLimiter.checkLimit(userId);

    if (!rateLimitCheck.allowed) {
      throw new Error(
        `Rate limit exceeded. Try again in ${Math.ceil(
          (rateLimitCheck.resetAt.getTime() - Date.now()) / 1000
        )} seconds.`
      );
    }

    secureLogger.info('AI query rate limit check', {
      component: 'AiOrchestratorService',
      action: 'query',
      userId,
      remaining: rateLimitCheck.remaining
    });

    // Resto da lógica existente...
    // ...
  }

  private getCurrentUserId(): string {
    // Implementar obtenção do userId do contexto
    // Pode ser do Supabase auth ou session
    return 'user_id'; // Placeholder
  }
}
```

**Checklist:**
- [ ] Rate limiter antigo removido
- [ ] aiRateLimiter integrado
- [ ] UserId implementation
- [ ] Logs atualizados

#### Fase 3.4: Criar Middleware Express (15 min)

**Criar arquivo:** `middleware/rateLimitMiddleware.ts`

```typescript
import { Request, Response, NextFunction } from 'express';
import { apiRateLimiter } from '../services/ai/rateLimiter';
import { secureLogger } from '../lib/secureLogger';

export async function rateLimitMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    // Identificador único (IP + User ID)
    const identifier = req.user?.id || req.ip || 'anonymous';

    const result = await apiRateLimiter.checkLimit(identifier);

    // Headers de rate limit
    res.setHeader('X-RateLimit-Limit', '100');
    res.setHeader('X-RateLimit-Remaining', result.remaining.toString());
    res.setHeader('X-RateLimit-Reset', result.resetAt.toISOString());

    if (!result.allowed) {
      secureLogger.warn('Rate limit exceeded', {
        component: 'RateLimitMiddleware',
        action: 'check',
        identifier: identifier.slice(0, 8) + '...' // Parcial para não logar IPs completos
      });

      return res.status(429).json({
        error: 'Too Many Requests',
        message: 'Rate limit exceeded. Please try again later.',
        resetAt: result.resetAt.toISOString()
      });
    }

    next();
  } catch (error) {
    secureLogger.error('Rate limit middleware error', error, {
      component: 'RateLimitMiddleware',
      action: 'check'
    });

    // Em caso de erro, permitir requisição (fail open)
    next();
  }
}
```

**Checklist:**
- [ ] Middleware criado
- [ ] Headers de rate limit adicionados
- [ ] Resposta 429 configurada
- [ ] Fail open implementado

### 🧪 Fase 3.5: Testes (30 min)

#### 3.5.1 Testes Unitários

**Criar:** `tests/unit/rateLimiter.test.ts`

```typescript
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import RedisRateLimiter from '@/services/ai/rateLimiter';

describe('RedisRateLimiter', () => {
  let rateLimiter: RedisRateLimiter;

  beforeAll(() => {
    rateLimiter = new RedisRateLimiter({
      windowMs: 10000, // 10 segundos
      maxRequests: 5
    });
  });

  afterAll(async () => {
    await rateLimiter.disconnect();
  });

  it('should allow requests within limit', async () => {
    const result = await rateLimiter.checkLimit('test-user-1');
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBeGreaterThanOrEqual(0);
  });

  it('should block requests over limit', async () => {
    const userId = 'test-user-2';

    // Fazer 5 requisições
    for (let i = 0; i < 5; i++) {
      await rateLimiter.checkLimit(userId);
    }

    // 6ª requisição deve ser bloqueada
    const result = await rateLimiter.checkLimit(userId);
    expect(result.allowed).toBe(false);
    expect(result.remaining).toBe(0);
  });

  it('should reset limit after window', async () => {
    const userId = 'test-user-3';

    // Fazer 5 requisições
    for (let i = 0; i < 5; i++) {
      await rateLimiter.checkLimit(userId);
    }

    // Resetar manualmente
    await rateLimiter.resetLimit(userId);

    // Deve permitir novamente
    const result = await rateLimiter.checkLimit(userId);
    expect(result.allowed).toBe(true);
  });
});
```

#### 3.5.2 Testar Integração

```bash
# Iniciar Redis
docker-compose up -d redis

# Testar rate limiter
npm run test tests/unit/rateLimiter.test.ts

# Testar aplicação
npm run dev

# Fazer múltiplas requisições AI
# Verificar que rate limit funciona
```

**Checklist:**
- [ ] Testes unitários passam
- [ ] Redis conecta corretamente
- [ ] Rate limit funciona em dev
- [ ] Fallback funciona sem Redis

### 📝 Documentação

**Atualizar:** `README.md`

```markdown
## Rate Limiting

Este projeto usa Redis para rate limiting distribuído.

### Setup Local

1. Instalar Redis:
```bash
docker-compose up -d redis
```

2. Configurar variáveis:
```env
REDIS_URL=redis://localhost:6379
REDIS_ENABLED=true
REDIS_RATE_LIMIT_WINDOW=60000
REDIS_RATE_LIMIT_MAX=60
```

3. Testar:
```bash
npm run dev
```

### Limites

- **AI Queries**: 60 requisições/minuto por usuário
- **API Geral**: 100 requisições/minuto por IP/usuário

### Fallback

Se Redis não estiver disponível, o sistema usa rate limiting em memória automaticamente.
```

**Checklist:**
- [ ] README atualizado
- [ ] Variáveis de ambiente documentadas
- [ ] Limites documentados

---

## ✅ Validação Final

### Checklist Completo

**Tarefa 1: TypeScript**
- [ ] 373 erros de "possibly undefined" corrigidos
- [ ] Build passa sem erros críticos
- [ ] Testes unitários passam
- [ ] Aplicação funciona normalmente

**Tarefa 2: Playwright MCP**
- [ ] Login testado e funcional
- [ ] Módulo de pacientes testado
- [ ] Módulo de agendamentos testado
- [ ] Screenshots capturados
- [ ] Resultados documentados

**Tarefa 3: Redis**
- [ ] Redis instalado e configurado
- [ ] Rate limiter implementado
- [ ] Integrado com AI Orchestrator
- [ ] Middleware criado
- [ ] Testes passam
- [ ] Documentação atualizada

### Comandos de Validação

```bash
# 1. Type check
npm run type-check | grep -E "error TS(18048|2532)" | wc -l
# Esperado: 0

# 2. Build
npm run build
# Esperado: Success

# 3. Testes
npm run test
# Esperado: All passed

# 4. Redis
docker-compose ps
# Esperado: redis running

# 5. Dev server
npm run dev
# Esperado: No errors
```

---

## 📊 Métricas de Sucesso

| Métrica | Antes | Depois | Meta |
|---------|-------|--------|------|
| Erros TS18048/TS2532 | 373 | 0 | ✅ 0 |
| Build status | ⚠️ Warnings | ✅ Pass | ✅ Pass |
| Rate limit | Memory | Redis | ✅ Redis |
| Testes E2E | 43 | 46 | ✅ +3 |
| Docs atualizadas | Sim | Sim | ✅ Sim |

---

## 📄 Entregáveis

### Código
1. ✅ 373 arquivos corrigidos (erros TS)
2. ✅ `services/ai/rateLimiter.ts` (novo)
3. ✅ `middleware/rateLimitMiddleware.ts` (novo)
4. ✅ `tests/unit/rateLimiter.test.ts` (novo)
5. ✅ `docker-compose.yml` (atualizado)

### Documentação
1. ✅ `PLANEJAMENTO_FASE_FINAL.md` (este arquivo)
2. ✅ `TESTES_PLAYWRIGHT_MCP_RESULTADOS.md` (novo)
3. ✅ `README.md` (atualizado - seção Redis)

### Configuração
1. ✅ `.env.local.example` (atualizado)
2. ✅ `package.json` (dependências Redis)

---

## 🎯 Próximos Passos Após Conclusão

1. **Deploy em Staging**
   - Configurar Redis na infraestrutura
   - Testar rate limiting em produção
   - Monitorar métricas

2. **Monitoramento**
   - Configurar alertas Redis
   - Dashboard de rate limiting
   - Logs de performance

3. **Otimizações Futuras**
   - Cache de queries AI no Redis
   - Session storage no Redis
   - WebSocket support com Redis Pub/Sub

---

## 📞 Suporte

**Dúvidas durante implementação?**
- Consulte `TYPESCRIPT_ERRORS_SUMMARY.md` para contexto de erros
- Verifique `✅_SEGURANCA_COMPLETA_28_OUT_2025.md` para padrões
- Execute `npm run type-check` frequentemente

**Redis não funciona?**
- Verificar Docker: `docker-compose ps`
- Logs Redis: `docker-compose logs redis`
- Fallback automático para memória está ativo

---

## 🏁 Conclusão

Este planejamento cobre as 3 tarefas finais de otimização:

✅ **Tarefa 1**: Correção sistemática de 373 erros TS
✅ **Tarefa 2**: Validação com Playwright MCP
✅ **Tarefa 3**: Rate limiting escalável com Redis

**Tempo total estimado**: 6.5 - 8.5 horas
**Status**: 📋 Planejado e pronto para execução
**Prioridade**: Implementar sequencialmente conforme capacidade

🚀 **Boa implementação!**
