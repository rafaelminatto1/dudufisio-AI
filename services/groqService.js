import Groq from 'groq-sdk';
const groqApiKey = import.meta.env.VITE_GROQ_API_KEY;
let groq = null;
if (groqApiKey) {
    groq = new Groq({
        apiKey: groqApiKey,
        dangerouslyAllowBrowser: true, // Enable client-side usage
    });
}
else {
    console.warn('Missing Groq API Key. AI features using Groq will be disabled.');
}
export const groqService = {
    async chat(messages, model = 'mixtral-8x7b-32768') {
        if (!groq) {
            throw new Error('Groq service not initialized. Check your API key.');
        }
        try {
            const response = await groq.chat.completions.create({
                messages,
                model,
                temperature: 0.7,
                max_tokens: 1024,
            });
            return response.choices[0]?.message?.content || '';
        }
        catch (error) {
            console.error('Groq API error:', error);
            throw new Error('Failed to get response from Groq API');
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
        const systemPrompt = `Você é um assistente especializado em análise de texto. Analise o seguinte texto conforme solicitado: ${analysisType}`;
        return this.generateText(text, systemPrompt);
    },
    isAvailable() {
        return groq !== null;
    }
};
export default groqService;
