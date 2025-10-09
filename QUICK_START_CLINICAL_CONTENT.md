# 🚀 GUIA RÁPIDO - Conteúdo Clínico

## ⚡ Início Rápido (3 minutos)

### 1. Gerar Conteúdo
```bash
npm run generate:clinical-content
```

### 2. Ver Resultado
```
📁 public/clinical-content/clinical-content-complete.json
```

### 3. Usar no Sistema
```typescript
import { getClinicalProtocols } from './scripts/integrate-clinical-content-to-db';
const protocols = getClinicalProtocols();
```

---

## 📋 O que Foi Gerado?

### ✅ 6 Protocolos Clínicos Completos

**Fisioterapia Esportiva:**
- Prevenção de Lesões em Atletas (4 fases, 10-15 semanas)
- Reabilitação de LCA (5 fases, 9-12 meses)

**Fisioterapia Pós-Operatória:**
- Artroplastia Total de Joelho (4 fases, 12+ semanas)
- Reparo do Manguito Rotador (4 fases, 6+ meses)

**Fisioterapia Gerontológica:**
- Prevenção de Quedas (5 fases, 12-16 semanas)
- Manutenção de Autonomia (3 fases, contínuo)

### ✅ 7 Exercícios Detalhados

- Agachamento Unipodal (+ 3 variações)
- Nordic Hamstring (+ 3 variações)
- Deslizamento de Calcanhar (+ 3 variações)
- Elevação do Braço com Bastão (+ 3 variações)
- Sentar e Levantar de Cadeira (+ 4 variações)
- Marcha Tandem (+ 4 variações)
- Elevação de Panturrilha (+ 4 variações)

Cada exercício inclui:
- Instruções passo a passo
- Objetivos
- Contraindicações
- Erros comuns
- Benefícios
- Músculos trabalhados

### ✅ 2 Avaliações Especializadas

- Avaliação Funcional Esportiva (hop tests, força, agilidade)
- Avaliação Geriátrica de Risco de Quedas (Berg, TUG, força)

### ✅ 3 Materiais Clínicos

- Guideline de Reabilitação Pós-LCA
- Formulário de Avaliação Inicial
- Orientações para Prevenção de Quedas

### ✅ Conteúdo Educacional

- Guia do Paciente: Fisioterapia Após Cirurgia de Joelho

---

## 🎯 Como Usar

### Opção 1: Importar Diretamente

```typescript
// Importar funções
import {
  getClinicalProtocols,
  getExercises,
  getContentBySpecialty
} from './scripts/integrate-clinical-content-to-db';

// Usar protocolos
const protocols = getClinicalProtocols();

// Filtrar por especialidade
const esportivaContent = getContentBySpecialty('esportiva');

// Buscar por tags
import { searchByTags } from './scripts/integrate-clinical-content-to-db';
const joelhoContent = searchByTags(['joelho', 'LCA']);
```

### Opção 2: Carregar do JSON

```typescript
const response = await fetch('/clinical-content/clinical-content-complete.json');
const data = await response.json();

const protocols = data.protocols;
const exercises = data.exercises;
```

### Opção 3: Página de Demonstração

```typescript
// Já criada em: pages/ClinicalContentPage.tsx
// Adicione à rota do sistema
import ClinicalContentPage from './pages/ClinicalContentPage';
```

---

## 🖼️ Sobre as Imagens

### Status Atual
✅ Prompts otimizados gerados  
✅ Placeholders SVG criados  
⏳ Aguardando API Imagen 3

### Quando Usar Imagen 3

Quando a API estiver disponível:
1. As imagens serão geradas automaticamente
2. Os prompts já estão otimizados
3. Nenhuma mudança de código necessária

### Tipos de Imagens

- **Protocolos:** 1-4 imagens por protocolo
- **Exercícios:** 3 imagens por exercício (início, meio, fim)
- **Avaliações:** 1-3 imagens por avaliação

---

## 📊 Estatísticas

```
Total de Conteúdos: 20+ itens
├── 6 Protocolos (com 20+ fases no total)
├── 7 Exercícios (com 21 variações)
├── 2 Avaliações (com 10 procedimentos)
├── 3 Materiais Clínicos
├── 1 Item de Biblioteca
└── 1 Conteúdo Educacional

Prompts de Imagem: 50+ otimizados
Palavras: ~25,000+
Referências Científicas: 15+
```

---

## 🔑 Comandos Úteis

```bash
# Gerar conteúdo completo
npm run generate:clinical-content

# Alternativa com node
npm run clinical:generate

# Ver sistema funcionando
npm run dev
```

---

## 📖 Estrutura de Dados

### Protocolo Clínico
```typescript
{
  id: string
  title: string
  specialty: 'esportiva' | 'pos-operatoria' | 'geriatrica'
  description: string
  summary: string
  objectives: string[]
  phases: Phase[]
  duration: string
  frequency: string
  evidenceLevel: 'A' | 'B' | 'C' | 'D'
  references: string[]
  images: Image[]
  tags: string[]
}
```

### Exercício
```typescript
{
  id: string
  name: string
  specialty: Specialty[]
  category: 'mobilidade' | 'fortalecimento' | 'equilibrio' | ...
  bodyParts: BodyPart[]
  instructions: Instruction[]
  difficulty: 'iniciante' | 'intermediario' | 'avancado'
  variations: Variation[]
  images: Image[]
  // ... mais campos
}
```

---

## 🎓 Baseado em Evidências

Todos os conteúdos são baseados em:

✅ **Activity Fisioterapia** (activityfisioterapia.com.br)  
✅ **Evidências Científicas** (15+ referências)  
✅ **Melhores Práticas** da fisioterapia  
✅ **Protocolos Validados** internacionalmente

---

## 🆘 Troubleshooting

### Erro: "Cannot find module"
```bash
npm install
```

### Erro: "API key not found"
API key já está configurada no código!

### Quer adicionar mais conteúdo?
Edite:
- `scripts/generate-clinical-content.ts` (protocolos)
- `scripts/generate-exercises.ts` (exercícios)
- `scripts/generate-assessments-materials.ts` (avaliações e materiais)

---

## 🎯 Próximos Passos

1. ✅ **Revisar** conteúdos gerados
2. ✅ **Integrar** no sistema
3. ✅ **Testar** funcionalidades
4. ⏳ **Aguardar** API Imagen 3
5. 🔄 **Expandir** biblioteca de conteúdos

---

## 📞 Suporte

**Documentação Completa:**  
📄 `CLINICAL_CONTENT_README.md`

**Arquivos Principais:**
```
scripts/
├── populate-clinical-content.ts      # Script principal
├── integrate-clinical-content-to-db.ts # Funções de uso
└── generate-*.ts                     # Geradores

services/ai/
└── imagenService.ts                  # Serviço de imagens

pages/
└── ClinicalContentPage.tsx           # Página de demo

types/
└── clinicalContent.ts                # Tipos TypeScript
```

---

**🚀 Pronto para usar! Execute: `npm run generate:clinical-content`**

