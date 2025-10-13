# 🔧 Solução para Erros de WebSocket do Vite

## 📊 Problema Identificado

Você está vendo estes erros no console:

```
WebSocket connection to 'ws://localhost:5175/?token=ArxFqnbMrGXQ' failed
[vite] failed to connect to websocket
Uncaught (in promise) Error: WebSocket closed without opened
```

### O que está acontecendo?

O Vite usa WebSocket para **Hot Module Replacement (HMR)** - a funcionalidade que atualiza o código automaticamente enquanto você desenvolve. Este erro indica que o navegador não consegue estabelecer conexão WebSocket com o servidor de desenvolvimento.

**⚠️ IMPORTANTE:** O Service Worker está funcionando corretamente! O problema é com a conexão do Vite.

---

## ✅ Soluções (Em Ordem de Prioridade)

### **Solução 1: Script Automatizado** ⚡ (RECOMENDADO)

Criamos um script PowerShell que resolve tudo automaticamente:

```powershell
.\fix-websocket.ps1
```

**O que ele faz:**
1. ✅ Para processos na porta 5175
2. ✅ Limpa cache do Vite e Node
3. ✅ Remove build anterior
4. ✅ Reinicia o servidor corretamente

---

### **Solução 2: Desabilitar Service Worker** 🔧

Se o problema persistir, desabilite temporariamente o Service Worker:

#### Opção A: Interface Gráfica (Mais Fácil)
1. Abra o arquivo no navegador: `desabilitar-service-worker.html`
2. Clique no botão "Desabilitar Service Worker Agora"
3. Siga as instruções na tela
4. Recarregue com `Ctrl+F5`

#### Opção B: DevTools do Navegador
1. Pressione `F12` para abrir DevTools
2. Vá em **Application** > **Service Workers**
3. Clique em **Unregister** em todos os Service Workers
4. Vá em **Storage** > **Clear site data**
5. Marque todas as opções e clique em **Clear data**
6. Recarregue com `Ctrl+F5`

---

### **Solução 3: Comandos Manuais** 🛠️

Se preferir fazer manualmente:

```powershell
# 1. Para processos na porta 5175
Get-NetTCPConnection -LocalPort 5175 | 
    Select-Object -ExpandProperty OwningProcess -Unique | 
    ForEach-Object { Stop-Process -Id $_ -Force }

# 2. Limpa cache
Remove-Item "node_modules/.vite" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item "dist" -Recurse -Force -ErrorAction SilentlyContinue

# 3. Reinicia servidor
npm run dev
```

---

## 🔍 Verificações Adicionais

### 1. Certifique-se que o servidor está rodando

```bash
npm run dev
```

Você deve ver:

```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5175/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```

### 2. Verifique se a porta está livre

```powershell
# PowerShell
Get-NetTCPConnection -LocalPort 5175 -ErrorAction SilentlyContinue
```

Se retornar algo, a porta está ocupada.

### 3. Teste em modo incógnito

Abra o navegador em modo incógnito (Ctrl+Shift+N) e acesse:
```
http://localhost:5175
```

Se funcionar, o problema é cache/extensões do navegador.

---

## 🎯 Por que isso acontece?

### Causas Comuns:

1. **Múltiplas instâncias do servidor** 🔄
   - Você iniciou `npm run dev` múltiplas vezes
   - Processos Node travados

2. **Cache corrompido** 📦
   - Cache do Vite ou Node inconsistente
   - Service Worker com cache antigo

3. **Porta bloqueada** 🚫
   - Firewall bloqueando WebSocket
   - Antivírus interferindo

4. **Conflito de extensões** 🔌
   - Extensões do navegador bloqueando WebSocket
   - AdBlockers muito agressivos

---

## 🚀 Prevenção

Para evitar este problema no futuro:

### 1. Use sempre o script de reinício

```powershell
.\restart-dev-server.ps1
```

### 2. Configure o Vite para ignorar Service Worker

Já está configurado em `vite.config.ts`:

```typescript
server: {
  hmr: {
    overlay: true,
    clientPort: 5175
  }
}
```

### 3. Limpe cache regularmente

```powershell
npm run clean  # Se tiver este comando
# ou
Remove-Item "node_modules/.vite" -Recurse -Force
```

---

## 📋 Checklist de Troubleshooting

- [ ] Executei `fix-websocket.ps1`
- [ ] Verifiquei que o servidor está rodando
- [ ] Testei em modo incógnito
- [ ] Desabilitei extensões do navegador
- [ ] Limpei cache do navegador (Ctrl+F5)
- [ ] Desabilitei Service Worker temporariamente
- [ ] Reiniciei o computador (última opção)

---

## 🆘 Ainda não resolveu?

Se nenhuma solução funcionou:

### 1. Verifique logs do Vite

No terminal onde você executou `npm run dev`, procure por erros.

### 2. Teste outra porta

Edite `vite.config.ts`:

```typescript
server: {
  port: 3000,  // Mude de 5175 para 3000
  hmr: {
    port: 3000
  }
}
```

### 3. Desabilite HMR temporariamente

```typescript
server: {
  hmr: false  // Desabilita HMR
}
```

**Nota:** Você precisará recarregar manualmente a página para ver mudanças.

---

## 📝 Notas Importantes

- ✅ O Service Worker **não interfere** com WebSocket do Vite
- ✅ Estes erros **não afetam** a aplicação em produção
- ✅ O HMR é apenas para desenvolvimento
- ⚠️ Em produção, não haverá WebSocket do Vite

---

## 🎓 Entendendo os Componentes

### WebSocket do Vite (HMR)
- Usado apenas em desenvolvimento
- Atualiza código sem recarregar página
- Não é essencial, mas melhora DX

### Service Worker
- Funciona em desenvolvimento e produção
- Cache de recursos e offline support
- Notificações push

### Como coexistem?
- WebSocket: Protocolo `ws://` ou `wss://`
- Service Worker: Intercepta `http://` e `https://`
- **Não há conflito entre eles!**

---

## ✅ Solução Aplicada

Criamos:
1. ✅ `fix-websocket.ps1` - Script automatizado
2. ✅ `desabilitar-service-worker.html` - Interface gráfica
3. ✅ `public/disable-sw.js` - Script de desabilitação
4. ✅ Este guia completo

**Próximo passo:** Execute `.\fix-websocket.ps1` e o problema deve ser resolvido! 🚀

