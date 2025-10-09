const createLogger = (category) => ({
    info: (event, payload) => {
        // Only log info in development mode
        if (import.meta.env.DEV) {
            console.info(`[${category}] ${event}`, payload);
        }
    },
    warn: (event, payload) => {
        // Only log warnings in development mode
        if (import.meta.env.DEV) {
            console.warn(`[${category}] ${event}`, payload);
        }
    },
    error: (event, payload) => {
        // Always log errors, but reduce noise for known issues
        const shouldLog = !event.includes('supabase.credentials.missing') || import.meta.env.DEV;
        if (shouldLog) {
            console.error(`[${category}] ${event}`, payload);
        }
    },
    debug: (event, payload) => {
        // Only log debug in development mode
        if (import.meta.env.DEV) {
            console.debug(`[${category}] ${event}`, payload);
        }
    },
});
export const observability = {
    security: createLogger('security'),
    database: createLogger('database'),
    application: createLogger('application'),
    communication: createLogger('application'), // Using 'application' category
    audit: createLogger('security'),
    service: {
        ...createLogger('application'),
        call: (event, payload) => {
            // Alias para info para compatibilidade
            createLogger('application').info(event, payload);
        }
    },
    config: {
        load: (event, payload) => console.info(`[config] ${event}`, payload),
        error: (event, payload) => console.error(`[config] ${event}`, payload),
        validate: (event, payload) => console.info(`[config] ${event}`, payload),
    },
    setup: {
        start: (event, payload) => console.info(`[setup] ${event}`, payload),
        warn: (event, payload) => console.warn(`[setup] ${event}`, payload),
        success: (event, payload) => console.info(`[setup] ${event}`, payload),
        error: (event, payload) => console.error(`[setup] ${event}`, payload),
    },
};
