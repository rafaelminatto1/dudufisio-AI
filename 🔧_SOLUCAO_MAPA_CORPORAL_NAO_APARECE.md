# 🔧 SOLUÇÃO: Mapa Corporal Não Aparece

## 🚨 PROBLEMA IDENTIFICADO

O mapa corporal não está aparecendo na aba "Mapa de Dor" do paciente.

## 🔍 DIAGNÓSTICO PASSO A PASSO

### 1. Verificar se o servidor está rodando
```bash
npm run dev
```
**Deve mostrar:** `Local: http://localhost:5173/`

### 2. Verificar se a migration foi aplicada
Acesse: https://app.supabase.com → SQL Editor

Execute:
```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE 'body_map%';
```

**Deve retornar:**
- body_map_sessions
- body_map_pain_regions
- body_map_analytics_cache
- body_regions_reference

### 3. Verificar console do navegador
1. Abra o navegador
2. Pressione F12
3. Vá para a aba "Console"
4. Acesse: http://localhost:5173/patients/PAT-001
5. Clique na aba "Mapa de Dor"

**Procure por erros como:**
- `Module not found`
- `Cannot resolve`
- `TypeError`
- `ReferenceError`

## 🛠️ SOLUÇÕES

### Solução 1: Aplicar Migration (MAIS COMUM)
```sql
-- Copie TODO o conteúdo do arquivo:
-- supabase/migrations/20251013_body_map_system.sql
-- Cole no SQL Editor do Supabase e execute
```

### Solução 2: Limpar Cache e Reiniciar
```bash
# Parar o servidor (Ctrl+C)
npm run dev
# Ou
rm -rf node_modules/.vite
npm run dev
```

### Solução 3: Verificar Importações
Verifique se estes arquivos existem:
- ✅ `components/body-map/BodyMapManager.tsx`
- ✅ `components/body-map/visualizations/SVGSimpleBodyMap.tsx`
- ✅ `components/body-map/PainRegionForm.tsx`
- ✅ `components/body-map/PainHistoryTimeline.tsx`
- ✅ `services/bodyMapService.ts`

### Solução 4: Verificar Tipos TypeScript
Verifique se `types.ts` contém:
- ✅ `BodyMapSession`
- ✅ `BodyMapPainRegion`
- ✅ `BodyMapVisualizationProps`

## 🎯 TESTE RÁPIDO

1. **Acesse:** http://localhost:5173/patients/PAT-001
2. **Clique na aba:** "Mapa de Dor" (ícone de pin)
3. **Deve aparecer:**
   - Header "Mapa Corporal de Dor"
   - Seletor de visualização (4 opções)
   - Área do mapa corporal
   - Lista de pontos de dor

## 🚨 SE AINDA NÃO FUNCIONAR

### Verificar Erros Específicos:

**Erro: "Cannot resolve module"**
```bash
# Reinstalar dependências
rm -rf node_modules package-lock.json
npm install
npm run dev
```

**Erro: "Table doesn't exist"**
```sql
-- Aplicar migration completa
-- Ver arquivo: supabase/migrations/20251013_body_map_system.sql
```

**Erro: "Type not found"**
```bash
# Verificar se types.ts tem os tipos corretos
# Ver arquivo: types.ts
```

**Erro: "Component not found"**
```bash
# Verificar se todos os componentes existem
# Ver arquivo: components/body-map/
```

## 📞 SUPORTE

Se nada funcionar, execute:

```bash
# 1. Verificar status
npm run dev

# 2. Verificar erros
# Abra F12 → Console

# 3. Verificar migration
# Acesse Supabase → SQL Editor
```

## ✅ VERIFICAÇÃO FINAL

O mapa corporal deve aparecer quando:
1. ✅ Servidor rodando (npm run dev)
2. ✅ Migration aplicada no Supabase
3. ✅ Sem erros no console do navegador
4. ✅ Acessando: /patients/PAT-001 → aba "Mapa de Dor"

---

**🎯 RESULTADO ESPERADO:**
- Interface completa do mapa corporal
- 4 tipos de visualização
- Formulário para adicionar pontos de dor
- Timeline de evolução
- Gráficos e analytics

**Se aparecer isso, está funcionando perfeitamente!** ✅
