// Mock service for build purposes

export interface AIAnalysisResult {
  summary: string;
  keyPoints: string[];
  recommendations: string[];
  confidence: number;
}

export class MultimodalAIService {
  // Mock implementation
  async analyzeImage(): Promise<AIAnalysisResult> {
    return {
      summary: "Mock analysis result",
      keyPoints: ["Mock key point 1", "Mock key point 2"],
      recommendations: ["Mock recommendation 1", "Mock recommendation 2"],
      confidence: 0.85
    };
  }

  async analyzeVideo(): Promise<AIAnalysisResult> {
    return {
      summary: "Mock video analysis result",
      keyPoints: ["Mock video point 1", "Mock video point 2"],
      recommendations: ["Mock video recommendation 1", "Mock video recommendation 2"],
      confidence: 0.80
    };
  }
}

export const multimodalAIService = new MultimodalAIService();