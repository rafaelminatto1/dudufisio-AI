# 🚀 COMECE AQUI - Base de Conhecimento RAG

## ⚡ TL;DR - Quick Start (10 minutos)

### 1️⃣ Configure `.env.local`

```bash
OPENAI_API_KEY=sk-proj-...           # https://platform.openai.com/api-keys
NEXT_PUBLIC_SUPABASE_URL=...         # Supabase Dashboard
NEXT_PUBLIC_SUPABASE_ANON_KEY=...    # Supabase Dashboard
SUPABASE_SERVICE_ROLE_KEY=...        # Supabase Dashboard (⚠️ Secreta!)
```

### 2️⃣ Aplique Migration

**Dashboard Supabase:**
1. SQL Editor
2. Cole: `supabase/migrations/20250115000001_create_knowledge_base.sql`
3. Execute (Run)

### 3️⃣ Processe PDFs

```bash
npm run kb:populate
```

### 4️⃣ Teste

```bash
npm run kb:test
npm run dev
# → http://localhost:3000/knowledge
```

---

## ✅ Checklist Mínimo

- [ ] `.env.local` configurado
- [ ] Migration aplicada
- [ ] PDFs processados (9/9)
- [ ] Testes passaram
- [ ] Interface funcionando

---

## 📚 Documentação Completa

### Para Instalação Passo a Passo:
👉 **`CHECKLIST_INSTALACAO.md`** ← COMECE POR AQUI!

### Outros Guias:
- `RESUMO_EXECUTIVO_FINAL.md` - O que foi feito
- `INSTRUCOES_INSTALACAO_RAG.md` - Instruções detalhadas
- `README_BASE_CONHECIMENTO.md` - Overview completo

---

## 🎯 Resultado Esperado

Após seguir os 4 passos acima, você terá:

✅ Base de conhecimento com 9 PDFs indexados (240+ chunks)  
✅ Chat IA com GPT-4 respondendo perguntas  
✅ Busca semântica em toda a literatura  
✅ Citação automática de fontes  

---

## 💡 Seus PDFs (já identificados)

`C:\Users\rafal\OneDrive\Documentos\base de conhecimento`

1. LIVRO_UNICO.pdf
2. Evidence-based rehabilitation following anterior cruciate.pdf
3. Brosseau-L-et-al-2016-Ottawa-Panel...pdf
4. ijspt-11-831.pdf
5. nihms-1751132.pdf
6. ACTA-94-174.pdf
7. 1106.full.pdf
8. 1119.full.pdf
9. 12890_2024_Article_3213.pdf

**Status:** Prontos para processamento com `npm run kb:populate`

---

## 🐛 Problemas?

- **Erro na migration?** → Ver `CHECKLIST_INSTALACAO.md` seção "Troubleshooting"
- **PDFs não processam?** → Verificar se são legíveis (não imagens escaneadas)
- **Chat não responde?** → Verificar chaves no `.env.local`

---

## 🎉 Próximo Passo

**Se tudo funcionou:**  
Me envie "continue implementando" para próxima fase!

**Se teve problemas:**  
Consulte `CHECKLIST_INSTALACAO.md` para diagnóstico completo.

---

**LEMBRE-SE:** Siga `CHECKLIST_INSTALACAO.md` para guia completo! ✅

