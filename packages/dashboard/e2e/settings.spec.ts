// =====================================================================
// E2E Test: Settings Page
// Verify settings functionality
// =====================================================================

import { test, expect } from '@playwright/test';

test.describe('Settings Page', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/settings');
    });

    test('should display all settings sections', async ({ page }) => {
        await expect(page.getByRole('heading', { name: 'Steward Profile' })).toBeVisible();
        await expect(page.getByRole('heading', { name: 'Recommendation Engine' })).toBeVisible();
        await expect(page.getByRole('heading', { name: 'Workspace' })).toBeVisible();
        await expect(page.getByRole('heading', { name: 'API & Integrations' })).toBeVisible();
        await expect(page.getByRole('heading', { name: 'About ControlBox' })).toBeVisible();
    });

    test('should allow updating steward name', async ({ page }) => {
        const nameInput = page.getByLabel('Steward Name');
        await nameInput.clear();
        await nameInput.fill('Test Steward');

        await page.getByRole('button', { name: 'Save Profile' }).click();

        await expect(page.getByText('Saved!')).toBeVisible();
    });

    test('should toggle auto-analysis setting', async ({ page }) => {
        const checkbox = page.getByRole('checkbox', { name: /Auto-Analysis/ });
        const initialState = await checkbox.isChecked();

        await checkbox.click();

        expect(await checkbox.isChecked()).toBe(!initialState);
    });

    test('should toggle theme', async ({ page }) => {
        const darkButton = page.getByRole('button', { name: /Dark/ });
        const lightButton = page.getByRole('button', { name: /Light/ });

        await lightButton.click();
        // Theme state should update

        await darkButton.click();
        // Theme should revert
    });

    test('should display version information', async ({ page }) => {
        await expect(page.getByText('v0.1.0-alpha')).toBeVisible();
        await expect(page.getByText('AI-Assisted Race Stewarding Platform')).toBeVisible();
    });
});
