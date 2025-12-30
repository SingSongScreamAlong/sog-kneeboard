// =====================================================================
// Discord Utility Tests
// Unit tests for Discord webhook functions
// =====================================================================

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
    sendDiscordWebhook,
    createIncidentEmbed,
    createPenaltyEmbed,
    createRaceControlEmbed,
    createRecommendationEmbed,
    DISCORD_COLORS,
} from './discord';

describe('Discord Utilities', () => {
    beforeEach(() => {
        vi.resetAllMocks();
    });

    describe('sendDiscordWebhook', () => {
        it('should send webhook successfully', async () => {
            global.fetch = vi.fn().mockResolvedValue({ ok: true });

            const result = await sendDiscordWebhook(
                'https://discord.com/api/webhooks/test',
                'Test message',
                []
            );

            expect(result).toBe(true);
            expect(global.fetch).toHaveBeenCalledWith(
                'https://discord.com/api/webhooks/test',
                expect.objectContaining({
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                })
            );
        });

        it('should handle failed webhook', async () => {
            global.fetch = vi.fn().mockResolvedValue({ ok: false });

            const result = await sendDiscordWebhook(
                'https://discord.com/api/webhooks/test',
                'Test message'
            );

            expect(result).toBe(false);
        });

        it('should handle network error', async () => {
            global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

            const result = await sendDiscordWebhook(
                'https://discord.com/api/webhooks/test',
                'Test message'
            );

            expect(result).toBe(false);
        });
    });

    describe('createIncidentEmbed', () => {
        it('should create incident embed with correct fields', () => {
            const embed = createIncidentEmbed({
                id: 'inc-1',
                type: 'contact',
                severity: 'medium',
                lapNumber: 15,
                drivers: ['#44 Hamilton', '#1 Verstappen'],
            });

            expect(embed.title).toBe('⚠️ Incident Detected');
            expect(embed.color).toBe(DISCORD_COLORS.ORANGE);
            expect(embed.fields).toBeDefined();
            expect(embed.fields?.length).toBeGreaterThan(0);
        });

        it('should use yellow for light severity', () => {
            const embed = createIncidentEmbed({
                id: 'inc-2',
                type: 'off_track',
                severity: 'light',
                lapNumber: 5,
                drivers: ['#44 Hamilton'],
            });

            expect(embed.color).toBe(DISCORD_COLORS.YELLOW);
        });

        it('should use red for heavy severity', () => {
            const embed = createIncidentEmbed({
                id: 'inc-3',
                type: 'collision',
                severity: 'heavy',
                lapNumber: 20,
                drivers: ['#44 Hamilton', '#1 Verstappen'],
            });

            expect(embed.color).toBe(DISCORD_COLORS.RED);
        });
    });

    describe('createPenaltyEmbed', () => {
        it('should create penalty embed with correct fields', () => {
            const embed = createPenaltyEmbed({
                driverName: 'Lewis Hamilton',
                carNumber: '44',
                type: 'time_penalty',
                reason: 'Causing a collision',
                value: 5,
            });

            expect(embed.title).toBe('🚩 Penalty Issued');
            expect(embed.color).toBe(DISCORD_COLORS.RED);
            expect(embed.fields).toBeDefined();
        });

        it('should handle penalty without value', () => {
            const embed = createPenaltyEmbed({
                driverName: 'Max Verstappen',
                carNumber: '1',
                type: 'warning',
                reason: 'Track limits',
            });

            const valueField = embed.fields?.find((f: { name: string }) => f.name === 'Value');
            expect(valueField?.value).toBe('N/A');
        });
    });

    describe('createRaceControlEmbed', () => {
        it('should create session start embed', () => {
            const embed = createRaceControlEmbed({
                type: 'session_start',
                trackName: 'Silverstone',
            });

            expect(embed.title).toBe('🏁 Session Started');
            expect(embed.color).toBe(DISCORD_COLORS.GREEN);
        });

        it('should create caution embed', () => {
            const embed = createRaceControlEmbed({
                type: 'caution',
                message: 'Debris on track - Turn 9',
                lapNumber: 25,
            });

            expect(embed.title).toBe('🟡 Caution Period');
            expect(embed.color).toBe(DISCORD_COLORS.YELLOW);
        });

        it('should handle all race control types', () => {
            const types = ['session_start', 'session_end', 'caution', 'green', 'red_flag'] as const;

            types.forEach(type => {
                const embed = createRaceControlEmbed({ type });
                expect(embed.title).toBeTruthy();
                expect(embed.color).toBeTruthy();
            });
        });
    });

    describe('createRecommendationEmbed', () => {
        it('should create recommendation embed', () => {
            const embed = createRecommendationEmbed({
                status: 'FULL_COURSE_YELLOW',
                confidence: 'HIGH',
                reasoning: 'Multiple cars involved in collision at Turn 1',
                drivers: ['#44', '#1', '#11'],
            });

            expect(embed.title).toContain('FULL COURSE YELLOW');
            expect(embed.color).toBe(DISCORD_COLORS.YELLOW);
            expect(embed.footer?.text).toContain('Internal recommendation only');
        });

        it('should use correct colors for each status', () => {
            const statusColors = [
                { status: 'GREEN', color: DISCORD_COLORS.GREEN },
                { status: 'REVIEW', color: DISCORD_COLORS.ORANGE },
                { status: 'POST_RACE_REVIEW', color: DISCORD_COLORS.PURPLE },
            ];

            statusColors.forEach(({ status, color }) => {
                const embed = createRecommendationEmbed({
                    status,
                    confidence: 'MEDIUM',
                    reasoning: 'Test',
                    drivers: [],
                });
                expect(embed.color).toBe(color);
            });
        });
    });
});
