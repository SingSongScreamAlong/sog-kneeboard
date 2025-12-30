// =====================================================================
// API Integration Types
// Types for REST API and external integrations
// =====================================================================

// API Configuration
export interface ApiConfig {
    baseUrl: string;
    version: string;
    apiKey?: string;
    timeout: number;
    retryAttempts: number;
}

// Webhook configuration
export interface WebhookConfig {
    id: string;
    name: string;
    url: string;
    secret?: string;
    events: WebhookEvent[];
    isActive: boolean;
    createdAt: Date;
    lastTriggered?: Date;
    failureCount: number;
}

export type WebhookEvent =
    | 'session.started'
    | 'session.ended'
    | 'session.paused'
    | 'incident.created'
    | 'incident.reviewed'
    | 'penalty.issued'
    | 'penalty.applied'
    | 'flag.deployed'
    | 'flag.cleared'
    | 'caution.start'
    | 'caution.end'
    | 'stage.completed'
    | 'position.change'
    | 'leader.change';

export interface WebhookPayload {
    event: WebhookEvent;
    timestamp: Date;
    sessionId: string;
    data: unknown;
    signature?: string;
}

// Discord integration
export interface DiscordConfig {
    guildId: string;
    botToken: string;
    channels: {
        raceControl?: string;
        incidents?: string;
        penalties?: string;
        announcements?: string;
        stewardChat?: string;
    };
    mentions: {
        incidentNotify?: string;     // Role ID to ping
        penaltyNotify?: string;
        cautionNotify?: string;
    };
    embedColors: {
        incident: number;
        penalty: number;
        caution: number;
        green: number;
    };
}

export interface DiscordMessage {
    channelId: string;
    content?: string;
    embed?: DiscordEmbed;
    mentions?: string[];
}

export interface DiscordEmbed {
    title: string;
    description?: string;
    color: number;
    fields?: { name: string; value: string; inline?: boolean }[];
    thumbnail?: string;
    image?: string;
    footer?: { text: string; iconUrl?: string };
    timestamp?: Date;
}

// Broadcast overlay integration
export interface OverlayConfig {
    id: string;
    name: string;
    type: OverlayType;
    position: { x: number; y: number };
    size: { width: number; height: number };
    style: OverlayStyle;
    dataSource: OverlayDataSource;
    refreshInterval: number;
    isVisible: boolean;
}

export type OverlayType =
    | 'standings'
    | 'battle'
    | 'incident_ticker'
    | 'penalty_ticker'
    | 'flag_status'
    | 'lap_counter'
    | 'stage_info'
    | 'driver_card'
    | 'timing_tower'
    | 'gap_display';

export interface OverlayStyle {
    backgroundColor: string;
    textColor: string;
    accentColor: string;
    fontFamily: string;
    fontSize: number;
    opacity: number;
    borderRadius: number;
    animation?: string;
}

export interface OverlayDataSource {
    endpoint: string;
    params?: Record<string, string>;
    transform?: string;            // JS expression to transform data
}

// Custom scoring plugin
export interface ScoringPlugin {
    id: string;
    name: string;
    version: string;
    author: string;
    description: string;

    // Plugin configuration
    config: Record<string, unknown>;

    // Hooks
    hooks: {
        onSessionStart?: string;   // Function name
        onLapComplete?: string;
        onIncident?: string;
        onPositionChange?: string;
        onSessionEnd?: string;
        calculatePoints?: string;
    };

    isActive: boolean;
    loadedAt?: Date;
}

// External API endpoints
export interface ExternalApiEndpoints {
    // iRacing Data API
    iRacingData?: {
        baseUrl: string;
        headers: Record<string, string>;
    };

    // Simresults import
    simResults?: {
        baseUrl: string;
        apiKey: string;
    };

    // Custom endpoints
    custom: {
        name: string;
        url: string;
        method: 'GET' | 'POST' | 'PUT' | 'DELETE';
        headers?: Record<string, string>;
        body?: unknown;
    }[];
}

// API rate limiting
export interface RateLimitConfig {
    requestsPerMinute: number;
    requestsPerHour: number;
    burstLimit: number;
    cooldownSeconds: number;
}

// Public API types
export interface PublicApiSession {
    id: string;
    trackName: string;
    sessionType: string;
    status: string;
    currentLap: number;
    totalLaps: number;
    driversCount: number;
    flagStatus: string;
    startTime: Date;
}

export interface PublicApiStandings {
    sessionId: string;
    timestamp: Date;
    standings: {
        position: number;
        driverName: string;
        carNumber: string;
        gap: string;
        lastLap: number;
        bestLap: number;
        status: string;
    }[];
}

export interface PublicApiIncident {
    id: string;
    sessionId: string;
    lapNumber: number;
    timeInSession: string;
    type: string;
    severity: string;
    driversInvolved: string[];
    status: string;
}

// API response wrapper for integrations
export interface IntegrationApiResponse<T> {
    success: boolean;
    data?: T;
    error?: {
        code: string;
        message: string;
        details?: unknown;
    };
    meta?: {
        timestamp: Date;
        requestId: string;
        rateLimit: {
            remaining: number;
            reset: Date;
        };
    };
}
