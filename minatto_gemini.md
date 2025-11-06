# Plano de Ação Estratégico - dudufisio-AI

Este documento detalha o plano de ação para otimizar e evoluir o projeto, com base na análise técnica e de mercado.

---

## 🗺️ Roadmap de Implementação

O roadmap está dividido em fases para priorizar o impacto e organizar o desenvolvimento.

### **Fase 1: Fundação e Dívida Técnica (Quick Wins)**
*(Foco: Melhorar a manutenibilidade, consistência e organização do projeto.)*

- **Sprint 1:** Organização do Projeto e Padronização de Scripts.
- **Sprint 2:** Consolidação do Schema do Banco de Dados.
- **Sprint 3:** Conclusão da Migração para TypeScript.

### **Fase 2: Otimização de Performance e UX**
*(Foco: Reduzir custos, melhorar a velocidade da aplicação e simplificar a experiência do usuário.)*

- **Sprint 4:** Otimização de Performance (Vercel Edge Functions & Bundles).
- **Sprint 5:** Implementação do Dashboard Unificado.

### **Fase 3: Inteligência e Diferenciação (IA)**
*(Foco: Implementar as funcionalidades de IA que criarão um diferencial competitivo claro.)*

- **Sprint 6:** Desenvolvimento do Modelo Preditivo de Churn.
- **Sprint 7:** Implementação do Gerador de Planos de Tratamento com IA.
- **Sprint 8:** Criação do Módulo de Business Intelligence (BI).

### **Fase 4: Visão de Futuro**
*(Foco: Explorar tecnologias de ponta para solidificar a liderança no mercado.)*

- **Sprint 9+:** Pesquisa e Desenvolvimento da Análise de Movimento com Visão Computacional.

---

## ✅ Plano de Ação Detalhado (To-Do List)

### **1. Estrutura de Dados e CRUD**
- [x] **Tarefa 1.1:** Consolidar o `prisma/schema.prisma` como fonte única da verdade para o esquema.
  - [x] Sub-tarefa: Executar `npx prisma db pull` para popular o esquema.
  - [x] Sub-tarefa: Refatorar `appointmentService.ts` para usar Prisma Client e atualizar seus testes unitários.
- [ ] **Tarefa 1.2:** Substituir o campo `JSONB` de exercícios por uma tabela de junção `protocol_exercises`.
  - [ ] Sub-tarefa: Criar a nova tabela no banco de dados. (Bloqueado: Problemas de conectividade com o banco de dados Supabase)
  - [ ] Sub-tarefa: Migrar os dados existentes do JSONB para a nova tabela.
  - [ ] Sub-tarefa: Refatorar a funcionalidade de prescrição de exercícios para usar a nova estrutura.
- [ ] **Tarefa 1.3:** Padronizar a nomenclatura em todo o banco de dados (colunas e enums).

### **2. Performance e Economia**
- [ ] **Tarefa 2.1:** Migrar webhooks (ex: `api/webhooks/whatsapp.ts`) para Vercel Edge Functions.
- [ ] **Tarefa 2.2:** Configurar e monitorar o painel de análise de performance de queries da Supabase.
- [ ] **Tarefa 2.3:** Implementar um `bundle-analyzer` para identificar e otimizar dependências duplicadas nos microfrontends.

### **3. Qualidade de Código e Dívida Técnica**
- [x] **Tarefa 3.1:** Mover todos os arquivos `.md` do diretório raiz para uma nova pasta `docs/`.
- [x] **Tarefa 3.2:** Refatorar scripts do `package.json` para serem cross-platform (remover dependências de PowerShell).
  - **Nota:** O script `bundle:size` foi mantido com comandos Unix-like (`du`, `sort`, `head`) por ser um script de conveniência para desenvolvedores e não crítico para o build.
- [ ] **Tarefa 3.3:** Finalizar a migração de todos os arquivos `.js` e `.jsx` para `.ts` e `.tsx`.

### **4. Melhorias de UX/UI**
- [ ] **Tarefa 4.1:** Desenvolver o novo Dashboard Principal Unificado.
  - [ ] Sub-tarefa: Design (wireframe/mockup) do dashboard com sistema de widgets.
  - [ ] Sub-tarefa: Desenvolver os componentes de widget (Agenda, Finanças, etc.).
  - [ ] Sub-tarefa: Implementar a lógica de customização e salvamento do layout do usuário.

### **5. Novas Funcionalidades (IA e Diferenciação)**
- [ ] **Tarefa 5.1:** Desenvolver o modelo de análise preditiva de churn de pacientes.
- [ ] **Tarefa 5.2:** Desenvolver o gerador de planos de tratamento com IA.
- [ ] **Tarefa 5.3:** Criar o módulo de Business Intelligence (BI) avançado para gestores.
- [ ] **Tarefa 5.4 (Futuro):** Iniciar P&D para a funcionalidade de análise de movimento com visão computacional.
