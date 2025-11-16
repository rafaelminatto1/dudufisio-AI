# 🚨 LEIA ISTO PRIMEIRO

## ⚡ Solução Rápida em 3 Passos

### ❗ IMPORTANTE: Você precisa ter PELO MENOS 1 PACIENTE no banco!

Se ainda não tem pacientes:
1. Acesse: `http://localhost:5175`
2. Faça login: `admin@dudufisio.com` / `demo123456`
3. Vá em "Pacientes" → "Novo Paciente"
4. Crie um paciente de teste
5. **DEPOIS** volte aqui e execute o SQL

---

## 📋 Passo a Passo

### 1️⃣ Abrir Supabase Dashboard
```
https://supabase.com/dashboard
→ Projeto: urfxniitfbbvsaskicfo
→ SQL Editor
→ New Query
```

### 2️⃣ Copiar e Colar SQL
```
Abra: 🔥_SQL_COPIAR_COLAR_DASHBOARD.sql
Copie TUDO (Ctrl+A, Ctrl+C)
Cole no SQL Editor (Ctrl+V)
```

### 3️⃣ Executar
```
Clique em "Run" (ou Ctrl+Enter)
```

---

## ✅ O Que Vai Acontecer

O SQL vai:
1. **Configurar RLS policies** (sem erro 401)
2. **Buscar um paciente existente** no seu banco
3. **Inserir 3 sessões de mapa corporal** para esse paciente
4. **Mostrar o ID do paciente** e URL para acessar

---

## 📊 Mensagens Esperadas

```
🚀 Iniciando configuração...
✅ RLS Policies configuradas
📊 Inserindo dados de teste...
🔍 Buscando pacientes no banco...
Total de pacientes encontrados: 1 (ou mais)
✅ Usando paciente existente com ID: abc123-def456-...
✅ 3 sessões inseridas
✅ CONFIGURAÇÃO CONCLUÍDA!

📊 Estatísticas:
   - Paciente: João Silva (ID: abc123...)
   - URL: http://localhost:5175/patients/abc123...
```

---

## 🎯 Depois de Executar

1. **Copie o UUID** do paciente (aparece nas mensagens)
2. **Cole no navegador:**
   ```
   http://localhost:5175/patients/[UUID-COPIADO]
   ```
3. **Faça login** (se não estiver logado)
4. **Clique na aba "Mapa de Dor"**

---

## 🆘 Se Der Erro

### Erro: "Nenhum paciente encontrado"
**Solução:** Crie um paciente pela interface primeiro!
1. Acesse: `http://localhost:5175`
2. Login: `admin@dudufisio.com` / `demo123456`
3. Vá em "Pacientes" → "Novo Paciente"
4. Preencha os dados e salve
5. Execute o SQL novamente

### Erro: "column ... does not exist"
**Solução:** O SQL agora está simplificado e não tenta criar pacientes, apenas usa os existentes. Este erro não deve mais ocorrer!

---

## 📁 Arquivos de Referência

- **🔥_SQL_COPIAR_COLAR_DASHBOARD.sql** ← USE ESTE!
- **⚡_INSTRUCAO_RAPIDA.md** - Guia rápido
- **✅_RESUMO_IMPLEMENTACAO_COMPLETA.md** - Documentação completa

---

**💡 Dica:** O servidor já está rodando em `http://localhost:5175`

