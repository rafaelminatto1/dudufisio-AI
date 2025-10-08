# ⚡ COMANDOS RÁPIDOS - GUIA DE REFERÊNCIA

**Copie e cole estes comandos para usar o sistema rapidamente!**

---

## 🚀 INICIAR O SISTEMA

```bash
# Iniciar servidor de desenvolvimento
npm run dev

# Ou com porta específica
npm run dev -- --port 3000
```

**Acesse:** http://localhost:5173

---

## 🗺️ URLS DAS NOVAS PÁGINAS

### Dashboards Gerais (sem parâmetros)
```
http://localhost:5173/population-health
http://localhost:5173/quality-assurance
```

### Páginas Específicas de Paciente
```
# Substitua PATIENT_ID pelo UUID do paciente

http://localhost:5173/risk-stratification/PATIENT_ID
http://localhost:5173/sports-rehab/PATIENT_ID
http://localhost:5173/family-portal/PATIENT_ID
http://localhost:5173/predictive-analytics/PATIENT_ID
```

---

## 🔍 VERIFICAR IMPLEMENTAÇÃO

### Verificar Tabelas no Supabase
```sql
-- Copie e cole no SQL Editor do Supabase

-- Tabelas de Risk Stratification
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name LIKE 'risk_%'
ORDER BY table_name;

-- Tabelas de Sports Rehab
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND (table_name LIKE '%athlete%' OR table_name LIKE '%sport%')
ORDER BY table_name;

-- Total de tabelas criadas
SELECT COUNT(*) as total 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND (
    table_name LIKE 'risk_%' 
    OR table_name LIKE '%athlete%' 
    OR table_name LIKE '%sport%'
    OR table_name = 'family_members'
  );
```

### Verificar Arquivos Localmente
```bash
# Verificar serviços
ls -la services/clinical/riskStratificationServiceSupabase.ts
ls -la services/sports/sportsRehabServiceSupabase.ts
ls -la services/analytics/populationHealthServiceSupabase.ts
ls -la services/family/familyPortalServiceSupabase.ts
ls -la services/ai/predictiveAnalyticsServiceSupabase.ts
ls -la services/quality/qualityAssuranceServiceSupabase.ts

# Verificar páginas
ls -la pages/*Page.tsx | grep -E "Risk|Sports|Population|Family|Predictive|Quality"

# Verificar componentes
ls -la components/sports/
ls -la components/analytics/
ls -la components/quality/
ls -la components/ai/
```

---

## 🧪 TESTAR FUNCIONALIDADES

### Teste 1: Console do Navegador
```javascript
// Abra o console (F12) e teste:

// Importar serviço (se estiver em contexto React)
import { riskStratificationServiceSupabase } from './services/clinical/riskStratificationServiceSupabase';

// Buscar estatísticas
const stats = await riskStratificationServiceSupabase.getRiskStatistics(
  new Date('2025-01-01'),
  new Date()
);
console.log('Estatísticas:', stats);
```

### Teste 2: Via Componente React
```typescript
// Adicione em qualquer página:

import { useRiskAssessment } from '@/hooks/useRiskAssessment';

function TestComponent() {
  const { profile, loading } = useRiskAssessment({ 
    patientId: 'algum-uuid', 
    autoLoad: true 
  });

  useEffect(() => {
    console.log('Profile carregado:', profile);
  }, [profile]);

  return <div>{loading ? 'Carregando...' : 'Dados carregados!'}</div>;
}
```

---

## 📝 NAVEGAÇÃO PROGRAMÁTICA

### Copie e cole em seus componentes:

```typescript
import { useNavigate } from 'react-router-dom';

function MyComponent() {
  const navigate = useNavigate();

  // Ir para Risk Stratification
  const goToRisk = (patientId: string) => {
    navigate(`/risk-stratification/${patientId}`);
  };

  // Ir para Sports Rehab
  const goToSports = (patientId: string) => {
    navigate(`/sports-rehab/${patientId}`);
  };

  // Ir para Population Health
  const goToPopulation = () => {
    navigate('/population-health');
  };

  // Ir para Family Portal
  const goToFamily = (patientId: string) => {
    navigate(`/family-portal/${patientId}`);
  };

  // Ir para Predictive Analytics
  const goToPredictive = (patientId: string) => {
    navigate(`/predictive-analytics/${patientId}`);
  };

  // Ir para Quality Assurance
  const goToQuality = () => {
    navigate('/quality-assurance');
  };

  return (
    <div>
      <button onClick={() => goToRisk('patient-id')}>Ver Riscos</button>
      <button onClick={() => goToSports('patient-id')}>Sports Rehab</button>
      <button onClick={goToPopulation}>Population Health</button>
    </div>
  );
}
```

---

## 🔧 USAR OS SERVIÇOS

### Risk Stratification
```typescript
import { riskStratificationServiceSupabase as riskService } from '@/services/clinical/riskStratificationServiceSupabase';

// Buscar perfil
const profile = await riskService.getPatientRiskProfile('patient-uuid');

// Buscar alertas
const alerts = await riskService.getActiveAlerts();

// Buscar estatísticas
const stats = await riskService.getRiskStatistics(startDate, endDate);
```

### Sports Rehabilitation
```typescript
import { sportsRehabServiceSupabase as sportsService } from '@/services/sports/sportsRehabServiceSupabase';

// Buscar perfil de atleta
const athlete = await sportsService.getAthleteProfile('patient-uuid');

// Buscar métricas
const metrics = await sportsService.getPerformanceMetrics('athlete-uuid');

// Buscar cargas
const loads = await sportsService.getLoadMonitoring('athlete-uuid', 8);
```

### Population Health
```typescript
import { populationHealthServiceSupabase as popService } from '@/services/analytics/populationHealthServiceSupabase';

// Buscar demografia
const demographics = await popService.getPopulationDemographics();

// Gerar insights
const insights = await popService.generatePopulationInsights();
```

---

## 🗃️ QUERIES ÚTEIS DO SUPABASE

### Copie e cole no SQL Editor:

#### Ver todos os ENUMs criados
```sql
SELECT typname, string_agg(enumlabel, ', ' ORDER BY enumsortorder) as values
FROM pg_type
JOIN pg_enum ON pg_type.oid = pg_enum.enumtypid
WHERE typname IN ('risk_type', 'risk_level', 'sport_type', 'competition_level', 'rehab_phase', 'clearance_status')
GROUP BY typname;
```

#### Ver todas as Foreign Keys
```sql
SELECT
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_name LIKE 'risk_%'
ORDER BY tc.table_name;
```

#### Ver todos os Índices
```sql
SELECT
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
  AND (tablename LIKE 'risk_%' OR tablename LIKE '%athlete%')
ORDER BY tablename, indexname;
```

---

## 🐛 DEBUGGING

### Verificar erros no console
```javascript
// No console do navegador (F12):

// Ver erros
console.log(window.__APP_ERROR__);

// Testar Supabase
const { data, error } = await supabase.from('patients').select('count');
console.log('Supabase test:', { data, error });
```

### Logs úteis
```typescript
// Adicione em seus componentes para debug:

useEffect(() => {
  console.log('📊 State atual:', {
    loading,
    profile,
    assessments,
    alerts,
  });
}, [loading, profile, assessments, alerts]);
```

---

## 📦 BUILD E DEPLOY

### Build para Produção
```bash
# Build
npm run build

# Preview do build
npm run preview

# Build size
du -sh dist/
```

### Deploy (Vercel)
```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy
vercel

# Deploy em produção
vercel --prod
```

---

## 🔄 GIT COMMANDS

### Ver histórico de commits
```bash
git log --oneline --graph --all -20
```

### Ver último commit
```bash
git show HEAD
```

### Ver arquivos modificados
```bash
git status
git diff --stat
```

---

## 📊 ESTATÍSTICAS DO PROJETO

### Contar linhas de código
```bash
# Serviços
find services -name "*Supabase.ts" -exec wc -l {} + | tail -1

# Páginas
find pages -name "*Page.tsx" | grep -E "Risk|Sports|Population|Family|Predictive|Quality" | xargs wc -l | tail -1

# Componentes
find components -name "*.tsx" -path "*/sports/*" -o -path "*/analytics/*" -o -path "*/quality/*" -o -path "*/ai/*" | xargs wc -l | tail -1
```

### Ver arquivos criados hoje
```bash
git log --since="1 day ago" --name-only --pretty=format: | sort | uniq
```

---

## 🎯 COMANDOS DE PRODUTIVIDADE

### Abrir arquivos importantes
```bash
# VS Code
code services/clinical/riskStratificationServiceSupabase.ts
code pages/RiskStratificationPage.tsx
code 🌟_SESSAO_FINALIZADA_COM_SUCESSO_TOTAL.md

# Ou navegar
cd services/clinical/
cd pages/
cd components/sports/
```

### Procurar por padrões
```bash
# Encontrar todos os métodos async
grep -r "async " services/**/*Supabase.ts

# Encontrar todas as rotas
grep -r "Route path" pages/CompleteDashboard.tsx

# Encontrar imports de serviços
grep -r "ServiceSupabase" pages/
```

---

## ✅ CHECKLIST RÁPIDO

Antes de usar, verifique:

```
✅ npm install executado
✅ .env.local configurado
✅ Supabase conectado
✅ Migrations aplicadas
✅ npm run dev funcionando
✅ Páginas carregando sem erro
```

---

## 🆘 COMANDOS DE EMERGÊNCIA

### Se algo der errado:

```bash
# Limpar cache
rm -rf node_modules
rm -rf dist
rm -rf .vite

# Reinstalar
npm install

# Rebuild
npm run build
```

### Reverter para commit anterior (se necessário)
```bash
# Ver últimos commits
git log --oneline -10

# Reverter para commit específico (NÃO RECOMENDADO - use apenas se realmente necessário)
# git reset --hard COMMIT_HASH
```

---

## 💡 DICAS RÁPIDAS

### Performance
```typescript
// Use React.memo para componentes pesados
export const HeavyComponent = React.memo(({ data }) => {
  // ... código
});

// Use useMemo para cálculos pesados
const expensiveValue = useMemo(() => {
  return calculateSomething(data);
}, [data]);
```

### Error Handling
```typescript
// Sempre use try-catch com toast
try {
  await someService.someMethod();
  toast.success('Sucesso!');
} catch (error) {
  console.error('Erro:', error);
  toast.error('Ocorreu um erro');
}
```

---

## 📚 DOCUMENTAÇÃO RÁPIDA

### Leitura Recomendada (ordem)
```
1. 🎊_SUMARIO_VISUAL_FINAL.md (5 min)
2. 🌟_SESSAO_FINALIZADA_COM_SUCESSO_TOTAL.md (10 min)
3. README_NOVAS_FUNCIONALIDADES.md (15 min)
4. 💡_EXEMPLOS_PRATICOS_USO.md (20 min)
5. 🎯_GUIA_COMPLETO_INTEGRACAO_FRONTEND.md (30 min)
```

### Referências Rápidas
```
Tipos:        types/*.ts
Serviços:     services/**/*Supabase.ts
Páginas:      pages/*Page.tsx
Componentes:  components/**/
Hooks:        hooks/use*.ts
Migrations:   supabase/migrations/*.sql
```

---

## 🎯 PRÓXIMOS PASSOS

### Agora mesmo:
```bash
1. npm run dev
2. Abrir http://localhost:5173/population-health
3. Explorar as funcionalidades
```

### Hoje:
```
4. Testar cada módulo
5. Ver dados sendo salvos no Supabase
6. Customizar conforme necessário
```

### Esta semana:
```
7. Adicionar dados reais
8. Configurar para produção
9. Deploy em staging
10. Testes com usuários reais
```

---

## ✨ ATALHOS DO TECLADO (Sugeridos)

### Adicione no seu componente:
```typescript
useEffect(() => {
  const handleKeyPress = (e: KeyboardEvent) => {
    // Ctrl+K: Abrir busca rápida
    if (e.ctrlKey && e.key === 'k') {
      e.preventDefault();
      // Abrir modal de busca
    }
    
    // Ctrl+R: Atualizar dados
    if (e.ctrlKey && e.key === 'r') {
      e.preventDefault();
      loadData();
    }
  };

  window.addEventListener('keydown', handleKeyPress);
  return () => window.removeEventListener('keydown', handleKeyPress);
}, []);
```

---

## 🎊 COMANDOS DE CELEBRAÇÃO

### Verificar o que foi feito
```bash
# Ver commits de hoje
git log --since="1 day ago" --oneline

# Ver estatísticas
git log --since="1 day ago" --stat

# Ver diferenças
git diff HEAD~12 HEAD --stat
```

### Compartilhar
```bash
# Gerar link do repositório
echo "https://github.com/rafaelminatto1/dudufisio-AI"

# Ver último commit
git log -1 --pretty=format:"%h - %s (%an, %ar)"
```

---

## 🏁 CONCLUSÃO

```
╔═══════════════════════════════════════════════════╗
║                                                   ║
║  ⚡ TODOS OS COMANDOS ESTÃO AQUI! ⚡              ║
║                                                   ║
║  Copie, cole e use! Tudo está documentado        ║
║  e pronto para funcionar.                        ║
║                                                   ║
║  🚀 BOA SORTE E BOM DESENVOLVIMENTO! 🚀          ║
║                                                   ║
╚═══════════════════════════════════════════════════╝
```

**📅 Data:** 08/10/2025  
**✅ Status:** COMPLETO  
**🎯 Próximo:** Explore e divirta-se! 🎉

