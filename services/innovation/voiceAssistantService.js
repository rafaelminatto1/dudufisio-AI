const SAMPLE_COMMANDS = [
    { pattern: /iniciar.*sess[aã]o/i, intent: 'start_session' },
    { pattern: /encerrar.*sess[aã]o/i, intent: 'finish_session' },
    { pattern: /registrar.*nota/i, intent: 'record_note' },
    { pattern: /agendar.*(consulta|sess[aã]o)/i, intent: 'schedule_appointment' },
    { pattern: /(ajuda|o que posso)/i, intent: 'help' },
];
export class VoiceAssistantService {
    async interpretCommand(transcript, context = {}) {
        const normalized = transcript.trim().toLowerCase();
        const match = SAMPLE_COMMANDS.find((cmd) => cmd.pattern.test(normalized));
        if (!match) {
            return { intent: 'unknown', confidence: 0.2 };
        }
        const payload = { context };
        if (match.intent === 'record_note') {
            payload.note = transcript;
        }
        return {
            intent: match.intent,
            confidence: 0.82,
            payload,
        };
    }
}
export const voiceAssistantService = new VoiceAssistantService();
