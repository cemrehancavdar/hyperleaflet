import { test, expect } from '@playwright/test';

test.describe('Dynamic DOM Updates', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/e2e/fixtures/dynamic-update.html');
    await page.waitForSelector('.leaflet-container');
    await page.waitForSelector('.leaflet-marker-icon');
  });

  test('starts with 2 markers', async ({ page }) => {
    const markerCount = await page.locator('.leaflet-marker-icon').count();
    expect(markerCount).toBe(2);
  });

  test('adding a row creates a new marker', async ({ page }) => {
    // Verify starting count
    expect(await page.locator('.leaflet-marker-icon').count()).toBe(2);

    // Click the add button
    await page.click('#btn-add');

    // Wait for the new marker to appear
    await page.waitForFunction(() => {
      return document.querySelectorAll('.leaflet-marker-icon').length === 3;
    }, { timeout: 5000 });

    expect(await page.locator('.leaflet-marker-icon').count()).toBe(3);
  });

  test('removing a row removes the marker', async ({ page }) => {
    expect(await page.locator('.leaflet-marker-icon').count()).toBe(2);

    await page.click('#btn-remove');

    await page.waitForFunction(() => {
      return document.querySelectorAll('.leaflet-marker-icon').length === 1;
    }, { timeout: 5000 });

    expect(await page.locator('.leaflet-marker-icon').count()).toBe(1);
  });

  test('changing data-geometry updates marker position', async ({ page }) => {
    // Get the original position of the Ankara marker
    const originalPos = await page.evaluate(() => {
      const layers = Object.values(window.hyperleaflet.map._layers);
      const ankara = layers.find((l) => l.hlID === 'existing-1');
      if (!ankara) return null;
      const ll = ankara.getLatLng();
      return { lat: ll.lat, lng: ll.lng };
    });
    expect(originalPos).not.toBeNull();
    expect(originalPos.lat).toBeCloseTo(39.92, 1);

    // Click the change button to move Ankara to [40.5, 30.0]
    await page.click('#btn-change');

    // Wait for position to update
    await page.waitForFunction(() => {
      const layers = Object.values(window.hyperleaflet.map._layers);
      const ankara = layers.find((l) => l.hlID === 'existing-1');
      if (!ankara) return false;
      return Math.abs(ankara.getLatLng().lat - 40.5) < 0.1;
    }, { timeout: 5000 });

    const newPos = await page.evaluate(() => {
      const layers = Object.values(window.hyperleaflet.map._layers);
      const ankara = layers.find((l) => l.hlID === 'existing-1');
      const ll = ankara.getLatLng();
      return { lat: ll.lat, lng: ll.lng };
    });
    expect(newPos.lat).toBeCloseTo(40.5, 1);
    expect(newPos.lng).toBeCloseTo(30.0, 1);
  });

  test('add then remove keeps marker count consistent', async ({ page }) => {
    expect(await page.locator('.leaflet-marker-icon').count()).toBe(2);

    // Add Izmir
    await page.click('#btn-add');
    await page.waitForFunction(() => document.querySelectorAll('.leaflet-marker-icon').length === 3, { timeout: 5000 });

    // Remove Istanbul
    await page.click('#btn-remove');
    await page.waitForFunction(() => document.querySelectorAll('.leaflet-marker-icon').length === 2, { timeout: 5000 });

    // Should have 2 markers: Ankara + Izmir
    expect(await page.locator('.leaflet-marker-icon').count()).toBe(2);
  });
});
