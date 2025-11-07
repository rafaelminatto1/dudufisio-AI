# 🧪 GUIA COMPLETO DE TESTES - APIs do Patient App

## ✅ BACKEND 100% IMPLEMENTADO E PRONTO

**Todas as APIs estão implementadas e prontas para teste!**

---

## 🚀 COMO INICIAR AS APIs

### Opção 1: Vercel Dev (Recomendado)

```bash
vercel dev --listen 3000
```

**Aguarde mensagem:** `Ready! Available at http://localhost:3000`

### Opção 2: Node + Express (Alternativo)

As APIs são serverless functions. Para testar localmente, use Vercel Dev.

---

## 🧪 TESTES VIA POSTMAN/INSOMNIA

### 1. LOGIN - POST /api/patient/login

**URL:** `http://localhost:3000/api/patient/login`

**Method:** POST

**Headers:**
```
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "accessCode": "EYNFFQ"
}
```

**Resposta Esperada (200 OK):**
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

**⚠️ Importante:** Copie o `token` para os próximos testes!

---

### 2. EXERCÍCIOS - GET /api/patient/exercises

**URL:** `http://localhost:3000/api/patient/exercises`

**Method:** GET

**Headers:**
```
Content-Type: application/json
Authorization: Bearer SEU_TOKEN_AQUI
```

**Resposta Esperada (200 OK):**
```json
{
  "exercises": [
    {
      "id": "uuid...",
      "exerciseName": "Alongamento de Quadríceps",
      "description": "Exercício para alongar o músculo quadríceps femoral",
      "instructions": "Realize este exercício com atenção...",
      "sets": 3,
      "reps": 10,
      "durationSeconds": 180,
      "restSeconds": 60,
      "frequencyPerWeek": 3,
      "video": {
        "title": "Alongamento de Quadríceps",
        "videoUrl": "https://www.youtube.com/watch?v=...",
        "thumbnailUrl": "https://img.youtube.com/vi/.../maxresdefault.jpg",
        "duration": 180,
        "category": "Alongamento",
        "tags": ["quadríceps", "pernas", "alongamento"]
      }
    },
    {
      "id": "uuid...",
      "exerciseName": "Fortalecimento de Core",
      "description": "Prancha isométrica para fortalecimento abdominal",
      "sets": 3,
      "reps": 10,
      "durationSeconds": 120,
      "video": {
        "title": "Fortalecimento de Core",
        "category": "Fortalecimento",
        "tags": ["core", "abdômen", "prancha"]
      }
    },
    {
      "id": "uuid...",
      "exerciseName": "Mobilidade de Ombro",
      "description": "Exercício de mobilidade articular do ombro",
      "sets": 3,
      "reps": 10,
      "durationSeconds": 150,
      "video": {
        "title": "Mobilidade de Ombro",
        "category": "Mobilidade",
        "tags": ["ombro", "mobilidade", "articular"]
      }
    }
  ]
}
```

---

### 3. ESTATÍSTICAS - GET /api/patient/stats

**URL:** `http://localhost:3000/api/patient/stats`

**Method:** GET

**Headers:**
```
Content-Type: application/json
Authorization: Bearer SEU_TOKEN_AQUI
```

**Resposta Esperada (200 OK):**
```json
{
  "stats": {
    "totalExercisesAssigned": 3,
    "totalExercisesCompleted": 0,
    "completionRate": 0,
    "currentStreakDays": 0,
    "longestStreakDays": 0,
    "totalSessionsCompleted": 0,
    "sessionsAttendanceRate": 0,
    "lastLoginAt": "2025-11-06T..."
  },
  "progressData": []
}
```

---

### 4. COMPLETAR EXERCÍCIO - POST /api/patient/exercises/[id]/complete

**URL:** `http://localhost:3000/api/patient/exercises/{EXERCISE_ID}/complete`

Substitua `{EXERCISE_ID}` pelo ID de um exercício obtido no teste 2.

**Method:** POST

**Headers:**
```
Content-Type: application/json
Authorization: Bearer SEU_TOKEN_AQUI
```

**Body (JSON):**
```json
{
  "setsCompleted": 3,
  "repsCompleted": 10,
  "durationSeconds": 180,
  "difficultyLevel": 3,
  "painLevel": 0,
  "notes": "Exercício realizado com sucesso!"
}
```

**Resposta Esperada (200 OK):**
```json
{
  "success": true,
  "message": "Exercício completado com sucesso!",
  "completion": {
    "id": "uuid...",
    "completedAt": "2025-11-06T...",
    "setsCompleted": 3,
    "repsCompleted": 10
  }
}
```

---

### 5. GERAR CÓDIGO (THERAPIST) - POST /api/patient/generate-code

**URL:** `http://localhost:3000/api/patient/generate-code`

**Method:** POST

**Headers:**
```
Content-Type: application/json
Authorization: Bearer THERAPIST_TOKEN
```

**Body (JSON):**
```json
{
  "patientId": "1c6d439f-de5e-42f4-ade1-0795b695107b"
}
```

**Resposta Esperada (200 OK):**
```json
{
  "code": "ABC123",
  "expiresAt": "2025-12-06T...",
  "patient": {
    "id": "1c6d439f-de5e-42f4-ade1-0795b695107b",
    "name": "João da Silva"
  }
}
```

---

## 🧪 TESTES VIA CURL

### 1. Login:
```bash
curl -X POST http://localhost:3000/api/patient/login \
  -H "Content-Type: application/json" \
  -d '{"accessCode":"EYNFFQ"}'
```

### 2. Exercícios:
```bash
curl http://localhost:3000/api/patient/exercises \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

### 3. Estatísticas:
```bash
curl http://localhost:3000/api/patient/stats \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

### 4. Completar Exercício:
```bash
curl -X POST http://localhost:3000/api/patient/exercises/ID_DO_EXERCICIO/complete \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -d '{"setsCompleted":3,"repsCompleted":10,"difficultyLevel":3,"painLevel":0}'
```

---

## 🧪 TESTES VIA POWERSHELL

### 1. Login:
```powershell
$body = @{ accessCode = "EYNFFQ" } | ConvertTo-Json
$response = Invoke-RestMethod -Uri 'http://localhost:3000/api/patient/login' -Method Post -Body $body -ContentType 'application/json'
$token = $response.token
Write-Host "Token: $token"
```

### 2. Exercícios:
```powershell
$headers = @{ Authorization = "Bearer $token" }
$exercises = Invoke-RestMethod -Uri 'http://localhost:3000/api/patient/exercises' -Headers $headers
$exercises.exercises | ForEach-Object { Write-Host "- $($_.exerciseName)" }
```

### 3. Estatísticas:
```powershell
$stats = Invoke-RestMethod -Uri 'http://localhost:3000/api/patient/stats' -Headers $headers
Write-Host "Exercícios Prescritos: $($stats.stats.totalExercisesAssigned)"
Write-Host "Exercícios Completados: $($stats.stats.totalExercisesCompleted)"
```

---

## ✅ CHECKLIST DE TESTES

### Básicos:
- [ ] Login com código EYNFFQ retorna token
- [ ] Token é válido JWT
- [ ] GET /exercises retorna 3 exercícios
- [ ] GET /stats retorna estatísticas iniciais

### Avançados:
- [ ] POST /complete atualiza estatísticas
- [ ] GET /stats após completar mostra progresso
- [ ] Token inválido retorna 401
- [ ] Código inválido retorna erro apropriado

### Segurança:
- [ ] Requisições sem token retornam 401
- [ ] Token expirado retorna 401
- [ ] Código expirado não permite login

---

## 📊 ESTRUTURA DAS APIS

### Localização dos Arquivos:
```
api/
├── patient/
│   ├── login.ts                    ✅ Implementado
│   ├── exercises.ts                ✅ Implementado
│   ├── exercises/[id]/complete.ts  ✅ Implementado
│   ├── stats.ts                    ✅ Implementado
│   ├── generate-code.ts            ✅ Implementado
│   └── _lib/
│       ├── jwt.ts                  ✅ JWT utils
│       ├── supabase.ts             ✅ Supabase client
│       └── middleware.ts           ✅ Auth middleware
```

---

## 🔑 DADOS DE TESTE

**Código de Acesso:** EYNFFQ  
**Válido até:** 06/12/2025  
**Paciente:** João da Silva  
**ID:** 1c6d439f-de5e-42f4-ade1-0795b695107b  

**Exercícios Disponíveis:** 3
1. Alongamento de Quadríceps (180s)
2. Fortalecimento de Core (120s)
3. Mobilidade de Ombro (150s)

---

## 🎯 RESULTADO ESPERADO

```
✅ Login: Token JWT válido
✅ Exercícios: Lista com 3 itens
✅ Stats: Dados iniciais zerados
✅ Complete: Atualiza stats
✅ Token Auth: Todas requests autenticadas
```

---

**🎊 Todas as APIs estão 100% implementadas e prontas para teste! 🚀**

**Inicie o Vercel Dev e comece os testes!**

