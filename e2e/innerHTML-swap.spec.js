import { test, expect } from '@playwright/test';

/**
 * innerHTML swap tests — the real htmx/Turbo scenario.
 *
 * When a server response replaces the contents of [data-hyperleaflet-source]
 * via innerHTML, HyperChange must diff old vs new and correctly:
 *   - Add markers for genuinely new data-id elements
 *   - Remove markers for data-id elements that disappeared
 *   - Update markers whose data-id survived but data-geometry changed
 *   - Leave unchanged markers alone
 *
 * These tests verify the full pipeline: DOM swap → HyperChange diff → geometry CRUD → Leaflet state.
 */

const MARKER_SELECTOR = '.leaflet-marker-icon';

/** Wait until marker count reaches expected value. */
async function waitForMarkerCount(page, count, timeout = 5000) {
  await page.waitForFunction(
    (expected) => document.querySelectorAll('.leaflet-marker-icon').length === expected,
    count,
    { timeout },
  );
}

/** Get all hlIDs from Leaflet layers on the map. */
async function getMarkerIDs(page) {
  return page.evaluate(() => {
    return Object.values(window.hyperleaflet.map._layers)
      .filter((l) => l.hlID)
      .map((l) => l.hlID)
      .sort();
  });
}

/** Get a specific marker's lat/lng by hlID. */
async function getMarkerPosition(page, id) {
  return page.evaluate((hlID) => {
    const layer = Object.values(window.hyperleaflet.map._layers).find((l) => l.hlID === hlID);
    if (!layer) return null;
    const ll = layer.getLatLng();
    return { lat: ll.lat, lng: ll.lng };
  }, id);
}

test.describe('innerHTML Swap (htmx/Turbo simulation)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/e2e/fixtures/innerHTML-swap.html');
    await page.waitForSelector('.leaflet-container');
    await page.waitForSelector(MARKER_SELECTOR);
    // Verify initial state: 3 markers
    await waitForMarkerCount(page, 3);
  });

  test('initial state has 3 markers with correct IDs', async ({ page }) => {
    const ids = await getMarkerIDs(page);
    expect(ids).toEqual(['ankara', 'istanbul', 'izmir']);
  });

  test('swap: add one, remove one — net count stays 3', async ({ page }) => {
    await page.click('#btn-swap-add-remove');
    await waitForMarkerCount(page, 3);

    const ids = await getMarkerIDs(page);
    expect(ids).toEqual(['ankara', 'bursa', 'izmir']);
    expect(ids).not.toContain('istanbul');
  });

  test('swap: move ankara — count stays 3, position changes', async ({ page }) => {
    const before = await getMarkerPosition(page, 'ankara');
    expect(before.lat).toBeCloseTo(39.92, 1);

    await page.click('#btn-swap-move');

    // Count unchanged
    await waitForMarkerCount(page, 3);

    // Position updated
    await page.waitForFunction(() => {
      const layer = Object.values(window.hyperleaflet.map._layers).find((l) => l.hlID === 'ankara');
      return layer && Math.abs(layer.getLatLng().lat - 40.5) < 0.1;
    }, { timeout: 5000 });

    const after = await getMarkerPosition(page, 'ankara');
    expect(after.lat).toBeCloseTo(40.5, 1);
    expect(after.lng).toBeCloseTo(30.0, 1);

    // Other markers still there
    const ids = await getMarkerIDs(page);
    expect(ids).toEqual(['ankara', 'istanbul', 'izmir']);
  });

  test('swap: replace all — old markers gone, new markers appear', async ({ page }) => {
    await page.click('#btn-swap-replace-all');
    await waitForMarkerCount(page, 2);

    const ids = await getMarkerIDs(page);
    expect(ids).toEqual(['antalya', 'trabzon']);

    // Verify old ones are truly gone
    const ankara = await getMarkerPosition(page, 'ankara');
    expect(ankara).toBeNull();
  });

  test('swap: mixed add + remove + change in one innerHTML', async ({ page }) => {
    await page.click('#btn-swap-mixed');
    await waitForMarkerCount(page, 3);

    const ids = await getMarkerIDs(page);
    expect(ids).toEqual(['ankara', 'bursa', 'izmir']);
    expect(ids).not.toContain('istanbul');

    // Ankara moved
    await page.waitForFunction(() => {
      const layer = Object.values(window.hyperleaflet.map._layers).find((l) => l.hlID === 'ankara');
      return layer && Math.abs(layer.getLatLng().lat - 40.5) < 0.1;
    }, { timeout: 5000 });

    const pos = await getMarkerPosition(page, 'ankara');
    expect(pos.lat).toBeCloseTo(40.5, 1);

    // Izmir unchanged
    const izmir = await getMarkerPosition(page, 'izmir');
    expect(izmir.lat).toBeCloseTo(38.42, 1);
  });

  test('swap: identical content — no markers lost or duplicated', async ({ page }) => {
    // Record marker count before
    expect(await page.locator(MARKER_SELECTOR).count()).toBe(3);

    await page.click('#btn-swap-identical');

    // Small wait — if things break, markers would briefly disappear or double
    await page.waitForTimeout(500);

    expect(await page.locator(MARKER_SELECTOR).count()).toBe(3);
    const ids = await getMarkerIDs(page);
    expect(ids).toEqual(['ankara', 'istanbul', 'izmir']);
  });

  test('swap: empty — all markers removed', async ({ page }) => {
    await page.click('#btn-swap-empty');
    await waitForMarkerCount(page, 0);

    const ids = await getMarkerIDs(page);
    expect(ids).toEqual([]);
  });

  test('swap: empty then repopulate — markers come back', async ({ page }) => {
    // Clear everything
    await page.click('#btn-swap-empty');
    await waitForMarkerCount(page, 0);

    // Restore
    await page.click('#btn-reset');
    await waitForMarkerCount(page, 3);

    const ids = await getMarkerIDs(page);
    expect(ids).toEqual(['ankara', 'istanbul', 'izmir']);
  });

  test('rapid consecutive swaps — final state is correct', async ({ page }) => {
    // Fire multiple swaps quickly without waiting between them
    await page.click('#btn-swap-add-remove');
    await page.click('#btn-swap-replace-all');

    // Final state should be the last swap: antalya + trabzon
    await waitForMarkerCount(page, 2);
    const ids = await getMarkerIDs(page);
    expect(ids).toEqual(['antalya', 'trabzon']);
  });

  test('swap then single DOM add — both mechanisms coexist', async ({ page }) => {
    // Do an innerHTML swap first
    await page.click('#btn-swap-add-remove');
    await waitForMarkerCount(page, 3);

    // Then do a single appendChild (like the old dynamic-update test)
    await page.evaluate(() => {
      const source = document.getElementById('source');
      const el = document.createElement('div');
      el.dataset.id = 'samsun';
      el.dataset.geometry = '[41.29, 36.33]';
      el.dataset.geometryType = 'Point';
      el.dataset.popup = 'Samsun';
      source.appendChild(el);
    });

    await waitForMarkerCount(page, 4);
    const ids = await getMarkerIDs(page);
    expect(ids).toContain('samsun');
    expect(ids).toContain('bursa');
  });
});
