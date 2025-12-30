// =====================================================================
// Environment Configuration (Week 12)
// Validated, typed config from environment variables.
// =====================================================================

import { z } from 'zod';

// =====================================================================
// Schema Definition
// =====================================================================

const AppEnvSchema = z.enum(['local', 'staging', 'production']);

const EnvSchema = z.object({
    // Core
    APP_ENV: AppEnvSchema.default('local'),
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    PORT: z.coerce.number().default(3000),
    BASE_URL: z.string().url().default('http://localhost:3000'),

    // Database
    DATABASE_URL: z.string().min(1),
    DB_POOL_SIZE: z.coerce.number().default(10),

    // Redis
    REDIS_URL: z.string().optional(),
    REDIS_ENABLED: z.coerce.boolean().default(false),

    // Auth
    JWT_SECRET: z.string().min(32),
    JWT_EXPIRES_IN: z.string().default('7d'),
    API_KEY_SALT: z.string().min(16),
    DEV_AUTH_MODE: z.coerce.boolean().default(false),

    // Public Access
    PUBLIC_SPECTATOR_MODE: z.coerce.boolean().default(true),
    PUBLIC_MAX_CONCURRENT_SESSIONS: z.coerce.number().default(10),

    // Telemetry Ingestion
    TELEMETRY_INGEST_ENABLED: z.coerce.boolean().default(true),
    TELEMETRY_MAX_RATE_HZ: z.coerce.number().default(60),

    // Retention (days)
    RETENTION_RAW_FRAMES_DAYS: z.coerce.number().default(14),
    RETENTION_TIMING_DAYS: z.coerce.number().default(90),
    RETENTION_HIGHLIGHTS_DAYS: z.coerce.number().default(365),
    RETENTION_AUDIT_DAYS: z.coerce.number().default(365),

    // Cost Guardrails
    MAX_REPLAY_STORAGE_GB: z.coerce.number().default(10),
    MAX_OVERLAY_CLIENTS_PER_SESSION: z.coerce.number().default(50),
    MAX_SESSIONS_PER_ORG: z.coerce.number().default(100),

    // Observability
    LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
    LOG_FORMAT: z.enum(['json', 'pretty']).default('json'),
    METRICS_ENABLED: z.coerce.boolean().default(true),

    // Build Info (injected at build time)
    BUILD_VERSION: z.string().default('dev'),
    BUILD_SHA: z.string().default('local'),
    BUILD_TIME: z.string().default(new Date().toISOString()),

    // Stripe
    STRIPE_SECRET_KEY: z.string().startsWith('sk_').min(1).default('sk_test_placeholder'),
    STRIPE_PUBLISHABLE_KEY: z.string().startsWith('pk_').min(1).default('pk_test_placeholder'),
    STRIPE_WEBHOOK_SECRET: z.string().startsWith('whsec_').min(1).default('whsec_placeholder'),

    // Stripe Price IDs
    STRIPE_PRICE_TEAM_MONTHLY: z.string().min(1).default('price_placeholder'),
    STRIPE_PRICE_TEAM_ANNUAL: z.string().min(1).default('price_placeholder'),
    STRIPE_PRICE_LEAGUE_MONTHLY: z.string().min(1).default('price_placeholder'),
    STRIPE_PRICE_LEAGUE_ANNUAL: z.string().min(1).default('price_placeholder'),
    STRIPE_PRICE_BROADCAST_MONTHLY: z.string().min(1).default('price_placeholder'),
    STRIPE_PRICE_BROADCAST_ANNUAL: z.string().min(1).default('price_placeholder'),
});

export type Env = z.infer<typeof EnvSchema>;
export type AppEnv = z.infer<typeof AppEnvSchema>;

// =====================================================================
// Validation
// =====================================================================

let _config: Env | null = null;

/**
 * Load and validate environment configuration at boot.
 * Throws if required vars are missing or invalid.
 */
export function loadConfig(): Env {
    if (_config) return _config;

    const result = EnvSchema.safeParse(process.env);

    if (!result.success) {
        console.error('❌ Environment validation failed:');
        for (const issue of result.error.issues) {
            console.error(`  - ${issue.path.join('.')}: ${issue.message}`);
        }
        process.exit(1);
    }

    _config = result.data;

    // Safety checks for production
    if (_config.APP_ENV === 'production') {
        if (_config.DEV_AUTH_MODE) {
            console.error('❌ DEV_AUTH_MODE must be false in production');
            process.exit(1);
        }
        if (_config.JWT_SECRET === 'dev-secret-change-me') {
            console.error('❌ JWT_SECRET must be changed in production');
            process.exit(1);
        }
    }

    console.log(`✅ Config loaded: ${_config.APP_ENV} (${_config.NODE_ENV})`);
    return _config;
}

/**
 * Get config (must call loadConfig first).
 */
export function getConfig(): Env {
    if (!_config) {
        throw new Error('Config not loaded. Call loadConfig() first.');
    }
    return _config;
}

// =====================================================================
// Environment Helpers
// =====================================================================

export function isProduction(): boolean {
    return getConfig().APP_ENV === 'production';
}

export function isStaging(): boolean {
    return getConfig().APP_ENV === 'staging';
}

export function isLocal(): boolean {
    return getConfig().APP_ENV === 'local';
}

export function isDevelopment(): boolean {
    return getConfig().NODE_ENV === 'development';
}

// =====================================================================
// Client-Safe Config
// =====================================================================

/**
 * Get config safe for client (no secrets).
 */
export function getClientConfig() {
    const config = getConfig();
    return {
        appEnv: config.APP_ENV,
        baseUrl: config.BASE_URL,
        publicSpectatorMode: config.PUBLIC_SPECTATOR_MODE,
        buildVersion: config.BUILD_VERSION,
        buildSha: config.BUILD_SHA,
    };
}
