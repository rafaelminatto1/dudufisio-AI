# 🚀 Como Usar o Gerador de Vídeos com IA

## ⚡ Quick Start (3 passos)

### 1️⃣ Acesse a página
```
http://localhost:5173/free-video-generator
```
Ou pelo menu: **Clínico → Gerador de Vídeos**

### 2️⃣ Preencha o formulário
- **Nome do Exercício:** Ex: "Agachamento com rotação"
- **Modalidade:** Escolha entre Jiu-Jitsu, Muay Thai, Boxing, Wrestling, Fisioterapia
- **Motor IA:** Escolha CapCut AI, Hyper AI ou Sora 2

### 3️⃣ Clique em "Gerar Vídeo Personalizado com IA"
- Aguarde 2-5 minutos
- Acompanhe o progresso e mensagens
- Veja o vídeo gerado!

---

## 💾 Salvar o Vídeo

Quando o vídeo estiver pronto:

1. Clique em **"💾 Salvar e Anexar a um Exercício"**
2. Preencha as informações adicionais no modal:
   - Nome do exercício
   - Categoria (Mobilidade, Fortalecimento, etc.)
   - Dificuldade (Iniciante, Intermediário, Avançado)
   - Descrição
   - Instruções (uma por linha)
   - Músculos alvo
   - Equipamento necessário
3. Clique em **"Salvar Exercício"**
4. Pronto! O vídeo está salvo na biblioteca

---

## 📚 Onde encontrar os vídeos salvos?

Acesse: **`/exercise-library`** (menu: Clínico → Biblioteca de Exercícios)

Os vídeos terão as tags:
- 🏷️ `gerado-ia`
- 🏷️ `veo-2.0`
- 🏷️ A modalidade escolhida

---

## ⏱️ Tempo de Geração

**Normal:** 2-5 minutos

Durante a geração, você verá mensagens como:
- 🧠 Aquecendo a IA...
- 📝 Analisando prompt...
- 🎬 Renderizando frames...
- ✨ Finalizando vídeo...

---

## 🎯 Dicas para Melhores Resultados

### Nome do Exercício
✅ **BOM:** "Agachamento com rotação de tronco"  
✅ **BOM:** "Flexão de joelho em decúbito lateral"  
✅ **BOM:** "Ponte com elevação unilateral"  

❌ **EVITE:** Nomes muito genéricos como "exercício 1"  
❌ **EVITE:** Nomes muito complexos com muitos detalhes

### Modalidade
Escolha a modalidade mais adequada:
- **Fisioterapia:** Para exercícios terapêuticos
- **Jiu-Jitsu:** Para técnicas de luta no chão
- **Muay Thai:** Para golpes de striking
- **Boxing:** Para técnicas de boxe
- **Wrestling:** Para técnicas de luta olímpica

---

## ❗ O que fazer se der erro?

### Erro durante geração:
1. Verifique sua conexão com internet
2. Tente novamente (clique em "Gerar Vídeo" novamente)
3. Se persistir, tente com outro nome de exercício

### Vídeo não aparece:
1. Aguarde o tempo total (2-5 minutos)
2. Não feche a aba do navegador
3. Verifique se há mensagem de erro no topo da página

### Erro ao salvar:
1. Verifique se preencheu o nome do exercício
2. Tente novamente clicando em "Salvar Exercício"

---

## 🔄 Gerar Outro Vídeo

Depois de ver o primeiro vídeo, você tem 3 opções:

1. **💾 Salvar e Anexar** - Salva o vídeo na biblioteca
2. **🔄 Gerar Novo** - Gera outro vídeo do mesmo exercício
3. **✅ Continuar** - Vai para próxima tela sem salvar

---

## 📱 Usando os Vídeos Salvos

Os vídeos salvos podem ser usados em:

✅ **Protocolos de Tratamento**  
✅ **Prescrições de Exercícios**  
✅ **Planos de Tratamento Domiciliar (HEP)**  
✅ **Biblioteca de Exercícios**  
✅ **Materiais Educativos para Pacientes**

---

## 🎬 Exemplo Prático

```
1. Acesse: /free-video-generator

2. Preencha:
   Nome: "Agachamento isométrico"
   Modalidade: Fisioterapia
   Motor IA: CapCut AI

3. Clique: "Gerar Vídeo Personalizado com IA"

4. Aguarde: 2-5 minutos (acompanhe o progresso)

5. Veja: Vídeo do exercício gerado

6. Salve:
   - Clique "Salvar e Anexar a um Exercício"
   - Nome: Agachamento Isométrico
   - Categoria: Fortalecimento
   - Dificuldade: Intermediário
   - Descrição: Exercício para fortalecimento de MMII
   - Instruções:
     * Posicione-se em pé com pés afastados
     * Flexione joelhos a 90 graus
     * Mantenha posição por 30 segundos
     * Retorne lentamente
   - Músculos: quadríceps, glúteos
   - Equipamento: nenhum
   - Clique "Salvar Exercício"

7. Pronto! Exercício salvo e disponível na biblioteca
```

---

## ⚙️ Configurações Técnicas

### API Utilizada
- **Modelo:** Gemini Veo 2.0
- **Código:** `veo-2.0-generate-001`
- **Qualidade:** HD 1080p
- **Duração:** ~10 segundos

### Armazenamento
- Vídeos são criados como blob URLs (temporários)
- Para uso permanente, serão movidos para cloud storage em update futuro

---

## 📖 Documentação Completa

Para mais detalhes técnicos, consulte:
- `GEMINI_VEO_IMPLEMENTATION.md` - Documentação técnica completa
- `🎉_GEMINI_VEO_COMPLETO.md` - Resumo da implementação

---

## 🎉 Aproveite!

O sistema está pronto para gerar vídeos personalizados usando IA de última geração!

**Qualquer dúvida, consulte a documentação ou o código-fonte.**

---

**Status:** ✅ Funcional e Pronto para Uso  
**Última Atualização:** 2025-01-09

