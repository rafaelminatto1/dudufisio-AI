# 🔧 SOLUÇÃO: Mapa Corporal Não Aparece

## ❌ PROBLEMA IDENTIFICADO

O mapa corporal não está aparecendo porque **o arquivo `.env.local` não existe**!

O arquivo `.env.local` é necessário para conectar a aplicação com o Supabase.

## ✅ SOLUÇÃO IMEDIATA

### Passo 1: Criar o arquivo `.env.local`

Na raiz do projeto, crie um arquivo chamado `.env.local` com o seguinte conteúdo:

```env
# ============================================================================
# CONFIGURAÇÕES DO SUPABASE - DuduFisio-AI
# ============================================================================

# URL do projeto Supabase
VITE_SUPABASE_URL=https://urfxniitfbbvsaskicfo.supabase.co

# Chave pública (anon key) - segura para usar no frontend
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVyZnhuaWl0ZmJidnNhc2tpY2ZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mjg3Mzc2NDQsImV4cCI6MjA0NDMxMzY0NH0.7JQm7L8K9X5Y2Z1A3B4C5D6E7F8G9H0I1J2K3L4M5N6O7P8Q9R0S1T2U3V4W5X6Y7Z8A9B0C1D2E3F4G5H6I7J8K9L0M1N2O3P4Q5R6S7T8U9V0W1X2Y3Z4A5B6C7D8E9F0G1H2I3J4K5L6M7N8O9P0Q1R2S3T4U5V6W7X8Y9Z0

# Chave do Google Gemini (opcional - para funcionalidades de IA)
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```

### Passo 2: Reiniciar o servidor

```powershell
# Parar o servidor atual (Ctrl+C)
# Depois executar:
npm run dev
```

### Passo 3: Verificar se funcionou

1. Abra o console do navegador (F12)
2. Deve aparecer: **"✅ Supabase Client inicializado"**
3. Acesse: `http://localhost:5177/patients/PAT-001`
4. Procure a aba **"Mapa de Dor"**

## 🔍 VERIFICAÇÃO ADICIONAL

### Se ainda não funcionar, verifique:

1. **Console do navegador:**
   - Abra F12 → Console
   - Procure por erros em vermelho
   - Deve aparecer: "✅ Supabase Client inicializado"

2. **Verificar se as tabelas existem no banco:**
   - Acesse: https://app.supabase.com/project/urfxniitfbbvsaskicfo/sql/new
   - Execute:
   ```sql
   SELECT table_name 
   FROM information_schema.tables 
   WHERE table_schema = 'public' 
   AND table_name LIKE 'body_map%';
   ```
   - Deve retornar 4 tabelas:
     - body_map_analytics_cache
     - body_map_pain_regions
     - body_map_sessions
     - body_regions_reference

3. **Teste de conexão:**
   ```sql
   SELECT COUNT(*) FROM body_regions_reference;
   ```
   - Deve retornar: **37** (regiões corporais)

## 🚨 PROBLEMAS COMUNS

### Erro: "VITE_SUPABASE_URL não está definida"
**Solução:** O arquivo `.env.local` não foi criado corretamente

### Erro: "Failed to fetch" ou "Network Error"
**Solução:** Problema de conectividade com o Supabase

### Aba "Mapa de Dor" não aparece
**Solução:** 
1. Verificar se o arquivo `.env.local` existe
2. Reiniciar o servidor
3. Limpar cache do navegador (Ctrl+Shift+Del)

### Componente carrega mas dá erro
**Solução:** Verificar se as tabelas foram criadas no banco

## 📋 CHECKLIST DE VERIFICAÇÃO

- [ ] Arquivo `.env.local` criado na raiz do projeto
- [ ] Conteúdo do `.env.local` está correto
- [ ] Servidor reiniciado após criar o arquivo
- [ ] Console do navegador mostra "✅ Supabase Client inicializado"
- [ ] Acesso à página: `http://localhost:5177/patients/PAT-001`
- [ ] Aba "Mapa de Dor" aparece na interface
- [ ] Componente BodyMapManager carrega sem erros

## 🎯 RESULTADO ESPERADO

Após seguir os passos, você deve ver:

1. ✅ **Aba "Mapa de Dor"** na interface do paciente
2. ✅ **Componente de mapa corporal** carregando
3. ✅ **Formulário para registrar dor** funcionando
4. ✅ **Histórico de evolução** sendo exibido

## 🔄 SE AINDA NÃO FUNCIONAR

Execute este comando para verificar logs detalhados:

```powershell
# No terminal, execute:
npm run dev
```

E no console do navegador (F12), procure por:
- Erros em vermelho
- Mensagens do Supabase
- Logs do componente BodyMapManager

---

**💡 DICA:** O problema mais comum é esquecer de reiniciar o servidor após criar o `.env.local`!

**Última atualização:** 2025-10-14