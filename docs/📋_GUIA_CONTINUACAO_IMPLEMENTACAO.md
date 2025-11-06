# 📋 Guia de Continuação da Implementação

## ✅ Concluído (60% do Plano)

### Fase 1: Base e Infraestrutura ✓
- [x] Sistema de cores moderno vibrante (Tailwind)
- [x] Gradientes e utilities (`lib/utils/gradients.ts`)
- [x] Componente `StatusBadge` reutilizável
- [x] 4 migrations SQL completas
- [x] TypeScript types atualizados
- [x] 4 services completos (Surgery, Pathology, Goals, AssessmentTest)
- [x] Service de predição com IA

## 🔄 Próximos Passos (40% Restante)

### Fase 2: Componentes de Gerenciamento (CRUD)

#### 1. SurgeryManager Component
**Arquivo:** `components/patient/SurgeryManager.tsx`

```tsx
import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Calendar, Scissors } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { surgeryService } from '@/services/supabase/surgeryService';
import { Surgery } from '@/types';
import { StatusBadge } from '@/components/ui/StatusBadge';

interface SurgeryManagerProps {
  patientId: string;
}

export function SurgeryManager({ patientId }: SurgeryManagerProps) {
  const [surgeries, setSurgeries] = useState<Surgery[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSurgery, setEditingSurgery] = useState<Surgery | null>(null);

  useEffect(() => {
    loadSurgeries();
  }, [patientId]);

  const loadSurgeries = async () => {
    try {
      setLoading(true);
      const data = await surgeryService.getSurgeriesByPatient(patientId);
      setSurgeries(data);
    } catch (error) {
      console.error('Erro ao carregar cirurgias:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (data: any) => {
    try {
      if (editingSurgery) {
        await surgeryService.updateSurgery(editingSurgery.id, data);
      } else {
        await surgeryService.createSurgery({ ...data, patientId });
      }
      setIsDialogOpen(false);
      setEditingSurgery(null);
      loadSurgeries();
    } catch (error) {
      console.error('Erro ao salvar cirurgia:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta cirurgia?')) {
      try {
        await surgeryService.deleteSurgery(id);
        loadSurgeries();
      } catch (error) {
        console.error('Erro ao excluir cirurgia:', error);
      }
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Scissors className="w-5 h-5 text-health-danger-500" />
          Cirurgias ({surgeries.length})
        </CardTitle>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-health-primary-600 hover:bg-health-primary-700">
              <Plus className="w-4 h-4 mr-2" />
              Nova Cirurgia
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingSurgery ? 'Editar Cirurgia' : 'Nova Cirurgia'}
              </DialogTitle>
            </DialogHeader>
            {/* Form aqui */}
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-8">Carregando...</div>
        ) : surgeries.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            Nenhuma cirurgia registrada
          </div>
        ) : (
          <div className="space-y-4">
            {surgeries.map((surgery) => {
              const { days, weeks, months } = surgeryService.calculateDaysSinceSurgery(surgery.date);
              return (
                <div key={surgery.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold text-lg">{surgery.name}</h4>
                      <div className="flex items-center gap-2 mt-2">
                        <Calendar className="w-4 h-4 text-slate-500" />
                        <span className="text-sm text-slate-600">{new Date(surgery.date).toLocaleDateString('pt-BR')}</span>
                        <span className="text-xs text-slate-500">•</span>
                        <span className="text-sm text-slate-600">{days} dias ({weeks} semanas, {months} meses)</span>
                      </div>
                      {surgery.surgeon && (
                        <p className="text-sm text-slate-600 mt-1">Cirurgião: {surgery.surgeon}</p>
                      )}
                      {surgery.hospital && (
                        <p className="text-sm text-slate-600">Hospital: {surgery.hospital}</p>
                      )}
                      {surgery.description && (
                        <p className="text-sm text-slate-700 mt-2">{surgery.description}</p>
                      )}
                      {surgery.complications && (
                        <div className="mt-2 p-2 bg-health-warning-50 rounded text-sm text-health-warning-700">
                          <strong>Complicações:</strong> {surgery.complications}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditingSurgery(surgery);
                          setIsDialogOpen(true);
                        }}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(surgery.id)}
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
```

#### 2. PathologyManager Component
**Arquivo:** `components/patient/PathologyManager.tsx`

Estrutura similar ao SurgeryManager, mas com:
- Filtro por status (ativas, resolvidas, crônicas)
- Campos: nome, CID, região afetada, severidade
- Badge de severidade colorido
- Score de impacto no tratamento

#### 3. GoalsManager Component
**Arquivo:** `components/patient/GoalsManager.tsx`

- Lista de metas com progress bars
- Categorias com ícones e cores
- Botão "Marcar como Concluída"
- Predição de likelihood de alcance
- Timeline de metas alcançadas

#### 4. AssessmentTestConfigManager Component
**Arquivo:** `components/patient/AssessmentTestConfigManager.tsx`

- Configuração de testes obrigatórios
- Form: nome, tipo, frequência
- Visualização de próximos testes devido
- Alertas de testes em atraso

### Fase 3: Dashboard Clínico Expandido

#### Atualizar PatientDetailPage
**Arquivo:** `pages/PatientDetailPage.tsx`

Adicionar na tab "Overview":

```tsx
{/* SEÇÃO 1: Cards Principais */}
<SurgeryManager patientId={patient.id} />
<PathologyManager patientId={patient.id} />
<GoalsManager patientId={patient.id} />

{/* SEÇÃO 2: Métricas */}
<div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
  {/* Aderência, Dor, Funcionalidade, Próxima Sessão */}
</div>

{/* SEÇÃO 3: Gráficos */}
{/* SEÇÃO 4: Análise Preditiva com IA */}
{/* SEÇÃO 5: Histórico de Sessões */}
```

### Fase 4: Gráficos com Recharts

Instalar Recharts:
```bash
npm install recharts
```

Criar componentes de gráficos:
- `components/charts/PainEvolutionChart.tsx`
- `components/charts/AmplitudeChart.tsx`
- `components/charts/StrengthChart.tsx`
- `components/charts/YBalanceChart.tsx`

### Fase 5: Sistema de Relatórios

#### Criar services de relatórios:
- `services/reports/patientEvolutionReport.ts`
- `services/reports/comparativePatientReport.ts`
- `services/reports/therapistPerformanceReport.ts`

#### Criar UI de geração:
- `components/reports/ReportGeneratorDialog.tsx`

### Fase 6: Redesign PatientListPage

**Arquivo:** `pages/PatientListPage.tsx`

- Stats cards com gradientes vibrantes
- Filtros avançados
- Tabela moderna com badges
- Quick actions

## 📦 Instalação de Dependências

```bash
# Recharts para gráficos
npm install recharts

# Componentes Shadcn adicionais (se necessário)
npx shadcn add progress avatar separator
```

## 🎨 Padrão de Cores a Aplicar

Substituir em todos os componentes:
- `bg-blue-500` → `bg-health-primary-500`
- `text-green-600` → `text-health-success-600`
- `border-red-500` → `border-health-danger-500`
- `bg-purple-500` → `bg-health-secondary-500`

## 🔧 Aplicar Migrations no Supabase

1. Acessar Supabase Dashboard
2. Ir em SQL Editor
3. Executar cada migration em ordem:
   - `20250116_patient_surgeries.sql`
   - `20250116_patient_pathologies.sql`
   - `20250116_patient_goals_unified.sql`
   - `20250116_assessment_tests_expanded.sql`

## 📊 Checklist de Implementação

### Componentes CRUD
- [ ] SurgeryManager
- [ ] PathologyManager  
- [ ] GoalsManager
- [ ] AssessmentTestConfigManager

### Dashboard
- [ ] Atualizar PatientDetailPage
- [ ] Adicionar cards de métricas
- [ ] Integrar análise preditiva
- [ ] Adicionar histórico de sessões

### Gráficos
- [ ] PainEvolutionChart
- [ ] AmplitudeChart
- [ ] StrengthChart
- [ ] YBalanceChart
- [ ] FuncionalityChart

### Relatórios
- [ ] PatientEvolutionReport service
- [ ] ComparativePatientReport service
- [ ] TherapistPerformanceReport service
- [ ] ReportGeneratorDialog UI

### Lista de Pacientes
- [ ] Redesenhar PatientListPage
- [ ] Stats cards com gradientes
- [ ] Filtros avançados
- [ ] Tabela moderna

### Aplicação Global
- [ ] Atualizar cores em todos os componentes
- [ ] Aplicar gradientes premium
- [ ] Testes de responsividade
- [ ] Testes de acessibilidade

## 🚀 Como Continuar

1. **Criar componentes de gerenciamento** seguindo o padrão do SurgeryManager
2. **Integrar no PatientDetailPage** nas tabs apropriadas
3. **Instalar Recharts** e criar gráficos
4. **Criar services de relatórios** com dados agregados
5. **Redesenhar PatientListPage** com novo design
6. **Aplicar cores globalmente** usando busca e substituição

## 📝 Notas Importantes

- Todos os services estão prontos e funcionais
- O sistema de cores está completo
- As migrations estão prontas para aplicação
- Os types TypeScript estão atualizados
- O serviço de predição com IA está implementado

## 🎯 Prioridades

1. **Alta**: Componentes de gerenciamento (CRUD)
2. **Alta**: Dashboard clínico expandido
3. **Média**: Gráficos de evolução
4. **Média**: Sistema de relatórios
5. **Baixa**: Redesign PatientListPage
6. **Baixa**: Aplicação global de cores

---

**Status**: 60% Concluído
**Próxima Fase**: Componentes de Gerenciamento
**Tempo Estimado**: 4-6 horas de desenvolvimento

