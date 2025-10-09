export class CalendarFactory {
    static register(name, provider) {
        this.providers.set(name.toLowerCase(), provider);
    }
    static create(providerName, config) {
        const normalizedName = providerName.toLowerCase();
        const ProviderClass = this.providers.get(normalizedName);
        if (!ProviderClass) {
            const error = new Error(`Calendar provider '${providerName}' not found. Available providers: ${this.getAvailableProviders().join(', ')}`);
            error.code = 'PROVIDER_NOT_FOUND';
            error.retryable = false;
            throw error;
        }
        // Create unique key for caching instances
        const instanceKey = `${normalizedName}-${JSON.stringify(config)}`;
        if (!this.instances.has(instanceKey)) {
            try {
                const instance = new ProviderClass(config);
                this.instances.set(instanceKey, instance);
            }
            catch (error) {
                const initError = new Error(`Failed to initialize calendar provider '${providerName}': ${error instanceof Error ? error.message : 'Unknown error'}`);
                initError.code = 'PROVIDER_INITIALIZATION_FAILED';
                initError.retryable = false;
                initError.details = error;
                throw initError;
            }
        }
        return this.instances.get(instanceKey);
    }
    static getAvailableProviders() {
        return Array.from(this.providers.keys());
    }
    static isProviderRegistered(providerName) {
        return this.providers.has(providerName.toLowerCase());
    }
    static clearInstances() {
        this.instances.clear();
    }
    static async testProvider(providerName, config) {
        try {
            const service = this.create(providerName, config);
            const result = await service.testConnection();
            return {
                success: result.success,
                error: result.error?.message,
                features: service.supportedFeatures
            };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error occurred'
            };
        }
    }
    static getProviderInfo(providerName) {
        const normalizedName = providerName.toLowerCase();
        if (!this.providers.has(normalizedName)) {
            return null;
        }
        try {
            // Create a temporary instance with minimal config to get features
            const tempInstance = this.create(providerName, {});
            return {
                name: providerName,
                available: true,
                features: tempInstance.supportedFeatures
            };
        }
        catch {
            return {
                name: providerName,
                available: false
            };
        }
    }
    static async createWithFallback(primaryProvider, fallbackProvider, primaryConfig, fallbackConfig) {
        // Try primary provider first
        try {
            const primaryService = this.create(primaryProvider, primaryConfig);
            const testResult = await primaryService.testConnection();
            if (testResult.success) {
                return {
                    service: primaryService,
                    provider: primaryProvider,
                    isFallback: false
                };
            }
        }
        catch (error) {
            console.warn(`Primary calendar provider '${primaryProvider}' failed:`, error);
        }
        // Fall back to secondary provider
        try {
            const fallbackService = this.create(fallbackProvider, fallbackConfig);
            const testResult = await fallbackService.testConnection();
            if (testResult.success) {
                return {
                    service: fallbackService,
                    provider: fallbackProvider,
                    isFallback: true
                };
            }
            throw new Error(`Fallback provider '${fallbackProvider}' also failed`);
        }
        catch (error) {
            const allFailedError = new Error(`Both primary provider '${primaryProvider}' and fallback provider '${fallbackProvider}' failed`);
            allFailedError.code = 'ALL_PROVIDERS_FAILED';
            allFailedError.retryable = true;
            allFailedError.details = error;
            throw allFailedError;
        }
    }
}
CalendarFactory.providers = new Map();
CalendarFactory.instances = new Map();
// Global factory instance for easy access
export const calendarFactory = CalendarFactory;
