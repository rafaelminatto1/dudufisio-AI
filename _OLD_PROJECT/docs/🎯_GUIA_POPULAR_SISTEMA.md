# 🎯 Guia: Popular o Sistema com Dados

## 🎲 O Que Este Script Faz

O arquivo **`🎲_POPULAR_SISTEMA_COMPLETO.sql`** vai criar:

- ✅ **10 Pacientes** com emails e dados variados
- ✅ **15 Sessões de Body Map** (3 por paciente, mostrando evolução)
- ✅ **20+ Regiões de Dor** detalhadas
- ✅ **Configuração de RLS** automática
- ✅ **Lista completa** de pacientes com URLs para acessar

## 🚀 Como Usar (3 Passos)

### 1️⃣ Abrir Supabase Dashboard
```
https://supabase.com/dashboard
→ Projeto: urfxniitfbbvsaskicfo
→ SQL Editor
→ New Query
```

### 2️⃣ Copiar e Colar
```
Abra: 🎲_POPULAR_SISTEMA_COMPLETO.sql
Copie TODO (Ctrl+A, Ctrl+C)
Cole no SQL Editor (Ctrl+V)
```

### 3️⃣ Executar
```
Clique em "Run" (ou Ctrl+Enter)
Aguarde ~10 segundos
Veja as mensagens de sucesso!
```

## 📊 O Que Você Verá

```
🚀 Iniciando população do sistema...
✅ RLS configurado
👥 Criando pacientes...
✅ Total de pacientes no sistema: 10
🗺️  Criando sessões de mapa corporal...
✅ 15 sessões de body map criadas
📍 Criando regiões de dor detalhadas...
✅ 20 regiões de dor criadas

═══════════════════════════════════════════════════════════
          ✅ SISTEMA POPULADO COM SUCESSO!
═══════════════════════════════════════════════════════════

📊 ESTATÍSTICAS:
   • Total de Pacientes: 10
   • Total de Sessões de Body Map: 15
   • Total de Regiões de Dor: 20

🎯 TESTAR AGORA:
   1. Acesse: http://localhost:5175/patients/[UUID]
   2. Login: admin@dudufisio.com / demo123456
   3. Clique na aba "Mapa de Dor"

📋 LISTA DE PACIENTES CRIADOS:
✅ 1. Email: maria.silva@email.com
      ID: abc-123-...
      Sessões: 3
      URL: http://localhost:5175/patients/abc-123-...
```

## 🎉 Depois de Executar

### 1. Acesse a Aplicação
```
http://localhost:5175
```

### 2. Faça Login
```
Email: admin@dudufisio.com
Senha: demo123456
```

### 3. Navegue

**Opção A: Ver Lista de Pacientes**
- Clique em "Pacientes" no menu
- Verá todos os 10 pacientes criados
- Clique em qualquer um para ver detalhes

**Opção B: Acessar Direto (copie a URL do log)**
- Copie a URL que apareceu no log
- Cole no navegador
- Verá os detalhes e o mapa de dor

### 4. Explore o Mapa Corporal
- Clique na aba "Mapa de Dor"
- Verá 3 sessões mostrando evolução:
  - Sessão 1 (14 dias atrás): Dor nível 7
  - Sessão 2 (7 dias atrás): Dor nível 4
  - Sessão 3 (1 dia atrás): Dor nível 2
- Timeline com gráfico de evolução
- Regiões de dor detalhadas

## 📋 Dados Criados

### Pacientes (10 total):
```
1. maria.silva@email.com       - 1985, 38 anos
2. joao.santos@email.com        - 1978, 45 anos
3. ana.oliveira@email.com       - 1992, 31 anos
4. carlos.pereira@email.com     - 1965, 58 anos
5. julia.costa@email.com        - 1988, 35 anos
6. roberto.almeida@email.com    - 1972, 51 anos
7. patricia.ferreira@email.com  - 1995, 28 anos
8. fernando.rodrigues@email.com - 1980, 43 anos
9. camila.martins@email.com     - 1990, 33 anos
10. ricardo.lima@email.com      - 1968, 55 anos
```

### Sessões de Body Map:
- **15 sessões** distribuídas entre os primeiros 5 pacientes
- Cada paciente tem **3 sessões** mostrando **evolução da dor**
- Datas: 14 dias atrás, 7 dias atrás, 1 dia atrás

### Regiões de Dor:
- **Região principal**: Lombar (em todas)
- **Região secundária**: Glúteo direito (quando dor > 5)
- **Tipos**: Aguda, Latejante
- **Níveis**: De 7 até 2 (mostra melhora)

## 🔧 Customizar

Se quiser adicionar mais dados, edite o arquivo `🎲_POPULAR_SISTEMA_COMPLETO.sql`:

**Adicionar mais pacientes:**
```sql
-- Linha ~77: adicione mais VALUES na lista
(gen_random_uuid(), 'novo@email.com', '(11) 99999-9999', '1990-01-01'::date, NOW(), NOW()),
```

**Adicionar mais sessões:**
```sql
-- Linha ~178: ajuste o LIMIT 5 para incluir mais pacientes
SELECT id FROM patients ORDER BY created_at LIMIT 10
```

**Alterar tipos de dor:**
```sql
-- Linha ~276: altere os pain_type
'queimação', 'pontada', 'formigamento', etc.
```

## ⚠️ Importante

- ✅ O script é **idempotente** (pode executar múltiplas vezes)
- ✅ Usa `ON CONFLICT DO NOTHING` para evitar duplicatas
- ✅ Configura RLS automaticamente
- ✅ Não precisa de pacientes pré-existentes
- ✅ Compatível com a estrutura atual do banco

## 🆘 Troubleshooting

### Erro: "table does not exist"
**Solução:** Aplique primeiro a migration do body map:
```
Execute: 🔥_SQL_COPIAR_COLAR_DASHBOARD.sql (apenas a parte 1 - RLS)
```

### Não aparece nenhuma sessão
**Solução:** 
1. Verifique se o script executou sem erros
2. Acesse um paciente que tem sessões (olhe o log)
3. Limpe o cache do navegador (Ctrl+Shift+Delete)

### Erro: "column does not exist"
**Solução:** O script detecta automaticamente as colunas disponíveis e se adapta. Se der erro, me avise!

---

## 🎉 Pronto para Usar!

Depois de executar o script, você terá um sistema totalmente populado e pronto para demonstrações e testes!

**🔥 Arquivos Importantes:**
- **🎲_POPULAR_SISTEMA_COMPLETO.sql** ← Execute este!
- **🔥_SQL_COPIAR_COLAR_DASHBOARD.sql** - RLS básico (alternativa)
- **🎯_GUIA_POPULAR_SISTEMA.md** - Este arquivo

