import { test, expect } from '@playwright/test';

test.describe('Public API', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/e2e/fixtures/basic-map.html');
    await page.waitForSelector('.leaflet-container');
  });

  test('hyperleaflet is accessible on window', async ({ page }) => {
    const exists = await page.evaluate(() => window.hyperleaflet !== null && window.hyperleaflet !== undefined);
    expect(exists).toBe(true);
  });

  test('getZoom returns correct initial zoom', async ({ page }) => {
    const zoom = await page.evaluate(() => window.hyperleaflet.getZoom());
    expect(zoom).toBe(10);
  });

  test('setZoom changes the map zoom level', async ({ page }) => {
    await page.evaluate(() => window.hyperleaflet.setZoom(5));

    // Wait for zoom animation to settle
    await page.waitForFunction(() => window.hyperleaflet.getZoom() === 5, { timeout: 5000 });

    const zoom = await page.evaluate(() => window.hyperleaflet.getZoom());
    expect(zoom).toBe(5);
  });

  test('getCenter returns correct initial center', async ({ page }) => {
    const center = await page.evaluate(() => {
      const c = window.hyperleaflet.getCenter();
      return { lat: Math.round(c.lat * 100) / 100, lng: Math.round(c.lng * 100) / 100 };
    });
    expect(center.lat).toBe(41.01);
    expect(center.lng).toBe(28.97);
  });

  test('getBounds returns a valid bounds object', async ({ page }) => {
    const bounds = await page.evaluate(() => {
      const b = window.hyperleaflet.getBounds();
      return {
        southWest: { lat: b.getSouthWest().lat, lng: b.getSouthWest().lng },
        northEast: { lat: b.getNorthEast().lat, lng: b.getNorthEast().lng },
      };
    });
    // Bounds should encompass the center point
    expect(bounds.southWest.lat).toBeLessThan(41.01);
    expect(bounds.northEast.lat).toBeGreaterThan(41.01);
    expect(bounds.southWest.lng).toBeLessThan(28.97);
    expect(bounds.northEast.lng).toBeGreaterThan(28.97);
  });

  test('getBBoxString returns a valid bbox string', async ({ page }) => {
    const bbox = await page.evaluate(() => window.hyperleaflet.getBBoxString());
    // Format: "west,south,east,north"
    const parts = bbox.split(',');
    expect(parts).toHaveLength(4);
    parts.forEach((part) => {
      expect(parseFloat(part)).not.toBeNaN();
    });
  });

  test('flyTo changes the map center', async ({ page }) => {
    // Use a promise that resolves when the moveend event fires after flyTo completes
    await page.evaluate(() => {
      return new Promise((resolve) => {
        window.hyperleaflet.map.once('moveend', () => resolve());
        window.hyperleaflet.flyTo([48.85, 2.35], 12);
      });
    });

    const center = await page.evaluate(() => {
      const c = window.hyperleaflet.getCenter();
      return { lat: c.lat, lng: c.lng };
    });
    expect(center.lat).toBeCloseTo(48.85, 0);
    expect(center.lng).toBeCloseTo(2.35, 0);
  });

  test('panTo changes the map center without zoom change', async ({ page }) => {
    const originalZoom = await page.evaluate(() => window.hyperleaflet.getZoom());

    await page.evaluate(() => window.hyperleaflet.panTo([40.0, 30.0]));

    // Wait for pan to settle
    await page.waitForFunction(() => {
      const c = window.hyperleaflet.getCenter();
      return Math.abs(c.lat - 40.0) < 0.5;
    }, { timeout: 5000 });

    const zoom = await page.evaluate(() => window.hyperleaflet.getZoom());
    expect(zoom).toBe(originalZoom);
  });
});
