// XAI Service - Using OpenAI-compatible API
const xaiApiKey = import.meta.env.VITE_XAI_API_KEY;
export const xaiService = {
    async chat(messages, model = 'grok-beta') {
        if (!xaiApiKey) {
            throw new Error('XAI service not initialized. Check your API key.');
        }
        try {
            const response = await fetch('https://api.x.ai/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${xaiApiKey}`,
                },
                body: JSON.stringify({
                    model,
                    messages,
                    temperature: 0.7,
                    max_tokens: 1024,
                }),
            });
            if (!response.ok) {
                throw new Error(`XAI API error: ${response.status} ${response.statusText}`);
            }
            const data = await response.json();
            return data.choices[0]?.message?.content || '';
        }
        catch (error) {
            console.error('XAI API error:', error);
            throw new Error('Failed to get response from XAI API');
        }
    },
    async generateText(prompt, systemPrompt) {
        const messages = [];
        if (systemPrompt) {
            messages.push({ role: 'system', content: systemPrompt });
        }
        messages.push({ role: 'user', content: prompt });
        return this.chat(messages);
    },
    async analyzeText(text, analysisType) {
        const systemPrompt = `Você é um assistente especializado em análise de texto para fisioterapia. Analise o seguinte texto conforme solicitado: ${analysisType}`;
        return this.generateText(text, systemPrompt);
    },
    isAvailable() {
        return !!xaiApiKey;
    }
};
export default xaiService;
