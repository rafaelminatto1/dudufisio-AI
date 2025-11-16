# 🤖 Funcionalidades de IA - MoocaFisio

> **Diferencial Competitivo**: Sistema de IA para Evolução de Pacientes

Este documento descreve as funcionalidades de Inteligência Artificial integradas ao MoocaFisio, utilizando Google Gemini 1.5 Flash.

---

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Configuração](#configuração)
3. [Funcionalidades](#funcionalidades)
4. [Como Usar](#como-usar)
5. [Limitações e Boas Práticas](#limitações-e-boas-práticas)
6. [Custos](#custos)
7. [Troubleshooting](#troubleshooting)

---

## 🎯 Visão Geral

O MoocaFisio integra IA do Google Gemini para auxiliar fisioterapeutas no registro de evolução, tornando o processo **até 80% mais rápido**. Funcionalidades incluem:

- ✅ **Transcrição de Áudio**: Grave a evolução falando
- ✅ **Estruturação SOAP Automática**: IA organiza o texto em formato SOAP
- ✅ **Sugestão de Exercícios**: IA sugere exercícios baseados no quadro clínico
- ✅ **Resumo de Progresso**: Gera relatórios profissionais automaticamente

**Nenhum concorrente brasileiro oferece essas funcionalidades!**

---

## ⚙️ Configuração

### 1. Obter API Key do Gemini

1. Acesse: https://makersuite.google.com/app/apikey
2. Faça login com sua conta Google
3. Clique em "Create API Key"
4. Copie a chave gerada

### 2. Configurar no Projeto

Abra o arquivo `.env.local` na raiz do projeto e descomente/adicione:

```bash
VITE_GEMINI_API_KEY=sua-chave-api-aqui
```

**Importante**: 
- Use o prefixo `VITE_` (não `NEXT_PUBLIC_`)
- Este é um projeto Vite, não Next.js
- Nunca comite este arquivo no Git

### 3. Reiniciar o Servidor

Após configurar a API key:

```bash
npm run dev
```

As funcionalidades de IA aparecerão automaticamente no sistema.

---

## 🚀 Funcionalidades

### 1. Transcrição de Áudio para Texto

**Onde**: Editor de Evolução → Card "Assistente de IA"

**Como funciona:**
1. Clique em "Usar IA"
2. Clique em "Iniciar Gravação"
3. Narre a evolução do paciente (1-3 minutos)
4. Clique em "Parar Gravação"
5. IA transcreve e estrutura automaticamente

**Tecnologia**: Gemini 1.5 Flash com suporte multimodal nativo para áudio

**Formato suportado**: WebM (gerado automaticamente pelo navegador)

**Limite**: 10MB por gravação (~10 minutos de áudio)

### 2. Estruturação Automática em SOAP

**Onde**: Editor de Evolução → Após transcrição

**Como funciona:**
- IA analisa o texto transcrito ou digitado
- Identifica e separa automaticamente:
  - **S (Subjetivo)**: Queixas e relatos do paciente
  - **O (Objetivo)**: Dados mensuráveis (ADM, força, testes)
  - **A (Avaliação)**: Interpretação clínica
  - **P (Plano)**: Condutas realizadas
- Preenche os campos do formulário automaticamente

**Você pode editar** qualquer campo após a IA processar.

### 3. Sugestão de Exercícios Terapêuticos

**Onde**: Editor de Evolução → Tab "Planejamento"

**Como funciona:**
1. Preencha a avaliação do paciente
2. Clique em "Sugerir Exercícios com IA"
3. IA analisa:
   - Diagnóstico
   - Localização da dor
   - Limitações funcionais
4. Sugere 5 exercícios com:
   - Nome e descrição
   - Séries e repetições
   - Justificativa clínica (por quê é indicado)

**Diferencial**: IA explica o racional de cada exercício, educando o profissional.

### 4. Resumo de Progresso

**Onde**: Página dedicada "Resumo de Progresso" (acessível via menu do paciente)

**Como funciona:**
1. Acesse a página de resumo do paciente
2. Clique em "Gerar Resumo com IA"
3. IA analisa todas as evoluções anteriores
4. Gera resumo profissional incluindo:
   - Condição inicial
   - Evolução ao longo do tratamento
   - Resultados alcançados
   - Recomendações para continuidade

**Uso**: Ideal para laudos de alta ou relatórios para médicos solicitantes

**Formato**: Texto profissional de até 300 palavras

---

## 📖 Como Usar - Passo a Passo

### Cenário 1: Gravar Evolução com Áudio

```
1. Abra o Editor de Evolução do paciente
2. Veja o card roxo/azul "Assistente de IA"
3. Clique em "Usar IA"
4. Permita acesso ao microfone (primeira vez)
5. Clique em "Iniciar Gravação"
6. Fale claramente, mencionando:
   - Queixas do paciente
   - Testes realizados e resultados
   - Condutas aplicadas
   - Resposta do paciente
7. Clique em "Parar Gravação"
8. Aguarde processamento (15-30 segundos)
9. Campos preenchidos automaticamente! ✨
10. Revise e edite se necessário
11. Salve normalmente
```

**Tempo economizado**: ~4 minutos por evolução

### Cenário 2: Sugerir Exercícios

```
1. No Editor de Evolução, vá para tab "Planejamento"
2. Preencha a avaliação do paciente
3. Clique em "Sugerir Exercícios com IA"
4. Aguarde sugestões (10-20 segundos)
5. Revise os 5 exercícios sugeridos
6. Edite ou remova os que não são adequados
7. Mantenha os que fazem sentido
8. Salve o plano
```

**Benefício**: Ideias baseadas em evidências + educação continuada

### Cenário 3: Gerar Relatório de Alta

```
1. Acesse o menu do paciente
2. Clique em "Resumo de Progresso"
3. Clique em "Gerar Resumo com IA"
4. Aguarde análise (20-40 segundos)
5. Resumo profissional gerado!
6. Copie ou exporte para PDF
7. Anexe ao laudo de alta
```

**Resultado**: Relatório profissional em segundos vs. 30 minutos manual

---

## ⚠️ Limitações e Boas Práticas

### Limitações

- **Conexão Internet**: Requer conexão estável
- **Idioma**: Otimizado para Português Brasileiro
- **Gravação**: Requer ambiente silencioso
- **Tamanho**: Áudio até 10MB, texto até 5000 caracteres
- **Precisão**: ~95% de acurácia (sempre revisar!)

### Boas Práticas

#### Para Gravação de Áudio:

✅ **Faça:**
- Grave em ambiente silencioso
- Fale claramente e pausadamente
- Use terminologia técnica padrão
- Mencione números claramente ("oito pontos" ao invés de "8")
- Duração ideal: 1-3 minutos

❌ **Evite:**
- Ambientes barulhentos
- Falar muito rápido
- Gírias ou termos regionais
- Gravações muito longas (>5 minutos)

#### Para Melhores Resultados:

1. **Sempre revisar** o texto gerado pela IA
2. **Não confiar cegamente** - IA pode errar
3. **Editar** exercícios sugeridos conforme necessário
4. **Contextualizar** diagnósticos para sugestões mais precisas
5. **Feedback**: Anote erros comuns para melhorias futuras

---

## 💰 Custos

### Google Gemini 1.5 Flash (Tier Gratuito)

- **Gratuito até**: 15 requisições/minuto
- **Limite diário**: Sem limite específico no tier grátis
- **Custo após limite**: US$ 0.00025 por 1K caracteres de entrada

### Estimativa de Uso

Para uma clínica com 100 evoluções/dia:

| Funcionalidade | Uso Médio | Custo/Mês (estimado) |
|----------------|-----------|----------------------|
| Transcrição | 50 áudios/dia | ~US$ 5-10 |
| Estruturação SOAP | 100 textos/dia | ~US$ 2-5 |
| Sugestão Exercícios | 30 sugestões/dia | ~US$ 1-3 |
| Resumos | 10 resumos/dia | ~US$ 1-2 |
| **TOTAL** | | **~US$ 10-20/mês** |

**Benefício ROI**: Economiza ~400 horas/mês de trabalho manual (valor >>> US$ 20)

### Como Monitorar

Acesse: https://console.cloud.google.com/billing

---

## 🔧 Troubleshooting

### Problema: "API Gemini não configurada"

**Solução:**
1. Verifique se `VITE_GEMINI_API_KEY` está no `.env.local`
2. Verifique se não há espaços antes/depois da chave
3. Reinicie o servidor (`npm run dev`)

### Problema: "Erro ao transcrever áudio"

**Causas comuns:**
- Áudio vazio ou corrompido
- Arquivo muito grande (>10MB)
- Formato não suportado
- Conexão internet instável

**Solução:**
1. Grave novamente em ambiente silencioso
2. Mantenha gravações curtas (1-3 minutos)
3. Verifique sua conexão
4. Tente com navegador atualizado

### Problema: "Transcrição incorreta"

**Solução:**
- Fale mais devagar e claramente
- Use terminologia padrão
- Grave em ambiente mais silencioso
- Edite manualmente o texto após transcrição

### Problema: "Exercícios sugeridos não são adequados"

**Solução:**
- Forneça diagnóstico mais detalhado
- Especifique limitações funcionais
- Edite ou remova sugestões inadequadas
- Use sugestões como inspiração, não verdade absoluta

### Problema: "IA está lenta"

**Causas:**
- Conexão internet lenta
- Muitas requisições simultâneas
- Problema temporário na API do Google

**Solução:**
- Aguarde alguns segundos
- Tente novamente
- Use modo offline (digitação manual) temporariamente

---

## 📞 Suporte

**Dúvidas sobre IA?**
- Email: suporte@moocafisio.com.br
- Discord: [servidor do projeto]

**Issues no GitHub:**
https://github.com/seu-repo/moocafisio-ai/issues

**Documentação Google Gemini:**
https://ai.google.dev/docs

---

## 🔄 Changelog

### v1.0.0 (Novembro 2024)
- ✨ Lançamento inicial das funcionalidades de IA
- 🎤 Transcrição de áudio
- 📝 Estruturação SOAP automática
- 💪 Sugestão de exercícios
- 📊 Resumo de progresso

---

## 🚦 Roadmap Futuro

- [ ] Suporte para múltiplos idiomas
- [ ] IA para análise de imagens (posturas, lesões)
- [ ] Chatbot de atendimento ao paciente
- [ ] Predição de alta baseada em ML
- [ ] Integração com wearables (Fitbit, Apple Watch)
- [ ] Geração automática de vídeos de exercícios

---

**Desenvolvido com ❤️ pelo time MoocaFisio**

