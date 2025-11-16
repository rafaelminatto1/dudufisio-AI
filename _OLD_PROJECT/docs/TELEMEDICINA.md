# 🩺 Telemedicina - Guia de Implementação

> Responsável: Fase 4 • Status: ✅ Implementado (07/11/2025)

## 1. Visão Geral
- Sala de teleconsulta com WebRTC e fallback local
- Chat, gravação e anotações com IA em tempo real
- Monitoramento de rede e consentimento LGPD
- Integração nativa com Supabase (sinalização, gravações, chat)

## 2. Arquitetura
| Camada | Descrição |
| --- | --- |
| **Front-End** | `features/telemedicine/TelemedicineConsultation.tsx` + `LocalMediaController` |
| **Serviço WebRTC** | `services/teleconsulta/webrtcTeleconsultaService.ts` (Supabase + WebSocket) |
| **Fallback Local** | Captura `MediaStream` + `MediaRecorder` (sem sinalização) |
| **Persistência** | Tabelas Supabase `teleconsulta_sessions`, `teleconsulta_chat`, `teleconsulta_recordings` |
| **TURN/STUN** | Configuráveis via `.env` (`NEXT_PUBLIC_TURN_*`, `TURN_*`) |

## 3. Variáveis de Ambiente
```
NEXT_PUBLIC_TELEMEDICINE_WEBSOCKET_URL=ws://localhost:8080
NEXT_PUBLIC_TURN_USERNAME=web-username
NEXT_PUBLIC_TURN_PASSWORD=web-password
TURN_USERNAME=server-username
TURN_PASSWORD=server-password
```
> Dica: armazenar segredos de TURN no Vercel/Supabase secrets.

## 4. Fluxo da Sessão
1. Profissional inicia a sala (`createTeleconsultaSession`).
2. Participantes ingressam via `joinSession` (Supabase + WebSocket).
3. Tracks de áudio/vídeo são anexadas e monitoradas (`getStats`).
4. Chat e gravações persistem no Supabase Storage.
5. Se qualquer etapa cloud falhar ⇒ fallback local (captura + gravação browser).

## 5. Recursos Disponíveis
- ✅ Videochamada HD (cloud & fallback)
- ✅ Chat seguro com upload opcional
- ✅ Gravação de sessão (Supabase Storage ou MediaRecorder)
- ✅ Screen share (modo cloud)
- ✅ Anotações com IA (`TeleconsultAIService` placeholder)
- ✅ Exportação de notas (JSON)
- ✅ Monitoramento de rede (latência, bitrate, perda)

## 6. Testes Automatizados
- Arquivo: `__tests__/features/TelemedicineConsultation.test.tsx`
- Cobertura:
  - Renderização inicial
  - Fallback local (mock `getUserMedia` + `MediaRecorder`)
  - Chat offline (mensagens otimizadas)
  - Alternância de câmera (rastreamento `enabled`)
- Executar: `npm test -- TelemedicineConsultation`

## 7. Como Rodar em Desenvolvimento
1. Configurar `.env.local` com variáveis acima.
2. Opcional: subir sinalização (`ws://localhost:8080`). Qualquer servidor WebSocket que faça relay de ofertas/respostas.
3. Rodar `npm run dev` e acessar `/telemedicina` (rota protegida).
4. Sem servidor? Aplicação cairá automaticamente no modo fallback para validação rápida.

## 8. Monitoramento & Logs
- Métricas em tempo real via `onNetworkQuality` (latência, perdas).
- Logs críticos: `console.info`/`console.warn` com prefixo `[Telemedicina]`.
- Recomendado integrar com Sentry + Supabase Performance Insights.

## 9. Segurança & Conformidade
- TLS obrigatório em produção (WebRTC exige HTTPS + WSS).
- Consentimento explícito antes de gravar (`getRecordingConsent`).
- Armazenamento criptografado (Supabase storage + RLS).
- Logs de auditoria sugeridos em `teleconsulta_audit_log` (não incluído).

## 10. Próximos Passos
- [ ] Integrar transcrição real (Gemini/Whisper) + SOAP automático.
- [ ] Disponibilizar whiteboard colaborativo (Compartilhar canvas).
- [ ] Sincronizar gravações com prontuário eletrônico.
- [ ] Criar suíte E2E (Playwright) com WebRTC headless.

---
> Qualquer dúvida: abrir issue `telemedicina` ou consultar `TEAM_PLAYBOOK.md` (seção suporte clínico).
