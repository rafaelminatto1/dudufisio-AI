import { observability } from './observabilityLogger';
export class SupabaseConfigManager {
    static getInstance() {
        if (!SupabaseConfigManager.instance) {
            SupabaseConfigManager.instance = new SupabaseConfigManager();
        }
        return SupabaseConfigManager.instance;
    }
    constructor() {
        this.config = null;
        this.loadConfig();
    }
    loadConfig() {
        try {
            const url = import.meta.env.VITE_SUPABASE_URL;
            const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
            // Detectar ambiente
            const environment = this.detectEnvironment();
            this.config = {
                url: url || '',
                anonKey: anonKey || '',
                environment,
                features: {
                    realtime: this.resolveFeatureEnabled('realtime', environment),
                    auth: this.resolveFeatureEnabled('auth', environment),
                    storage: this.resolveFeatureEnabled('storage', environment),
                    functions: this.resolveFeatureEnabled('functions', environment)
                },
                performance: {
                    timeout: this.getPerformanceConfig('timeout', environment),
                    retries: this.getPerformanceConfig('retries', environment),
                    batchSize: this.getPerformanceConfig('batchSize', environment)
                }
            };
            observability.config.load('supabase.config.loaded', {
                environment,
                hasValidCredentials: this.hasValidCredentials(),
                features: this.config.features
            });
        }
        catch (error) {
            observability.config.error('supabase.config.load_error', { error });
            throw new Error(`Erro ao carregar configuração do Supabase: ${error}`);
        }
    }
    detectEnvironment() {
        const mode = import.meta.env.MODE;
        const url = import.meta.env.VITE_SUPABASE_URL;
        if (mode === 'production' || url?.includes('supabase.co')) {
            return 'production';
        }
        else if (mode === 'staging' || url?.includes('staging')) {
            return 'staging';
        }
        else {
            return 'development';
        }
    }
    resolveFeatureEnabled(feature, environment) {
        const envVar = import.meta.env[`VITE_SUPABASE_${feature.toUpperCase()}_ENABLED`];
        if (envVar !== undefined) {
            return envVar === 'true';
        }
        // Configurações padrão por ambiente
        const defaultFeatures = {
            development: {
                realtime: true,
                auth: true,
                storage: false,
                functions: false
            },
            staging: {
                realtime: true,
                auth: true,
                storage: true,
                functions: true
            },
            production: {
                realtime: true,
                auth: true,
                storage: true,
                functions: true
            }
        };
        return defaultFeatures[environment]?.[feature] || false;
    }
    getPerformanceConfig(setting, environment) {
        const envVar = import.meta.env[`VITE_SUPABASE_${setting.toUpperCase()}`];
        if (envVar !== undefined) {
            return parseInt(envVar, 10);
        }
        // Configurações padrão por ambiente
        const defaultPerformance = {
            development: {
                timeout: 10000,
                retries: 3,
                batchSize: 50
            },
            staging: {
                timeout: 15000,
                retries: 5,
                batchSize: 100
            },
            production: {
                timeout: 30000,
                retries: 5,
                batchSize: 200
            }
        };
        return defaultPerformance[environment]?.[setting] || 10000;
    }
    getConfig() {
        if (!this.config) {
            throw new Error('Configuração do Supabase não foi carregada');
        }
        return this.config;
    }
    hasValidCredentials() {
        if (!this.config)
            return false;
        return Boolean(this.config.url &&
            this.config.anonKey &&
            this.config.anonKey !== 'your_anon_key_here' &&
            (this.config.url.includes('supabase.co') || this.config.url.includes('localhost')));
    }
    isFeatureEnabled(feature) {
        return this.config?.features[feature] || false;
    }
    getEnvironment() {
        return this.config?.environment || 'development';
    }
    getPerformanceSetting(setting) {
        return this.config?.performance[setting] || 10000;
    }
    validateConfig() {
        const errors = [];
        if (!this.config) {
            errors.push('Configuração não foi carregada');
            return { isValid: false, errors };
        }
        if (!this.config.url) {
            errors.push('VITE_SUPABASE_URL não está definida');
        }
        if (!this.config.anonKey) {
            errors.push('VITE_SUPABASE_ANON_KEY não está definida');
        }
        if (this.config.anonKey === 'your_anon_key_here') {
            errors.push('VITE_SUPABASE_ANON_KEY ainda contém valor placeholder');
        }
        if (this.config.url && !this.isValidUrl(this.config.url)) {
            errors.push('VITE_SUPABASE_URL não é uma URL válida');
        }
        const isValid = errors.length === 0;
        observability.config.validate('supabase.config.validation', {
            isValid,
            errors,
            environment: this.config.environment
        });
        return { isValid, errors };
    }
    isValidUrl(url) {
        try {
            new URL(url);
            return true;
        }
        catch {
            return false;
        }
    }
    getConnectionString() {
        if (!this.hasValidCredentials()) {
            return 'mock://development';
        }
        return `${this.config.url}?apikey=${this.config.anonKey}`;
    }
    reloadConfig() {
        this.config = null;
        this.loadConfig();
    }
    // Método para setup inicial da aplicação
    async setupApplication() {
        try {
            observability.setup.start('supabase.setup.application', {});
            const validation = this.validateConfig();
            if (!validation.isValid) {
                observability.setup.warn('supabase.setup.fallback_to_mock', {
                    errors: validation.errors
                });
                return {
                    success: true,
                    provider: 'mock',
                    message: `Usando serviços mock devido a problemas de configuração: ${validation.errors.join(', ')}`
                };
            }
            // Testar conectividade
            const { supabase } = await import('./supabase');
            const { data, error } = await supabase
                .from('users')
                .select('id')
                .limit(1);
            if (error && error.message !== 'relation "users" does not exist') {
                throw error;
            }
            observability.setup.success('supabase.setup.supabase_ready', {
                environment: this.config.environment,
                features: this.config.features
            });
            return {
                success: true,
                provider: 'supabase',
                message: `Supabase configurado com sucesso (${this.config.environment})`
            };
        }
        catch (error) {
            observability.setup.error('supabase.setup.error', { error });
            return {
                success: true,
                provider: 'mock',
                message: `Falha na conexão com Supabase, usando serviços mock: ${error}`
            };
        }
    }
    // Métodos de debug e desenvolvimento
    getDebugInfo() {
        return {
            config: this.getConfig(),
            validation: this.validateConfig(),
            environment: this.getEnvironment(),
            connectionString: this.getConnectionString()
        };
    }
    logConfigSummary() {
        const info = this.getDebugInfo();
        console.group('🔧 Supabase Configuration Summary');
        console.log('Environment:', info.environment);
        console.log('Valid credentials:', info.validation.isValid);
        console.log('Connection string:', info.connectionString);
        console.log('Features enabled:', info.config.features);
        console.log('Performance settings:', info.config.performance);
        if (!info.validation.isValid) {
            console.warn('Configuration errors:', info.validation.errors);
        }
        console.groupEnd();
    }
}
// Export singleton instance
export const supabaseConfigManager = SupabaseConfigManager.getInstance();
