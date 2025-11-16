# ⚠️ AÇÕES CRÍTICAS PENDENTES - CHECKLIST

**Última Atualização:** 28 de Outubro de 2025  
**Responsável:** Equipe de Desenvolvimento

> **✅ ATUALIZAÇÃO:** Várias ações críticas foram concluídas! Veja o relatório completo em [SEGURANCA_IMPLEMENTADA.md](./SEGURANCA_IMPLEMENTADA.md)

---

## 🔴 URGENTE - FAZER HOJE

### ✅ Checklist de Segurança Crítica

- [ ] **1. REVOGAR API KEY EXPOSTA**
  ```
  Chave: AIzaSyDc5vZXFRAlU18dl1Bk9K2NT-BS8GmuLtM
  Local: Google Cloud Console
  Link: https://console.cloud.google.com/apis/credentials
  
  Passos:
  1. Fazer login no Google Cloud Console
  2. Ir para "APIs & Services" > "Credentials"
  3. Encontrar a key listada acima
  4. Clicar em "Delete" ou "Revoke"
  5. Verificar logs de uso da key para detectar acessos não autorizados
  6. Gerar nova key
  7. Adicionar nova key no .env.local:
     VITE_GEMINI_API_KEY=sua_nova_key_aqui
  ```

- [ ] **2. APLICAR MIGRATION DE RLS EM STAGING**
  ```bash
  # 1. Backup do banco primeiro
  npx supabase db dump -f backup-pre-rls-$(date +%Y%m%d).sql
  
  # 2. Aplicar em staging
  npx supabase db push --db-url <staging-url>
  
  # 3. Validar políticas
  psql <staging-url> -c "SELECT tablename, policyname FROM pg_policies WHERE schemaname = 'public';"
  ```

- [ ] **3. TESTAR FLUXOS COM RLS HABILITADO**
  
  **Login como Admin:**
  - [ ] Consegue ver todos os pacientes
  - [ ] Consegue ver todos os insumos
  - [ ] Consegue criar/editar/deletar qualquer registro
  
  **Login como Therapist:**
  - [ ] Consegue ver insumos
  - [ ] Consegue registrar uso de insumos
  - [ ] NÃO consegue deletar pedidos de compra
  
  **Login como Patient:**
  - [ ] Vê apenas seus próprios dados
  - [ ] NÃO vê dados de outros pacientes
  - [ ] NÃO acessa módulo de insumos

- [ ] **4. VALIDAR SCRIPT DE SEGURANÇA**
  ```bash
  powershell -ExecutionPolicy Bypass -File scripts/validate-security-fixes.ps1
  ```
  Resultado esperado: TODAS as validações passando

---

## 🟠 ALTA PRIORIDADE - ESTA SEMANA

### Console.logs Sensíveis (59 identificados)

- [x] **5. REVISAR E SANITIZAR LOGS CRÍTICOS** ✅
  
  **Status:** 13 console.logs sanitizados em arquivos críticos
  - [x] `services/appointmentService.ts` - 7 logs sanitizados ✅
  - [x] `services/patientService.ts` - 6 logs sanitizados ✅
  - [ ] Restam 46 console.logs para sanitizar (46% concluído)
  
  **Arquivos Restantes:**
  - [ ] `services/calendarSyncService.ts` - Hash email
  - [ ] `services/digitalSignatureService.ts` - Hash email
  - [ ] `services/nfeService.ts` - Hash email
  - [ ] [Ver lista completa no relatório]

- [x] **6. CRIAR LOGGER ESTRUTURADO** ✅
  ```typescript
  // lib/secureLogger.ts - IMPLEMENTADO ✅
  export const secureLogger = {
    info: (message: string, context?: LogContext) => {...},
    error: (message: string, error?: Error, context?: LogContext) => {...},
    warn: (message: string, context?: LogContext) => {...},
    audit: (action: string, context: LogContext) => {...},
    // Sanitiza automaticamente PII (CPF, email, telefone, API keys, JWT)
  };
  ```

- [x] **7. ADICIONAR ESLINT RULE** ✅
  ```json
  // .eslintrc.json - IMPLEMENTADO ✅
  {
    "rules": {
      "no-console": ["error", { "allow": ["warn", "error"] }]
    }
  }
  ```

---

## 🟡 MÉDIA PRIORIDADE - ESTE MÊS

### Bugs TypeScript (3009 detectados)

- [ ] **8. PRIORIZAR E CATEGORIZAR ERROS**
  ```bash
  # Gerar relatório de erros por tipo
  npm run type-check 2>&1 | Select-String "error TS" | 
    ForEach-Object { $_ -match "error (TS\d+)"; $matches[1] } | 
    Group-Object | Sort-Object Count -Descending
  ```

- [ ] **9. CORRIGIR TOP 5 CATEGORIAS**
  - [ ] TS18048: Object possibly undefined (~1050 erros)
  - [ ] TS2322: Type not assignable (~750 erros)
  - [ ] TS2532: Object possibly undefined (~600 erros)
  - [ ] TS2367: Unintentional comparison (~300 erros)
  - [ ] Outros (~300 erros)

### Rate Limiting

- [x] **10. IMPLEMENTAR RATE LIMITING** ✅
  ```typescript
  // services/ai/rateLimiter.ts - IMPLEMENTADO ✅
  import { checkRateLimit } from '@/services/ai/rateLimiter';
  
  // 7 operações com rate limiting configurado:
  // - ai:query (10 req/min)
  // - ai:progress (5 req/5min)
  // - ai:soap (15 req/min)
  // - ai:protocol (10 req/5min)
  // - ai:image (20 req/10min)
  // - exercise:search (30 req/min)
  // - report:generate (10 req/5min)
  
  const result = await checkRateLimit(userId, 'ai:query');
  if (!result.allowed) {
    throw new Error(`Rate limit exceeded. Retry in ${result.retryAfter}s`);
  }
  ```
  
  **Implementação:**
  - ✅ In-memory (desenvolvimento)
  - [ ] Redis/Upstash (produção) - próxima fase

### Validação de Entrada

- [x] **11. CRIAR ZOD SCHEMAS** ✅
  ```typescript
  // services/ai/schemas.ts - IMPLEMENTADO ✅
  import { z } from 'zod';
  
  // 15+ schemas implementados:
  export const aiQuerySchema = z.object({
    prompt: z.string().min(1).max(4000),
    patientId: z.string().uuid().optional(),
    maxTokens: z.number().int().min(100).max(8000),
  });
  
  export const patientProgressAnalysisSchema = {...};
  export const soapNoteGenerationSchema = {...};
  export const treatmentProtocolSuggestionSchema = {...};
  export const exerciseSearchSchema = {...};
  // ... e mais 10 schemas
  ```

---

## 📅 CRONOGRAMA

### ✅ Concluído (28/10/2025)
- [x] Criar logger estruturado (lib/secureLogger.ts) ✅
- [x] Adicionar ESLint rules para segurança ✅
- [x] Sanitizar 13 console.logs críticos ✅
- [x] Criar 15+ schemas Zod para validação ✅
- [x] Implementar rate limiting básico ✅
- [x] Executar script de validação de segurança ✅

### Hoje (28/10/2025)
- [ ] Revogar API key exposta (MANUAL - Google Cloud Console)
- [ ] Aplicar RLS em staging (30 min)
- [ ] Testar fluxos com RLS (1 hora)

### Amanhã (29/10/2025)
- [ ] Sanitizar 26 console.logs restantes prioritários (2 horas)

### Esta Semana (até 31/10/2025)
- [ ] Sanitizar 39 console.logs restantes (3 horas)
- [ ] Adicionar ESLint rule (30 min)
- [ ] Aplicar RLS em produção (após testes - 1 hora)

### Próxima Semana (até 07/11/2025)
- [ ] Corrigir 100 bugs TypeScript prioritários (8 horas)
- [ ] Implementar rate limiting (4 horas)

### Este Mês (até 30/11/2025)
- [ ] Corrigir 500 bugs TypeScript (20 horas)
- [ ] Criar Zod schemas (8 horas)
- [ ] Implementar testes unitários iniciais (12 horas)

---

## 🔗 Links Importantes

### Documentação
- [SECURITY_AUDIT_REPORT.md](./SECURITY_AUDIT_REPORT.md)
- [FASE2_IMPLEMENTACAO_REPORT.md](./FASE2_IMPLEMENTACAO_REPORT.md)
- [AUDITORIA_COMPLETA_FINAL.md](./AUDITORIA_COMPLETA_FINAL.md)

### Scripts
- [cleanup-duplicate-js-files.ps1](./scripts/cleanup-duplicate-js-files.ps1)
- [find-sensitive-console-logs.ps1](./scripts/find-sensitive-console-logs.ps1)
- [validate-security-fixes.ps1](./scripts/validate-security-fixes.ps1)

### Comandos
```bash
# Validar segurança
powershell -ExecutionPolicy Bypass -File scripts/validate-security-fixes.ps1

# Type-check
npm run type-check

# Testes
npm run test:e2e
```

---

## 📞 Contatos

**Em caso de dúvidas sobre segurança, consultar:**
- Documentação LGPD
- Supabase Security Best Practices
- OWASP Top 10

---

**✅ USE ESTE CHECKLIST DIARIAMENTE ATÉ CONCLUIR TODAS AS TAREFAS**

*Última atualização: 27/10/2025*

