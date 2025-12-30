// =====================================================================
// E2E Test: Navigation Flow
// Verify all navigation links and routing
// =====================================================================

import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
    });

    test('should display the dashboard on load', async ({ page }) => {
        await expect(page.getByRole('heading', { name: 'Command Center' })).toBeVisible();
    });

    test('should navigate to Race Control', async ({ page }) => {
        await page.getByRole('link', { name: 'Race Control' }).click();
        await expect(page).toHaveURL('/race-control/demo');
        await expect(page.getByText('Race Control Center')).toBeVisible();
    });

    test('should navigate to Incidents page', async ({ page }) => {
        await page.getByRole('link', { name: 'Incidents' }).click();
        await expect(page).toHaveURL('/incidents');
    });

    test('should navigate to Drivers page', async ({ page }) => {
        await page.getByRole('link', { name: 'Drivers' }).click();
        await expect(page).toHaveURL('/drivers');
    });

    test('should navigate to Results page', async ({ page }) => {
        await page.getByRole('link', { name: 'Results' }).click();
        await expect(page).toHaveURL('/results');
    });

    test('should navigate to Season page', async ({ page }) => {
        await page.getByRole('link', { name: 'Season' }).click();
        await expect(page).toHaveURL('/season');
    });

    test('should navigate to Reports page', async ({ page }) => {
        await page.getByRole('link', { name: 'Reports' }).click();
        await expect(page).toHaveURL('/reports');
    });

    test('should navigate to Settings page', async ({ page }) => {
        await page.getByRole('link', { name: 'Settings' }).click();
        await expect(page).toHaveURL('/settings');
        await expect(page.getByRole('heading', { name: 'Settings' })).toBeVisible();
    });
});

test.describe('Dashboard Stats', () => {
    test('should display stat cards', async ({ page }) => {
        await page.goto('/');

        await expect(page.getByText('Active Sessions')).toBeVisible();
        await expect(page.getByText('Pending Incidents')).toBeVisible();
        await expect(page.getByText('Pending Penalties')).toBeVisible();
        await expect(page.getByText('Recommendations')).toBeVisible();
    });
});
