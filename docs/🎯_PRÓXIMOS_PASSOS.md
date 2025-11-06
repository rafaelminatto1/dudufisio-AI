# 🎯 PRÓXIMOS PASSOS - Sistema Body Map

## ✅ Status Atual

**Banco de Dados:** ✅ Populado com sucesso!
- 10 Pacientes criados
- 15 Sessões de Body Map
- 20+ Regiões de Dor mapeadas

---

## 📋 O QUE FAZER AGORA

### 1️⃣ **Buscar o ID do Paciente**

Execute esta query no Supabase Dashboard para pegar o ID de um paciente com sessões:

```sql
SELECT 
  p.id,
  p.full_name,
  p.email,
  p.phone,
  COUNT(bms.id) as total_sessoes
FROM patients p
LEFT JOIN body_map_sessions bms ON bms.patient_id = p.id
WHERE bms.id IS NOT NULL
GROUP BY p.id, p.full_name, p.email, p.phone
ORDER BY COUNT(bms.id) DESC
LIMIT 5;
```

**Copie o `id` do primeiro paciente da lista!** 📋

---

### 2️⃣ **Configurar o Frontend**

#### Opção A: Atualizar o ID Hardcoded (Rápido para teste)

Edite `pages/PatientDetailPage.tsx` linha 30:

```typescript
// ANTES
const patient = {
  id: 'patient-1', // ❌ ID antigo
  name: 'João Silva Santos',
  // ...
};

// DEPOIS (cole o ID real)
const patient = {
  id: 'SEU-UUID-AQUI', // ✅ ID do banco
  name: 'Maria Silva Santos', // ✅ Confira o nome
  email: 'maria.silva@email.com',
  phone: '+5511987654321',
  // ...
};
```

#### Opção B: Usar Rota Dinâmica (Solução Permanente)

A página já está preparada, mas precisa configurar a rota. Verifique o arquivo de rotas e acesse:

```
http://localhost:5175/patients/SEU-UUID-AQUI
```

---

### 3️⃣ **Reiniciar o Servidor de Desenvolvimento**

```bash
# Parar o servidor atual (Ctrl+C)

# Reiniciar
npm run dev
```

---

### 4️⃣ **Testar o Body Map**

1. **Acesse a aplicação:**
   ```
   http://localhost:5175
   ```

2. **Faça login:**
   - Email: `admin@dudufisio.com`
   - Senha: `demo123456`

3. **Navegue para o paciente:**
   ```
   http://localhost:5175/patients/SEU-UUID-AQUI
   ```

4. **Clique na aba "Mapa de Dor"** 🗺️

---

### 5️⃣ **O que você deve ver:**

#### ✅ Se tudo estiver correto:

```
📊 Histórico de Evolução (3 sessões)

┌─────────────────────────────────────┐
│ Timeline de Evolução da Dor:        │
│                                     │
│ 🔴 14 dias atrás - Nível 7          │
│    "Dor lombar intensa"             │
│                                     │
│ 🟡 7 dias atrás - Nível 4           │
│    "Melhora significativa"          │
│                                     │
│ 🟢 1 dia atrás - Nível 2            │
│    "Dor praticamente controlada"    │
└─────────────────────────────────────┘

+ Botão para criar nova sessão
+ Mapa corporal interativo
+ Gráficos de evolução
```

---

## 🔍 VERIFICAÇÃO RÁPIDA

### Confirmar dados no Supabase:

```sql
-- Ver pacientes
SELECT id, full_name, email FROM patients LIMIT 5;

-- Ver sessões
SELECT 
  bms.id,
  bms.session_date,
  bms.overall_pain_level,
  bms.main_complaint_region,
  p.full_name as paciente
FROM body_map_sessions bms
JOIN patients p ON p.id = bms.patient_id
ORDER BY bms.session_date DESC;

-- Ver regiões de dor
SELECT 
  bpr.body_region,
  bpr.pain_level,
  bpr.pain_types,
  bpr.coordinates_x,
  bpr.coordinates_y,
  p.full_name as paciente
FROM body_map_pain_regions bpr
JOIN patients p ON p.id = bpr.patient_id
LIMIT 10;
```

---

## ⚠️ PROBLEMAS COMUNS

### 1. "Nenhuma sessão encontrada"

**Causa:** ID do paciente incorreto

**Solução:** 
- Verifique se o ID está correto usando a query do passo 1
- Confirme se está usando o mesmo ID no frontend

---

### 2. Erro de autenticação / RLS

**Causa:** Row Level Security bloqueando acesso

**Solução temporária (desenvolvimento):**
```sql
-- Desabilitar RLS temporariamente
ALTER TABLE body_map_sessions DISABLE ROW LEVEL SECURITY;
ALTER TABLE body_map_pain_regions DISABLE ROW LEVEL SECURITY;
ALTER TABLE patients DISABLE ROW LEVEL SECURITY;

-- OU criar policy permissiva para desenvolvimento
CREATE POLICY "allow_all_dev" ON body_map_sessions FOR ALL USING (true);
CREATE POLICY "allow_all_dev" ON body_map_pain_regions FOR ALL USING (true);
CREATE POLICY "allow_all_dev" ON patients FOR ALL USING (true);
```

⚠️ **ATENÇÃO:** Reabilitar RLS antes de produção!

---

### 3. Frontend não está atualizando

**Solução:**
```bash
# Limpar cache e reinstalar
rm -rf node_modules/.vite
npm run dev
```

---

## 🎨 PERSONALIZAÇÕES FUTURAS

Depois que confirmar que está funcionando, você pode:

1. **Adicionar mais pacientes:** Execute novamente o SQL ou crie via interface
2. **Criar novas sessões:** Use o formulário no Body Map Manager
3. **Exportar relatórios:** Botão "Gerar Relatório PDF"
4. **Configurar gráficos:** Ajustar período de visualização

---

## 📞 SUPORTE

Se encontrar problemas:

1. **Console do navegador:** F12 → Console
2. **Logs do Supabase:** Dashboard → Logs
3. **Verificar queries:** Network tab (F12)

---

## ✅ CHECKLIST DE VALIDAÇÃO

- [ ] Query SQL executou sem erros
- [ ] Dados aparecem no Supabase Dashboard
- [ ] ID do paciente está correto no frontend
- [ ] Servidor dev está rodando
- [ ] Login funcionando
- [ ] Aba "Mapa de Dor" aparece
- [ ] Histórico de sessões carrega
- [ ] Formulário de nova sessão funciona

---

## 🎉 PRONTO!

Quando tudo estiver funcionando, você terá um sistema completo de mapeamento corporal de dor com:

✅ Registro histórico de evolução
✅ Visualização em timeline
✅ Gráficos de tendência
✅ Mapa corporal interativo
✅ Relatórios PDF
✅ Analytics de progresso

**Boa sorte!** 🚀

