# 🚀 Guia de Desenvolvimento - DuduFisio-AI

## Soluções para Conflito de Porta

### Problema
Quando a porta 5176 está em uso, você precisa matar o processo manualmente ou trocar a porta.

### ✅ Soluções Implementadas

#### 1. **Solução Automática (Recomendada)**
Use o novo comando que mata automaticamente o processo e inicia o servidor:

```bash
npm run dev:clean
```

Este comando:
- ✅ Verifica se a porta 5176 está em uso
- ✅ Mata automaticamente o processo que está usando a porta
- ✅ Inicia o servidor de desenvolvimento
- ✅ Funciona no Windows (PowerShell)

#### 2. **Solução Alternativa (Fallback Automático)**
Agora o Vite está configurado para usar automaticamente outra porta se a 5176 estiver ocupada:

```bash
npm run dev
```

Se a porta 5176 estiver ocupada, o Vite automaticamente usará a próxima porta disponível (5177, 5178, etc.) e mostrará no console qual porta está sendo usada.

#### 3. **Comando Original (Com Verificação de Env)**
```bash
npm run dev
```
- Verifica as variáveis de ambiente antes de iniciar
- Usa porta alternativa se 5176 estiver ocupada

#### 4. **Sem Verificação de Env**
```bash
npm run dev:skip-check
```
- Pula a verificação de variáveis de ambiente
- Mais rápido para desenvolvimento

---

## 📋 Comandos Disponíveis

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Inicia o servidor com verificação de env |
| `npm run dev:clean` | **NOVO** - Mata processos na porta e inicia |
| `npm run dev:skip-check` | Inicia sem verificar env |
| `npm run kill:servers` | **NOVO** - Mata TODOS os servidores locais |
| `npm run kill:node` | **NOVO** - Mata apenas processos Node.js |

---

## 🛑 Matar Todos os Servidores

### Opção 1: Matar Todos os Servidores (Recomendado)
Mata todos os processos Node.js e processos em portas comuns:

```bash
npm run kill:servers
```

Este comando mata:
- ✅ Todos os processos Node.js
- ✅ Processos nas portas: 5176, 5177, 5178, 5179, 5180, 3000, 3001, 3002, 4173, 4174

### Opção 2: Matar Apenas Node.js
Mata apenas processos Node.js:

```bash
npm run kill:node
```

### Opção 3: Matar e Reiniciar
Combinação útil para reiniciar tudo:

```bash
npm run kill:servers && npm run dev:clean
```

---

## 🔧 Matar Processo Manualmente

Se você quiser matar o processo manualmente:

### Windows (PowerShell)
```powershell
# Ver qual processo está usando a porta
Get-NetTCPConnection -LocalPort 5176 | Select-Object OwningProcess

# Matar o processo (substitua PID pelo número)
Stop-Process -Id <PID> -Force
```

### Linux/Mac
```bash
# Ver qual processo está usando a porta
lsof -i:5176

# Matar o processo (substitua PID pelo número)
kill -9 <PID>
```

---

## 💡 Dicas

1. **Use `npm run dev:clean`** - É a forma mais rápida e automática
2. **Mantenha o terminal aberto** - Fechar o terminal mata o processo automaticamente
3. **Use Ctrl+C** - Para parar o servidor quando terminar de testar
4. **Porta alternativa** - O Vite agora mostra qual porta está usando se a 5176 estiver ocupada

---

## 🐛 Solução de Problemas

### Erro: "Port is already in use"
✅ **Solução**: Use `npm run dev:clean` ou simplesmente `npm run dev` (agora usa porta alternativa)

### Erro: "Permission denied"
✅ **Solução**: Execute o PowerShell como Administrador

### Vite usando porta diferente
✅ **Normal**: O Vite mostrará no console qual porta está usando. Exemplo:
```
VITE v7.1.9  ready in 234 ms

➜  Local:   http://localhost:5177/
```

---

## 📝 Notas de Configuração

- **Porta padrão**: 5176
- **Porta de fallback**: Automática (5177, 5178, etc.)
- **Host**: localhost
- **HMR**: Habilitado com overlay

Configuração em `vite.config.ts`:
```typescript
server: {
  port: 5176,
  strictPort: false, // Permite porta alternativa
  host: 'localhost',
}
```

