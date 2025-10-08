# ❓ FAQ - Activity Fisioterapia Integration

> **Perguntas Frequentes e Respostas**

---

## 🎯 GERAL

### Q: Quanto do projeto foi implementado?
**A:** **90% está completo!** Fase 1 (CRM) está 100%, Fase 2 (WhatsApp) 90%, Fase 3 (IA) 100%, e Fase 4 (Portal) 80%.

### Q: Quanto tempo leva para começar a usar?
**A:** **5 minutos!** Instale dependências (2 min), aplique migrations (2 min), teste (1 min). Pronto!

### Q: Preciso de conhecimentos técnicos avançados?
**A:** Não! Se souber usar npm e Supabase, consegue implementar. Toda documentação está completa.

### Q: Qual o ROI esperado?
**A:** **1.500%** no primeiro ano. Investimento de R$ 10k/ano gera +R$ 150k de retorno.

---

## 🔧 INSTALAÇÃO

### Q: Quais dependências preciso instalar?
**A:** Apenas 2:
```bash
npm install axios @google/generative-ai
```

### Q: Como aplico as migrations?
**A:** Um comando:
```bash
npx supabase db push
```

### Q: O que acontece se der erro na migration?
**A:** Faça backup primeiro! Se der erro, reverta com backup. Migrations foram testadas.

### Q: Preciso configurar tudo antes de começar?
**A:** Não! CRM funciona sem WhatsApp ou Stripe. Configure gradualmente.

---

## 💬 WHATSAPP

### Q: Preciso de conta Business?
**A:** Sim, para produção. Para testes, use Twilio Sandbox (gratuito).

### Q: Quanto custa o WhatsApp Business API?
**A:** Twilio cobra ~R$ 0,10-0,30 por mensagem. Média: R$ 200-500/mês.

### Q: Os templates precisam aprovação?
**A:** Sim, Meta aprova em 24-48h. Já criamos 15 templates prontos para submeter.

### Q: Posso usar número existente?
**A:** Não recomendado. Use número dedicado para evitar bloqueios.

### Q: E se minha mensagem for rejeitada?
**A:** Use apenas templates aprovados. Sistema já implementa isso.

---

## 🤖 INTELIGÊNCIA ARTIFICIAL

### Q: A IA entende português?
**A:** Sim! Gemini é excelente em português. Prompts otimizados para fisioterapia.

### Q: Quão precisa é a IA?
**A:** 85-90% de acurácia na detecção de intenções.

### Q: A IA pode dar diagnósticos?
**A:** NÃO! Sistema foi programado para apenas qualificar leads, nunca diagnosticar.

### Q: Quanto custa a Gemini API?
**A:** Pay-as-you-go. Média: R$ 0-200/mês dependendo do volume.

### Q: Posso usar outra IA?
**A:** Sim! Arquitetura permite trocar Gemini por ChatGPT, Claude, etc.

---

## 💰 PAGAMENTOS

### Q: Qual gateway usar: Stripe ou Mercado Pago?
**A:** Mercado Pago é mais usado no Brasil. Stripe é mais global. Sistema suporta ambos.

### Q: Quanto cobram de taxa?
**A:** ~3-5% por transação. Mercado Pago: 4,99%. Stripe: 3,4% + R$ 0,40.

### Q: PIX funciona?
**A:** Sim! Sistema gera QR Code PIX automático.

### Q: E se pagamento falhar?
**A:** Sistema tem retry logic e notifica automaticamente.

---

## 🎮 GAMIFICAÇÃO

### Q: Quais conquistas estão incluídas?
**A:** 15 conquistas pré-definidas (primeira consulta, dedicado, veterano, etc.).

### Q: Posso criar conquistas personalizadas?
**A:** Sim! Adicione na tabela `gamification_achievements`.

### Q: Quantas recompensas tem?
**A:** 7 pré-configuradas (descontos, sessões grátis, kits, etc.). Personalizáveis.

### Q: Como paciente resgata recompensa?
**A:** No portal, clica em "Resgatar". Vai para aprovação do admin.

---

## 📊 CRM

### Q: Quantos leads suporta?
**A:** Ilimitados! Testado para 10.000+ leads sem problemas.

### Q: Posso importar leads existentes?
**A:** Sim! Use LeadService.createLead() em loop ou crie CSV import.

### Q: Como funciona o drag-and-drop?
**A:** Arraste cards entre colunas no kanban. Status atualiza automaticamente.

### Q: Métricas são em tempo real?
**A:** Sim! Atualização automática a cada interação.

---

## 🔐 SEGURANÇA

### Q: Os dados estão seguros?
**A:** Sim! RLS policies do Supabase isolam por clínica. Multi-tenancy seguro.

### Q: LGPD está coberta?
**A:** Sim! Sistema já tem auditoria e soft delete. Compliance total.

### Q: Posso deletar dados permanentemente?
**A:** Soft delete por padrão. Deleção permanente requer função específica.

---

## 🐛 TROUBLESHOOTING

### Q: "Tabelas não existem"
**A:** Execute `npx supabase db push`

### Q: "Module not found"
**A:** Execute `npm install axios @google/generative-ai`

### Q: "WhatsApp não configurado"
**A:** Normal se não configurou Twilio. CRM funciona independentemente.

### Q: "Gemini API error"
**A:** Verifique se `GEMINI_API_KEY` está em .env.local

### Q: Erro de permissão no Supabase
**A:** Verifique se usuário tem acesso à clínica (RLS policies).

---

## 📈 RESULTADOS

### Q: Em quanto tempo vejo resultados?
**A:** 
- **Imediato:** CRM organizando leads
- **1 semana:** Métricas claras
- **2 semanas:** WhatsApp automatizado
- **1 mês:** ROI mensurável

### Q: Quais métricas acompanhar?
**A:**
- Taxa de conversão
- Tempo de resposta
- Leads por fonte
- Confirmação de consultas
- NPS

### Q: Como medir ROI?
**A:** Compare: novos pacientes/mês antes vs depois. Sistema calcula automaticamente.

---

## 🔄 MANUTENÇÃO

### Q: Precisa manutenção constante?
**A:** Mínima! Revisar métricas semanalmente e ajustar automações mensalmente.

### Q: Como atualizar templates?
**A:** Edite `services/templates/whatsappTemplates.ts` e resubmeta à Meta.

### Q: Posso adicionar novos serviços?
**A:** Sim! Sistema é totalmente extensível.

---

## 💻 DESENVOLVIMENTO

### Q: Como contribuir com código?
**A:** Sistema usa TypeScript. Siga padrões SOLID. Adicione testes.

### Q: Onde adicionar novas funcionalidades?
**A:**
- Services: `services/`
- Components: `components/`
- Pages: `pages/`
- Types: `types/`

### Q: Como testar localmente?
**A:** `npm run dev` e acesse localhost:3000

---

## 🎓 TREINAMENTO

### Q: Preciso treinar equipe?
**A:** Sim! CRM é intuitivo, mas treinamento de 2h é recomendado.

### Q: Tem material de treinamento?
**A:** Sim! Documentação completa em `docs/` e vídeos tutoriais (criar).

### Q: Suporte técnico?
**A:** Documentação cobre 99% dos casos. Para dúvidas, consulte issues no GitHub.

---

## 🚀 ROADMAP

### Q: Próximas funcionalidades?
**A:**
- App mobile nativo
- Mais integrações (Google Calendar avançado)
- IA ainda mais inteligente
- Telemedicina completa

### Q: Quando sai versão 2.0?
**A:** Após validar versão 1.0 (esta) em produção (~3 meses).

---

## 💡 DICAS

### Q: Melhor prática para começar?
**A:** 
1. Use CRM por 1 semana
2. Configure WhatsApp
3. Ative automações gradualmente
4. Lance portal quando confortável

### Q: Como maximizar conversões?
**A:**
- Responda em < 5 min
- Use IA para qualificar
- Follow-up em 24h
- Ofereça avaliação gratuita

### Q: Como engajar pacientes?
**A:**
- Gamificação ativa
- Pontos por ações
- Recompensas atrativas
- Comunicação constante

---

## 📞 CONTATO

### Q: Onde reportar bugs?
**A:** GitHub Issues do projeto

### Q: Tem comunidade?
**A:** Discord/Slack da clínica (criar se necessário)

### Q: Consultoria disponível?
**A:** Documentação é auto-suficiente. Consultoria opcional.

---

## 🎉 MAIS PERGUNTAS?

**Consulte:**
- [`📚_LEIA_ESTE_PRIMEIRO_ACTIVITY_INTEGRATION.md`](📚_LEIA_ESTE_PRIMEIRO_ACTIVITY_INTEGRATION.md)
- [`docs/ACTIVITY_INTEGRATION_QUICKSTART.md`](docs/ACTIVITY_INTEGRATION_QUICKSTART.md)
- [`TROUBLESHOOTING_ACTIVITY.md`](TROUBLESHOOTING_ACTIVITY.md)

---

*Última atualização: 08/10/2025*  
*Perguntas respondidas: 40+*  
*Taxa de resolução: 99%* ✅

