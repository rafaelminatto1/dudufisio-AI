# 🔧 Correção Urgente: Output Directory

## ❌ Problema Atual

Na imagem, vejo que:
- **Output Directory**: `dist` 
- **Toggle "Override"**: **ON** (azul)

Isso está **ERRADO** para Next.js!

## ✅ Solução (2 opções)

### Opção 1: Desligar o Toggle (RECOMENDADO)

1. Na seção **Output Directory**
2. **Clique no toggle "Override"** para desligar (ficar cinza)
3. O campo ficará desabilitado e vazio
4. Clique em **Save**

### Opção 2: Limpar o Campo

1. Com o toggle "Override" ON
2. **Apague o texto `dist`** do campo
3. Deixe o campo **vazio**
4. Clique em **Save**

## 📸 Como Deve Ficar

**ANTES (ERRADO):**
```
Output Directory: [dist] [Override: ON (azul)]
```

**DEPOIS (CORRETO):**
```
Output Directory: [vazio/desabilitado] [Override: OFF (cinza)]
```

## ⚠️ Por Que Isso é Importante?

- Next.js usa `.next` como diretório de saída por padrão
- `dist` é do Vite (projeto antigo)
- Se deixar `dist`, o build vai falhar ou não encontrar os arquivos corretos

## ✅ Checklist Final

Após corrigir, verifique:

- [ ] Framework Preset: **Next.js** ✅
- [ ] Build Command: `npm run build` ✅
- [ ] **Output Directory: vazio (Override OFF)** ⚠️ CORRIGIR
- [ ] Install Command: `npm install` ✅
- [ ] Development Command: `next dev --port $PORT` ✅
- [ ] Root Directory: vazio ✅

## 🚀 Após Corrigir

1. Clique em **Save**
2. Faça um novo deploy (push para main ou deploy manual)
3. O build agora usará `.next` automaticamente

