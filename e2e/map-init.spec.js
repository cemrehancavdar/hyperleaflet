import { test, expect } from '@playwright/test';

test.describe('Map Initialization', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/e2e/fixtures/basic-map.html');
    await page.waitForSelector('.leaflet-container');
  });

  test('map container gets leaflet-container class', async ({ page }) => {
    const mapEl = page.locator('#map');
    await expect(mapEl).toHaveClass(/leaflet-container/);
  });

  test('map container gets hyperleaflet attribute', async ({ page }) => {
    const mapEl = page.locator('#map');
    await expect(mapEl).toHaveAttribute('hyperleaflet', '');
  });

  test('tile images load', async ({ page }) => {
    // Wait for at least one tile image to appear
    await page.waitForSelector('.leaflet-tile-pane img', { timeout: 10_000 });
    const tileCount = await page.locator('.leaflet-tile-pane img').count();
    expect(tileCount).toBeGreaterThan(0);
  });

  test('zoom controls are present', async ({ page }) => {
    await expect(page.locator('.leaflet-control-zoom-in')).toBeVisible();
    await expect(page.locator('.leaflet-control-zoom-out')).toBeVisible();
  });

  test('layer control is present', async ({ page }) => {
    await expect(page.locator('.leaflet-control-layers')).toBeVisible();
  });

  test('map center and zoom match HTML attributes', async ({ page }) => {
    const center = await page.evaluate(() => {
      const map = window.hyperleaflet.map;
      const c = map.getCenter();
      return { lat: Math.round(c.lat * 100) / 100, lng: Math.round(c.lng * 100) / 100 };
    });
    expect(center.lat).toBe(41.01);
    expect(center.lng).toBe(28.97);

    const zoom = await page.evaluate(() => window.hyperleaflet.getZoom());
    expect(zoom).toBe(10);
  });
});
