// =====================================================================
// Relay Authentication (Week 1)
// Simple API key validation for relay agents.
// =====================================================================

/**
 * Validate relay API key
 * In production, this should check against a database.
 * For Week 1, we accept env var or any non-empty key in dev.
 */
export async function validateRelayApiKey(apiKey: string): Promise<boolean> {
    if (!apiKey || apiKey.length === 0) {
        return false;
    }

    // Check against configured key(s)
    const configuredKey = process.env.RELAY_API_KEY || 'dev-relay-key';
    const configuredKeys = configuredKey.split(',').map(k => k.trim());

    if (configuredKeys.includes(apiKey)) {
        return true;
    }

    // In development, accept any non-empty key for testing
    if (process.env.NODE_ENV !== 'production') {
        console.log(`⚠️  DEV MODE: Accepting relay API key without validation`);
        return true;
    }

    return false;
}

/**
 * Check if a socket is authenticated as a relay
 */
export function isRelayAuthenticated(socketData: Record<string, unknown>): boolean {
    return socketData.agentType === 'relay' && typeof socketData.sessionId === 'string';
}
