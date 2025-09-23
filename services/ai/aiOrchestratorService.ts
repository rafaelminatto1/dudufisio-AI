// Mock AI Orchestrator Service for build purposes

import { AIProvider, AIResponse, AIQueryLog } from '../../types';

export class AiOrchestratorService {
  async query(prompt: string, provider?: string): Promise<AIResponse> {
    // Mock response
    return {
      response: `Mock AI response for: ${prompt.slice(0, 50)}...`,
      provider: provider as AIProvider || 'mock',
      timestamp: new Date(),
      usage: { tokens: 100, cost: 0.01 }
    };
  }

  async getQueryHistory(): Promise<AIQueryLog[]> {
    return [];
  }

  async getAvailableProviders(): Promise<AIProvider[]> {
    return ['mock' as AIProvider];
  }
}

export const aiOrchestratorService = new AiOrchestratorService();