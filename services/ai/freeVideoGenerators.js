/**
 * Free Video Generators Integration
 * Integração com ferramentas gratuitas de geração de vídeos
 */
import { GoogleGenerativeAI } from '@google/generative-ai';
const GEMINI_API_KEY = process.env.VITE_GEMINI_API_KEY || 'AIzaSyDc5vZXFRAlU18dl1Bk9K2NT-BS8GmuLtM';
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
// Ferramentas gratuitas de geração de vídeos
export const FREE_VIDEO_TOOLS = {
    capcut: {
        id: 'capcut',
        name: 'CapCut',
        description: 'Gerador de vídeo com IA totalmente gratuito',
        url: 'https://www.capcut.com/tools/ai-video-generator',
        features: ['Text-to-Video', 'Image-to-Video', 'Templates', 'Efeitos IA'],
        limitations: 'Marca d\'água em alguns casos',
        quality: 'HD (1080p)',
        maxDuration: 60, // segundos
        formats: ['MP4', 'MOV'],
        howToUse: [
            '1. Abra CapCut.com/tools/ai-video-generator',
            '2. Cole o prompt otimizado',
            '3. Escolha estilo e duração',
            '4. Clique "Generate"',
            '5. Aguarde processamento (1-2 min)',
            '6. Baixe o vídeo',
            '7. Faça upload no sistema',
        ],
    },
    canva: {
        id: 'canva',
        name: 'Canva',
        description: 'Editor de vídeos com IA e templates prontos',
        url: 'https://www.canva.com/create/videos/',
        features: ['Templates', 'IA generativa', 'Animações', 'Biblioteca de mídia'],
        limitations: 'Conta gratuita com recursos limitados',
        quality: 'HD (1080p)',
        maxDuration: 60,
        formats: ['MP4', 'GIF'],
        howToUse: [
            '1. Acesse Canva.com',
            '2. Busque "AI Video Generator"',
            '3. Use template ou crie do zero',
            '4. Adicione elementos com IA',
            '5. Personalize',
            '6. Baixe o vídeo',
            '7. Faça upload no sistema',
        ],
    },
    hyperAI: {
        id: 'hyperAI',
        name: 'Hyper AI',
        description: 'Gera vídeos de alta qualidade a partir de prompts',
        url: 'https://hyperhuman.deemos.com/',
        features: ['Text-to-Video', 'Image-to-Video', 'Alta qualidade', 'Gratuito'],
        limitations: 'Créditos limitados por dia',
        quality: '4K',
        maxDuration: 20,
        formats: ['MP4'],
        howToUse: [
            '1. Acesse Hyper AI',
            '2. Faça login gratuito',
            '3. Cole o prompt otimizado',
            '4. Escolha configurações',
            '5. Gere o vídeo (2-3 min)',
            '6. Baixe',
            '7. Upload automático no sistema',
        ],
    },
    adobeFirefly: {
        id: 'adobeFirefly',
        name: 'Adobe Firefly',
        description: 'IA generativa da Adobe para vídeos dinâmicos',
        url: 'https://firefly.adobe.com/',
        features: ['Text-to-Video', 'Image-to-Video', 'Animações', 'Efeitos'],
        limitations: 'Créditos mensais gratuitos',
        quality: 'HD (1080p)',
        maxDuration: 30,
        formats: ['MP4'],
        howToUse: [
            '1. Acesse Adobe Firefly',
            '2. Selecione "Text to Video"',
            '3. Cole o prompt',
            '4. Ajuste configurações',
            '5. Gere (1-2 min)',
            '6. Baixe',
            '7. Upload no sistema',
        ],
    },
};
/**
 * Serviço de Geração Gratuita de Vídeos
 */
export class FreeVideoGeneratorService {
    constructor() {
        this.model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    }
    /**
     * Gera guia completo para criar vídeo usando ferramenta gratuita
     */
    async generateVideoGuide(exerciseName, modality, tool, additionalContext) {
        const toolInfo = FREE_VIDEO_TOOLS[tool];
        // Otimizar prompt para a ferramenta específica
        const optimizedPrompt = await this.optimizePromptForTool(exerciseName, modality, tool, additionalContext);
        return {
            tool: toolInfo.name,
            optimizedPrompt,
            steps: toolInfo.howToUse,
            estimatedTime: '2-3 minutos',
            directLink: toolInfo.url,
        };
    }
    /**
     * Otimiza prompt para ferramenta específica
     */
    async optimizePromptForTool(exerciseName, modality, tool, additionalContext) {
        const toolInfo = FREE_VIDEO_TOOLS[tool];
        const promptOptimization = `
Você é um especialista em criar prompts para geração de vídeos usando ${toolInfo.name}.

Exercício: ${exerciseName}
Modalidade: ${modality}
Contexto adicional: ${additionalContext || 'N/A'}

Ferramenta: ${toolInfo.name}
Features disponíveis: ${toolInfo.features.join(', ')}
Qualidade máxima: ${toolInfo.quality}
Duração máxima: ${toolInfo.maxDuration}s

Crie um prompt OTIMIZADO para ${toolInfo.name} que:

1. **Seja claro e específico** (${toolInfo.name} funciona melhor com prompts diretos)
2. **Descreva a cena visual** (ambiente, iluminação, cores)
3. **Especifique a ação** (movimento, técnica, execução)
4. **Inclua detalhes técnicos** (câmera, ângulos, velocidade)
5. **Seja adequado para fisioterapia/esporte** (profissional, educacional)
6. **Otimizado para a ferramenta** (características específicas do ${toolInfo.name})

Formato do prompt:
- Descrição visual clara
- Ação específica
- Estilo e qualidade
- Duração e ritmo

Responda APENAS com o prompt otimizado, sem explicações adicionais.
Máximo 200 palavras, direto e objetivo.
`;
        const result = await this.model.generateContent(promptOptimization);
        const response = await result.response;
        return response.text().trim();
    }
    /**
     * Gera múltiplos prompts para diferentes ferramentas
     */
    async generateMultiToolPrompts(exerciseName, modality, additionalContext) {
        const guides = {};
        for (const toolKey of Object.keys(FREE_VIDEO_TOOLS)) {
            guides[toolKey] = await this.generateVideoGuide(exerciseName, modality, toolKey, additionalContext);
        }
        return guides;
    }
    /**
     * Sugere melhor ferramenta baseada nos requisitos
     */
    suggestBestTool(requirements) {
        if (requirements.quality === '4k') {
            return 'hyperAI';
        }
        if (requirements.needsTemplates) {
            return 'canva';
        }
        if (requirements.needsAnimation) {
            return 'adobeFirefly';
        }
        if (requirements.duration && requirements.duration > 30) {
            return 'capcut';
        }
        // Default: CapCut (mais fácil e rápido)
        return 'capcut';
    }
    /**
     * Obtém informações de uma ferramenta
     */
    getToolInfo(tool) {
        return FREE_VIDEO_TOOLS[tool];
    }
    /**
     * Lista todas as ferramentas disponíveis
     */
    listAvailableTools() {
        return Object.entries(FREE_VIDEO_TOOLS).map(([key, tool]) => ({
            id: key,
            ...tool,
        }));
    }
}
// Exportar instância singleton
export const freeVideoGeneratorService = new FreeVideoGeneratorService();
export default freeVideoGeneratorService;
