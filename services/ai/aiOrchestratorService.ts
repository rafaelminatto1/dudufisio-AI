// Mock AI Orchestrator Service for build purposes

import { AIProvider, AIResponse, AIQueryLog } from '../../types';

export class AiOrchestratorService {
  async query(prompt: string, provider?: string): Promise<AIResponse> {
    // Mock response
    return {
      content: `Mock AI response for: ${prompt.slice(0, 50)}...`,
      source: provider || 'mock'
    };
  }

  async getQueryHistory(): Promise<AIQueryLog[]> {
    return [];
  }

  async getAvailableProviders(): Promise<AIProvider[]> {
    return ['mock' as AIProvider];
  }

  async generateSoapNote(data: any): Promise<any> {
    return {
      assessment: 'AI-generated assessment',
      plan: 'AI-generated plan'
    };
  }

  async getResponse(prompt: string): Promise<any> {
    return {
      content: `Mock response for: ${prompt}`,
      source: 'mock'
    };
  }
}

export const aiOrchestratorService = new AiOrchestratorService();