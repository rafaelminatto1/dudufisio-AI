# 🎯 Solução Definitiva - Erro de Roles

## 🐛 Problema Atual

Os valores que estamos tentando usar (`'admin'`, `'educadorfisico'`) **não existem** no enum `user_role`.

## 🔍 Passo 1: Descobrir Valores Corretos

Execute no SQL Editor o arquivo **`DESCOBRIR_VALORES_CORRETOS.sql`**

**O que você vai ver:**
```
valor_valido
------------
admin
therapist  
patient
```
(ou outros valores dependendo do que está configurado)

**📝 ANOTE esses valores!**

---

## ✅ Passo 2: Escolher Solução

### Opção A: Se o enum só tem 3 valores (Recomendado)

Se o enum só tem: `admin`, `therapist`, `patient`

Execute no SQL Editor:

```sql
UPDATE users SET role = 'admin', name = 'Administrador' WHERE email = 'admin@dudufisio.com';
UPDATE users SET role = 'therapist', name = 'Dr. Carlos Silva' WHERE email = 'therapist@dudufisio.com';
UPDATE users SET role = 'patient', name = 'Maria Santos' WHERE email = 'patient@dudufisio.com';
UPDATE users SET role = 'therapist', name = 'João Educador' WHERE email = 'educator@dudufisio.com';  -- Usar 'therapist' como fallback
```

### Opção B: Converter para TEXT (Mais Flexível)

Execute o arquivo **`ALTERNATIVA_SEM_ENUM.sql`**

Isso vai:
- Converter `role` de ENUM para TEXT
- Permitir qualquer valor
- Funciona sem restrições

**⚠️ Aviso:** Remove a validação do enum, mas resolve o problema.

---

## 🎯 Solução Mais Rápida (RECOMENDADA)

Execute tudo de uma vez no SQL Editor:

```sql
-- Descobrir valores válidos
SELECT unnest(enum_range(NULL::user_role)) as valores_validos;

-- Depois executar (ajuste conforme os valores acima)
BEGIN;

-- Se admin existe, usa admin
UPDATE users SET role = 'admin', name = 'Administrador' WHERE email = 'admin@dudufisio.com' AND role = 'admin';

-- Se therapist existe
UPDATE users SET role = 'therapist', name = 'Dr. Carlos Silva' WHERE email = 'therapist@dudufisio.com';

-- Se patient existe  
UPDATE users SET role = 'patient', name = 'Maria Santos' WHERE email = 'patient@dudufisio.com';

-- Para educator, usar o mesmo que therapist
UPDATE users SET role = 'therapist', name = 'João Educador' WHERE email = 'educator@dudufisio.com';

COMMIT;

-- Verificar
SELECT email, name, role, created_at FROM users WHERE email LIKE '%@dudufisio.com';
```

---

## 🚀 Depois de Resolver

1. ✅ Verifique se os usuários estão atualizados:
```sql
SELECT email, name, role FROM users WHERE email LIKE '%@dudufisio.com';
```

2. ✅ Atualize `.env.local`:
```env
VITE_FALLBACK_TO_MOCK=false
```

3. ✅ Reinicie servidor:
```bash
npm run dev
```

4. ✅ Teste login:
- Email: `admin@dudufisio.com`
- Senha: `demo123456`

5. ✅ **Teste CRÍTICO:** Recarregue página (F5) → deve manter logado!

---

## 📞 Me Avise

Após resolver:
1. Qual solução funcionou (A ou B)?
2. Se o login está funcionando
3. Se a sessão persiste após reload

**Tempo estimado:** 5 minutos  
**🚀 Execute os SQLs e me diga o resultado!**

