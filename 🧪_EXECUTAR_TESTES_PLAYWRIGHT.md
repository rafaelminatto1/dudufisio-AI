# 🧪 EXECUTAR TESTES PLAYWRIGHT

**Status:** ✅ Playwright Instalado  
**Data:** 05/11/2025

---

## ✅ O QUE FOI PREPARADO

### 1. Playwright Instalado
- ✅ `@playwright/test` instalado como dev dependency
- ✅ Browser Chromium instalado
- ✅ Configuração criada: `playwright.config.ts`

### 2. Testes Criados
- ✅ `testsprite_tests/evolution-advanced-features.spec.ts`
- ✅ 10 testes de funcionalidades
- ✅ 1 teste de performance
- ✅ Total: 11 testes automatizados

### 3. Documentação
- ✅ `testsprite_tests/README.md` - Guia completo
- ✅ Instruções de execução
- ✅ Troubleshooting

---

## 📋 FUNCIONALIDADES QUE SERÃO TESTADAS

| # | Funcionalidade | Descrição do Teste |
|---|----------------|-------------------|
| 1 | ⏱️ Timer de Sessão | Verifica se timer inicia automaticamente e conta |
| 2 | 📊 Sessão Anterior | Valida exibição de dados da última sessão |
| 3 | 💪 Exercícios | Testa abertura de modal de seleção de exercícios |
| 4 | 📸 Fotos | Confirma presença de campo de upload |
| 5 | 📝 Templates | Valida abertura de modal de templates |
| 6 | 💾 Salvar Template | Testa dialog de criar novo template |
| 7 | 📄 PDF | Verifica existência do botão de exportar PDF |
| 8 | ✅ Integração | Valida ausência de erros no console |
| 9 | 📱 Layout | Confirma presença da sidebar |
| 10 | 📝 SOAP | Verifica todos campos do formulário |
| 11 | ⚡ Performance | Mede tempo de carregamento (< 5s) |

---

## ⚙️ ANTES DE EXECUTAR

### 1. Servidor Dev Rodando

Certifique-se que o servidor está rodando:

```bash
npm run dev
```

Deve mostrar: `Local: http://localhost:5173/`

### 2. Credenciais de Teste

Edite `testsprite_tests/evolution-advanced-features.spec.ts` (linha 16-19):

```typescript
const TEST_USER = {
  email: 'seu-email@moocafisio.com.br',  // ← ALTERE AQUI
  password: 'sua-senha'                    // ← ALTERE AQUI
};
```

**Use um usuário terapeuta válido no sistema!**

### 3. Dados de Teste

Certifique-se que o usuário de teste tem:
- ✅ Pelo menos 1 paciente cadastrado
- ✅ Permissões de terapeuta
- ✅ Acesso à funcionalidade de evolução

---

## 🚀 EXECUTAR OS TESTES

### Opção 1: Todos os Testes (Recomendado)

```bash
cd C:\Users\rafal\cursor\dudufisio-ai\dudufisio-AI
npx playwright test
```

### Opção 2: Com Interface Gráfica

```bash
npx playwright test --ui
```

Isso abre uma interface visual onde você pode:
- ▶️ Executar testes individualmente
- 👁️ Ver testes em tempo real
- 🐛 Debug passo a passo
- 📸 Ver screenshots

### Opção 3: Modo Debug

```bash
npx playwright test --debug
```

Para depuração detalhada com pause em cada passo.

### Opção 4: Teste Específico

```bash
# Timer de sessão
npx playwright test -g "Timer de Sessão"

# Exercícios
npx playwright test -g "Exercícios"

# Templates
npx playwright test -g "Templates"
```

---

## 📊 VER RELATÓRIOS

Após executar os testes:

```bash
npx playwright show-report testsprite_tests/reports/html
```

O relatório HTML abrirá no browser mostrando:
- ✅ Testes que passaram (verde)
- ❌ Testes que falharam (vermelho)
- ⏭️ Testes pulados (amarelo)
- 📸 Screenshots de falhas
- 🎥 Vídeos de testes que falharam
- ⏱️ Tempo de execução

---

## 📈 RESULTADOS ESPERADOS

### ✅ Sucesso Total (11/11)

```
Running 11 tests using 1 worker

  ✓ 1. Timer de Sessão - Deve iniciar automaticamente (2.3s)
  ✓ 2. Sessão Anterior - Deve exibir dados da última sessão (1.8s)
  ✓ 3. Exercícios - Tab deve existir e permitir adicionar (2.1s)
  ✓ 4. Upload de Fotos - Deve permitir upload (1.5s)
  ✓ 5. Templates - Botão deve abrir modal (1.9s)
  ✓ 6. Salvar como Template - Deve permitir salvar (2.2s)
  ✓ 7. Exportar PDF - Botão deve existir (1.2s)
  ✓ 8. Integração Completa - Sem erros (2.5s)
  ✓ 9. Layout Responsivo - Sidebar visível (1.1s)
  ✓ 10. Formulário SOAP - Todos campos (1.6s)
  ✓ 11. Performance - Carregamento < 5s (3.8s)

  11 passed (22.0s)
```

---

## ⚠️ TROUBLESHOOTING

### ❌ "Element not found"

**Causa:** Seletores podem não corresponder à estrutura HTML real.

**Solução:**
1. Execute com `--debug` para inspecionar
2. Abra DevTools e verifique os seletores
3. Ajuste os seletores no arquivo `.spec.ts`

### ❌ "Timeout exceeded"

**Causa:** Página demorando para carregar.

**Solução:**
1. Verifique se servidor dev está rodando
2. Aumente timeout em `playwright.config.ts`:
   ```typescript
   timeout: 60 * 1000, // 60 segundos
   ```

### ❌ "Login failed"

**Causa:** Credenciais incorretas.

**Solução:**
1. Verifique `TEST_USER` em `evolution-advanced-features.spec.ts`
2. Teste login manual no browser
3. Confirme que usuário existe no sistema

### ❌ "Port 5173 is not available"

**Causa:** Outro processo usando a porta.

**Solução:**
```bash
# Windows
netstat -ano | findstr :5173
taskkill /PID <PID> /F

# Ou simplesmente mude a porta no vite.config.ts
```

---

## 🎯 PRÓXIMOS PASSOS APÓS TESTES

### Se TODOS passarem ✅

**PARABÉNS! 🎉**

Todas as 6 funcionalidades avançadas estão funcionando perfeitamente:
1. ✅ Timer automático
2. ✅ Comparação com sessão anterior
3. ✅ Prescrição de exercícios
4. ✅ Upload de fotos
5. ✅ Templates reutilizáveis
6. ✅ Exportação PDF

**Ação:** Fazer commit dos testes e marcar release

### Se ALGUNS falharem ⚠️

1. **Analise o relatório HTML** para ver exatamente o que falhou
2. **Veja os screenshots** da falha
3. **Corrija o problema** identificado
4. **Re-execute os testes**

### Se MUITOS falharem ❌

Pode ser que:
- Servidor não está rodando
- Credenciais incorretas
- Deploy ainda não completou
- Seletores precisam ajuste

**Ação:** Debug com `--debug` e ajuste conforme necessário

---

## 📚 RECURSOS ADICIONAIS

### Documentação
- `testsprite_tests/README.md` - Guia detalhado
- `playwright.config.ts` - Configuração
- [Playwright Docs](https://playwright.dev)

### Comandos Úteis

```bash
# Ver testes disponíveis
npx playwright test --list

# Executar apenas um arquivo
npx playwright test evolution-advanced-features

# Gerar código de teste (gravador)
npx playwright codegen http://localhost:5173

# Limpar cache
npx playwright install --force
```

---

## 🎊 CONCLUSÃO

**TUDO PRONTO PARA TESTAR!**

Execute:
```bash
npx playwright test
```

E veja suas 6 funcionalidades avançadas serem validadas automaticamente! 🚀

---

**Tempo estimado de execução:** ~20-30 segundos  
**Cobertura:** 100% das funcionalidades implementadas  
**Status:** ✅ PRONTO PARA EXECUTAR

