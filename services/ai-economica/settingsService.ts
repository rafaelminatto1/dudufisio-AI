// services/ai-economica/settingsService.ts
import { AI_PROVIDERS_CONFIG, ProviderSettings, DEFAULT_AI_PROVIDER } from './aiProviders';
import { PremiumProvider } from './types/ai-economica.types';

const SETTINGS_KEY = 'fisioflow_ai_settings';

export interface AiSettings {
    providers: Record<string, { enabled: boolean }>;
    defaultProvider: PremiumProvider;
}

export const settingsService = {
    getSettings(): AiSettings {
        try {
            const storedSettings = localStorage.getItem(SETTINGS_KEY);
            if (storedSettings) {
                return JSON.parse(storedSettings);
            }
        } catch (error) {
            console.error("Failed to parse AI settings from localStorage", error);
        }
        
        // Default settings from config file
        const providerSettings: Record<string, { enabled: boolean }> = {};
        for (const key in AI_PROVIDERS_CONFIG) {
            const config = AI_PROVIDERS_CONFIG[key];
            if (config) {
                providerSettings[key] = { enabled: config.enabled };
            }
        }
        return {
            providers: providerSettings,
            defaultProvider: DEFAULT_AI_PROVIDER,
        };
    },

    saveSettings(settings: AiSettings): void {
        try {
            localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
        } catch (error) {
            console.error("Failed to save AI settings to localStorage", error);
        }
    },
    
    getMergedProviderConfigs(): Record<string, ProviderSettings> {
        const settings = this.getSettings();
        const mergedConfigs: Record<string, ProviderSettings> = {};

        for (const key in AI_PROVIDERS_CONFIG) {
            const config = AI_PROVIDERS_CONFIG[key];
            if (config) {
                mergedConfigs[key] = {
                    ...config,
                    enabled: settings.providers[key]?.enabled ?? config.enabled,
                };
            }
        }
        return mergedConfigs;
    }
};