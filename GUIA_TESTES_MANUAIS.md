# 🧪 Guia de Testes Manuais - PWA e Acessibilidade

**Data:** 19 de Janeiro de 2025  
**URL de Produção:** https://dudufisio-7hrx191bg-rafael-minattos-projects.vercel.app  
**Status:** ⏸️ Testes Manuais Pendentes

---

## 📋 Checklist de Testes

### ✅ Testes Automatizados (Concluídos)
- [x] Deploy em produção
- [x] Build de produção
- [x] Lighthouse Performance
- [x] Lighthouse Accessibility
- [x] Lighthouse PWA
- [x] Lighthouse Best Practices

### ⏸️ Testes Manuais (Pendentes)
- [ ] PWA Installation
- [ ] PWA Offline Support
- [ ] PWA Manifest Validation
- [ ] Keyboard Navigation
- [ ] Screen Reader
- [ ] Contrast Ratios

---

## 🚀 Teste 1: PWA Installation

### Objetivo
Verificar se o app pode ser instalado como PWA no dispositivo.

### Passos

#### 1.1 Abrir a Aplicação
```
URL: https://dudufisio-7hrx191bg-rafael-minattos-projects.vercel.app
```

#### 1.2 Verificar Manifest (Chrome)
1. Abrir Chrome DevTools (F12)
2. Ir para aba **Application**
3. Clicar em **Manifest** no menu lateral
4. Verificar:
   - ✅ Nome: "Activity Fisioterapia - Gestão Completa"
   - ✅ Short Name: "Activity Fisio"
   - ✅ Icons: 192x192, 512x512, 180x180, 32x32
   - ✅ Theme Color: #00C8FF
   - ✅ Display: standalone

**Resultado Esperado:**
```
✅ Manifest válido
✅ Todos os ícones carregam
✅ Theme color configurado
```

#### 1.3 Testar Install Prompt (Chrome Desktop)
1. Abrir a aplicação no Chrome
2. Aguardar alguns segundos
3. Verificar se aparece um ícone de instalação na barra de endereços
4. Clicar no ícone
5. Verificar se aparece o prompt "Instalar Activity Fisio"

**Resultado Esperado:**
```
✅ Install prompt aparece
✅ Ícone de instalação visível
✅ Prompt mostra nome correto
```

#### 1.4 Instalar PWA (Chrome Desktop)
1. Clicar em "Instalar" no prompt
2. Aguardar instalação
3. Verificar se o app abre em janela standalone
4. Verificar se o ícone aparece na área de trabalho

**Resultado Esperado:**
```
✅ App instala com sucesso
✅ Abre em janela standalone
✅ Ícone aparece na área de trabalho
✅ Título da janela: "Activity Fisio"
```

#### 1.5 Testar Install Prompt (Mobile Chrome)
1. Abrir a aplicação no Chrome Mobile (Android)
2. Aguardar alguns segundos
3. Verificar se aparece banner "Adicionar à tela inicial"
4. Clicar em "Adicionar"

**Resultado Esperado:**
```
✅ Banner aparece
✅ App adiciona à tela inicial
✅ Ícone aparece na tela inicial
```

#### 1.6 Testar Install Prompt (Safari iOS)
1. Abrir a aplicação no Safari (iOS)
2. Clicar no botão de compartilhar
3. Verificar se aparece "Adicionar à Tela de Início"
4. Clicar em "Adicionar à Tela de Início"

**Resultado Esperado:**
```
✅ Opção "Adicionar à Tela de Início" aparece
✅ App adiciona à tela inicial
✅ Ícone aparece na tela inicial
```

---

## 📱 Teste 2: PWA Offline Support

### Objetivo
Verificar se o app funciona offline após instalação.

### Passos

#### 2.1 Verificar Service Worker (Chrome)
1. Abrir Chrome DevTools (F12)
2. Ir para aba **Application**
3. Clicar em **Service Workers** no menu lateral
4. Verificar:
   - ✅ Service Worker está registrado
   - ✅ Status: "activated and is running"
   - ✅ Cache: "activity-fisio-v1.0.0"

**Resultado Esperado:**
```
✅ Service Worker ativo
✅ Cache configurado
✅ Status: activated and running
```

#### 2.2 Testar Modo Offline (Chrome)
1. Abrir Chrome DevTools (F12)
2. Ir para aba **Network**
3. Marcar checkbox "Offline"
4. Recarregar a página (F5)
5. Verificar se o app carrega offline

**Resultado Esperado:**
```
✅ App carrega offline
✅ Conteúdo está visível
✅ Mensagem de offline aparece (se aplicável)
```

#### 2.3 Testar Cache (Chrome)
1. Abrir Chrome DevTools (F12)
2. Ir para aba **Application**
3. Clicar em **Cache Storage** no menu lateral
4. Verificar se existem caches:
   - ✅ activity-fisio-v1.0.0
   - ✅ activity-fisio-api-v1.0.0

**Resultado Esperado:**
```
✅ Caches criados
✅ Recursos em cache
✅ API cache configurado
```

#### 2.4 Testar Offline no Mobile
1. Desconectar WiFi/dados móveis
2. Abrir o app instalado
3. Verificar se o app funciona offline

**Resultado Esperado:**
```
✅ App funciona offline
✅ Conteúdo está visível
✅ Navegação funciona
```

---

## ♿ Teste 3: Acessibilidade - Keyboard Navigation

### Objetivo
Verificar se todos os elementos são navegáveis via teclado.

### Passos

#### 3.1 Testar Tab Navigation
1. Abrir a aplicação
2. Pressionar **Tab** repetidamente
3. Verificar se o foco navega por todos os elementos interativos:
   - ✅ Links
   - ✅ Botões
   - ✅ Inputs
   - ✅ Checkboxes
   - ✅ Radio buttons
   - ✅ Selects

**Resultado Esperado:**
```
✅ Todos os elementos são focáveis
✅ Ordem lógica de navegação
✅ Indicador visual de foco visível
```

#### 3.2 Testar Skip Links
1. Abrir a aplicação
2. Pressionar **Tab** imediatamente
3. Verificar se aparece o skip link "Pular para conteúdo principal"
4. Pressionar **Enter**
5. Verificar se o foco vai para o conteúdo principal

**Resultado Esperado:**
```
✅ Skip link aparece no foco
✅ Funcional
✅ Redireciona para conteúdo principal
```

#### 3.3 Testar Modais
1. Abrir um modal (ex: criar agendamento)
2. Pressionar **Tab** repetidamente
3. Verificar se o foco fica dentro do modal
4. Pressionar **Escape**
5. Verificar se o modal fecha

**Resultado Esperado:**
```
✅ Foco fica dentro do modal
✅ Tab não sai do modal
✅ Escape fecha o modal
```

#### 3.4 Testar Enter/Space
1. Navegar com **Tab** até um botão
2. Pressionar **Enter**
3. Verificar se o botão é ativado
4. Navegar até outro botão
5. Pressionar **Space**
6. Verificar se o botão é ativado

**Resultado Esperado:**
```
✅ Enter ativa botões
✅ Space ativa botões
✅ Funcionalidade preservada
```

#### 3.5 Testar Arrow Keys
1. Navegar até uma lista (ex: lista de pacientes)
2. Pressionar **Arrow Up/Down**
3. Verificar se a navegação funciona

**Resultado Esperado:**
```
✅ Arrow keys funcionam
✅ Navegação por lista funcional
```

---

## 🎙️ Teste 4: Acessibilidade - Screen Reader

### Objetivo
Verificar se o app é acessível para usuários de screen readers.

### Passos

#### 4.1 Testar com NVDA (Windows)
1. Instalar NVDA: https://www.nvaccess.org/
2. Abrir a aplicação
3. Pressionar **Insert+Q** para iniciar NVDA
4. Navegar com **Tab** e **Arrow keys**
5. Verificar se o screen reader anuncia:
   - ✅ Nome dos elementos
   - ✅ Tipo de elemento (botão, link, etc.)
   - ✅ Estado do elemento (selecionado, desabilitado, etc.)
   - ✅ Valores dos inputs

**Resultado Esperado:**
```
✅ Screen reader anuncia elementos
✅ Nomes descritivos
✅ Tipos corretos
✅ Estados corretos
```

#### 4.2 Testar com JAWS (Windows)
1. Instalar JAWS: https://www.freedomscientific.com/
2. Abrir a aplicação
3. Iniciar JAWS
4. Navegar com **Tab** e **Arrow keys**
5. Verificar se o screen reader anuncia corretamente

**Resultado Esperado:**
```
✅ Screen reader anuncia elementos
✅ Nomes descritivos
✅ Tipos corretos
```

#### 4.3 Testar com VoiceOver (Mac/iOS)
1. Ativar VoiceOver: **Cmd+F5**
2. Abrir a aplicação
3. Navegar com **VO+Arrow keys**
4. Verificar se o screen reader anuncia corretamente

**Resultado Esperado:**
```
✅ Screen reader anuncia elementos
✅ Nomes descritivos
✅ Tipos corretos
```

#### 4.4 Testar com TalkBack (Android)
1. Ativar TalkBack: Configurações > Acessibilidade > TalkBack
2. Abrir a aplicação
3. Navegar deslizando para esquerda/direita
4. Verificar se o screen reader anuncia corretamente

**Resultado Esperado:**
```
✅ Screen reader anuncia elementos
✅ Nomes descritivos
✅ Tipos corretos
```

#### 4.5 Testar LoadingAnnouncer
1. Abrir uma página com loading (ex: Dashboard)
2. Aguardar o carregamento
3. Verificar se o screen reader anuncia "Carregando dados..."

**Resultado Esperado:**
```
✅ Screen reader anuncia loading
✅ Mensagem clara
✅ Aparece apenas durante loading
```

---

## 🎨 Teste 5: Acessibilidade - Contrast Ratios

### Objetivo
Verificar se os contrastes de cor atendem WCAG 2.1 AA.

### Passos

#### 5.1 Testar com WebAIM Contrast Checker
1. Acessar: https://webaim.org/resources/contrastchecker/
2. Para cada cor de texto importante:
   - Cor de fundo
   - Cor do texto
   - Verificar se passa em AA (4.5:1 para texto normal, 3:1 para texto grande)

**Cores a Testar:**
- ✅ Texto principal (#1e293b) em fundo branco (#ffffff)
- ✅ Texto secundário (#64748b) em fundo branco (#ffffff)
- ✅ Links (#00C8FF) em fundo branco (#ffffff)
- ✅ Botões primários (#00C8FF) com texto branco (#ffffff)
- ✅ Botões secundários (#10b981) com texto branco (#ffffff)

**Resultado Esperado:**
```
✅ Todos os contrastes passam em AA
✅ Mínimo 4.5:1 para texto normal
✅ Mínimo 3:1 para texto grande
```

#### 5.2 Testar com Chrome DevTools
1. Abrir Chrome DevTools (F12)
2. Ir para aba **Elements**
3. Selecionar um elemento de texto
4. Verificar o contraste na aba **Computed**
5. Verificar se passa em AA

**Resultado Esperado:**
```
✅ Contrast ratios adequados
✅ Passa em WCAG 2.1 AA
```

---

## 📊 Template de Resultados

Use este template para documentar os resultados dos testes:

```markdown
## 🧪 Resultados dos Testes Manuais

### Teste 1: PWA Installation
- [ ] Manifest válido
- [ ] Install prompt aparece
- [ ] App instala com sucesso
- [ ] Ícone aparece na área de trabalho

**Observações:**
[Descrever qualquer problema encontrado]

---

### Teste 2: PWA Offline Support
- [ ] Service Worker ativo
- [ ] App funciona offline
- [ ] Cache configurado
- [ ] Recursos em cache

**Observações:**
[Descrever qualquer problema encontrado]

---

### Teste 3: Keyboard Navigation
- [ ] Tab navigation funcional
- [ ] Skip links funcionais
- [ ] Modais com focus trap
- [ ] Enter/Space funcionam
- [ ] Arrow keys funcionam

**Observações:**
[Descrever qualquer problema encontrado]

---

### Teste 4: Screen Reader
- [ ] NVDA funciona
- [ ] JAWS funciona
- [ ] VoiceOver funciona
- [ ] TalkBack funciona
- [ ] LoadingAnnouncer funciona

**Observações:**
[Descrever qualquer problema encontrado]

---

### Teste 5: Contrast Ratios
- [ ] Todos os contrastes passam em AA
- [ ] Mínimo 4.5:1 para texto normal
- [ ] Mínimo 3:1 para texto grande

**Observações:**
[Descrever qualquer problema encontrado]

---

## 🎯 Resumo

**Total de Testes:** 5  
**Testes Concluídos:** X/5  
**Testes com Sucesso:** X/5  
**Testes com Falha:** X/5  
**Taxa de Sucesso:** X%

**Status Geral:** ✅ Aprovado / ⚠️ Aprovado com ressalvas / ❌ Reprovado
```

---

## 🎯 Próximos Passos

1. **Executar Testes Manuais** (30-60 minutos)
   - Seguir este guia passo a passo
   - Documentar resultados
   - Reportar problemas

2. **Corrigir Problemas** (se houver)
   - Identificar problemas
   - Implementar correções
   - Testar novamente

3. **Documentar Resultados**
   - Criar `RESULTADOS_TESTES_MANUAIS.md`
   - Incluir screenshots
   - Atualizar status

---

## 📚 Documentação Relacionada

- **VALIDACAO_METRICAS_IMPLEMENTADAS.md** - Validação completa
- **LIGHTHOUSE_RESULTADO_PRODUCAO.md** - Resultados em produção
- **PROXIMOS_PASSOS_RECOMENDADOS.md** - Próximos passos

---

**Versão:** 1.0.0  
**Data:** 19 de Janeiro de 2025  
**Status:** ⏸️ Aguardando Execução dos Testes Manuais

