# 🎯 Teste do Sentry - DuduFisio AI

## ✅ O que foi feito

1. **✅ DSN atualizado no código** (`lib/sentry.ts`)
   - DSN antigo removido
   - DSN novo configurado: `https://d62c317fee896cf9151ac4bfdd3db3fb@o4510069182955520.ingest.us.sentry.io/4510184091877376`

2. **✅ Arquivo de teste criado** (`test-sentry-event.html`)
   - Teste independente do projeto
   - Envia eventos diretamente para o Sentry
   - Interface visual para testar diferentes tipos de eventos

## 🚀 Como Testar AGORA

### Opção 1: Teste Rápido (HTML)

1. **Abra o arquivo de teste no navegador:**
   ```powershell
   start test-sentry-event.html
   ```

2. **Clique nos botões para testar:**
   - 🔴 **Erro Simples** - Envia um erro básico
   - 💥 **Exception** - Simula erro real de código
   - 📨 **Mensagem** - Envia mensagem informativa
   - ⚡ **Performance** - Testa monitoramento de performance
   - 🍞 **Breadcrumbs** - Testa rastreamento de ações do usuário

3. **Verifique no Sentry:**
   - Abra: https://activity-fisioterapia-rg.sentry.io/issues/
   - Você verá os eventos em poucos segundos! ⚡

### Opção 2: Teste no Projeto (Desenvolvimento)

1. **Criar arquivo `.env.local`:**
   ```powershell
   @"
# Sentry Configuration
VITE_SENTRY_DSN=https://d62c317fee896cf9151ac4bfdd3db3fb@o4510069182955520.ingest.us.sentry.io/4510184091877376

# Gemini API Key (se tiver)
GEMINI_API_KEY=your_gemini_api_key_here
"@ | Out-File -FilePath .env.local -Encoding UTF8
   ```

2. **Iniciar servidor de desenvolvimento:**
   ```powershell
   npm run dev
   ```

3. **Acesse:** http://localhost:5173

4. **Abra o Console do Navegador** e digite:
   ```javascript
   // Enviar erro de teste
   window.Sentry.captureMessage('Teste do DuduFisio AI!', 'info');
   
   // Ou causar um erro
   throw new Error('Erro de teste!');
   ```

## 📊 Verificar Resultados

### No Sentry Dashboard:

1. Acesse: https://activity-fisioterapia-rg.sentry.io
2. Vá para **Issues** no menu lateral
3. Você verá os eventos de teste aparecendo!

### Informações dos Eventos:

- **Event ID**: Identificador único de cada evento
- **Environment**: `test` (para HTML) ou `development` (para projeto)
- **Release**: `dudufisio-ai@test` ou `dudufisio-ai@1.0.0`
- **Timestamp**: Quando o evento foi enviado

## 🎯 Status Atual

| Configuração | Status | Detalhes |
|-------------|--------|----------|
| ✅ DSN no código | ✅ Atualizado | `lib/sentry.ts` com DSN correto |
| ✅ Arquivo de teste | ✅ Criado | `test-sentry-event.html` pronto |
| ⚪ Teste executado | ⏳ Pendente | Execute agora! |
| ⚪ Eventos no Sentry | ⏳ Aguardando | Verificar após teste |

## 🔧 Próximos Passos

### Depois do teste funcionar:

1. **Configurar no Vercel:**
   ```powershell
   # Adicionar variável de ambiente
   vercel env add VITE_SENTRY_DSN
   # Cole o DSN quando solicitado:
   # https://d62c317fee896cf9151ac4bfdd3db3fb@o4510069182955520.ingest.us.sentry.io/4510184091877376
   ```

2. **Fazer deploy:**
   ```powershell
   git add .
   git commit -m "fix: atualizar DSN do Sentry"
   git push
   ```

3. **Verificar em produção:**
   - Acesse seu site no Vercel
   - Faça alguma ação que possa gerar erro
   - Verifique no Sentry se os eventos de produção estão chegando

## 🐛 Troubleshooting

### Não aparece nada no Sentry?

1. **Verifique o console do navegador:**
   - Devem aparecer logs do Sentry em modo debug
   - Procure por: `[Sentry]` nas mensagens

2. **Verifique a conexão de rede:**
   - Abra DevTools > Network
   - Procure por requisições para `sentry.io`
   - Devem ser status 200

3. **Verifique o DSN:**
   - O DSN correto está configurado?
   - Formato: `https://[KEY]@[ORG].ingest.us.sentry.io/[PROJECT]`

### Eventos aparecem mas não vejo detalhes?

- Aguarde alguns segundos (máximo 1 minuto)
- Atualize a página do Sentry
- Verifique se está no projeto correto: `dudufisio-ai`

## 📝 Notas Importantes

- **Em desenvolvimento:** O Sentry NÃO envia eventos (configuração atual)
  - Para testar em dev, use o arquivo HTML
  - Ou comente as linhas 35-38 do `lib/sentry.ts`

- **Em produção:** Todos os eventos são enviados
  - Apenas erros reais
  - Performance monitoring ativo
  - Session replay em 10% das sessões

- **Filtros ativos:**
  - Ignora erros de extensões do navegador
  - Ignora erros comuns de rede
  - Ignora `ResizeObserver` errors

## ✨ Resultado Esperado

Após executar o teste HTML, você verá no Sentry:

```
🎉 Novo evento recebido!

Title: DuduFisio AI - Sentry está funcionando!
Environment: test
Release: dudufisio-ai@test
Timestamp: [agora]
```

E a mensagem "Waiting to receive first event" desaparecerá! 🚀

---

**📌 EXECUTE O TESTE AGORA:**
```powershell
start test-sentry-event.html
```

Depois volte aqui e me diga se funcionou! 😊

