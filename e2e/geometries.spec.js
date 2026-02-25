import { test, expect } from '@playwright/test';

test.describe('Geometry Rendering', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/e2e/fixtures/geometries.html');
    await page.waitForSelector('.leaflet-container');
    // Wait for markers to render
    await page.waitForSelector('.leaflet-marker-icon');
  });

  test('correct number of point markers on map', async ({ page }) => {
    const markerCount = await page.locator('.leaflet-marker-icon').count();
    // 3 points: Ankara, Istanbul, Izmir
    expect(markerCount).toBe(3);
  });

  test('polyline renders on map', async ({ page }) => {
    // Leaflet renders polylines as SVG paths
    const pathCount = await page.locator('.leaflet-overlay-pane path').count();
    // At least 1 path: the LineString (polygon also renders as path)
    expect(pathCount).toBeGreaterThanOrEqual(1);
  });

  test('polygon renders on map', async ({ page }) => {
    // Polygon and LineString both render as SVG paths
    const pathCount = await page.locator('.leaflet-overlay-pane path').count();
    // Should have at least 2: LineString + Polygon (circleMarker also adds a path)
    expect(pathCount).toBeGreaterThanOrEqual(2);
  });

  test('circleMarker renders on map as SVG path', async ({ page }) => {
    // CircleMarker renders as an SVG circle path, not a marker icon
    const hasBursa = await page.evaluate(() => {
      const layers = Object.values(window.hyperleaflet.map._layers);
      const bursa = layers.find((l) => l.hlID === 'circle-1');
      if (!bursa) return false;
      const ll = bursa.getLatLng();
      return Math.abs(ll.lat - 40.19) < 0.01 && Math.abs(ll.lng - 29.06) < 0.01;
    });
    expect(hasBursa).toBe(true);
  });

  test('circleMarker popup works', async ({ page }) => {
    // Click the circleMarker programmatically (SVG paths are hard to click visually)
    await page.evaluate(() => {
      const layers = Object.values(window.hyperleaflet.map._layers);
      const bursa = layers.find((l) => l.hlID === 'circle-1');
      bursa.fire('click', { latlng: bursa.getLatLng() });
      bursa.openPopup();
    });

    await page.waitForSelector('.leaflet-popup-content');
    const text = await page.locator('.leaflet-popup-content').textContent();
    expect(text).toContain('Bursa');
  });

  test('clicking marker opens popup with correct text', async ({ page }) => {
    // Click the first marker (Ankara is roughly in the center)
    const markers = page.locator('.leaflet-marker-icon');
    await markers.first().click();

    await page.waitForSelector('.leaflet-popup-content');
    const popupText = await page.locator('.leaflet-popup-content').textContent();
    // The popup should contain one of our city names
    const validPopups = ['Ankara', 'Istanbul', 'Izmir'];
    expect(validPopups.some((city) => popupText.includes(city))).toBe(true);
  });

  test('tooltip is bound to marker', async ({ page }) => {
    // Ankara marker has data-tooltip="Capital"
    // Hover over markers to trigger tooltip
    const markers = page.locator('.leaflet-marker-icon');
    const count = await markers.count();

    let tooltipFound = false;
    for (let i = 0; i < count; i++) {
      await markers.nth(i).hover();
      // Small wait for tooltip to appear
      await page.waitForTimeout(300);
      const tooltipCount = await page.locator('.leaflet-tooltip').count();
      if (tooltipCount > 0) {
        const tooltipText = await page.locator('.leaflet-tooltip').first().textContent();
        if (tooltipText.includes('Capital')) {
          tooltipFound = true;
          break;
        }
      }
    }
    expect(tooltipFound).toBe(true);
  });

  test('inline styled circleMarker has correct Leaflet options', async ({ page }) => {
    const opts = await page.evaluate(() => {
      const layers = Object.values(window.hyperleaflet.map._layers);
      const styled = layers.find((l) => l.hlID === 'circle-styled');
      if (!styled) return null;
      return {
        radius: styled.options.radius,
        color: styled.options.color,
        fillColor: styled.options.fillColor,
        fillOpacity: styled.options.fillOpacity,
        weight: styled.options.weight,
      };
    });
    expect(opts).not.toBeNull();
    expect(opts.radius).toBe(12);
    expect(opts.color).toBe('red');
    expect(opts.fillColor).toBe('#ff0000');
    expect(opts.fillOpacity).toBe(0.8);
    expect(opts.weight).toBe(3);
  });

  test('inline styled polyline has correct Leaflet options', async ({ page }) => {
    const opts = await page.evaluate(() => {
      const layers = Object.values(window.hyperleaflet.map._layers);
      const styled = layers.find((l) => l.hlID === 'line-styled');
      if (!styled) return null;
      return {
        color: styled.options.color,
        weight: styled.options.weight,
        opacity: styled.options.opacity,
      };
    });
    expect(opts).not.toBeNull();
    expect(opts.color).toBe('green');
    expect(opts.weight).toBe(5);
    expect(opts.opacity).toBe(0.7);
  });

  test('case-insensitive geometry type (POINT) works', async ({ page }) => {
    // Izmir has data-geometry-type="POINT" (uppercase)
    // If it renders, we have 3 markers total (already tested above, but let's verify specifically)
    const markerCount = await page.locator('.leaflet-marker-icon').count();
    expect(markerCount).toBe(3);

    // Verify all 3 markers have popup capability by checking the Leaflet layer data
    const popupCount = await page.evaluate(() => {
      const layers = Object.values(window.hyperleaflet.map._layers);
      return layers.filter((l) => l.getPopup && l.getPopup()).length;
    });
    // All 8 geometries have popups (3 points + 2 lines + 1 polygon + 2 circleMarkers)
    expect(popupCount).toBe(8);
  });
});
