# 📋 Guia de Manutenção do Projeto

## 🚀 Scripts Disponíveis

### **Verificação de Saúde do Projeto**
```bash
# Verificação completa de saúde
npm run maintenance

# Verificação + atualização de dependências
npm run maintenance:full

# Apenas atualização de dependências
npm run maintenance:update
```

### **Qualidade de Código**
```bash
# Verificação completa (TypeScript + ESLint)
npm run check

# Correção automática de linting
npm run lint:fix

# Verificação de tipos TypeScript
npm run type-check

# Verificação de linting
npm run lint
```

### **Segurança e Dependências**
```bash
# Auditoria de segurança
npm run security

# Verificar dependências desatualizadas
npm run deps:check

# Atualizar dependências
npm run deps:update
```

## 📅 Cronograma de Manutenção

### **Semanalmente (Segunda-feira)**
- [ ] `npm run maintenance` - Verificação completa
- [ ] `npm run security` - Auditoria de segurança
- [ ] `npm run deps:check` - Verificar dependências

### **Antes de Commits Importantes**
- [ ] `npm run check` - Verificação completa
- [ ] `npm run lint:fix` - Corrigir problemas de linting
- [ ] `npm run security` - Verificar segurança

### **Mensalmente**
- [ ] `npm run maintenance:update` - Atualizar dependências
- [ ] Revisar e corrigir erros de TypeScript
- [ ] Atualizar documentação

## 🔧 Correções Graduais de TypeScript

### **Prioridade Alta**
1. **Arquivos da Agenda** (já corrigidos parcialmente)
   - `pages/AgendaPage.tsx`
   - `components/agenda/AgendaViewSelector.tsx`
   - `components/agenda/ImprovedWeeklyView.tsx`

2. **Tipos Duplicados**
   - `types.ts` - Remover identificadores duplicados
   - `types/medical-records.ts` - Corrigir imports

### **Prioridade Média**
1. **Services**
   - `services/supabase/patientServiceSupabase.ts`
   - `services/supabase/appointmentServiceSupabase.ts`

2. **Components**
   - Componentes de comunicação
   - Componentes de dashboard

### **Prioridade Baixa**
1. **Bibliotecas Externas**
   - Dependências opcionais (nodemailer, web-push, etc.)
   - Tipos de terceiros

## 🛠️ Workflow de Correção

### **1. Identificar Problemas**
```bash
npm run check
```

### **2. Corrigir Linting Automaticamente**
```bash
npm run lint:fix
```

### **3. Corrigir TypeScript Gradualmente**
- Focar em arquivos críticos primeiro
- Corrigir um arquivo por vez
- Testar após cada correção

### **4. Verificar Segurança**
```bash
npm run security
```

### **5. Atualizar Dependências (Opcional)**
```bash
npm run deps:update
```

## 📊 Métricas de Qualidade

### **Status Atual**
- ✅ **0 vulnerabilidades** de segurança
- ⚠️ **Muitos erros** de linting (não críticos)
- ⚠️ **Muitos erros** de TypeScript (não bloqueiam desenvolvimento)

### **Objetivos**
- 🎯 **0 erros** de linting críticos
- 🎯 **0 erros** de TypeScript em arquivos principais
- 🎯 **Dependências** sempre atualizadas

## 🔄 GitHub Actions

O projeto possui workflow automatizado que executa:
- Verificação de segurança
- Linting e type-check
- Build verification
- Relatórios semanais

## 💡 Dicas

### **Para Desenvolvedores**
1. Execute `npm run check` antes de commits importantes
2. Use `npm run lint:fix` regularmente
3. Corrija erros de TypeScript gradualmente
4. Mantenha dependências atualizadas

### **Para Manutenção**
1. Execute `npm run maintenance` semanalmente
2. Monitore relatórios do GitHub Actions
3. Atualize dependências mensalmente
4. Documente mudanças importantes

## 🚨 Problemas Conhecidos

### **Não Críticos (Não Bloqueiam Desenvolvimento)**
- Erros de linting em componentes não utilizados
- Erros de TypeScript em bibliotecas opcionais
- Warnings de React Hooks

### **Críticos (Precisam Correção)**
- Nenhum identificado atualmente ✅

## 📞 Suporte

Para dúvidas sobre manutenção:
1. Consulte este guia
2. Verifique os scripts disponíveis
3. Execute `npm run maintenance` para diagnóstico
4. Consulte a documentação do projeto
