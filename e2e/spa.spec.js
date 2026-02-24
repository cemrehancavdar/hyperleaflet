import { test, expect } from '@playwright/test';

test.describe('SPA Late Mount', () => {
  test('late-mounted #map element gets initialized', async ({ page }) => {
    await page.goto('/e2e/fixtures/spa-late-mount.html');

    // Status starts as "waiting"
    await expect(page.locator('#status')).toHaveText('waiting');

    // Wait for hyperleaflet to detect the late-mounted map and initialize
    await page.waitForSelector('.leaflet-container', { timeout: 10_000 });

    // Map should now have the leaflet classes
    const mapEl = page.locator('#map');
    await expect(mapEl).toHaveClass(/leaflet-container/);
  });

  test('hyperleaflet:ready fires after late mount', async ({ page }) => {
    await page.goto('/e2e/fixtures/spa-late-mount.html');

    // Wait for the status to change from "waiting" to "ready"
    await page.waitForFunction(
      () => document.getElementById('status').textContent === 'ready',
      { timeout: 10_000 },
    );

    await expect(page.locator('#status')).toHaveText('ready');
  });

  test('geometries render after late mount', async ({ page }) => {
    await page.goto('/e2e/fixtures/spa-late-mount.html');

    // Wait for the map to initialize
    await page.waitForSelector('.leaflet-container', { timeout: 10_000 });

    // Wait for marker to appear
    await page.waitForSelector('.leaflet-marker-icon', { timeout: 10_000 });

    const markerCount = await page.locator('.leaflet-marker-icon').count();
    expect(markerCount).toBe(1);
  });
});
