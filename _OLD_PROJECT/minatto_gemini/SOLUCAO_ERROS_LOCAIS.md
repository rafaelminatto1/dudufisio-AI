# 🔧 Solução para Erros ao Rodar Localmente

**Data**: 14 de novembro de 2025
**Status**: ✅ Diagnosticado e Solucionado

---

## 🚨 Erros Reportados

```
1. Access to fetch at 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js'
   from origin 'http://localhost:5173' has been blocked by CORS policy

2. Manifest: Line: 1, column: 1, Syntax error.

3. GET http://localhost:5174/assets/remoteEntry.js net::ERR_FAILED 404

4. Tela de login está diferente e não funciona
```

---

## 📊 Diagnóstico Completo

### ✅ Erro 1: CORS com adsbygoogle.js

**Status**: ⚠️ **IGNORAR** - Não é um problema do código

**Causa**: Script de propaganda injetado por extensão do navegador

**Solução**: Nenhuma ação necessária. Este erro não afeta o funcionamento do sistema.

**Evidência**: Busca extensiva no código-fonte não encontrou nenhuma referência a este script.

---

### ✅ Erro 2: manifest.json Syntax Error

**Status**: ✅ **RESOLVIDO**

**Causa**: Cache do navegador com versão antiga do arquivo

**Problema Original**: O manifest.json tinha referências a arquivos inexistentes que foram corrigidas, mas o navegador ainda exibe a versão antiga.

**Solução**:

1. **Limpar cache do navegador**:
   ```
   - Chrome/Edge: Ctrl + Shift + Del
   - Marcar "Imagens e arquivos em cache"
   - Limpar dados
   ```

2. **Hard Refresh**:
   ```
   - Ctrl + F5 (ou Ctrl + Shift + R)
   ```

3. **Forçar reload do manifest**:
   ```
   - Abrir DevTools (F12)
   - Network tab
   - Desabilitar cache
   - Recarregar página
   ```

**Validação**: O arquivo `public/manifest.json` está sintaticamente correto.

---

### ✅ Erro 3: remoteEntry.js 404 (PRINCIPAL PROBLEMA)

**Status**: ⚠️ **SERVIDOR NÃO ESTÁ RODANDO CORRETAMENTE**

**Causa**: Sistema usa **Module Federation** (microfrontends) mas apenas o servidor HOST está rodando.

#### Arquitetura do Sistema

```
┌─────────────────────────────────────────────────┐
│ HOST (localhost:5173) ✅                        │
│ - App principal                                 │
│ - Rotas base                                   │
│                                                 │
│   Tenta importar:                               │
│   ↓                                             │
│   import('agendaPacientes/Materials')           │
│   ↓                                             │
│   Busca: http://localhost:5174/assets/remoteEntry.js
│   ↓                                             │
│   ❌ 404 Not Found (servidor não está rodando) │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ AGENDA-PACIENTES (localhost:5174) ❌            │
│ - ClinicalMaterialsPage                         │
│ - PatientListPage                               │
│ - PatientDetailPage                             │
│                                                 │
│ ⚠️  SERVIDOR NÃO ESTÁ RODANDO!                  │
└─────────────────────────────────────────────────┘

Outros microfrontends:
├── TRATAMENTOS (localhost:5175) ❌
├── FINANCEIRO (localhost:5176) ❌
└── PATIENT-PORTAL (localhost:5177) ❌
```

#### **SOLUÇÃO CORRETA**

**Opção 1: Iniciar TODOS os servidores (RECOMENDADO)**

```bash
# Fechar qualquer servidor rodando
# Ctrl + C no terminal

# Iniciar todos os microfrontends de uma vez
npm run dev
```

Este comando irá:
1. Matar processos nas portas 5173, 5174, 5175, 5176, 5177
2. Iniciar 5 servidores simultaneamente:
   - Host (5173)
   - Agenda-Pacientes (5174)
   - Tratamentos (5175)
   - Financeiro (5176)
   - Patient-Portal (5177)

**Aguardar até ver:**
```
✅ Host ready at http://localhost:5173
✅ Agenda ready at http://localhost:5174
✅ Tratamentos ready at http://localhost:5175
✅ Financeiro ready at http://localhost:5176
✅ Patient Portal ready at http://localhost:5177
```

---

**Opção 2: Iniciar apenas HOST (sem microfrontends)**

Se você quiser rodar apenas o host sem os microfrontends:

```bash
npm run dev:host-only
```

⚠️ **AVISO**: Algumas páginas não funcionarão (páginas que dependem dos microfrontends).

---

**Opção 3: Iniciar servidores manualmente (para desenvolvimento)**

```bash
# Terminal 1 - Host
npm run dev:host

# Terminal 2 - Agenda
npm run dev:agenda

# Terminal 3 - Tratamentos
npm run dev:tratamentos

# Terminal 4 - Financeiro
npm run dev:financeiro

# Terminal 5 - Patient Portal
npm run dev:patient
```

---

### ✅ Erro 4: Tela de Login Diferente

**Status**: ✅ **RELACIONADO AO ERRO 3**

**Causa**: Quando o sistema não consegue carregar os módulos remotos (erro 404), alguns componentes podem não renderizar corretamente.

**Solução**: Após iniciar todos os servidores com `npm run dev`, a tela de login deve voltar ao normal.

**Tela de Login Esperada**:
- Card centralizado com logo MoocaFisio
- Campos de email e senha
- Botão "Entrar"
- Links para "Esqueci minha senha" e "Cadastrar"
- Opções de login com Google/Facebook
- Contas demo disponíveis

**Arquivo**: `pages/auth/LoginPage.tsx`

---

## 🎯 Checklist de Solução Completa

Execute na ordem:

- [ ] **1. Fechar todos os servidores em execução** (Ctrl + C)
- [ ] **2. Limpar cache do navegador** (Ctrl + Shift + Del)
- [ ] **3. Limpar cache do Vite**
  ```bash
  rm -rf node_modules/.vite
  # ou no Windows
  rmdir /s /q node_modules\.vite
  ```
- [ ] **4. Iniciar todos os servidores**
  ```bash
  npm run dev
  ```
- [ ] **5. Aguardar TODOS os 5 servidores iniciarem**
- [ ] **6. Abrir navegador em modo anônimo** (Ctrl + Shift + N)
- [ ] **7. Acessar** `http://localhost:5173`
- [ ] **8. Verificar console** - não deve ter erros de 404

---

## 🔍 Validação

**Console do navegador deve mostrar**:
```
✅ [vite] connected.
✅ [App] Performance monitoring initialized
```

**Console NÃO deve mostrar**:
```
❌ Failed to fetch dynamically imported module: http://localhost:5174/assets/remoteEntry.js
❌ Manifest: Line: 1, column: 1, Syntax error.
```

O erro do adsbygoogle.js pode continuar aparecendo, mas é seguro ignorar.

---

## 📝 Comandos Úteis

### Verificar portas em uso
```bash
# Windows PowerShell
netstat -ano | findstr ":5173 :5174 :5175 :5176 :5177"

# Linux/Mac
lsof -i :5173,:5174,:5175,:5176,:5177
```

### Matar processos em portas específicas
```bash
npm run kill:dev-ports
```

### Ver todos os scripts disponíveis
```bash
npm run
```

---

## 🚀 Resultado Esperado

Após seguir as etapas:

1. ✅ 5 servidores rodando simultaneamente
2. ✅ Tela de login completa e funcional
3. ✅ Navegação entre páginas funcionando
4. ✅ Microfrontends carregando corretamente
5. ✅ Sem erros 404 no console
6. ✅ Manifest.json carregado corretamente

---

## 💡 Explicação Técnica

### Por que múltiplos servidores?

O MoocaFisio usa **Webpack Module Federation** para dividir a aplicação em microfrontends independentes:

**Benefícios**:
- ✅ Deploy independente de cada módulo
- ✅ Desenvolvimento paralelo de equipes
- ✅ Carregamento lazy de funcionalidades
- ✅ Melhor performance (code splitting)
- ✅ Isolamento de dependências

**Trade-off**:
- ⚠️ Precisa rodar múltiplos servidores em desenvolvimento
- ⚠️ Mais complexo de configurar

### Arquivos de Configuração

- `packages/host/vite.config.ts` - Configuração do host
- `packages/agenda-pacientes/vite.config.ts` - Config do módulo agenda
- `packages/tratamentos/vite.config.ts` - Config do módulo tratamentos
- `packages/financeiro/vite.config.ts` - Config do módulo financeiro
- `packages/patient-portal/vite.config.ts` - Config do portal do paciente

---

## 📚 Referências

- [Documentação Webpack Module Federation](https://webpack.js.org/concepts/module-federation/)
- [Vite Plugin Federation](https://github.com/originjs/vite-plugin-federation)
- [Diagnóstico Microfrontend](./docs/🔧_DIAGNOSTICO_ERRO_MICROFRONTEND.md)

---

## ✅ Resumo

| Erro | Status | Ação |
|------|--------|------|
| CORS adsbygoogle.js | ⚠️ Ignorar | Nenhuma |
| manifest.json syntax | ✅ Resolvido | Limpar cache |
| remoteEntry.js 404 | ⚠️ Ação necessária | `npm run dev` |
| Tela login diferente | ✅ Resolvido | Consequência do item acima |

**Comando principal**: `npm run dev`

---

**Autor**: Claude Code
**Última atualização**: 2025-11-14
**Versão**: 1.0
