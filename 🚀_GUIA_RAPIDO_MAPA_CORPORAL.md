# 🚀 GUIA RÁPIDO - Sistema de Mapa Corporal de Dor

## ⚡ INÍCIO RÁPIDO (3 PASSOS)

### Passo 1: Aplicar Migration (5 min)
1. Abra https://app.supabase.com
2. SQL Editor → New query
3. Cole: `supabase/migrations/20251013_body_map_system.sql`
4. Run (Ctrl+Enter)
5. ✅ Pronto!

### Passo 2: Iniciar App (1 min)
```bash
npm run dev
```

### Passo 3: Usar! (Imediato)
1. Vá para Pacientes
2. Click em qualquer paciente
3. Aba "📍 Mapa de Dor"
4. Comece a registrar!

---

## 📍 COMO REGISTRAR DOR

### Fluxo Simples
1. **Paciente chega** com queixa de dor
2. **Abrir ficha** do paciente
3. **Click** na aba "Mapa de Dor"
4. **Escolher visualização** (4 opções no topo)
5. **Click no corpo** onde dói
6. **Preencher:**
   - Região: ex "lombar"
   - Nível: 0-10 (mover slider)
   - Tipo: ex "latejante"
   - Sintomas: ex "rigidez, irradiação"
7. **Salvar**
8. **Repetir** para outras regiões
9. **Pronto!** Gráficos aparecem automaticamente

### Se Veio Sem Dor
- Click no botão verde "Marcar Sem Dor"
- Sistema registra tudo automaticamente
- ✅ Sessão salva!

---

## 🎯 FUNCIONALIDADES PRINCIPAIS

### 1. Queixa Principal (⭐)
- Aparece **sempre destacada** com badge amarelo
- Definida no cadastro do paciente
- **Não pode ser removida**, apenas resolvida
- Progresso acompanhado separadamente

### 2. Múltiplos Pontos
- Adicione **quantos pontos quiser**
- Cada um com características próprias
- Vista frontal E posterior
- Edit/delete individual

### 3. Escalas de Dor
- **0:** Sem dor
- **1-2:** Leve  
- **3-4:** Moderada
- **5-6:** Forte
- **7-8:** Muito Forte
- **9-10:** Intensa/Insuportável

### 4. Tipos de Dor (8 opções)
- Aguda
- Latejante
- Queimação
- Formigamento
- Cansaço
- Pontada
- Pressão
- Choque

### 5. Visualizações (4 tipos)
**Simples:** Rápido para uso básico  
**Detalhado:** Anatômico com animações  
**Interativo:** Canvas com desenho livre  
**Anatômico:** Imagem profissional

Escolha o que você mais gosta!

---

## 📊 VER EVOLUÇÃO

### Timeline Automática
- Scroll down na aba "Mapa de Dor"
- Gráficos aparecem automaticamente
- Mostra:
  - Evolução da dor ao longo do tempo
  - Estatísticas (média, min, max)
  - Tendência (melhorando/piorando)
  - Sessões sem dor

### Dashboard Completo
1. Click em "Ver Dashboard Completo"
2. Ou navegue: `/body-map-dashboard/:patientId`
3. **3 abas disponíveis:**
   - **Dashboard:** Todos os gráficos
   - **Timeline:** Histórico cronológico
   - **Comparação:** Primeira vs Atual

---

## 📄 GERAR RELATÓRIO PDF

### Para Médico
1. Abrir dashboard completo
2. Selecionar período (7d, 30d, 90d, todos)
3. Click "Exportar PDF"
4. **PDF pronto!** Com:
   - Dados do paciente
   - Queixa principal
   - Estatísticas
   - Gráficos de evolução
   - Regiões afetadas
   - Comparação antes/depois
   - Assinatura digital

---

## 🔧 DICAS DE USO

### Para Máxima Eficiência
1. **Defina a queixa principal** no cadastro
2. **Use a visualização favorita** (salva preferência)
3. **Marque "sem dor"** quando aplicável
4. **Revise o histórico** antes da sessão
5. **Mostre gráficos** ao paciente (motivação!)

### Atalhos Úteis
- **Click duplo** no ponto: Editar rápido
- **Esc:** Fechar formulário
- **Tab:** Navegar formulário
- **Enter:** Salvar

### Regiões Mais Usadas
- Lombar, Cervical, Ombros
- Joelhos, Quadris
- Punhos, Tornozelos

---

## 🎨 RECURSOS VISUAIS

### Indicadores
| Visual | Significado |
|--------|-------------|
| ⭐ Badge Amarelo | Queixa Principal |
| ✓ Verde | Dor Resolvida |
| Pulso Animado | Queixa Ativa |
| Número no Centro | Nível de Dor |
| Barra Colorida | Intensidade |

### Tendências
| Icon | Significado |
|------|-------------|
| 📉 Verde | Melhorando |
| 📈 Vermelho | Piorando |
| ➖ Amarelo | Estável |

---

## 💡 CASOS DE USO

### Caso 1: Lombalgia Crônica
1. Cadastrar paciente com queixa: "Lombalgia"
2. Região: "lombar"
3. Sistema pré-marca em todas as sessões
4. Fisio adiciona outras dores conforme aparecem
5. Acompanha evolução da lombar separadamente

### Caso 2: Pós-Cirúrgico
1. Registro inicial: dor 8/10 no joelho
2. Sessões seguintes: 7, 6, 5, 4...
3. Gráfico mostra melhoria clara
4. Paciente vê progresso e se motiva
5. Médico recebe PDF com evolução

### Caso 3: Múltiplos Pontos
1. Paciente com cervical + lombar + ombro
2. Registrar todos os 3 pontos
3. Cada um com nível diferente
4. Sistema mostra quais melhoraram/pioraram
5. Foco na queixa principal

---

## 🆘 TROUBLESHOOTING

### Migration não aplica
✅ **Solução:** Usar Dashboard do Supabase (não CLI)

### Componente não aparece
✅ **Solução:** Limpar cache
```bash
rm -rf node_modules/.vite
npm run dev
```

### Erro ao salvar
✅ **Verificar:**
- Migration foi aplicada?
- Conexão com Supabase OK?
- Console do navegador (F12)

### Gráficos não aparecem
✅ **Precisa:** Pelo menos 2 sessões registradas

---

## 📞 SUPORTE

### Documentação
- Ver arquivos `.md` na raiz do projeto
- Comentários no código-fonte
- Tipos TypeScript como referência

### Logs
- Console do navegador (F12)
- Console do terminal (backend)
- Logs do Supabase (dashboard)

---

## ✅ CHECKLIST DE USO DIÁRIO

**Antes da sessão:**
- [ ] Abrir ficha do paciente
- [ ] Revisar última sessão do mapa

**Durante a sessão:**
- [ ] Perguntar: "Onde está doendo?"
- [ ] Registrar cada ponto no mapa
- [ ] Preencher níveis e tipos
- [ ] Salvar sessão

**Depois:**
- [ ] Mostrar evolução ao paciente
- [ ] Ajustar tratamento conforme mapa
- [ ] Gerar PDF se for alta/encaminhamento

---

## 🎉 PRONTO!

**Sistema 100% Funcional e Pronto para Uso!**

Comece agora mesmo:
1. Aplicar migration
2. Abrir paciente
3. Registrar primeira dor
4. Ver a mágica acontecer! ✨

---

**Bom trabalho e ótimos atendimentos!** 💪

_Sistema criado para facilitar sua vida e melhorar o cuidado dos pacientes._

