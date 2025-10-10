# 🚨 Solução de Erros do Service Worker

## 🔍 Problemas Identificados

### **Erros no Console:**
```
sw.js:316  Fetch error: TypeError: Failed to fetch
WebSocket connection to 'ws://localhost:5175/?token=...' failed
503 Service Unavailable
Failed to load resource
```

### **Causa:**
- Servidor de desenvolvimento Vite parou ou travou
- Service Worker tentando buscar recursos indisponíveis
- Cache corrompido
- Conexão WebSocket perdida

---

## 🛠️ Soluções

### **1. Limpeza Completa (Recomendado)**

Execute o script PowerShell criado:
```powershell
.\fix-service-worker-cache.ps1
```

**Ou manualmente:**

#### A) Parar todos os processos:
```powershell
Get-Process | Where-Object {$_.ProcessName -like "*node*" -or $_.ProcessName -like "*vite*"} | Stop-Process -Force
```

#### B) Limpar cache:
```powershell
Remove-Item -Recurse -Force node_modules\.vite -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force dist -ErrorAction SilentlyContinue
```

#### C) Reiniciar servidor:
```powershell
npm run dev
```

### **2. Limpar Cache do Navegador**

#### **Chrome/Edge:**
1. Pressione `F12` (DevTools)
2. Vá para **Application** > **Storage**
3. Clique **Clear storage**
4. Ou pressione `Ctrl+Shift+Delete`

#### **Firefox:**
1. Pressione `F12`
2. Vá para **Storage** > **Local Storage**
3. Delete todos os itens
4. Ou use `Ctrl+Shift+Delete`

### **3. Modo Incógnito (Teste Rápido)**

Abra uma aba incógnita e acesse:
```
http://localhost:5173/free-video-generator
```

---

## 🔄 Processo Completo de Correção

### **Passo 1: Verificar Servidor**
```bash
# Verificar se o servidor está rodando
netstat -an | findstr :5173
```

### **Passo 2: Parar e Limpar**
```powershell
# Parar processos
taskkill /f /im node.exe

# Limpar cache
Remove-Item -Recurse -Force node_modules\.vite
Remove-Item -Recurse -Force dist
```

### **Passo 3: Reinstalar Dependências (Se necessário)**
```bash
npm install
```

### **Passo 4: Reiniciar Servidor**
```bash
npm run dev
```

### **Passo 5: Limpar Navegador**
- F12 > Application > Storage > Clear storage
- Ou modo incógnito

### **Passo 6: Testar**
Acesse: `http://localhost:5173/free-video-generator`

---

## 🎯 Verificação de Funcionamento

### **Indicadores de Sucesso:**
- ✅ Servidor rodando na porta 5173
- ✅ Sem erros de Service Worker no console
- ✅ WebSocket conectado
- ✅ Recursos carregando (sem 503 errors)
- ✅ Página do gerador de vídeos carrega normalmente

### **Indicadores de Problema:**
- ❌ Erros de fetch no Service Worker
- ❌ 503 Service Unavailable
- ❌ WebSocket connection failed
- ❌ Recursos não carregando

---

## 🚀 Comandos Rápidos

### **Reiniciar Tudo:**
```powershell
# Script automático
.\fix-service-worker-cache.ps1

# Ou manual
taskkill /f /im node.exe; Remove-Item -Recurse -Force node_modules\.vite; npm run dev
```

### **Verificar Status:**
```bash
# Verificar porta
netstat -an | findstr :5173

# Verificar processos Node
Get-Process | Where-Object {$_.ProcessName -like "*node*"}
```

---

## 📱 Teste da Página

Após corrigir os erros, teste:

1. **Acesse:** `http://localhost:5173/free-video-generator`
2. **Verifique:** Console sem erros de Service Worker
3. **Preencha:** Formulário de geração de vídeo
4. **Teste:** Clique em "Gerar Vídeo Personalizado com IA"

### **Formulário de Teste:**
- **Nome:** "Teste de Agachamento"
- **Prompt:** "Dois atletas demonstrando agachamento em tatame azul, câmera frontal"
- **Modalidade:** Fisioterapia
- **Motor IA:** CapCut AI

---

## 🔧 Troubleshooting Avançado

### **Se os problemas persistirem:**

#### **1. Verificar Porta:**
```bash
# Verificar se a porta 5173 está em uso
netstat -ano | findstr :5173
```

#### **2. Mudar Porta:**
```bash
# No package.json ou vite.config.ts
npm run dev -- --port 5174
```

#### **3. Verificar Firewall:**
- Windows Defender pode estar bloqueando
- Adicionar exceção para Node.js

#### **4. Reinstalar Node Modules:**
```bash
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json
npm install
```

---

## 📞 Suporte

### **Logs Úteis:**
- Console do navegador (F12)
- Terminal onde o servidor está rodando
- Network tab no DevTools

### **Informações para Debug:**
- Versão do Node.js: `node --version`
- Versão do npm: `npm --version`
- Sistema operacional: Windows 11
- Navegador e versão

---

## ✅ Checklist de Verificação

- [ ] Servidor Vite rodando na porta 5173
- [ ] Sem erros de Service Worker no console
- [ ] WebSocket conectado
- [ ] Recursos carregando (sem 503)
- [ ] Cache do navegador limpo
- [ ] Página do gerador de vídeos acessível
- [ ] Formulário funcionando
- [ ] Botão de geração responsivo

---

**Status:** 🔧 **Em Correção**  
**Prioridade:** 🔴 **Alta**  
**Impacto:** 🚫 **Bloqueia funcionalidade**

Após seguir estes passos, a página do gerador de vídeos deve funcionar normalmente!
