/**
 * BroadcastBox E2E Tests
 * Smoke tests for core functionality
 */

import { test, expect } from '@playwright/test';

test.describe('BroadcastBox Smoke Tests', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        // Wait for app to load
        await page.waitForSelector('.app-layout', { timeout: 10000 });
    });

    test('loads application successfully', async ({ page }) => {
        // Verify main layout exists
        await expect(page.locator('.app-layout')).toBeVisible();

        // Verify key components are present
        await expect(page.locator('.topbar')).toBeVisible();
        await expect(page.locator('.driver-stack')).toBeVisible();
        await expect(page.locator('.main-feed')).toBeVisible();
        await expect(page.locator('.leaderboard')).toBeVisible();
    });

    test('displays logo and branding', async ({ page }) => {
        // Check for logo stripes
        await expect(page.locator('.logo-stripes')).toBeVisible();
        await expect(page.locator('.logo-text')).toContainText('OK, BOX BOX');
        await expect(page.locator('.logo-product')).toContainText('BroadcastBox');
    });

    test('displays driver stack with tiles', async ({ page }) => {
        // Should have at least one driver tile
        const driverTiles = page.locator('.driver-tile');
        const tileCount = await driverTiles.count();
        expect(tileCount).toBeGreaterThanOrEqual(1);

        // First driver should be visible
        await expect(driverTiles.first()).toBeVisible();

        // Should show driver name
        await expect(page.locator('.driver-name').first()).not.toBeEmpty();
    });

    test('displays leaderboard with timing data', async ({ page }) => {
        // Leaderboard table should exist
        await expect(page.locator('.leaderboard__table')).toBeVisible();

        // Should have table rows
        const rows = page.locator('.leaderboard__table tbody tr');
        const rowCount = await rows.count();
        expect(rowCount).toBeGreaterThanOrEqual(1);
    });

    test('driver selection works', async ({ page }) => {
        // Click on first driver tile
        const firstDriver = page.locator('.driver-tile').first();
        await firstDriver.click();

        // Should have selected class
        await expect(firstDriver).toHaveClass(/driver-tile--selected/);

        // Click again to deselect
        await firstDriver.click();
        await expect(firstDriver).not.toHaveClass(/driver-tile--selected/);
    });

    test('keyboard shortcut selects driver', async ({ page }) => {
        // Press '1' to select first driver
        await page.keyboard.press('1');

        // First driver should be selected
        await expect(page.locator('.driver-tile').first()).toHaveClass(/driver-tile--selected/);

        // Press Escape to deselect
        await page.keyboard.press('Escape');
        await expect(page.locator('.driver-tile').first()).not.toHaveClass(/driver-tile--selected/);
    });

    test('advanced options panel toggles', async ({ page }) => {
        // Panel should not be visible initially
        await expect(page.locator('.advanced-options-overlay')).not.toBeVisible();

        // Click ADV OPTIONS button
        await page.locator('.topbar__adv-btn').click();

        // Panel should now be visible
        await expect(page.locator('.advanced-options-overlay')).toBeVisible();

        // Press 'A' to toggle off
        await page.keyboard.press('a');
        await expect(page.locator('.advanced-options-overlay')).not.toBeVisible();
    });

    test('camera lock toggle works', async ({ page }) => {
        // Select a driver first
        await page.keyboard.press('1');

        // Press Space to lock camera
        await page.keyboard.press('Space');

        // Camera lock badge should appear
        await expect(page.locator('.camera-lock-badge')).toBeVisible();

        // Press Space again to unlock
        await page.keyboard.press('Space');
        await expect(page.locator('.camera-lock-badge')).not.toBeVisible();
    });
});

test.describe('Session State Display', () => {
    test('displays current session state', async ({ page }) => {
        await page.goto('/');
        await page.waitForSelector('.app-layout');

        // Session state banner should be visible
        await expect(page.locator('.state-banner')).toBeVisible();
    });

    test('displays track information', async ({ page }) => {
        await page.goto('/');
        await page.waitForSelector('.race-context');

        // Track info should be present
        await expect(page.locator('.track-name')).toBeVisible();
    });

    test('displays lap counter', async ({ page }) => {
        await page.goto('/');
        await page.waitForSelector('.race-context');

        // Lap display should show lap number
        await expect(page.locator('.lap-display')).toBeVisible();
        await expect(page.locator('.lap-current')).toBeVisible();
    });
});

test.describe('Track Map', () => {
    test('displays track map svg', async ({ page }) => {
        await page.goto('/');
        await page.waitForSelector('.track-map');

        // Track map SVG should be visible
        await expect(page.locator('.track-map__svg')).toBeVisible();
        await expect(page.locator('.track-outline')).toBeVisible();
    });

    test('displays car dots on track', async ({ page }) => {
        await page.goto('/');
        await page.waitForSelector('.track-map');

        // Car dots should be present
        const carDots = page.locator('.car-dot');
        const dotCount = await carDots.count();
        expect(dotCount).toBeGreaterThanOrEqual(1);
    });
});
