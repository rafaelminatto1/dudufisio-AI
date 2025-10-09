// Mock AI Orchestrator Service for build purposes
export class AiOrchestratorService {
    async query(prompt, provider) {
        // Mock response
        return {
            content: `Mock AI response for: ${prompt.slice(0, 50)}...`,
            source: provider || 'mock'
        };
    }
    async getQueryHistory() {
        return [];
    }
    async getAvailableProviders() {
        return ['mock'];
    }
    async generateSoapNote(data) {
        return {
            assessment: 'AI-generated assessment',
            plan: 'AI-generated plan'
        };
    }
    async getResponse(prompt) {
        return {
            content: `Mock response for: ${prompt}`,
            source: 'mock'
        };
    }
}
export const aiOrchestratorService = new AiOrchestratorService();
