# 🏥 Sistema de Conteúdo Clínico - DuduFisio AI

## 📋 Visão Geral

Este sistema gera automaticamente conteúdos clínicos para popular o sistema DuduFisio-AI com protocolos, exercícios, avaliações e materiais educacionais baseados nas melhores práticas de fisioterapia.

**Baseado em:** Análise do site Activity Fisioterapia (activityfisioterapia.com.br)

**Tecnologias:** Google Gemini API + Imagen 3 (Banana) para geração de imagens

## 🎯 Conteúdos Gerados

### 1. Protocolos Clínicos (6 protocolos)
- ✅ **Fisioterapia Esportiva**
  - Protocolo de Prevenção de Lesões em Atletas
  - Protocolo de Reabilitação de Lesão de LCA
  
- ✅ **Fisioterapia Pós-Operatória**
  - Protocolo de Reabilitação Pós-Artroplastia Total de Joelho
  - Protocolo de Reabilitação Pós-Reparo do Manguito Rotador
  
- ✅ **Fisioterapia Gerontológica**
  - Programa de Prevenção de Quedas em Idosos
  - Protocolo de Manutenção de Autonomia e Qualidade de Vida

### 2. Biblioteca de Exercícios (7 exercícios detalhados)
- Agachamento Unipodal
- Nordic Hamstring
- Deslizamento de Calcanhar
- Elevação do Braço com Bastão
- Sentar e Levantar de Cadeira
- Marcha Tandem
- Elevação de Panturrilha

### 3. Avaliações Especializadas (2 avaliações)
- Avaliação Funcional Esportiva
- Avaliação Geriátrica de Risco de Quedas

### 4. Materiais Clínicos (3 materiais)
- Guideline de Reabilitação Pós-Cirúrgica de LCA
- Formulário de Avaliação Inicial
- Orientações para Prevenção de Quedas

### 5. Biblioteca Clínica (1 artigo)
- Diretrizes para Retorno ao Esporte Após Lesão de LCA

### 6. Conteúdo Educacional (1 guia)
- Guia do Paciente: O que Esperar da Fisioterapia Após Cirurgia de Joelho

## 🚀 Como Usar

### Pré-requisitos

1. **API Key do Google Gemini configurada**
   ```bash
   # Criar arquivo .env.local na raiz do projeto
   echo "VITE_GEMINI_API_KEY=AIzaSyDc5vZXFRAlU18dl1Bk9K2NT-BS8GmuLtM" > .env.local
   ```

2. **Dependências instaladas**
   ```bash
   npm install
   ```

### Executar o Gerador

#### Opção 1: Comando NPM (Recomendado)
```bash
npm run generate:clinical-content
```

#### Opção 2: Executar Script Diretamente
```bash
node scripts/run-clinical-content-generator.js
```

#### Opção 3: Usando TypeScript
```bash
npx tsx scripts/populate-clinical-content.ts
```

### Saída

O script gera um arquivo JSON completo em:
```
public/clinical-content/clinical-content-complete.json
```

Este arquivo contém todos os conteúdos estruturados e prontos para serem importados no sistema.

## 📊 Estrutura dos Dados

```typescript
{
  "protocols": ClinicalProtocol[],      // Protocolos clínicos
  "exercises": Exercise[],              // Exercícios
  "assessments": SpecializedAssessment[], // Avaliações
  "materials": ClinicalMaterial[],      // Materiais
  "library": ClinicalLibraryItem[],     // Biblioteca
  "educational": EducationalContent[],  // Educacional
  "metadata": {
    "generatedAt": "ISO Date",
    "totalProtocols": number,
    // ... estatísticas
  }
}
```

## 🖼️ Geração de Imagens

### Status Atual

O sistema está **preparado** para gerar imagens com Google Imagen 3 (Banana), mas atualmente gera:
- ✅ **Prompts otimizados** para cada imagem necessária
- ✅ **Placeholders SVG** enquanto a API Imagen 3 não está disponível

### Quando a API Imagen 3 estiver disponível

Os prompts já estão otimizados e salvos. Basta:
1. Ativar a API Imagen 3 no Google AI Studio
2. O serviço `imagenService.ts` automaticamente usará a API
3. As imagens reais substituirão os placeholders

### Tipos de Imagens Geradas

- **Protocolos:** Ilustrações de fases e procedimentos
- **Exercícios:** 3 ângulos (início, meio, fim)
- **Avaliações:** Demonstrações de testes
- **Materiais:** Infográficos educacionais

## 🔧 Integração com o Sistema

### 1. Importar Conteúdos

```typescript
import {
  getClinicalProtocols,
  getExercises,
  getAssessments
} from './scripts/integrate-clinical-content-to-db';

// Usar no seu componente ou serviço
const protocols = getClinicalProtocols();
```

### 2. Filtrar por Especialidade

```typescript
import { getContentBySpecialty } from './scripts/integrate-clinical-content-to-db';

// Obter todo conteúdo de fisioterapia esportiva
const esportivaContent = getContentBySpecialty('esportiva');
```

### 3. Buscar por Tags

```typescript
import { searchByTags } from './scripts/integrate-clinical-content-to-db';

// Buscar conteúdos relacionados a joelho
const joelhoContent = searchByTags(['joelho', 'LCA']);
```

## 📄 Arquivos Principais

```
scripts/
├── generate-clinical-content.ts          # Protocolos clínicos
├── generate-exercises.ts                 # Biblioteca de exercícios
├── generate-assessments-materials.ts     # Avaliações e materiais
├── populate-clinical-content.ts          # Script principal (gera imagens)
├── integrate-clinical-content-to-db.ts   # Funções de integração
└── run-clinical-content-generator.js     # Executor simples

services/ai/
└── imagenService.ts                      # Serviço de geração de imagens

types/
└── clinicalContent.ts                    # Tipos TypeScript
```

## 🎓 Especialidades Cobertas

### ⚽ Fisioterapia Esportiva
- Prevenção e tratamento de lesões esportivas
- Reabilitação de atletas
- Protocolos de retorno ao esporte
- Avaliações funcionais

### 🏥 Fisioterapia Pós-Operatória
- Recuperação de cirurgias ortopédicas (joelho, ombro, quadril, coluna)
- Fases da reabilitação
- Orientações para médicos parceiros
- Progressão baseada em critérios

### 👴 Fisioterapia Gerontológica
- Cuidados para idosos
- Prevenção de quedas
- Manutenção de autonomia
- Qualidade de vida

## 📈 Estatísticas

```
Total de Conteúdos: 20+ itens
├── 6 Protocolos Clínicos
├── 7 Exercícios Detalhados
├── 2 Avaliações Especializadas
├── 3 Materiais Clínicos
├── 1 Item de Biblioteca
└── 1 Conteúdo Educacional

Prompts de Imagem: 50+ otimizados e prontos
```

## 🔑 Configuração da API Key

A API key fornecida já está no código:
```
AIzaSyDc5vZXFRAlU18dl1Bk9K2NT-BS8GmuLtM
```

**⚠️ Nota de Segurança:** Em produção, mova esta key para variáveis de ambiente e não commite no Git.

## 🆘 Solução de Problemas

### Erro: "API key não configurada"
```bash
# Criar .env.local com a key
echo "VITE_GEMINI_API_KEY=AIzaSyDc5vZXFRAlU18dl1Bk9K2NT-BS8GmuLtM" > .env.local
```

### Erro: "Module not found"
```bash
# Instalar dependências
npm install

# Verificar se @google/generative-ai está instalado
npm list @google/generative-ai
```

### Erro ao executar script
```bash
# Usar npx para executar TypeScript
npx tsx scripts/populate-clinical-content.ts
```

## 🎯 Próximos Passos

1. ✅ **Revisar Conteúdos**
   - Abrir `public/clinical-content/clinical-content-complete.json`
   - Verificar qualidade dos conteúdos gerados

2. ✅ **Testar no Sistema**
   - Importar funções de integração
   - Criar páginas para exibir conteúdos

3. ⏳ **Aguardar API Imagen 3**
   - Quando disponível, imagens reais serão geradas
   - Prompts já estão otimizados

4. 🔄 **Expandir Conteúdo**
   - Adicionar mais protocolos
   - Expandir biblioteca de exercícios
   - Criar mais materiais educacionais

## 📞 Suporte

Para dúvidas ou problemas:
1. Verificar este README
2. Revisar comentários no código
3. Consultar documentação do Google Gemini API

## 📝 Changelog

### v1.0.0 (Atual)
- ✅ Sistema completo de geração de conteúdo
- ✅ 6 protocolos clínicos detalhados
- ✅ 7 exercícios com variações
- ✅ Avaliações especializadas
- ✅ Materiais clínicos prontos
- ✅ Integração com Google Gemini
- ✅ Preparação para Imagen 3
- ✅ Baseado em análise real da Activity Fisioterapia

---

**Desenvolvido para:** DuduFisio-AI  
**Baseado em:** Activity Fisioterapia (activityfisioterapia.com.br)  
**Tecnologia:** Google Gemini API + Imagen 3 (Banana)  
**Data:** Outubro 2024

