# Prompt 15: Mapa de Dor Corporal Realista e Interativo

## 🎯 Objetivo

Implementar mapa de dor corporal com anatomia realista, interativo e com gradiente de cores por intensidade, inspirado na imagem fornecida e nas melhores práticas de sistemas de saúde.

---

## 📋 Contexto

**Problema atual:**
- Mapa de dor simplificado e esquemático
- Difícil identificar regiões específicas
- Sem visualização de intensidade
- Não transmite profissionalismo

**Solução:**
- Anatomia humana realista (músculos visíveis)
- Frente e costas lado a lado
- Sistema de cores por intensidade (0-10)
- Regiões clicáveis e interativas
- Comparação entre sessões
- Exportação em PDF

---

## 🎨 Design Visual

### Anatomia Realista

**Características:**
- Corpo humano com músculos principais visíveis
- Proporções anatômicas corretas
- Detalhes de articulações
- Linhas de contorno suaves
- Cor base: Azul claro (#60A5FA)
- Linhas: Azul escuro (#2563EB)

**Visualizações:**
- **Frente:** Corpo de frente (anterior)
- **Costas:** Corpo de costas (posterior)
- **Lado a lado:** Ambas as visualizações visíveis simultaneamente

### Sistema de Cores por Intensidade

**Gradiente:**
```css
/* Sem dor */
--pain-0: transparent;

/* Dor muito leve */
--pain-1-2: rgba(16, 185, 129, 0.3); /* Verde claro */

/* Dor leve */
--pain-3-4: rgba(251, 191, 36, 0.5); /* Amarelo */

/* Dor moderada */
--pain-5-7: rgba(249, 115, 22, 0.7); /* Laranja */

/* Dor intensa */
--pain-8-9: rgba(239, 68, 68, 0.85); /* Vermelho */

/* Dor muito intensa */
--pain-10: rgba(153, 27, 27, 1); /* Vermelho escuro */
```

**Legenda:**
```
🟢 Sem dor (0-2)
🟡 Dor leve (3-4)
🟠 Dor moderada (5-7)
🔴 Dor intensa (8-10)
```

---

## 🔧 Funcionalidades

### 1. Regiões Clicáveis

**Regiões pré-definidas (frente):**
- Cabeça e pescoço
- Ombro direito / esquerdo
- Braço direito / esquerdo
- Antebraço direito / esquerdo
- Mão direita / esquerda
- Tórax
- Abdômen
- Coluna cervical
- Coluna torácica
- Coluna lombar
- Quadril direito / esquerdo
- Coxa direita / esquerda
- Joelho direito / esquerdo
- Perna direita / esquerda
- Tornozelo direito / esquerdo
- Pé direito / esquerdo

**Regiões pré-definidas (costas):**
- Pescoço posterior
- Trapézio direito / esquerdo
- Escapula direita / esquerda
- Coluna cervical posterior
- Coluna torácica posterior
- Coluna lombar posterior
- Glúteo direito / esquerdo
- Posterior coxa direita / esquerda
- Panturrilha direita / esquerda

### 2. Modal de Registro de Dor

**Ao clicar em uma região:**
```
┌─────────────────────────────────────────┐
│  Ombro Direito                    [X]   │
├─────────────────────────────────────────┤
│                                         │
│  Intensidade da Dor (0-10):             │
│  ●━━━━━━━━━━━━━━━━━━━━━━━━━━━━━○       │
│  0                    5                10│
│                       7                  │
│                                         │
│  Tipo de Dor:                           │
│  ○ Aguda/Pontada                        │
│  ● Latejante                            │
│  ○ Queimação                            │
│  ○ Formigamento                         │
│  ○ Dormência                            │
│  ○ Rigidez                              │
│  ○ Inchaço                              │
│                                         │
│  Observações:                           │
│  ┌─────────────────────────────────┐   │
│  │ Dor piora ao levantar o braço   │   │
│  │                                 │   │
│  └─────────────────────────────────┘   │
│                                         │
│  [Limpar]              [Salvar]         │
└─────────────────────────────────────────┘
```

### 3. Visualização de Intensidade

**Região colorida:**
- Ao salvar, região fica colorida conforme intensidade
- Cor muda de verde → amarelo → laranja → vermelho
- Transparência indica intensidade
- Múltiplas regiões podem ter cores diferentes

### 4. Comparação Entre Sessões

**Modo de comparação:**
```
┌──────────────────────────────────────────────────┐
│  Comparar Evoluções                        [X]   │
├──────────────────────────────────────────────────┤
│                                                  │
│  ┌─────────────────┐    ┌─────────────────┐    │
│  │  01/10/2025     │    │  01/11/2025     │    │
│  │  Sessão #5      │    │  Sessão #10     │    │
│  │                 │    │                 │    │
│  │     👤          │    │      👤         │    │
│  │   (corpo)       │    │    (corpo)      │    │
│  │                 │    │                 │    │
│  │  🔴 Ombro: 8/10 │    │  🟡 Ombro: 4/10 │    │
│  │  🟠 Lombar: 6/10│    │  🟢 Lombar: 2/10│    │
│  └─────────────────┘    └─────────────────┘    │
│                                                  │
│  Evolução:                                       │
│  ✅ Ombro: Melhora de 50% (-4 pontos)           │
│  ✅ Lombar: Melhora de 67% (-4 pontos)          │
│                                                  │
│  [Exportar PDF]                                  │
└──────────────────────────────────────────────────┘
```

### 5. Histórico de Evolução

**Timeline:**
- Lista cronológica de mapas de dor
- Slider de data
- Gráfico de intensidade média ao longo do tempo
- Animação de evolução (opcional)

### 6. Exportação em PDF

**Conteúdo do PDF:**
- Imagem do corpo com regiões coloridas
- Legenda de cores
- Lista de regiões com intensidade e tipo de dor
- Data da avaliação
- Nome do paciente e fisioterapeuta
- Observações

---

## 🛠️ Implementação Técnica

### Opção 1: SVG Customizado (Recomendado)

**Vantagens:**
- Controle total sobre regiões
- Escalável (vetorial)
- Leve (poucos KB)
- Fácil de estilizar com CSS

**Estrutura:**
```typescript
// components/BodyMap.tsx
import React, { useState } from 'react';

interface PainRegion {
  id: string;
  name: string;
  intensity: number; // 0-10
  type?: string;
  notes?: string;
}

export function BodyMap() {
  const [regions, setRegions] = useState<PainRegion[]>([]);
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);

  const handleRegionClick = (regionId: string) => {
    setSelectedRegion(regionId);
    // Abrir modal
  };

  const getRegionColor = (intensity: number) => {
    if (intensity === 0) return 'transparent';
    if (intensity <= 2) return 'rgba(16, 185, 129, 0.3)';
    if (intensity <= 4) return 'rgba(251, 191, 36, 0.5)';
    if (intensity <= 7) return 'rgba(249, 115, 22, 0.7)';
    if (intensity <= 9) return 'rgba(239, 68, 68, 0.85)';
    return 'rgba(153, 27, 27, 1)';
  };

  return (
    <div className="flex gap-8">
      {/* Frente */}
      <svg viewBox="0 0 200 500" className="w-64">
        {/* Cabeça */}
        <ellipse
          cx="100"
          cy="30"
          rx="25"
          ry="30"
          fill={getRegionColor(regions.find(r => r.id === 'head')?.intensity || 0)}
          stroke="#2563EB"
          strokeWidth="2"
          onClick={() => handleRegionClick('head')}
          className="cursor-pointer hover:opacity-80"
        />
        
        {/* Pescoço */}
        <rect
          x="85"
          y="55"
          width="30"
          height="20"
          fill={getRegionColor(regions.find(r => r.id === 'neck')?.intensity || 0)}
          stroke="#2563EB"
          strokeWidth="2"
          onClick={() => handleRegionClick('neck')}
          className="cursor-pointer hover:opacity-80"
        />
        
        {/* Ombro Direito */}
        <circle
          cx="70"
          cy="90"
          r="20"
          fill={getRegionColor(regions.find(r => r.id === 'shoulder_right')?.intensity || 0)}
          stroke="#2563EB"
          strokeWidth="2"
          onClick={() => handleRegionClick('shoulder_right')}
          className="cursor-pointer hover:opacity-80"
        />
        
        {/* Ombro Esquerdo */}
        <circle
          cx="130"
          cy="90"
          r="20"
          fill={getRegionColor(regions.find(r => r.id === 'shoulder_left')?.intensity || 0)}
          stroke="#2563EB"
          strokeWidth="2"
          onClick={() => handleRegionClick('shoulder_left')}
          className="cursor-pointer hover:opacity-80"
        />
        
        {/* ... mais regiões ... */}
      </svg>

      {/* Costas */}
      <svg viewBox="0 0 200 500" className="w-64">
        {/* Regiões posteriores */}
      </svg>
    </div>
  );
}
```

### Opção 2: Biblioteca React Body Highlighter

**Instalação:**
```bash
npm install react-body-highlighter
```

**Uso:**
```typescript
import { BodyHighlighter } from 'react-body-highlighter';

export function BodyMap() {
  const [data, setData] = useState([
    { slug: 'shoulder', intensity: 7 },
    { slug: 'lower-back', intensity: 5 },
  ]);

  return (
    <BodyHighlighter
      data={data}
      onClick={(region) => handleRegionClick(region)}
      colors={[
        'rgba(16, 185, 129, 0.3)',
        'rgba(251, 191, 36, 0.5)',
        'rgba(249, 115, 22, 0.7)',
        'rgba(239, 68, 68, 0.85)',
        'rgba(153, 27, 27, 1)',
      ]}
    />
  );
}
```

### Banco de Dados

```sql
-- Tabela de mapas de dor
CREATE TABLE pain_maps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES sessions(id),
  patient_id UUID REFERENCES patients(id),
  professional_id UUID REFERENCES professionals(id),
  created_at TIMESTAMP DEFAULT NOW(),
  notes TEXT
);

-- Tabela de regiões com dor
CREATE TABLE pain_regions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pain_map_id UUID REFERENCES pain_maps(id) ON DELETE CASCADE,
  region_id TEXT NOT NULL, -- 'shoulder_right', 'lower_back', etc.
  region_name TEXT NOT NULL,
  intensity INT CHECK (intensity >= 0 AND intensity <= 10),
  pain_type TEXT, -- 'sharp', 'throbbing', 'burning', etc.
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_pain_maps_patient ON pain_maps(patient_id);
CREATE INDEX idx_pain_maps_session ON pain_maps(session_id);
CREATE INDEX idx_pain_regions_map ON pain_regions(pain_map_id);
```

### API

```typescript
// app/api/pain-maps/route.ts
export async function POST(req: Request) {
  const { session_id, patient_id, regions, notes } = await req.json();

  // Criar mapa de dor
  const { data: painMap } = await supabase
    .from('pain_maps')
    .insert({
      session_id,
      patient_id,
      professional_id: req.user.id,
      notes,
    })
    .select()
    .single();

  // Criar regiões
  const regionsData = regions.map((r: any) => ({
    pain_map_id: painMap.id,
    region_id: r.id,
    region_name: r.name,
    intensity: r.intensity,
    pain_type: r.type,
    notes: r.notes,
  }));

  await supabase.from('pain_regions').insert(regionsData);

  return Response.json({ painMap });
}

// GET - Buscar mapas de dor de um paciente
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const patient_id = searchParams.get('patient_id');

  const { data } = await supabase
    .from('pain_maps')
    .select('*, pain_regions(*)')
    .eq('patient_id', patient_id)
    .order('created_at', { ascending: false });

  return Response.json({ data });
}
```

---

## 📊 Gráfico de Evolução

**Gráfico de linha:**
```typescript
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend } from 'recharts';

export function PainEvolutionChart({ patientId }: { patientId: string }) {
  const [data, setData] = useState([]);

  useEffect(() => {
    // Buscar histórico
    const fetchData = async () => {
      const { data: painMaps } = await supabase
        .from('pain_maps')
        .select('*, pain_regions(*)')
        .eq('patient_id', patientId)
        .order('created_at');

      // Calcular intensidade média por sessão
      const chartData = painMaps.map(pm => ({
        date: new Date(pm.created_at).toLocaleDateString(),
        avgIntensity: pm.pain_regions.reduce((sum, r) => sum + r.intensity, 0) / pm.pain_regions.length,
        maxIntensity: Math.max(...pm.pain_regions.map(r => r.intensity)),
      }));

      setData(chartData);
    };

    fetchData();
  }, [patientId]);

  return (
    <LineChart width={600} height={300} data={data}>
      <XAxis dataKey="date" />
      <YAxis domain={[0, 10]} />
      <Tooltip />
      <Legend />
      <Line type="monotone" dataKey="avgIntensity" stroke="#3B82F6" name="Média" />
      <Line type="monotone" dataKey="maxIntensity" stroke="#EF4444" name="Máxima" />
    </LineChart>
  );
}
```

---

## 📄 Exportação em PDF

```typescript
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export async function exportPainMapToPDF(painMapId: string) {
  // Buscar dados
  const { data: painMap } = await supabase
    .from('pain_maps')
    .select('*, pain_regions(*), patient(*), professional(*)')
    .eq('id', painMapId)
    .single();

  // Criar PDF
  const pdf = new jsPDF();

  // Cabeçalho
  pdf.setFontSize(18);
  pdf.text('Mapa de Dor Corporal', 20, 20);

  pdf.setFontSize(12);
  pdf.text(`Paciente: ${painMap.patient.name}`, 20, 35);
  pdf.text(`Data: ${new Date(painMap.created_at).toLocaleDateString()}`, 20, 45);
  pdf.text(`Profissional: ${painMap.professional.name}`, 20, 55);

  // Capturar imagem do mapa
  const mapElement = document.getElementById('body-map');
  const canvas = await html2canvas(mapElement);
  const imgData = canvas.toDataURL('image/png');

  pdf.addImage(imgData, 'PNG', 20, 70, 170, 150);

  // Legenda
  pdf.setFontSize(10);
  pdf.text('Legenda:', 20, 230);
  pdf.setFillColor(16, 185, 129);
  pdf.rect(20, 235, 5, 5, 'F');
  pdf.text('Sem dor (0-2)', 30, 240);

  pdf.setFillColor(251, 191, 36);
  pdf.rect(20, 245, 5, 5, 'F');
  pdf.text('Dor leve (3-4)', 30, 250);

  pdf.setFillColor(249, 115, 22);
  pdf.rect(20, 255, 5, 5, 'F');
  pdf.text('Dor moderada (5-7)', 30, 260);

  pdf.setFillColor(239, 68, 68);
  pdf.rect(20, 265, 5, 5, 'F');
  pdf.text('Dor intensa (8-10)', 30, 270);

  // Lista de regiões
  pdf.addPage();
  pdf.setFontSize(14);
  pdf.text('Regiões com Dor:', 20, 20);

  let y = 35;
  painMap.pain_regions.forEach((region, i) => {
    pdf.setFontSize(12);
    pdf.text(`${i + 1}. ${region.region_name}`, 20, y);
    pdf.text(`Intensidade: ${region.intensity}/10`, 30, y + 7);
    pdf.text(`Tipo: ${region.pain_type || 'Não especificado'}`, 30, y + 14);
    if (region.notes) {
      pdf.setFontSize(10);
      pdf.text(`Obs: ${region.notes}`, 30, y + 21);
    }
    y += 35;
  });

  // Salvar
  pdf.save(`mapa-dor-${painMap.patient.name}-${new Date().toISOString().split('T')[0]}.pdf`);
}
```

---

## ✅ Critérios de Sucesso

1. ✅ Anatomia realista e profissional
2. ✅ Frente e costas visíveis
3. ✅ Regiões clicáveis (mínimo 30 regiões)
4. ✅ Sistema de cores por intensidade
5. ✅ Modal de registro funcional
6. ✅ Dados salvos no banco
7. ✅ Comparação entre sessões
8. ✅ Gráfico de evolução
9. ✅ Exportação em PDF
10. ✅ Responsivo (mobile e desktop)

---

## 🚀 Plano de Implementação

### Fase 1: MVP (1-2 semanas)
- ✅ SVG do corpo humano (frente e costas)
- ✅ Regiões clicáveis
- ✅ Modal de registro
- ✅ Sistema de cores
- ✅ Salvar no banco

### Fase 2: Melhorias (1 semana)
- ✅ Comparação entre sessões
- ✅ Gráfico de evolução
- ✅ Exportação em PDF

### Fase 3: Avançado (1 semana)
- ✅ Animação de evolução
- ✅ Modo paciente (app)
- ✅ Anotações livres

---

## 📚 Recursos

- [React Body Highlighter](https://github.com/Krisell/react-body-highlighter)
- [SVG Tutorial](https://developer.mozilla.org/en-US/docs/Web/SVG/Tutorial)
- [jsPDF Docs](https://github.com/parallax/jsPDF)
- [html2canvas](https://html2canvas.hertzen.com/)

---

**Tempo estimado:** 3-4 semanas  
**Prioridade:** 🔴 CRÍTICA  
**Impacto:** Melhora profissionalismo e precisão do registro de dor
