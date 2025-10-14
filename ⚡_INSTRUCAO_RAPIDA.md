# ⚡ Instrução Rápida - Aplicar SQL

## 🔥 ERRO CORRIGIDO!

O erro era porque `'patient-1'` não é um UUID válido. 

**✅ SQL CORRIGIDO:** O arquivo `🔥_SQL_COPIAR_COLAR_DASHBOARD.sql` agora:
- Busca automaticamente um paciente existente no seu banco
- OU cria um paciente de teste se não houver nenhum
- Insere as sessões com o UUID correto
- Mostra o patient_id e a URL correta ao final

## 🚀 Como Aplicar (3 passos)

### 1. Abrir Dashboard
```
https://supabase.com/dashboard
→ Selecione projeto: urfxniitfbbvsaskicfo
→ Clique em: SQL Editor
→ Clique em: New Query
```

### 2. Copiar e Colar
```
Abra o arquivo: 🔥_SQL_COPIAR_COLAR_DASHBOARD.sql
Copie TODO o conteúdo (Ctrl+A, Ctrl+C)
Cole no SQL Editor do Supabase (Ctrl+V)
```

### 3. Executar
```
Clique em "Run" (ou pressione Ctrl+Enter)
Aguarde ~5 segundos
Veja as mensagens de confirmação ✅
```

## 📊 O que vai aparecer

Você verá mensagens como:

```
🚀 Iniciando configuração do Body Map System...
✅ RLS Policies configuradas
✅ Permissões concedidas
📊 Inserindo dados de teste...
Usando paciente existente com ID: abc123-def456-...
✅ 3 sessões inseridas para o paciente ID: abc123...
✅ Dados de teste inseridos

═══════════════════════════════════════════════
        ✅ CONFIGURAÇÃO CONCLUÍDA!
═══════════════════════════════════════════════

📊 Estatísticas:
   - Total de sessões: 3
   - RLS Status: DISABLED
   - Paciente com sessões: João Silva Santos
   - Número de sessões: 3

🎯 Próximos passos:
   1. Reinicie o servidor: npm run dev
   2. Acesse: http://localhost:5175/patients/[UUID-DO-PACIENTE]
   3. Faça login: admin@dudufisio.com / demo123456
   4. Clique na aba "Mapa de Dor"
```

## ✅ Depois de Executar

1. **Copie o UUID** do paciente que apareceu na mensagem
2. **Reinicie o servidor** (se não estiver rodando):
   ```powershell
   npm run dev
   ```
3. **Acesse no navegador** usando o UUID correto:
   ```
   http://localhost:5175/patients/[UUID-QUE-APARECEU]
   ```
4. **Faça login:**
   - Email: `admin@dudufisio.com`
   - Senha: `demo123456`
5. **Clique na aba "Mapa de Dor"**

## 🎉 Pronto!

Deve aparecer:
- ✅ Formulário para criar nova sessão
- ✅ Histórico com 3 sessões
- ✅ Timeline de evolução (dor 6 → 3 → 0)
- ✅ Gráficos e visualizações

---

**💡 Dica:** Se não funcionar, pressione F12 no navegador e veja o console para logs detalhados.

