# ⚠️ AÇÕES CRÍTICAS PENDENTES - CHECKLIST

**Última Atualização:** 27 de Outubro de 2025  
**Responsável:** Equipe de Desenvolvimento

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

- [ ] **5. REVISAR E SANITIZAR LOGS CRÍTICOS**
  
  **Prioridade 1 - API Keys (7 ocorrências):**
  - [ ] `services/geminiService.ts:452` - Remove log de API key
  - [ ] `services/clinicalContentService.ts:36` - Sanitizar
  - [ ] `services/customTypesService.ts:208` - Sanitizar
  
  **Prioridade 2 - Dados de Pacientes (34 ocorrências):**
  - [ ] `services/appointmentService.ts:123` - Usar ID ao invés de nome
  - [ ] `services/bodyMapService.ts:34` - Usar ID ao invés de nome
  - [ ] `services/demoDataService.ts:171` - Usar ID ao invés de nome
  - [ ] [Ver lista completa no relatório]
  
  **Prioridade 3 - Emails e Auth (9 ocorrências):**
  - [ ] `services/calendarSyncService.ts:245` - Hash email
  - [ ] `services/digitalSignatureService.ts:329` - Hash email
  - [ ] `services/nfeService.ts:325` - Hash email

- [ ] **6. CRIAR LOGGER ESTRUTURADO**
  ```typescript
  // lib/logger.ts
  export const logger = {
    info: (message: string, data?: SanitizedData) => {...},
    error: (message: string, error?: Error) => {...},
    warn: (message: string, data?: SanitizedData) => {...},
    // Nunca loga PII (Personally Identifiable Information)
  };
  ```

- [ ] **7. ADICIONAR ESLINT RULE**
  ```json
  // .eslintrc.json
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

- [ ] **10. IMPLEMENTAR RATE LIMITING COM REDIS**
  ```typescript
  // services/ai/rateLimiter.ts
  import { Redis } from '@upstash/redis';
  
  export async function checkRateLimit(
    userId: string,
    limit: number,
    windowMs: number
  ): Promise<boolean> {
    // Implementação com Redis
  }
  ```

### Validação de Entrada

- [ ] **11. CRIAR ZOD SCHEMAS**
  ```typescript
  // services/ai/schemas.ts
  import { z } from 'zod';
  
  export const aiQuerySchema = z.object({
    prompt: z.string().min(1).max(4000),
    patientId: z.string().uuid().optional(),
  });
  ```

---

## 📅 CRONOGRAMA

### Hoje (27/10/2025)
- [ ] Revogar API key (15 min)
- [ ] Aplicar RLS em staging (30 min)
- [ ] Testar fluxos (1 hora)

### Amanhã (28/10/2025)
- [ ] Sanitizar 20 console.logs mais críticos (2 horas)
- [ ] Criar logger estruturado (2 horas)

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

