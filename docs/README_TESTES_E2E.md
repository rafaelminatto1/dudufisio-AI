# 🧪 Testes E2E - MoocaFisio

## 🚀 Quick Start

### 1. Validar Ambiente
```bash
npm run test:e2e:validate
```

### 2. Criar Dados de Teste
```bash
npm run test:e2e:seed:clean
```

### 3. Executar Testes
```bash
npm run test:e2e:ui
```

### 4. Ver Relatório
```bash
npm run test:report
```

---

## 📊 Testes Disponíveis

### E2E (34 testes)
- **Agendamento** (11) - `appointment-scheduling.spec.ts`
- **Evolução** (11) - `session-evolution.spec.ts`
- **Exercícios** (12) - `exercise-prescription.spec.ts`

### Integração (22 testes)
- **AI/Gemini** (10) - `ai-integration.spec.ts`
- **WhatsApp** (12) - `whatsapp-integration.spec.ts`

### Segurança (18 testes)
- **Auth & RLS** - `auth-security.spec.ts`

### Performance (15 testes)
- **Web Vitals** - `page-load.spec.ts`

**TOTAL: 89 testes**

---

## 🔧 Scripts Disponíveis

```bash
# Validação
npm run test:e2e:validate

# Seed
npm run test:e2e:seed              # Criar dados
npm run test:e2e:seed:clean        # Limpar + criar

# Execução
npm run test:e2e                   # Modo automático
npm run test:e2e:ui                # Interface visual ⭐
npm run test:e2e:direct            # Headless
npm run test:e2e:headed            # Ver execução
npm run test:e2e:with-seed         # Seed + Testes (interativo)

# Específicos
npx playwright test appointment-scheduling
npx playwright test session-evolution
npx playwright test exercise-prescription

# Relatórios
npm run test:report                # HTML report
```

---

## ✅ Pré-requisitos

- [x] Node.js 18+ instalado
- [x] Servidor dev rodando (`npm run dev`)
- [x] Porta 5173 disponível
- [x] Supabase configurado (.env.local)
- [x] Usuário de teste criado:
  - Email: `admin@dudufisio.com`
  - Senha: `DuduFisio2024!`
- [x] Browsers Playwright instalados (`npx playwright install`)

---

## 📚 Documentação

- **GUIA_ANALISE_TESTES_E2E.md** - Guia completo de execução
- **DATA_TESTIDS_MAPPING.md** - Mapeamento de testids
- **IMPLEMENTACAO_COMPLETA_FINAL.md** - Detalhes técnicos

---

## 🎯 Taxa de Sucesso Esperada

| Ambiente | Meta | Ótimo |
|----------|------|-------|
| Primeira execução | 70-80% | >85% |
| Após ajustes | 85-95% | 100% |
| CI/CD | >95% | 100% |

---

## 💡 Dicas

1. **Use a UI do Playwright** para debugging (`npm run test:e2e:ui`)
2. **Execute o seed antes** para dados consistentes
3. **Valide o ambiente** antes de rodar testes
4. **Veja screenshots** de falhas no relatório HTML

---

**Versão:** 2.0.0  
**Última atualização:** 04/11/2025

