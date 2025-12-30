// =====================================================================
// Memory Store (Week 17)
// Persistence and retrieval of engineer memory.
// =====================================================================

import { pool } from '../db/pool.js';
import {
    type EngineerMemory,
    createNewMemory,
    serializeMemory,
    deserializeMemory,
    resetMemory,
} from './memory.model.js';
import { applyPatternDecay } from './adaptation-rules.js';

// =====================================================================
// In-Memory Cache
// =====================================================================

const memoryCache = new Map<string, EngineerMemory>();

// =====================================================================
// Store Operations
// =====================================================================

/**
 * Get engineer memory for a driver.
 * Creates new memory if none exists.
 */
export async function getMemory(driverId: string): Promise<EngineerMemory> {
    // Check cache
    if (memoryCache.has(driverId)) {
        return memoryCache.get(driverId)!;
    }

    // Try database
    try {
        const result = await pool.query(
            `SELECT memory_data FROM engineer_memory WHERE driver_id = $1`,
            [driverId]
        );

        if (result.rows.length > 0) {
            const memory = deserializeMemory(result.rows[0].memory_data);
            if (memory) {
                // Apply decay before returning
                applyPatternDecay(memory);
                memoryCache.set(driverId, memory);
                return memory;
            }
        }
    } catch {
        // Table may not exist, use defaults
    }

    // Create new memory
    const newMemory = createNewMemory(driverId);
    memoryCache.set(driverId, newMemory);
    return newMemory;
}

/**
 * Save engineer memory to storage.
 */
export async function saveMemory(memory: EngineerMemory): Promise<void> {
    memoryCache.set(memory.driverId, memory);
    memory.lastUpdatedAt = Date.now();

    try {
        await pool.query(
            `INSERT INTO engineer_memory (driver_id, memory_data, updated_at)
             VALUES ($1, $2, NOW())
             ON CONFLICT (driver_id) 
             DO UPDATE SET memory_data = $2, updated_at = NOW()`,
            [memory.driverId, serializeMemory(memory)]
        );
    } catch (err) {
        console.error('Failed to save engineer memory:', err);
    }
}

/**
 * Reset memory for a driver.
 */
export async function resetDriverMemory(driverId: string): Promise<EngineerMemory> {
    const existing = await getMemory(driverId);
    const reset = resetMemory(existing);

    await saveMemory(reset);
    return reset;
}

/**
 * Delete memory for a driver (hard delete).
 */
export async function deleteMemory(driverId: string): Promise<void> {
    memoryCache.delete(driverId);

    try {
        await pool.query(
            `DELETE FROM engineer_memory WHERE driver_id = $1`,
            [driverId]
        );
    } catch {
        // Ignore
    }
}

// =====================================================================
// Session Tracking
// =====================================================================

/**
 * Mark start of a new session for memory tracking.
 */
export async function startSession(driverId: string): Promise<EngineerMemory> {
    const memory = await getMemory(driverId);

    memory.sessionsTracked++;
    memory.lastSessionAt = Date.now();

    // Apply decay at session start
    applyPatternDecay(memory);

    await saveMemory(memory);
    return memory;
}

/**
 * Mark end of session with stats.
 */
export async function endSession(
    driverId: string,
    callsDelivered: number,
    callsSuppressed: number
): Promise<void> {
    const memory = await getMemory(driverId);

    memory.totalCallsDelivered += callsDelivered;
    memory.totalCallsSuppressed += callsSuppressed;

    await saveMemory(memory);
}

// =====================================================================
// Batch Operations
// =====================================================================

/**
 * Get memories for multiple drivers.
 */
export async function getMemories(driverIds: string[]): Promise<Map<string, EngineerMemory>> {
    const result = new Map<string, EngineerMemory>();

    for (const driverId of driverIds) {
        result.set(driverId, await getMemory(driverId));
    }

    return result;
}

/**
 * Flush all cached memories to storage.
 */
export async function flushCache(): Promise<void> {
    for (const memory of memoryCache.values()) {
        await saveMemory(memory);
    }
}

// =====================================================================
// DB Schema (for reference)
// =====================================================================

export const MEMORY_TABLE_SQL = `
CREATE TABLE IF NOT EXISTS engineer_memory (
    driver_id VARCHAR(100) PRIMARY KEY,
    memory_data JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_engineer_memory_updated 
ON engineer_memory (updated_at);
`;
