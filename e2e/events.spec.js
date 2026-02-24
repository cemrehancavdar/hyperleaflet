import { test, expect } from '@playwright/test';

test.describe('Event System', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/e2e/fixtures/events.html');
    await page.waitForSelector('.leaflet-container');
    await page.waitForSelector('.leaflet-marker-icon');
  });

  test('hyperleaflet:ready event fires on page load', async ({ page }) => {
    // Wait for the ready event to be logged
    await page.waitForSelector('[data-event-type="hyperleaflet:ready"]', { timeout: 5000 });
    const entry = await page.locator('[data-event-type="hyperleaflet:ready"]').textContent();
    expect(entry).toContain('hyperleaflet:ready');
    expect(entry).toContain('zoom');
    expect(entry).toContain('center');
  });

  test('map:ready event fires on page load', async ({ page }) => {
    await page.waitForSelector('[data-event-type="map:ready"]', { timeout: 5000 });
    const entry = await page.locator('[data-event-type="map:ready"]').textContent();
    expect(entry).toContain('map:ready');
  });

  test('map:click event fires when clicking on the map', async ({ page }) => {
    // Click on the map area (not on a marker)
    const mapEl = page.locator('#map');
    const box = await mapEl.boundingBox();
    // Click in the bottom-right corner where there's no marker
    await page.mouse.click(box.x + box.width - 50, box.y + box.height - 50);

    await page.waitForSelector('[data-event-type="map:click"]', { timeout: 5000 });
    const entry = await page.locator('[data-event-type="map:click"]').first().textContent();
    expect(entry).toContain('map:click');
    expect(entry).toContain('lat');
    expect(entry).toContain('lng');
  });

  test('geometry:click event fires when clicking a marker', async ({ page }) => {
    const marker = page.locator('.leaflet-marker-icon').first();
    await marker.click();

    await page.waitForSelector('[data-event-type="geometry:click"]', { timeout: 5000 });
    const entry = await page.locator('[data-event-type="geometry:click"]').first().textContent();
    expect(entry).toContain('geometry:click');
    expect(entry).toContain('"id":"marker-1"');
  });

  test('map:zoom event fires when zooming', async ({ page }) => {
    // Click zoom in button
    await page.click('.leaflet-control-zoom-in');

    await page.waitForSelector('[data-event-type="map:zoom"]', { timeout: 5000 });
    const entry = await page.locator('[data-event-type="map:zoom"]').first().textContent();
    expect(entry).toContain('map:zoom');
    expect(entry).toContain('zoom');
  });
});
