# 🚀 Guia Rápido - DuduFisio-AI

## ⚡ Comandos Mais Usados

### 🟢 Iniciar Servidor

```bash
# Inicia e mata processo na porta automaticamente
npm run dev:clean

# Inicia com verificação de env (usa porta alternativa se necessário)
npm run dev

# Inicia sem verificação de env
npm run dev:skip-check
```

### 🔴 Parar Servidores

```bash
# Mata TODOS os servidores locais (Node.js + portas)
npm run kill:servers

# Mata apenas processos Node.js
npm run kill:node

# Mata e reinicia tudo
npm run kill:servers && npm run dev:clean
```

### 🔄 Fluxo Completo de Teste

```bash
# 1. Mata todos os servidores
npm run kill:servers

# 2. Inicia servidor limpo
npm run dev:clean

# Ou em uma linha:
npm run kill:servers && npm run dev:clean
```

---

## 🎯 Cenários Comuns

### Cenário 1: Porta ocupada
```bash
npm run dev:clean
```
✅ Mata processo na porta e inicia

### Cenário 2: Múltiplos servidores rodando
```bash
npm run kill:servers
```
✅ Mata todos os servidores Node.js

### Cenário 3: Reiniciar tudo
```bash
npm run kill:servers && npm run dev:clean
```
✅ Mata tudo e inicia limpo

### Cenário 4: Desenvolvimento rápido
```bash
npm run dev:skip-check
```
✅ Pula verificações, inicia rápido

---

## 📊 Resumo dos Comandos

| Situação | Comando |
|----------|---------|
| Iniciar servidor (limpo) | `npm run dev:clean` |
| Iniciar servidor (normal) | `npm run dev` |
| Parar todos os servidores | `npm run kill:servers` |
| Parar apenas Node.js | `npm run kill:node` |
| Reiniciar tudo | `npm run kill:servers && npm run dev:clean` |

---

## 💡 Dicas Pro

1. **Use `dev:clean`** - É o mais prático para desenvolvimento
2. **Use `kill:servers`** - Quando terminar de testar
3. **Use o combo** - `kill:servers && dev:clean` para reiniciar tudo
4. **Ctrl+C** - Para parar o servidor atual

---

## 🆘 Problemas Comuns

### "Port is already in use"
```bash
npm run kill:servers
npm run dev:clean
```

### "Múltiplos servidores rodando"
```bash
npm run kill:servers
```

### "Servidor travado"
```bash
npm run kill:servers
npm run dev:clean
```

---

## 📚 Documentação Completa

Para mais detalhes, consulte: [README-DEV.md](./README-DEV.md)

