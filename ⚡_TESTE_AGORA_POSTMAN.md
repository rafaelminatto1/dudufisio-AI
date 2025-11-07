# ⚡ TESTE AGORA NO POSTMAN!

## ✅ Vercel Dev está PRONTO!

Porta 3000 está ativa e aguardando requisições!

---

## 🎯 CONFIGURAÇÃO NO POSTMAN

### Método:
```
POST
```

### URL:
```
http://localhost:3000/api/patient/login
```

### Body:
1. Clique na aba **"Body"**
2. Selecione **"raw"**
3. Selecione **"JSON"** no dropdown
4. Cole exatamente isto:

```json
{
  "accessCode": "EYNFFQ"
}
```

### Enviar:
- Clique no botão azul **"Send"**

---

## ✅ RESPOSTA ESPERADA

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "patient": {
    "id": "1c6d439f-de5e-42f4-ade1-0795b695107b",
    "name": "João da Silva",
    "email": "paciente.teste@moocafisio.com.br",
    "phone": "(11) 99999-9999"
  }
}
```

**Status:** 200 OK

---

## ⚠️ SE AINDA DER ERRO "ECONNREFUSED"

### Solução Alternativa - Use 127.0.0.1:

Ao invés de `localhost`, use:

```
http://127.0.0.1:3000/api/patient/login
```

### Ou teste via PowerShell:

```powershell
$body = @{ accessCode = "EYNFFQ" } | ConvertTo-Json
Invoke-RestMethod -Uri 'http://127.0.0.1:3000/api/patient/login' -Method Post -Body $body -ContentType 'application/json'
```

---

## 📋 CHECKLIST RÁPIDO

Antes de clicar Send:

- [x] Vercel Dev rodando (porta 3000 ativa)
- [ ] Postman aberto
- [ ] Método: POST ✅
- [ ] URL: http://localhost:3000/api/patient/login ✅
- [ ] Body: raw + JSON ✅
- [ ] JSON: { "accessCode": "EYNFFQ" } ✅
- [ ] Clicar Send ✅

---

## 🔑 DADOS

**Código:** EYNFFQ (copie exatamente)  
**Case sensitive:** Sim (maiúsculas!)  
**Tamanho:** 6 caracteres

---

**🎯 Teste agora no Postman! Vercel Dev está pronto! 🚀**

