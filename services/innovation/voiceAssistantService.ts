interface VoiceCommandContext {
  patientId?: string;
  sessionId?: string;
}

interface VoiceCommandResult {
  intent: 'start_session' | 'finish_session' | 'record_note' | 'schedule_appointment' | 'help' | 'unknown';
  confidence: number;
  payload?: Record<string, unknown>;
}

const SAMPLE_COMMANDS: Array<{ pattern: RegExp; intent: VoiceCommandResult['intent'] }> = [
  { pattern: /iniciar.*sess[aã]o/i, intent: 'start_session' },
  { pattern: /encerrar.*sess[aã]o/i, intent: 'finish_session' },
  { pattern: /registrar.*nota/i, intent: 'record_note' },
  { pattern: /agendar.*(consulta|sess[aã]o)/i, intent: 'schedule_appointment' },
  { pattern: /(ajuda|o que posso)/i, intent: 'help' },
];

export class VoiceAssistantService {
  async interpretCommand(transcript: string, context: VoiceCommandContext = {}): Promise<VoiceCommandResult> {
    const normalized = transcript.trim().toLowerCase();

    const match = SAMPLE_COMMANDS.find((cmd) => cmd.pattern.test(normalized));
    if (!match) {
      return { intent: 'unknown', confidence: 0.2 };
    }

    const payload: Record<string, unknown> = { context };

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
