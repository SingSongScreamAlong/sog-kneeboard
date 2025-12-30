// =====================================================================
// Discord Bot Integration
// Notifications and race control commands for Discord
// =====================================================================

// Discord Webhook Configuration
export interface DiscordWebhookConfig {
    webhookUrl: string;
    channelName: string;
    enabled: boolean;
    notifyOn: {
        incidents: boolean;
        penalties: boolean;
        raceControl: boolean;
        sessionStart: boolean;
        sessionEnd: boolean;
    };
}

// Discord Embed Message Format
export interface DiscordEmbed {
    title: string;
    description?: string;
    color: number;  // Decimal color
    fields?: DiscordEmbedField[];
    footer?: {
        text: string;
        icon_url?: string;
    };
    timestamp?: string;
    thumbnail?: {
        url: string;
    };
}

export interface DiscordEmbedField {
    name: string;
    value: string;
    inline?: boolean;
}

// Color constants for embeds
export const DISCORD_COLORS = {
    GREEN: 0x57F287,      // Success, race started
    YELLOW: 0xFEE75C,     // Warning, caution
    RED: 0xED4245,        // Error, penalty
    BLUE: 0x5865F2,       // Info
    ORANGE: 0xE67E22,     // Incident
    PURPLE: 0x9B59B6,     // Review
} as const;

/**
 * Send a message to Discord via webhook
 */
export async function sendDiscordWebhook(
    webhookUrl: string,
    content: string | null,
    embeds?: DiscordEmbed[]
): Promise<boolean> {
    try {
        const response = await fetch(webhookUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                content,
                embeds,
                username: 'ControlBox',
                avatar_url: 'https://controlbox.racing/logo.png',
            }),
        });
        return response.ok;
    } catch (error) {
        console.error('Discord webhook error:', error);
        return false;
    }
}

/**
 * Create an incident notification embed
 */
export function createIncidentEmbed(incident: {
    id: string;
    type: string;
    severity: string;
    lapNumber: number;
    drivers: string[];
}): DiscordEmbed {
    const severityColors: Record<string, number> = {
        light: DISCORD_COLORS.YELLOW,
        medium: DISCORD_COLORS.ORANGE,
        heavy: DISCORD_COLORS.RED,
    };

    return {
        title: `⚠️ Incident Detected`,
        description: `A ${incident.severity} ${incident.type} incident has been detected and is under review.`,
        color: severityColors[incident.severity] || DISCORD_COLORS.ORANGE,
        fields: [
            { name: 'Type', value: incident.type.replace(/_/g, ' ').toUpperCase(), inline: true },
            { name: 'Severity', value: incident.severity.toUpperCase(), inline: true },
            { name: 'Lap', value: String(incident.lapNumber), inline: true },
            { name: 'Drivers Involved', value: incident.drivers.join(', ') || 'Unknown', inline: false },
        ],
        footer: { text: `Incident ID: ${incident.id}` },
        timestamp: new Date().toISOString(),
    };
}

/**
 * Create a penalty notification embed
 */
export function createPenaltyEmbed(penalty: {
    driverName: string;
    carNumber: string;
    type: string;
    reason: string;
    value?: number;
}): DiscordEmbed {
    return {
        title: `🚩 Penalty Issued`,
        description: `A penalty has been issued to **#${penalty.carNumber} ${penalty.driverName}**`,
        color: DISCORD_COLORS.RED,
        fields: [
            { name: 'Driver', value: `#${penalty.carNumber} ${penalty.driverName}`, inline: true },
            { name: 'Penalty', value: penalty.type.replace(/_/g, ' ').toUpperCase(), inline: true },
            { name: 'Value', value: penalty.value ? `${penalty.value}s` : 'N/A', inline: true },
            { name: 'Reason', value: penalty.reason, inline: false },
        ],
        footer: { text: 'ControlBox Race Control' },
        timestamp: new Date().toISOString(),
    };
}

/**
 * Create a race control status embed
 */
export function createRaceControlEmbed(status: {
    type: 'session_start' | 'session_end' | 'caution' | 'green' | 'red_flag';
    trackName?: string;
    message?: string;
    lapNumber?: number;
}): DiscordEmbed {
    const configs: Record<string, { title: string; color: number; emoji: string }> = {
        session_start: { title: 'Session Started', color: DISCORD_COLORS.GREEN, emoji: '🏁' },
        session_end: { title: 'Session Ended', color: DISCORD_COLORS.BLUE, emoji: '🏆' },
        caution: { title: 'Caution Period', color: DISCORD_COLORS.YELLOW, emoji: '🟡' },
        green: { title: 'Green Flag', color: DISCORD_COLORS.GREEN, emoji: '🟢' },
        red_flag: { title: 'Red Flag', color: DISCORD_COLORS.RED, emoji: '🔴' },
    };

    const config = configs[status.type];

    return {
        title: `${config.emoji} ${config.title}`,
        description: status.message || (status.trackName ? `At ${status.trackName}` : ''),
        color: config.color,
        fields: status.lapNumber ? [
            { name: 'Lap', value: String(status.lapNumber), inline: true },
        ] : undefined,
        footer: { text: 'ControlBox Race Control' },
        timestamp: new Date().toISOString(),
    };
}

/**
 * Create a recommendation notification embed
 */
export function createRecommendationEmbed(recommendation: {
    status: string;
    confidence: string;
    reasoning: string;
    drivers: string[];
}): DiscordEmbed {
    const statusColors: Record<string, number> = {
        GREEN: DISCORD_COLORS.GREEN,
        LOCAL_YELLOW: DISCORD_COLORS.YELLOW,
        FULL_COURSE_YELLOW: DISCORD_COLORS.YELLOW,
        REVIEW: DISCORD_COLORS.ORANGE,
        POST_RACE_REVIEW: DISCORD_COLORS.PURPLE,
        NO_ACTION: DISCORD_COLORS.BLUE,
    };

    return {
        title: `🎯 Recommended Status: ${recommendation.status.replace(/_/g, ' ')}`,
        description: recommendation.reasoning,
        color: statusColors[recommendation.status] || DISCORD_COLORS.BLUE,
        fields: [
            { name: 'Confidence', value: recommendation.confidence, inline: true },
            { name: 'Drivers', value: recommendation.drivers.join(', ') || 'N/A', inline: true },
        ],
        footer: { text: 'ControlBox AI Analysis • Internal recommendation only' },
        timestamp: new Date().toISOString(),
    };
}
