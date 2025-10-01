# Fase 7 – Inovação e Futuro

Esta fase trabalha exclusivamente com pacientes particulares e explora tecnologias emergentes para elevar a experiência clínica. Nenhuma integração com convênios é considerada.

## Entregas implementadas

1. **Realidade Aumentada (AR)**
   - Serviço `services/innovation/arService.ts` gera overlays mockados para sessões (frames, keypoints, descrição).
2. **Integração IoT**
   - Serviço `iotGatewayService` registra dispositivos, normaliza leituras e agrega métricas.
3. **Auditoria via Blockchain**
   - Serviço `blockchainAuditService` simula encadeamento SHA-256 para auditoria imutável de ações.
4. **Voice Assistant**
   - Serviço `voiceAssistantService` interpreta comandos de voz (iniciar sessão, registrar nota, agendar) em português.

## Próximos passos sugeridos

- Evoluir AR para consumir dados reais de avaliação postural e gerar instruções personalizadas.
- Conectar IoT gateway a dispositivos físicos (MQTT/HTTP) e armazenar leituras no Supabase.
- Integrar auditoria blockchain com tabelas reais (logs de prontuário, assinaturas digitais).
- Criar UI para voice assistant (feedback visual, confirmação de comandos) e fluxo de fallback.

## Considerações
- Todos os serviços estão desacoplados e podem ser “plugados” quando os recursos físicos/infra estiverem disponíveis.
- Continuar garantindo que nenhuma feature dependa de convênios de saúde.
