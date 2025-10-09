# 📅 PLANEJAMENTO DETALHADO - PRÓXIMO CICLO DE DESENVOLVIMENTO
## DuduFisio-AI - Outubro/Novembro 2025

**Data de Criação:** 08 de Outubro de 2025  
**Versão:** 1.0  
**Status:** 🟢 ATIVO

---

## 📊 VISÃO GERAL

### Contexto Atual
✅ **6 novos módulos implementados:**
- Sistema de Estratificação de Risco
- Reabilitação Esportiva  
- Dashboard de Saúde Populacional
- Portal da Família
- Análise Preditiva com IA
- Garantia de Qualidade e Compliance

✅ **Base técnica sólida:**
- 29 tabelas no Supabase
- 6 serviços completos (53 métodos)
- 6 páginas frontend
- 6.000+ linhas de código
- Type-safe 100%

### Objetivo do Próximo Ciclo
Consolidar, testar e expandir as funcionalidades implementadas, preparando o sistema para produção.

---

## 🎯 FASE 1: CURTO PRAZO (Esta Semana - 7 dias)
**Objetivo:** Validar e estabilizar o que foi desenvolvido  
**Prioridade:** 🔴 CRÍTICA  
**Esforço Total:** 32 horas

### 📝 TODO 1.1: Testar Cada Funcionalidade
**Duração:** 2 dias (16 horas)  
**Responsável:** Dev + QA  
**Prioridade:** CRÍTICA

#### Checklist de Testes por Módulo

##### 1.1.1 Sistema de Estratificação de Risco
**Rota:** `/risk-stratification/:patientId`

```bash
# Passo a passo:
1. npm run dev
2. Acessar: http://localhost:5173/risk-stratification/[UUID_PACIENTE]
```

**Casos de Teste:**
- [ ] ✅ Página carrega sem erros
- [ ] ✅ Lista de avaliações anteriores aparece
- [ ] ✅ Criar nova avaliação funciona
- [ ] ✅ Calcular score automático funciona
- [ ] ✅ Gráficos de tendência renderizam
- [ ] ✅ Alertas são exibidos corretamente
- [ ] ✅ Salvar no Supabase funciona
- [ ] ✅ Editar avaliação existente funciona
- [ ] ✅ Deletar avaliação funciona
- [ ] ✅ Responsivo em mobile

**Comandos de Teste:**
```typescript
// services/clinical/riskStratificationServiceSupabase.ts
// Testar cada método:
await riskStratificationService.getAssessments(patientId);
await riskStratificationService.createAssessment(data);
await riskStratificationService.updateAssessment(id, data);
await riskStratificationService.deleteAssessment(id);
```

**Critérios de Sucesso:**
- 10/10 casos de teste passando
- Zero erros no console
- Tempo de resposta < 2s

---

##### 1.1.2 Reabilitação Esportiva
**Rota:** `/sports-rehab/:patientId`

**Casos de Teste:**
- [ ] ✅ Criar perfil de atleta
- [ ] ✅ Registrar lesão
- [ ] ✅ Adicionar teste funcional
- [ ] ✅ Calcular ACWR (carga de treino)
- [ ] ✅ Ver progressão por fases
- [ ] ✅ Dashboard de métricas
- [ ] ✅ Critérios de retorno ao esporte
- [ ] ✅ Histórico de lesões
- [ ] ✅ Gráficos de desempenho
- [ ] ✅ Export de relatórios

**Script de Teste Automatizado:**
```javascript
// tests/e2e/sports-rehab.spec.ts
describe('Sports Rehabilitation Module', () => {
  it('should create athlete profile', async () => {
    // implementar
  });
  
  it('should track injury recovery', async () => {
    // implementar
  });
});
```

---

##### 1.1.3 Dashboard de Saúde Populacional
**Rota:** `/population-health`

**Casos de Teste:**
- [ ] ✅ Página carrega dados agregados
- [ ] ✅ Filtros por período funcionam
- [ ] ✅ Gráficos demográficos renderizam
- [ ] ✅ Análise de tendências precisa
- [ ] ✅ Insights da IA aparecem
- [ ] ✅ Export para PDF/Excel
- [ ] ✅ Performance com 1000+ registros
- [ ] ✅ Refresh automático de dados
- [ ] ✅ Drill-down em gráficos
- [ ] ✅ Comparação de períodos

---

##### 1.1.4 Portal da Família
**Rota:** `/family-portal/:patientId`

**Casos de Teste:**
- [ ] ✅ Adicionar membro da família
- [ ] ✅ Configurar permissões
- [ ] ✅ Visualizar relatórios (read-only)
- [ ] ✅ Enviar mensagem para terapeuta
- [ ] ✅ Histórico de acesso (LGPD)
- [ ] ✅ Revogar acesso
- [ ] ✅ Consentimento do paciente
- [ ] ✅ Notificações para família
- [ ] ✅ Multi-idioma (PT/EN/ES)
- [ ] ✅ Acessibilidade (WCAG)

---

##### 1.1.5 Análise Preditiva com IA
**Rota:** `/predictive-analytics/:patientId`

**Casos de Teste:**
- [ ] ✅ Gerar predição de outcome
- [ ] ✅ Análise de fatores de risco
- [ ] ✅ Cenários alternativos
- [ ] ✅ Nível de confiança exibido
- [ ] ✅ Recomendações da IA
- [ ] ✅ Validação com dados reais
- [ ] ✅ Histórico de predições
- [ ] ✅ Acurácia das predições
- [ ] ✅ Explicabilidade da IA
- [ ] ✅ Integração com Gemini API

**Testar com API Key:**
```bash
# .env.local
GEMINI_API_KEY=sua_chave_aqui
```

---

##### 1.1.6 Garantia de Qualidade
**Rota:** `/quality-assurance`

**Casos de Teste:**
- [ ] ✅ Dashboard de compliance
- [ ] ✅ Métricas de qualidade
- [ ] ✅ Audit trail completo
- [ ] ✅ Relatórios executivos
- [ ] ✅ Alertas de não conformidade
- [ ] ✅ Verificação COFFITO
- [ ] ✅ Verificação LGPD
- [ ] ✅ Export de relatórios
- [ ] ✅ Drill-down em métricas
- [ ] ✅ Filtros avançados

---

### 📝 TODO 1.2: Adicionar Dados de Exemplo
**Duração:** 1 dia (8 horas)  
**Responsável:** Dev  
**Prioridade:** ALTA

#### Script de Seed Data

```typescript
// scripts/seed-new-modules.ts
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY! // service key para bypass RLS
);

async function seedData() {
  console.log('🌱 Iniciando seed de dados...');
  
  // 1. Criar pacientes de exemplo
  const patients = await createExamplePatients();
  
  // 2. Avaliações de risco
  await createRiskAssessments(patients);
  
  // 3. Perfis de atletas
  await createAthleteProfiles(patients);
  
  // 4. Membros da família
  await createFamilyMembers(patients);
  
  // 5. Predições de IA
  await createPredictions(patients);
  
  // 6. Dados de compliance
  await createComplianceData();
  
  console.log('✅ Seed completo!');
}

async function createExamplePatients() {
  const patients = [
    {
      name: 'João Silva',
      cpf: '123.456.789-00',
      birth_date: '1985-05-15',
      email: 'joao.silva@example.com',
      phone: '(11) 98765-4321'
    },
    {
      name: 'Maria Santos',
      cpf: '987.654.321-00',
      birth_date: '1992-08-22',
      email: 'maria.santos@example.com',
      phone: '(11) 91234-5678'
    },
    {
      name: 'Carlos Oliveira',
      cpf: '456.789.123-00',
      birth_date: '1978-03-10',
      email: 'carlos.oliveira@example.com',
      phone: '(11) 99876-5432'
    }
  ];
  
  const { data, error } = await supabase
    .from('patients')
    .insert(patients)
    .select();
    
  if (error) throw error;
  return data;
}

async function createRiskAssessments(patients: any[]) {
  const assessments = patients.map(patient => ({
    patient_id: patient.id,
    assessment_type: 'cardiovascular',
    overall_score: Math.floor(Math.random() * 100),
    risk_level: ['low', 'moderate', 'high'][Math.floor(Math.random() * 3)],
    assessed_by: 'system',
    assessment_date: new Date().toISOString()
  }));
  
  await supabase.from('risk_assessments').insert(assessments);
}

async function createAthleteProfiles(patients: any[]) {
  const profiles = patients.slice(0, 2).map(patient => ({
    patient_id: patient.id,
    sport: ['Futebol', 'Vôlei'][Math.floor(Math.random() * 2)],
    position: 'Atacante',
    competition_level: 'semi_professional',
    training_frequency: 5,
    goals: 'Retornar ao esporte após lesão',
    is_active: true
  }));
  
  await supabase.from('athlete_profiles').insert(profiles);
}

async function createFamilyMembers(patients: any[]) {
  const members = [
    {
      patient_id: patients[0].id,
      name: 'Ana Silva',
      relationship: 'spouse',
      email: 'ana.silva@example.com',
      phone: '(11) 98765-1111',
      has_view_permission: true,
      has_message_permission: true,
      consent_given: true
    }
  ];
  
  await supabase.from('family_members').insert(members);
}

async function createPredictions(patients: any[]) {
  const predictions = patients.map(patient => ({
    patient_id: patient.id,
    prediction_type: 'treatment_outcome',
    outcome_prediction: 'positive',
    confidence_score: 0.85,
    factors_analyzed: ['age', 'condition_severity', 'adherence'],
    recommendations: ['Manter frequência', 'Adicionar exercícios'],
    created_by: 'ai_system'
  }));
  
  await supabase.from('ai_predictions').insert(predictions);
}

async function createComplianceData() {
  const data = {
    audit_date: new Date().toISOString(),
    compliance_score: 95,
    areas_checked: ['LGPD', 'COFFITO', 'Documentation'],
    issues_found: 2,
    status: 'compliant'
  };
  
  await supabase.from('compliance_audits').insert(data);
}

// Executar
seedData().catch(console.error);
```

**Como Executar:**
```bash
# Instalar ts-node se necessário
npm install -D ts-node

# Executar script
npx ts-node scripts/seed-new-modules.ts
```

**Validação:**
- [ ] ✅ Script executa sem erros
- [ ] ✅ Dados aparecem no Supabase
- [ ] ✅ Dados aparecem nas páginas
- [ ] ✅ Relações entre tabelas corretas
- [ ] ✅ Constraints respeitadas

---

### 📝 TODO 1.3: Validar Fluxos Completos
**Duração:** 1 dia (8 horas)  
**Responsável:** Dev + Product Owner  
**Prioridade:** ALTA

#### Fluxos de Usuário a Validar

##### Fluxo 1: Terapeuta Avalia Risco de Paciente
```
1. Login como terapeuta
2. Acessar lista de pacientes
3. Selecionar paciente
4. Ir para Estratificação de Risco
5. Criar nova avaliação
6. Preencher todos os campos
7. Sistema calcula score automaticamente
8. Salvar avaliação
9. Ver histórico atualizado
10. Exportar relatório em PDF
```

**Critérios de Sucesso:**
- [ ] ✅ Fluxo completo sem erros
- [ ] ✅ Dados salvos corretamente
- [ ] ✅ UI responsiva e intuitiva
- [ ] ✅ Feedback visual adequado
- [ ] ✅ Tempo total < 3 minutos

---

##### Fluxo 2: Acompanhamento de Atleta
```
1. Login como fisioterapeuta esportivo
2. Acessar módulo Sports Rehab
3. Criar perfil de atleta
4. Registrar lesão inicial
5. Adicionar plano de retorno
6. Registrar testes funcionais
7. Calcular progressão
8. Avaliar critérios de RTS (Return to Sport)
9. Gerar relatório final
10. Compartilhar com equipe técnica
```

**Critérios de Sucesso:**
- [ ] ✅ Todos os dados salvos
- [ ] ✅ Cálculos precisos
- [ ] ✅ Gráficos atualizados
- [ ] ✅ Relatório gerado
- [ ] ✅ Performance adequada

---

##### Fluxo 3: Família Acompanha Tratamento
```
1. Paciente autoriza acesso familiar
2. Membro da família recebe convite
3. Login no portal da família
4. Visualizar relatórios do paciente
5. Ver progressão do tratamento
6. Enviar mensagem para terapeuta
7. Receber resposta
8. Acessar recursos educacionais
9. Visualizar próximos agendamentos
10. Avaliar satisfação
```

**Critérios de Sucesso:**
- [ ] ✅ Permissões respeitadas
- [ ] ✅ Dados sensíveis protegidos
- [ ] ✅ Comunicação funcional
- [ ] ✅ LGPD compliance
- [ ] ✅ UX familiar amigável

---

##### Fluxo 4: IA Gera Predições
```
1. Terapeuta acessa Analytics
2. Selecionar paciente
3. Solicitar predição de outcome
4. IA analisa histórico completo
5. Gemini API processa dados
6. Sistema retorna predição
7. Exibir fatores de risco
8. Sugerir intervenções
9. Salvar predição no histórico
10. Monitorar acurácia ao longo do tempo
```

**Critérios de Sucesso:**
- [ ] ✅ API key configurada
- [ ] ✅ Predições coerentes
- [ ] ✅ Tempo de resposta < 5s
- [ ] ✅ Explicabilidade clara
- [ ] ✅ Histórico salvo

---

### 📝 TODO 1.4: Ajustar Conforme Necessário
**Duração:** 0.5 dia (4 horas)  
**Responsável:** Dev  
**Prioridade:** MÉDIA

#### Checklist de Ajustes

**UI/UX:**
- [ ] ✅ Corrigir problemas de layout
- [ ] ✅ Melhorar mensagens de erro
- [ ] ✅ Adicionar loading states faltantes
- [ ] ✅ Melhorar acessibilidade
- [ ] ✅ Otimizar mobile

**Performance:**
- [ ] ✅ Lazy load de imagens
- [ ] ✅ Debounce em buscas
- [ ] ✅ Pagination onde necessário
- [ ] ✅ Cache de queries
- [ ] ✅ Otimizar bundle size

**Segurança:**
- [ ] ✅ Validar inputs
- [ ] ✅ Sanitizar dados
- [ ] ✅ Revisar RLS policies
- [ ] ✅ Adicionar rate limiting
- [ ] ✅ Logs de auditoria

---

## 🚀 FASE 2: MÉDIO PRAZO (Próximas 2 Semanas - 14 dias)
**Objetivo:** Otimizar performance e adicionar features avançadas  
**Prioridade:** 🟡 ALTA  
**Esforço Total:** 80 horas

### 📝 TODO 2.1: Implementar React Query para Cache
**Duração:** 3 dias (24 horas)  
**Responsável:** Dev Senior  
**Prioridade:** ALTA

#### Plano de Implementação

##### Passo 1: Instalar Dependências
```bash
npm install @tanstack/react-query @tanstack/react-query-devtools
```

##### Passo 2: Configurar Provider
```typescript
// App.tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutos
      cacheTime: 10 * 60 * 1000, // 10 minutos
      retry: 3,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      {/* Seu app aqui */}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
```

##### Passo 3: Criar Custom Hooks

```typescript
// hooks/useRiskAssessments.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { riskStratificationService } from '@/services/clinical/riskStratificationServiceSupabase';

export function useRiskAssessments(patientId: string) {
  return useQuery({
    queryKey: ['risk-assessments', patientId],
    queryFn: () => riskStratificationService.getAssessments(patientId),
    enabled: !!patientId,
  });
}

export function useCreateRiskAssessment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: riskStratificationService.createAssessment,
    onSuccess: (data) => {
      // Invalidar cache para forçar refetch
      queryClient.invalidateQueries({ 
        queryKey: ['risk-assessments', data.patient_id] 
      });
    },
  });
}

export function useUpdateRiskAssessment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: any) => 
      riskStratificationService.updateAssessment(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ 
        queryKey: ['risk-assessments', data.patient_id] 
      });
    },
  });
}

export function useDeleteRiskAssessment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: riskStratificationService.deleteAssessment,
    onSuccess: (_, assessmentId) => {
      // Invalidar todos os caches de risk-assessments
      queryClient.invalidateQueries({ 
        queryKey: ['risk-assessments'] 
      });
    },
  });
}
```

##### Passo 4: Refatorar Páginas

```typescript
// pages/RiskStratificationPage.tsx
import { useRiskAssessments, useCreateRiskAssessment } from '@/hooks/useRiskAssessments';

export function RiskStratificationPage() {
  const { patientId } = useParams();
  
  // Usar React Query
  const { data: assessments, isLoading, error } = useRiskAssessments(patientId!);
  const createMutation = useCreateRiskAssessment();
  
  const handleCreate = async (formData: any) => {
    try {
      await createMutation.mutateAsync({
        patient_id: patientId,
        ...formData
      });
      toast.success('Avaliação criada com sucesso!');
    } catch (err) {
      toast.error('Erro ao criar avaliação');
    }
  };
  
  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorDisplay error={error} />;
  
  return (
    <div>
      {/* UI aqui */}
    </div>
  );
}
```

##### Passo 5: Criar Hooks para Todos os Módulos

**Arquivos a criar:**
- `hooks/useRiskAssessments.ts` ✅
- `hooks/useSportsRehab.ts`
- `hooks/usePopulationHealth.ts`
- `hooks/useFamilyPortal.ts`
- `hooks/usePredictiveAnalytics.ts`
- `hooks/useQualityAssurance.ts`

**Template para cada hook:**
```typescript
// hooks/useSportsRehab.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { sportsRehabService } from '@/services/sports/sportsRehabServiceSupabase';

export function useAthleteProfile(patientId: string) {
  return useQuery({
    queryKey: ['athlete-profile', patientId],
    queryFn: () => sportsRehabService.getAthleteProfile(patientId),
    enabled: !!patientId,
  });
}

export function useCreateAthleteProfile() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: sportsRehabService.createAthleteProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['athlete-profile'] });
    },
  });
}

// ... mais hooks
```

##### Passo 6: Otimizações Avançadas

```typescript
// Prefetching
export function usePrefetchPatientData(patientId: string) {
  const queryClient = useQueryClient();
  
  useEffect(() => {
    // Prefetch dados relacionados
    queryClient.prefetchQuery({
      queryKey: ['risk-assessments', patientId],
      queryFn: () => riskStratificationService.getAssessments(patientId),
    });
    
    queryClient.prefetchQuery({
      queryKey: ['athlete-profile', patientId],
      queryFn: () => sportsRehabService.getAthleteProfile(patientId),
    });
  }, [patientId, queryClient]);
}

// Optimistic updates
export function useOptimisticUpdateAssessment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: riskStratificationService.updateAssessment,
    onMutate: async ({ id, data }) => {
      // Cancel refetches
      await queryClient.cancelQueries({ 
        queryKey: ['risk-assessments', data.patient_id] 
      });
      
      // Snapshot do valor anterior
      const previous = queryClient.getQueryData([
        'risk-assessments', 
        data.patient_id
      ]);
      
      // Atualizar otimisticamente
      queryClient.setQueryData(
        ['risk-assessments', data.patient_id],
        (old: any[]) => 
          old.map(item => item.id === id ? { ...item, ...data } : item)
      );
      
      return { previous };
    },
    onError: (err, variables, context) => {
      // Reverter em caso de erro
      queryClient.setQueryData(
        ['risk-assessments', variables.data.patient_id],
        context?.previous
      );
    },
    onSettled: (data) => {
      queryClient.invalidateQueries({ 
        queryKey: ['risk-assessments', data.patient_id] 
      });
    },
  });
}
```

**Checklist de Implementação:**
- [ ] ✅ Instalar React Query
- [ ] ✅ Configurar QueryClient
- [ ] ✅ Criar hooks para Risk Stratification
- [ ] ✅ Criar hooks para Sports Rehab
- [ ] ✅ Criar hooks para outros módulos
- [ ] ✅ Refatorar todas as páginas
- [ ] ✅ Adicionar prefetching
- [ ] ✅ Implementar optimistic updates
- [ ] ✅ Configurar React Query Devtools
- [ ] ✅ Testar cache funcionando
- [ ] ✅ Documentar padrões

**Benefícios Esperados:**
- ⚡ 70% redução em chamadas API
- 🚀 Loading instantâneo em navegação
- 💾 Dados offline disponíveis
- 🔄 Sincronização automática
- 🐛 Menos bugs de state

---

### 📝 TODO 2.2: Adicionar Real-time Subscriptions
**Duração:** 4 dias (32 horas)  
**Responsável:** Dev Senior  
**Prioridade:** ALTA

#### Plano de Implementação

##### Passo 1: Habilitar Real-time no Supabase

```sql
-- No Supabase SQL Editor
-- Habilitar real-time para tabelas principais

ALTER PUBLICATION supabase_realtime 
ADD TABLE risk_assessments;

ALTER PUBLICATION supabase_realtime 
ADD TABLE athlete_profiles;

ALTER PUBLICATION supabase_realtime 
ADD TABLE athlete_injuries;

ALTER PUBLICATION supabase_realtime 
ADD TABLE family_members;

ALTER PUBLICATION supabase_realtime 
ADD TABLE ai_predictions;

ALTER PUBLICATION supabase_realtime 
ADD TABLE compliance_audits;
```

##### Passo 2: Criar Hook de Real-time

```typescript
// hooks/useRealtimeSubscription.ts
import { useEffect, useState } from 'react';
import { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabaseClient';
import { useQueryClient } from '@tanstack/react-query';

export function useRealtimeSubscription<T = any>(
  table: string,
  filter?: string,
  queryKey?: string[]
) {
  const [data, setData] = useState<T[]>([]);
  const queryClient = useQueryClient();
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);
  
  useEffect(() => {
    // Criar subscription
    const subscription = supabase
      .channel(`${table}-changes`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: table,
          filter: filter
        },
        (payload) => {
          console.log('Real-time update:', payload);
          
          // Invalidar cache do React Query
          if (queryKey) {
            queryClient.invalidateQueries({ queryKey });
          }
          
          // Atualizar estado local
          if (payload.eventType === 'INSERT') {
            setData(prev => [...prev, payload.new as T]);
          } else if (payload.eventType === 'UPDATE') {
            setData(prev => 
              prev.map(item => 
                (item as any).id === payload.new.id ? payload.new as T : item
              )
            );
          } else if (payload.eventType === 'DELETE') {
            setData(prev => 
              prev.filter(item => (item as any).id !== payload.old.id)
            );
          }
        }
      )
      .subscribe();
    
    setChannel(subscription);
    
    // Cleanup
    return () => {
      subscription.unsubscribe();
    };
  }, [table, filter, queryKey, queryClient]);
  
  return { data, channel };
}
```

##### Passo 3: Aplicar em Páginas

```typescript
// pages/RiskStratificationPage.tsx
import { useRealtimeSubscription } from '@/hooks/useRealtimeSubscription';

export function RiskStratificationPage() {
  const { patientId } = useParams();
  const { data: assessments, isLoading } = useRiskAssessments(patientId!);
  
  // Real-time subscription
  useRealtimeSubscription(
    'risk_assessments',
    `patient_id=eq.${patientId}`,
    ['risk-assessments', patientId!]
  );
  
  // UI atualiza automaticamente quando dados mudam no Supabase!
  
  return (
    <div>
      {assessments?.map(assessment => (
        <AssessmentCard key={assessment.id} data={assessment} />
      ))}
    </div>
  );
}
```

##### Passo 4: Notificações Real-time

```typescript
// hooks/useRealtimeNotifications.ts
import { useEffect } from 'react';
import { toast } from 'sonner';
import { useRealtimeSubscription } from './useRealtimeSubscription';

export function useRealtimeNotifications(userId: string) {
  const { data: notifications } = useRealtimeSubscription(
    'notifications',
    `user_id=eq.${userId}`
  );
  
  useEffect(() => {
    if (notifications.length > 0) {
      const latest = notifications[notifications.length - 1];
      
      toast(latest.title, {
        description: latest.message,
        action: {
          label: 'Ver',
          onClick: () => {
            // Navegar para notificação
          }
        }
      });
    }
  }, [notifications]);
}
```

##### Passo 5: Status de Presença (Online/Offline)

```typescript
// hooks/usePresence.ts
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { RealtimeChannel } from '@supabase/supabase-js';

export function usePresence(roomName: string, userId: string) {
  const [onlineUsers, setOnlineUsers] = useState<any[]>([]);
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);
  
  useEffect(() => {
    const presenceChannel = supabase.channel(roomName);
    
    presenceChannel
      .on('presence', { event: 'sync' }, () => {
        const state = presenceChannel.presenceState();
        const users = Object.values(state).flat();
        setOnlineUsers(users);
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        console.log('User joined:', newPresences);
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        console.log('User left:', leftPresences);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await presenceChannel.track({
            user_id: userId,
            online_at: new Date().toISOString()
          });
        }
      });
    
    setChannel(presenceChannel);
    
    return () => {
      presenceChannel.unsubscribe();
    };
  }, [roomName, userId]);
  
  return { onlineUsers, channel };
}
```

##### Passo 6: Chat Real-time

```typescript
// components/RealtimeChat.tsx
import { useState } from 'react';
import { useRealtimeSubscription } from '@/hooks/useRealtimeSubscription';
import { supabase } from '@/lib/supabaseClient';

export function RealtimeChat({ roomId, userId }: any) {
  const [message, setMessage] = useState('');
  const { data: messages } = useRealtimeSubscription(
    'chat_messages',
    `room_id=eq.${roomId}`,
    ['chat', roomId]
  );
  
  const sendMessage = async () => {
    await supabase
      .from('chat_messages')
      .insert({
        room_id: roomId,
        user_id: userId,
        content: message,
        created_at: new Date().toISOString()
      });
    
    setMessage('');
  };
  
  return (
    <div className="flex flex-col h-96">
      <div className="flex-1 overflow-y-auto">
        {messages.map(msg => (
          <div key={msg.id} className="p-2">
            <strong>{msg.user_id}:</strong> {msg.content}
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          value={message}
          onChange={e => setMessage(e.target.value)}
          onKeyPress={e => e.key === 'Enter' && sendMessage()}
          className="flex-1 border p-2"
        />
        <button onClick={sendMessage} className="btn-primary">
          Enviar
        </button>
      </div>
    </div>
  );
}
```

**Checklist de Implementação:**
- [ ] ✅ Habilitar real-time no Supabase
- [ ] ✅ Criar hook de subscription
- [ ] ✅ Aplicar em Risk Stratification
- [ ] ✅ Aplicar em Sports Rehab
- [ ] ✅ Aplicar em outros módulos
- [ ] ✅ Implementar notificações real-time
- [ ] ✅ Implementar status de presença
- [ ] ✅ Criar chat real-time (opcional)
- [ ] ✅ Testar multi-usuário
- [ ] ✅ Otimizar performance
- [ ] ✅ Documentar uso

**Benefícios Esperados:**
- 🔴 Dados sempre atualizados
- 👥 Colaboração em tempo real
- 🔔 Notificações instantâneas
- 💬 Chat integrado
- 👀 Indicadores de presença

---

### 📝 TODO 2.3: Criar Testes Automatizados
**Duração:** 4 dias (32 horas)  
**Responsável:** QA Engineer + Dev  
**Prioridade:** ALTA

#### Estrutura de Testes

```
tests/
├── unit/                    # Testes unitários
│   ├── services/
│   ├── components/
│   └── utils/
├── integration/             # Testes de integração
│   ├── api/
│   └── database/
└── e2e/                    # Testes end-to-end
    ├── risk-stratification.spec.ts
    ├── sports-rehab.spec.ts
    ├── population-health.spec.ts
    ├── family-portal.spec.ts
    ├── predictive-analytics.spec.ts
    └── quality-assurance.spec.ts
```

##### Passo 1: Configurar Vitest

```bash
npm install -D vitest @vitest/ui @testing-library/react @testing-library/jest-dom
```

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './tests/setup.ts',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'tests/',
        '*.config.*',
      ],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
});
```

##### Passo 2: Testes Unitários de Serviços

```typescript
// tests/unit/services/riskStratificationServiceSupabase.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { riskStratificationService } from '@/services/clinical/riskStratificationServiceSupabase';
import { supabase } from '@/lib/supabaseClient';

// Mock do Supabase
vi.mock('@/lib/supabaseClient', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => Promise.resolve({ data: [], error: null })),
      insert: vi.fn(() => Promise.resolve({ data: {}, error: null })),
      update: vi.fn(() => Promise.resolve({ data: {}, error: null })),
      delete: vi.fn(() => Promise.resolve({ error: null })),
    })),
  },
}));

describe('RiskStratificationService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  describe('getAssessments', () => {
    it('deve retornar avaliações de um paciente', async () => {
      const mockData = [
        {
          id: '1',
          patient_id: 'patient-1',
          assessment_type: 'cardiovascular',
          overall_score: 75,
          risk_level: 'moderate',
        },
      ];
      
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn(() => Promise.resolve({ data: mockData, error: null })),
      } as any);
      
      const result = await riskStratificationService.getAssessments('patient-1');
      
      expect(result).toEqual(mockData);
      expect(supabase.from).toHaveBeenCalledWith('risk_assessments');
    });
    
    it('deve lançar erro quando Supabase falha', async () => {
      const mockError = { message: 'Database error' };
      
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn(() => Promise.resolve({ data: null, error: mockError })),
      } as any);
      
      await expect(
        riskStratificationService.getAssessments('patient-1')
      ).rejects.toThrow('Database error');
    });
  });
  
  describe('createAssessment', () => {
    it('deve criar nova avaliação', async () => {
      const mockAssessment = {
        patient_id: 'patient-1',
        assessment_type: 'cardiovascular',
        overall_score: 80,
        risk_level: 'moderate',
      };
      
      const mockResult = { id: '1', ...mockAssessment };
      
      vi.mocked(supabase.from).mockReturnValue({
        insert: vi.fn(() => Promise.resolve({ data: mockResult, error: null })),
      } as any);
      
      const result = await riskStratificationService.createAssessment(mockAssessment);
      
      expect(result).toEqual(mockResult);
    });
  });
  
  describe('calculateRiskScore', () => {
    it('deve calcular score corretamente', () => {
      const factors = {
        age: 65,
        has_chronic_disease: true,
        mobility_score: 50,
      };
      
      const score = riskStratificationService.calculateRiskScore(factors);
      
      expect(score).toBeGreaterThan(0);
      expect(score).toBeLessThanOrEqual(100);
    });
  });
});
```

##### Passo 3: Testes de Componentes

```typescript
// tests/unit/components/AthleteQuickStats.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AthleteQuickStats } from '@/components/sports/AthleteQuickStats';

describe('AthleteQuickStats', () => {
  it('deve renderizar estatísticas do atleta', () => {
    const mockProfile = {
      id: '1',
      patient_id: 'patient-1',
      sport: 'Futebol',
      position: 'Atacante',
      competition_level: 'professional',
      training_frequency: 6,
    };
    
    render(<AthleteQuickStats profile={mockProfile} />);
    
    expect(screen.getByText('Futebol')).toBeInTheDocument();
    expect(screen.getByText('Atacante')).toBeInTheDocument();
    expect(screen.getByText('6')).toBeInTheDocument();
  });
  
  it('deve exibir loading state', () => {
    render(<AthleteQuickStats profile={null} loading={true} />);
    
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });
});
```

##### Passo 4: Testes E2E com Playwright

```typescript
// tests/e2e/risk-stratification.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Risk Stratification Module', () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto('http://localhost:5173/login');
    await page.fill('[name="email"]', 'test@example.com');
    await page.fill('[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/dashboard');
  });
  
  test('deve criar nova avaliação de risco', async ({ page }) => {
    // Navegar para módulo
    await page.goto('http://localhost:5173/risk-stratification/patient-123');
    
    // Clicar em "Nova Avaliação"
    await page.click('button:has-text("Nova Avaliação")');
    
    // Preencher formulário
    await page.selectOption('[name="assessment_type"]', 'cardiovascular');
    await page.fill('[name="blood_pressure_systolic"]', '140');
    await page.fill('[name="blood_pressure_diastolic"]', '90');
    await page.check('[name="has_heart_disease"]');
    
    // Salvar
    await page.click('button:has-text("Calcular e Salvar")');
    
    // Verificar sucesso
    await expect(page.locator('.toast-success')).toBeVisible();
    await expect(page.locator('.assessment-card')).toHaveCount(1);
  });
  
  test('deve exibir erro com dados inválidos', async ({ page }) => {
    await page.goto('http://localhost:5173/risk-stratification/patient-123');
    await page.click('button:has-text("Nova Avaliação")');
    
    // Submeter sem preencher
    await page.click('button:has-text("Calcular e Salvar")');
    
    // Verificar mensagens de erro
    await expect(page.locator('.field-error')).toHaveCount(3);
  });
  
  test('deve filtrar avaliações por tipo', async ({ page }) => {
    await page.goto('http://localhost:5173/risk-stratification/patient-123');
    
    // Filtrar
    await page.selectOption('[name="filter_type"]', 'cardiovascular');
    
    // Verificar resultados
    const cards = await page.locator('.assessment-card').all();
    for (const card of cards) {
      await expect(card.locator('.assessment-type')).toHaveText('Cardiovascular');
    }
  });
  
  test('deve exportar relatório em PDF', async ({ page }) => {
    await page.goto('http://localhost:5173/risk-stratification/patient-123');
    
    // Clicar em exportar
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.click('button:has-text("Exportar PDF")'),
    ]);
    
    // Verificar download
    expect(download.suggestedFilename()).toContain('.pdf');
  });
});
```

##### Passo 5: Testes de Integração com Supabase

```typescript
// tests/integration/supabase-integration.test.ts
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createClient } from '@supabase/supabase-js';

// Usar banco de testes
const supabaseTest = createClient(
  process.env.VITE_SUPABASE_TEST_URL!,
  process.env.SUPABASE_TEST_SERVICE_KEY!
);

describe('Supabase Integration Tests', () => {
  let testPatientId: string;
  
  beforeAll(async () => {
    // Criar paciente de teste
    const { data, error } = await supabaseTest
      .from('patients')
      .insert({
        name: 'Test Patient',
        cpf: '000.000.000-00',
        email: 'test@test.com',
      })
      .select()
      .single();
    
    if (error) throw error;
    testPatientId = data.id;
  });
  
  afterAll(async () => {
    // Limpar dados de teste
    await supabaseTest
      .from('patients')
      .delete()
      .eq('id', testPatientId);
  });
  
  it('deve criar e recuperar avaliação de risco', async () => {
    // Criar
    const { data: created, error: createError } = await supabaseTest
      .from('risk_assessments')
      .insert({
        patient_id: testPatientId,
        assessment_type: 'cardiovascular',
        overall_score: 75,
        risk_level: 'moderate',
      })
      .select()
      .single();
    
    expect(createError).toBeNull();
    expect(created).toBeDefined();
    
    // Recuperar
    const { data: fetched, error: fetchError } = await supabaseTest
      .from('risk_assessments')
      .select('*')
      .eq('patient_id', testPatientId)
      .single();
    
    expect(fetchError).toBeNull();
    expect(fetched.id).toBe(created.id);
    expect(fetched.overall_score).toBe(75);
  });
  
  it('deve respeitar RLS policies', async () => {
    // Testar com usuário não autorizado
    const { error } = await supabaseTest
      .from('risk_assessments')
      .select('*')
      .eq('patient_id', testPatientId);
    
    // Deve retornar erro ou dados vazios dependendo da policy
    expect(error).toBeDefined();
  });
});
```

##### Passo 6: Scripts de Teste

```json
// package.json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:all": "npm run test:coverage && npm run test:e2e"
  }
}
```

**Checklist de Implementação:**
- [ ] ✅ Configurar Vitest
- [ ] ✅ Criar testes unitários de serviços
- [ ] ✅ Criar testes de componentes
- [ ] ✅ Configurar Playwright
- [ ] ✅ Criar testes E2E
- [ ] ✅ Testes de integração Supabase
- [ ] ✅ Coverage > 80%
- [ ] ✅ CI/CD com testes
- [ ] ✅ Documentar padrões de teste

**Metas de Cobertura:**
- 🎯 Serviços: 90%
- 🎯 Componentes: 80%
- 🎯 Utils: 95%
- 🎯 Overall: 85%

---

### 📝 TODO 2.4: Otimizar Performance
**Duração:** 3 dias (24 horas)  
**Responsável:** Dev Senior  
**Prioridade:** MÉDIA

#### Checklist de Otimização

##### 1. Bundle Size Optimization

```bash
# Analisar bundle
npm run build
npx vite-bundle-visualizer
```

**Ações:**
- [ ] ✅ Code splitting em todas as rotas
- [ ] ✅ Lazy load de componentes pesados
- [ ] ✅ Tree shaking configurado
- [ ] ✅ Remover dependências não usadas
- [ ] ✅ Comprimir assets
- [ ] ✅ Meta: bundle < 200KB (gzipped)

##### 2. Otimização de Queries

```typescript
// Usar select específico ao invés de *
await supabase
  .from('risk_assessments')
  .select('id, patient_id, overall_score, risk_level') // ✅ específico
  .eq('patient_id', id);

// Ao invés de:
await supabase
  .from('risk_assessments')
  .select('*'); // ❌ traz tudo
```

**Ações:**
- [ ] ✅ Selects específicos
- [ ] ✅ Pagination implementada
- [ ] ✅ Índices no banco otimizados
- [ ] ✅ Queries N+1 eliminadas
- [ ] ✅ Joins otimizados

##### 3. Otimização de Imagens

```typescript
// components/OptimizedImage.tsx
import { useState } from 'react';

export function OptimizedImage({ src, alt, ...props }: any) {
  const [loaded, setLoaded] = useState(false);
  
  return (
    <div className="relative">
      {!loaded && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse" />
      )}
      <img
        src={src}
        alt={alt}
        loading="lazy"
        onLoad={() => setLoaded(true)}
        className={`transition-opacity ${loaded ? 'opacity-100' : 'opacity-0'}`}
        {...props}
      />
    </div>
  );
}
```

**Ações:**
- [ ] ✅ Lazy loading de imagens
- [ ] ✅ WebP format
- [ ] ✅ Responsive images
- [ ] ✅ Blur placeholder
- [ ] ✅ CDN para assets

##### 4. Memoização e Performance React

```typescript
// Usar React.memo para componentes
export const AthleteQuickStats = React.memo(({ profile }) => {
  // ... component
});

// useMemo para cálculos pesados
const riskScore = useMemo(() => {
  return calculateComplexRiskScore(assessments);
}, [assessments]);

// useCallback para funções
const handleCreate = useCallback(() => {
  // ... handler
}, [dependencies]);
```

**Ações:**
- [ ] ✅ React.memo em componentes
- [ ] ✅ useMemo para cálculos
- [ ] ✅ useCallback para handlers
- [ ] ✅ Virtualization em listas longas
- [ ] ✅ Debounce em inputs

##### 5. Service Worker e PWA

```typescript
// service-worker.ts
import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { CacheFirst, NetworkFirst } from 'workbox-strategies';

// Precache static assets
precacheAndRoute(self.__WB_MANIFEST);

// Cache API calls
registerRoute(
  ({ url }) => url.pathname.startsWith('/api/'),
  new NetworkFirst({
    cacheName: 'api-cache',
    networkTimeoutSeconds: 10,
  })
);

// Cache images
registerRoute(
  ({ request }) => request.destination === 'image',
  new CacheFirst({
    cacheName: 'images',
    plugins: [
      {
        cacheWillUpdate: async ({ response }) => {
          return response.status === 200 ? response : null;
        },
      },
    ],
  })
);
```

**Ações:**
- [ ] ✅ Service Worker configurado
- [ ] ✅ Offline mode
- [ ] ✅ Cache strategy
- [ ] ✅ Background sync
- [ ] ✅ Push notifications

##### 6. Métricas e Monitoramento

```typescript
// lib/performance.ts
export function measurePerformance(metricName: string, callback: () => void) {
  const start = performance.now();
  callback();
  const end = performance.now();
  
  console.log(`[Performance] ${metricName}: ${end - start}ms`);
  
  // Enviar para analytics
  if (window.gtag) {
    window.gtag('event', 'timing_complete', {
      name: metricName,
      value: Math.round(end - start),
      event_category: 'Performance'
    });
  }
}
```

**Ações:**
- [ ] ✅ Web Vitals configurado
- [ ] ✅ Performance monitoring
- [ ] ✅ Error tracking (Sentry)
- [ ] ✅ Analytics (Google Analytics 4)
- [ ] ✅ Lighthouse score > 90

**Metas de Performance:**
- ⚡ First Contentful Paint: < 1.5s
- ⚡ Largest Contentful Paint: < 2.5s
- ⚡ Time to Interactive: < 3.0s
- ⚡ Cumulative Layout Shift: < 0.1
- ⚡ First Input Delay: < 100ms

---

## 🎯 FASE 3: LONGO PRAZO (Próximo Mês - 30 dias)
**Objetivo:** Implementar features avançadas e preparar produção  
**Prioridade:** 🟢 MÉDIA-ALTA  
**Esforço Total:** 160 horas

### 📝 TODO 3.1: Implementar Funcionalidades Restantes da PROPOSTA
**Duração:** 10 dias (80 horas)  
**Responsável:** Time Completo  
**Prioridade:** ALTA

#### Funcionalidades a Implementar

##### 1. Módulo Geriátrico
**Referência:** PROPOSTA_FUNCIONALIDADES.md - Item 7.2

**Features:**
- [ ] Avaliação de risco de quedas (Escala de Morse)
- [ ] Integração com avaliação cognitiva (MEEM)
- [ ] Medidas de resultado específicas (Berg Balance Scale)
- [ ] Planos de prevenção personalizados
- [ ] Dashboard geriátrico

**Estimativa:** 3 dias

---

##### 2. Integração com Saúde Mental
**Referência:** PROPOSTA_FUNCIONALIDADES.md - Item 7.3

**Features:**
- [ ] Questionários de ansiedade/depressão (HAD Scale)
- [ ] Encaminhamentos para profissionais de saúde mental
- [ ] Histórico de saúde mental do paciente
- [ ] Integração com terapeutas
- [ ] Alertas de risco psicológico

**Estimativa:** 3 dias

---

##### 3. Sistema de Integração EMR/EHR
**Referência:** PROPOSTA_FUNCIONALIDADES.md - Item 8.1

**Features:**
- [ ] API para integração HL7 FHIR
- [ ] Import de dados de outros sistemas
- [ ] Export padronizado
- [ ] Mapeamento de dados
- [ ] Sincronização bidirecional

**Estimativa:** 5 dias

---

##### 4. Rastreador Avançado de Sintomas
**Referência:** PROPOSTA_FUNCIONALIDADES.md - Item 9.2

**Features:**
- [ ] Diário de sintomas do paciente
- [ ] Escala visual de dor aprimorada
- [ ] Correlação com fatores ambientais
- [ ] Gráficos de tendência
- [ ] Alertas automáticos

**Estimativa:** 2 dias

---

##### 5. Orientação Nutricional
**Referência:** PROPOSTA_FUNCIONALIDADES.md - Item 9.4

**Features:**
- [ ] Planos nutricionais integrados
- [ ] Cálculo de IMC e composição corporal
- [ ] Recomendações personalizadas
- [ ] Integração com nutricionistas
- [ ] Tracking de peso e medidas

**Estimativa:** 2 dias

---

### 📝 TODO 3.2: Machine Learning Real
**Duração:** 8 dias (64 horas)  
**Responsável:** ML Engineer + Dev Senior  
**Prioridade:** MÉDIA

#### Plano de ML

##### 1. Coleta e Preparação de Dados

```python
# scripts/prepare_ml_data.py
import pandas as pd
from supabase import create_client

# Conectar Supabase
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

# Extrair dados históricos
def extract_training_data():
    # Pacientes
    patients = supabase.table('patients').select('*').execute()
    
    # Tratamentos
    treatments = supabase.table('treatments').select('*').execute()
    
    # Outcomes
    outcomes = supabase.table('treatment_outcomes').select('*').execute()
    
    # Criar dataset
    df = pd.merge(
        pd.DataFrame(treatments.data),
        pd.DataFrame(outcomes.data),
        on='treatment_id'
    )
    
    return df

# Feature engineering
def prepare_features(df):
    df['age'] = (pd.Timestamp.now() - pd.to_datetime(df['birth_date'])).dt.days // 365
    df['treatment_duration'] = (
        pd.to_datetime(df['end_date']) - pd.to_datetime(df['start_date'])
    ).dt.days
    
    # One-hot encoding
    df = pd.get_dummies(df, columns=['condition_type', 'treatment_type'])
    
    return df
```

##### 2. Treinamento de Modelos

```python
# models/outcome_predictor.py
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.model_selection import train_test_split, cross_val_score
import joblib

class OutcomePredictor:
    def __init__(self):
        self.models = {
            'rf': RandomForestClassifier(n_estimators=100, random_state=42),
            'gb': GradientBoostingClassifier(n_estimators=100, random_state=42)
        }
        self.best_model = None
    
    def train(self, X, y):
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42
        )
        
        best_score = 0
        for name, model in self.models.items():
            # Cross-validation
            scores = cross_val_score(model, X_train, y_train, cv=5)
            avg_score = scores.mean()
            
            print(f'{name}: {avg_score:.3f}')
            
            if avg_score > best_score:
                best_score = avg_score
                self.best_model = model
        
        # Treinar melhor modelo
        self.best_model.fit(X_train, y_train)
        
        # Avaliar
        test_score = self.best_model.score(X_test, y_test)
        print(f'Test score: {test_score:.3f}')
        
        return self.best_model
    
    def save(self, path='models/outcome_predictor.pkl'):
        joblib.dump(self.best_model, path)
    
    def load(self, path='models/outcome_predictor.pkl'):
        self.best_model = joblib.load(path)
        return self.best_model
    
    def predict(self, X):
        return self.best_model.predict(X)
    
    def predict_proba(self, X):
        return self.best_model.predict_proba(X)
```

##### 3. API de Predição

```typescript
// api/ml-predictions.ts
import Anthropic from '@anthropic-ai/sdk';

export async function predictTreatmentOutcome(patientData: any) {
  // Usar Claude para análise contextual
  const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  });
  
  const response = await anthropic.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 1024,
    messages: [{
      role: 'user',
      content: `
        Analise os seguintes dados do paciente e preveja o outcome do tratamento:
        
        Idade: ${patientData.age}
        Condição: ${patientData.condition}
        Histórico: ${patientData.history}
        Tratamento proposto: ${patientData.treatment_plan}
        
        Forneça:
        1. Probabilidade de sucesso (0-100%)
        2. Fatores de risco principais
        3. Recomendações para melhorar outcome
        4. Duração estimada de tratamento
        
        Responda em formato JSON.
      `
    }]
  });
  
  return JSON.parse(response.content[0].text);
}
```

##### 4. Modelos a Implementar

**Modelo 1: Predição de Outcome**
- Input: dados demográficos, condição, plano de tratamento
- Output: probabilidade de sucesso (0-1)
- Algoritmo: Gradient Boosting
- Métrica: AUC-ROC > 0.80

**Modelo 2: Predição de Abandono**
- Input: comportamento do paciente, histórico de faltas
- Output: risco de abandono (low/medium/high)
- Algoritmo: Random Forest
- Métrica: Precisão > 75%

**Modelo 3: Recomendação de Exercícios**
- Input: condição, progresso, preferências
- Output: lista de exercícios recomendados
- Algoritmo: Collaborative Filtering
- Métrica: NDCG > 0.70

**Modelo 4: Análise de Marcha (Visão Computacional)**
- Input: vídeo de marcha
- Output: métricas de marcha, anomalias
- Algoritmo: CNN (YOLO ou similar)
- Métrica: mAP > 0.75

---

### 📝 TODO 3.3: Integração com Wearables
**Duração:** 6 dias (48 horas)  
**Responsável:** Dev Mobile + Dev Backend  
**Prioridade:** MÉDIA

#### Dispositivos a Integrar

##### 1. Apple Health / HealthKit

```typescript
// services/integrations/appleHealthService.ts
export class AppleHealthService {
  async authorize() {
    // Solicitar permissões
    const permissions = {
      toRead: [
        'HKQuantityTypeIdentifierStepCount',
        'HKQuantityTypeIdentifierHeartRate',
        'HKQuantityTypeIdentifierDistanceWalkingRunning',
        'HKQuantityTypeIdentifierActiveEnergyBurned'
      ]
    };
    
    await AppleHealthKit.initHealthKit(permissions);
  }
  
  async getSteps(startDate: Date, endDate: Date) {
    return AppleHealthKit.getStepCount({
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString()
    });
  }
  
  async getHeartRate(startDate: Date, endDate: Date) {
    return AppleHealthKit.getHeartRateSamples({
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString()
    });
  }
  
  async syncToSupabase(patientId: string) {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const steps = await this.getSteps(yesterday, today);
    const heartRate = await this.getHeartRate(yesterday, today);
    
    // Salvar no Supabase
    await supabase.from('wearable_data').insert({
      patient_id: patientId,
      source: 'apple_health',
      data_type: 'steps',
      value: steps.value,
      recorded_at: new Date().toISOString()
    });
  }
}
```

##### 2. Google Fit

```typescript
// services/integrations/googleFitService.ts
export class GoogleFitService {
  async authorize() {
    const result = await GoogleFit.authorize({
      scopes: [
        'FITNESS_ACTIVITY_READ',
        'FITNESS_LOCATION_READ',
        'FITNESS_BODY_READ'
      ]
    });
    
    return result.success;
  }
  
  async getActivityData(startDate: Date, endDate: Date) {
    const data = await GoogleFit.getDailySteps(startDate, endDate);
    return data;
  }
}
```

##### 3. Fitbit API

```typescript
// services/integrations/fitbitService.ts
export class FitbitService {
  private accessToken: string;
  
  async authorize() {
    // OAuth flow
    const authUrl = 'https://www.fitbit.com/oauth2/authorize' +
      `?client_id=${FITBIT_CLIENT_ID}` +
      '&response_type=code' +
      '&scope=activity+heartrate+sleep';
    
    // Redirect user
    window.location.href = authUrl;
  }
  
  async getActivityData(date: string) {
    const response = await fetch(
      `https://api.fitbit.com/1/user/-/activities/date/${date}.json`,
      {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`
        }
      }
    );
    
    return response.json();
  }
  
  async syncData(patientId: string) {
    const today = new Date().toISOString().split('T')[0];
    const data = await this.getActivityData(today);
    
    await supabase.from('wearable_data').insert({
      patient_id: patientId,
      source: 'fitbit',
      data_type: 'activity',
      value: data.summary.steps,
      recorded_at: new Date().toISOString()
    });
  }
}
```

##### 4. Dashboard de Wearables

```typescript
// pages/WearablesIntegrationPage.tsx
export function WearablesIntegrationPage() {
  const [connectedDevices, setConnectedDevices] = useState<string[]>([]);
  const [activityData, setActivityData] = useState<any>(null);
  
  const connectAppleHealth = async () => {
    const service = new AppleHealthService();
    await service.authorize();
    setConnectedDevices(prev => [...prev, 'apple_health']);
  };
  
  const connectFitbit = async () => {
    const service = new FitbitService();
    await service.authorize();
  };
  
  return (
    <div className="p-6">
      <h1>Integração com Wearables</h1>
      
      <div className="grid grid-cols-3 gap-4 mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Apple Health</CardTitle>
          </CardHeader>
          <CardContent>
            {connectedDevices.includes('apple_health') ? (
              <Badge variant="success">Conectado</Badge>
            ) : (
              <Button onClick={connectAppleHealth}>
                Conectar
              </Button>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Google Fit</CardTitle>
          </CardHeader>
          <CardContent>
            <Button>Conectar</Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Fitbit</CardTitle>
          </CardHeader>
          <CardContent>
            <Button onClick={connectFitbit}>Conectar</Button>
          </CardContent>
        </Card>
      </div>
      
      {activityData && (
        <div className="mt-6">
          <h2>Dados de Atividade</h2>
          <WearableDataChart data={activityData} />
        </div>
      )}
    </div>
  );
}
```

**Checklist:**
- [ ] ✅ Integração Apple Health
- [ ] ✅ Integração Google Fit
- [ ] ✅ Integração Fitbit
- [ ] ✅ Integração Garmin (opcional)
- [ ] ✅ Dashboard de wearables
- [ ] ✅ Sincronização automática
- [ ] ✅ Visualizações de dados
- [ ] ✅ Alertas baseados em métricas

---

### 📝 TODO 3.4: Deploy em Produção
**Duração:** 6 dias (48 horas)  
**Responsável:** DevOps + Dev Senior  
**Prioridade:** CRÍTICA

#### Checklist de Deploy

##### 1. Preparação de Ambiente

```bash
# .env.production
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua_chave_anon
VITE_GEMINI_API_KEY=sua_chave_gemini
VITE_RESEND_API_KEY=sua_chave_resend
VITE_ENV=production
```

**Checklist:**
- [ ] ✅ Variáveis de ambiente configuradas
- [ ] ✅ API keys de produção obtidas
- [ ] ✅ Domínio registrado
- [ ] ✅ SSL configurado
- [ ] ✅ CDN configurada (Cloudflare)
- [ ] ✅ Backup automático ativo

---

##### 2. Build de Produção

```bash
# Otimizar e buildar
npm run build

# Testar build localmente
npm run preview

# Analisar bundle
npx vite-bundle-visualizer
```

**Checklist:**
- [ ] ✅ Build sem erros
- [ ] ✅ Bundle size < 200KB
- [ ] ✅ Lighthouse score > 90
- [ ] ✅ Assets otimizados
- [ ] ✅ Service worker ativo

---

##### 3. Configuração Vercel

```json
// vercel.json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "vite",
  "env": {
    "VITE_SUPABASE_URL": "@supabase_url",
    "VITE_SUPABASE_ANON_KEY": "@supabase_anon_key"
  },
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    }
  ],
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

**Deploy:**
```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

**Checklist:**
- [ ] ✅ Deploy na Vercel
- [ ] ✅ Domínio customizado configurado
- [ ] ✅ Preview deployments ativos
- [ ] ✅ Analytics configurado
- [ ] ✅ Logs configurados

---

##### 4. Configuração Supabase Produção

**Migrações:**
```bash
# Aplicar migrations em produção
npx supabase db push --db-url "postgresql://..."
```

**Checklist:**
- [ ] ✅ Banco de produção criado
- [ ] ✅ Migrations aplicadas
- [ ] ✅ RLS habilitado
- [ ] ✅ Backups automáticos
- [ ] ✅ Monitoramento ativo
- [ ] ✅ Rate limiting configurado

---

##### 5. Monitoramento e Observabilidade

```typescript
// lib/monitoring.ts
import * as Sentry from '@sentry/react';

Sentry.init({
  dsn: process.env.VITE_SENTRY_DSN,
  environment: process.env.VITE_ENV,
  tracesSampleRate: 1.0,
  integrations: [
    new Sentry.BrowserTracing(),
    new Sentry.Replay()
  ],
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
});
```

**Ferramentas:**
- [ ] ✅ Sentry para error tracking
- [ ] ✅ Google Analytics 4
- [ ] ✅ Vercel Analytics
- [ ] ✅ Supabase Dashboard
- [ ] ✅ Uptime monitoring (UptimeRobot)
- [ ] ✅ Slack notifications

---

##### 6. Documentação e Handoff

**Documentos a criar:**
- [ ] ✅ Manual de deploy
- [ ] ✅ Runbook de produção
- [ ] ✅ Guia de troubleshooting
- [ ] ✅ Contatos de emergência
- [ ] ✅ Procedimentos de rollback
- [ ] ✅ Disaster recovery plan

---

## 📊 RESUMO EXECUTIVO

### Cronograma Consolidado

```
Semana 1 (Dias 1-7):
├── Testar funcionalidades           [2 dias]
├── Adicionar dados de exemplo       [1 dia]
├── Validar fluxos                   [1 dia]
└── Ajustes                          [0.5 dia]
Total: 4.5 dias

Semanas 2-3 (Dias 8-21):
├── React Query                      [3 dias]
├── Real-time subscriptions          [4 dias]
├── Testes automatizados             [4 dias]
└── Otimização de performance        [3 dias]
Total: 14 dias

Semanas 4-6 (Dias 22-51):
├── Funcionalidades restantes        [10 dias]
├── Machine Learning real            [8 dias]
├── Integração wearables             [6 dias]
└── Deploy produção                  [6 dias]
Total: 30 dias

TOTAL GERAL: 48.5 dias (~7 semanas)
```

### Recursos Necessários

**Time:**
- 1 Dev Senior (full-time)
- 1 Dev Pleno (full-time)
- 1 QA Engineer (part-time)
- 1 ML Engineer (part-time)
- 1 DevOps (part-time)

**Infraestrutura:**
- Supabase Pro: $25/mês
- Vercel Pro: $20/mês
- Sentry: $26/mês
- CDN: $10/mês
- Total: ~$80/mês

### Riscos e Mitigações

| Risco | Probabilidade | Impacto | Mitigação |
|-------|---------------|---------|-----------|
| Integrações de terceiros falharem | Média | Alto | Implementar fallbacks e mocks |
| Performance inadequada | Baixa | Alto | Testes de carga desde o início |
| Bugs críticos em produção | Média | Crítico | Testes E2E robustos + monitoramento |
| Atrasos no cronograma | Alta | Médio | Buffer de 20% no prazo |
| Custos acima do esperado | Baixa | Médio | Monitoramento de custos semanal |

### KPIs de Sucesso

**Técnicos:**
- ✅ Uptime > 99.9%
- ✅ Performance (LCP) < 2.5s
- ✅ Cobertura de testes > 80%
- ✅ Zero critical bugs
- ✅ Lighthouse score > 90

**Negócio:**
- 📈 50 clínicas utilizando
- 📈 500+ pacientes ativos
- 📈 95% satisfação usuários
- 📈 < 5% churn rate

**Qualidade:**
- 🎯 100% compliance LGPD
- 🎯 Certificação ISO 27001
- 🎯 Aprovação COFFITO
- 🎯 Zero incidentes de segurança

---

## ✅ PRÓXIMOS PASSOS IMEDIATOS

### Hoje (Dia 1)
1. ⏰ **09:00** - Ler este planejamento completo
2. ⏰ **10:00** - Iniciar testes de funcionalidades
3. ⏰ **12:00** - Review dos resultados
4. ⏰ **14:00** - Começar script de seed data
5. ⏰ **16:00** - Validar primeiros fluxos

### Amanhã (Dia 2)
1. Finalizar todos os testes
2. Completar seed data
3. Documentar bugs encontrados
4. Priorizar ajustes

### Esta Semana
1. Completar TODO 1.1 ao 1.4
2. Preparar ambiente para Fase 2
3. Instalar React Query
4. Planning da próxima semana

---

## 📞 CONTATOS E SUPORTE

**Desenvolvedor Principal:** [Seu nome]  
**Email:** [Seu email]  
**Slack:** [Canal do projeto]  
**GitHub:** [Link do repo]

**Horário de Trabalho:** 9h - 18h (BRT)  
**On-call:** 24/7 após deploy em produção

---

## 📚 REFERÊNCIAS

1. `🌟_SESSAO_FINALIZADA_COM_SUCESSO_TOTAL.md` - Status atual
2. `PROPOSTA_FUNCIONALIDADES.md` - Features solicitadas
3. `STRATEGIC_ROADMAP.md` - Roadmap de longo prazo
4. `🎯_GUIA_COMPLETO_INTEGRACAO_FRONTEND.md` - Guia técnico
5. `📝_INTEGRACAO_SUPABASE_SERVICOS.md` - Serviços implementados

---

**✨ SUCESSO NO DESENVOLVIMENTO! ✨**

Este planejamento é seu guia completo para os próximos 2 meses.  
Siga passo a passo e teremos um sistema de nível mundial! 🚀

---

**Criado em:** 08 de Outubro de 2025  
**Última atualização:** 08 de Outubro de 2025  
**Versão:** 1.0  
**Status:** 🟢 ATIVO

