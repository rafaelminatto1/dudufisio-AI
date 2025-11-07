# 📘 GUIA POSTMAN - Passo a Passo Detalhado

## 🎯 Como Testar a API de Login no Postman

---

## PASSO 1: Abrir o Postman

1. Abra o **Postman** no seu computador
2. Se não tiver instalado, baixe em: https://www.postman.com/downloads/

---

## PASSO 2: Criar Nova Requisição

1. Clique no botão **"New"** (canto superior esquerdo)
2. Ou clique no **"+"** para nova aba
3. Ou use o atalho: **Ctrl + N**

---

## PASSO 3: Configurar a Requisição

### 3.1 Selecionar Método HTTP:

Na parte superior da requisição, você verá um dropdown com **"GET"**.

✅ **Clique** e selecione: **POST**

```
┌─────────┐
│  POST ▼ │  ← Clique aqui e selecione POST
└─────────┘
```

---

### 3.2 Inserir a URL:

No campo ao lado do método POST, digite:

```
http://localhost:3000/api/patient/login
```

**IMPORTANTE:** Certifique-se de que o Vercel Dev está rodando!

```
┌─────────┬────────────────────────────────────────────────┐
│  POST ▼ │ http://localhost:3000/api/patient/login        │
└─────────┴────────────────────────────────────────────────┘
```

---

### 3.3 Configurar Headers:

Logo abaixo da URL, você verá várias abas: **Params**, **Authorization**, **Headers**, **Body**...

1. Clique na aba **"Headers"**

2. Adicione um novo header:
   - **Key:** `Content-Type`
   - **Value:** `application/json`

```
Headers
┌──────────────────┬──────────────────┬──────┐
│ KEY              │ VALUE            │      │
├──────────────────┼──────────────────┼──────┤
│ Content-Type     │ application/json │  ✓   │
└──────────────────┴──────────────────┴──────┘
```

**ℹ️ DICA:** Normalmente o Postman já adiciona `Content-Type: application/json` automaticamente quando você seleciona **"raw"** + **"JSON"** no Body.

---

### 3.4 Configurar o Body:

1. Clique na aba **"Body"**

2. Selecione a opção **"raw"** (não "form-data", não "x-www-form-urlencoded")

3. No dropdown à direita (onde diz "Text"), selecione **"JSON"**

4. Cole o JSON no campo de texto:

```json
{
  "accessCode": "EYNFFQ"
}
```

**Visual:**
```
Body
○ none  ○ form-data  ○ x-www-form-urlencoded  ● raw  ○ binary  ○ GraphQL
                                                        ┌──────────┐
                                                        │ JSON   ▼ │
                                                        └──────────┘

┌────────────────────────────────────────────────────────┐
│ {                                                      │
│   "accessCode": "EYNFFQ"                               │
│ }                                                      │
└────────────────────────────────────────────────────────┘
```

---

## PASSO 4: Enviar a Requisição

1. Clique no botão azul **"Send"** (à direita da URL)

2. Aguarde a resposta (pode demorar alguns segundos na primeira vez)

```
┌─────────┬────────────────────────────────────┬──────────┐
│  POST ▼ │ http://localhost:3000/api/...      │ [ Send ] │ ← Clique aqui
└─────────┴────────────────────────────────────┴──────────┘
```

---

## PASSO 5: Ver a Resposta

### ✅ Se der SUCESSO (Status 200):

Na parte inferior do Postman, você verá:

```
Status: 200 OK
```

**Body da resposta:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwYXRpZW50SWQiOiIxYzZkNDM5Zi1kZTVlLTQyZjQtYWRlMS0wNzk1YjY5NTEwN2IiLCJpYXQiOjE3MzA5MTYwMDAsImV4cCI6MTczMDkyMzIwMH0.ABC123...",
  "patient": {
    "id": "1c6d439f-de5e-42f4-ade1-0795b695107b",
    "name": "João da Silva",
    "email": "paciente.teste@moocafisio.com.br",
    "phone": "(11) 99999-9999"
  }
}
```

**📋 IMPORTANTE:** Copie o valor do `token` - você vai precisar dele nos próximos testes!

---

### ❌ Se der ERRO:

**Erro 404 (Not Found):**
```
Causa: Vercel Dev não está rodando
Solução: Execute no terminal: vercel dev --listen 3000
```

**Erro 401 (Unauthorized):**
```
Causa: Código inválido ou expirado
Solução: Use o código EYNFFQ ou gere novo código
```

**Erro 500 (Internal Server Error):**
```
Causa: Erro no servidor
Solução: Verifique logs do Vercel Dev no terminal
```

---

## PASSO 6: Salvar a Requisição (Opcional)

Para facilitar testes futuros:

1. Clique em **"Save"** (canto superior direito)
2. Dê um nome: **"Patient Login - EYNFFQ"**
3. Crie uma coleção: **"MoocaFisio - Patient API"**
4. Clique em **"Save"**

---

## 🎯 PRÓXIMOS TESTES

Após o login, copie o **token** e teste:

### Teste 2: Buscar Exercícios

```
GET http://localhost:3000/api/patient/exercises

Headers:
  Authorization: Bearer SEU_TOKEN_AQUI
```

### Teste 3: Ver Estatísticas

```
GET http://localhost:3000/api/patient/stats

Headers:
  Authorization: Bearer SEU_TOKEN_AQUI
```

---

## ⚡ ATALHOS DO POSTMAN

```
Ctrl + N     →  Nova requisição
Ctrl + S     →  Salvar requisição
Ctrl + Enter →  Enviar requisição
Ctrl + /     →  Buscar
```

---

## 🔧 TROUBLESHOOTING

### "Could not send request"

**Causa:** Vercel Dev não está rodando.

**Solução:**
```bash
# No terminal do projeto:
vercel dev --listen 3000

# Aguarde mensagem:
Ready! Available at http://localhost:3000
```

### "ECONNREFUSED"

**Causa:** Nada está escutando na porta 3000.

**Solução:** Inicie o Vercel Dev (comando acima).

### "Invalid access code"

**Causa:** Código incorreto ou expirado.

**Solução:** Use o código: **EYNFFQ** (maiúsculas!)

---

## 📊 RESUMO VISUAL

```
┌────────────────────────────────────────────────────┐
│  POSTMAN                                           │
├────────────────────────────────────────────────────┤
│  POST ▼  │ http://localhost:3000/api/patient/login│ Send │
├────────────────────────────────────────────────────┤
│  Headers │ Body │ ...                              │
│  ┌────────────────────────────────────────────┐   │
│  │ Body: ● raw  ▼ JSON                         │   │
│  │                                              │   │
│  │ {                                            │   │
│  │   "accessCode": "EYNFFQ"                     │   │
│  │ }                                            │   │
│  └────────────────────────────────────────────┘   │
├────────────────────────────────────────────────────┤
│  Response                                          │
│  Status: 200 OK                                    │
│  ┌────────────────────────────────────────────┐   │
│  │ {                                            │   │
│  │   "token": "eyJhbGc...",                     │   │
│  │   "patient": {                               │   │
│  │     "name": "João da Silva",                 │   │
│  │     "email": "paciente.teste@moocafisio..."  │   │
│  │   }                                          │   │
│  │ }                                            │   │
│  └────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────┘
```

---

## ✅ CHECKLIST

Antes de enviar a requisição:

- [ ] Postman aberto
- [ ] Nova requisição criada
- [ ] Método: **POST**
- [ ] URL: `http://localhost:3000/api/patient/login`
- [ ] Aba **Body** selecionada
- [ ] Opção **raw** marcada
- [ ] Dropdown em **JSON**
- [ ] Body contém: `{ "accessCode": "EYNFFQ" }`
- [ ] Vercel Dev rodando (porta 3000)
- [ ] Clicar em **Send**

---

## 🎯 CÓDIGO DE ACESSO

```
EYNFFQ
```

**Copie e cole exatamente como está (maiúsculas)!**

---

**📘 Siga este guia passo a passo e você conseguirá testar com sucesso! 🚀**

