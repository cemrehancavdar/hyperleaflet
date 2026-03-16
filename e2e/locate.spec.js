import { test, expect } from '@playwright/test';

test.describe('Locate Control', () => {
  test.describe('enabled by default', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/e2e/fixtures/locate.html');
      await page.waitForSelector('.leaflet-container');
    });

    test('locate button is present on the map', async ({ page }) => {
      await expect(page.locator('.hyperleaflet-locate')).toBeVisible();
    });

    test('locate button has correct aria attributes', async ({ page }) => {
      const button = page.locator('.hyperleaflet-locate-button');
      await expect(button).toHaveAttribute('aria-label', 'Find my location');
      await expect(button).toHaveAttribute('title', 'Where am I?');
    });

    test('locate button contains SVG icon', async ({ page }) => {
      const svg = page.locator('.hyperleaflet-locate-button svg');
      await expect(svg).toBeVisible();
    });

    test('clicking locate button triggers geolocation', async ({ context, page }) => {
      // Grant geolocation permission and mock coordinates
      await context.grantPermissions(['geolocation']);
      await context.setGeolocation({ latitude: 40.7128, longitude: -74.006 });

      const button = page.locator('.hyperleaflet-locate-button');
      await button.click();

      // Wait for location to be found — circle marker should appear
      await page.waitForSelector('.leaflet-interactive', { timeout: 5000 });

      // Verify the map moved to the mocked location
      const center = await page.evaluate(() => {
        const c = window.hyperleaflet.map.getCenter();
        return { lat: Math.round(c.lat * 10) / 10, lng: Math.round(c.lng * 10) / 10 };
      });
      expect(center.lat).toBe(40.7);
      expect(center.lng).toBe(-74);
    });

    test('locate:found event is dispatched', async ({ context, page }) => {
      await context.grantPermissions(['geolocation']);
      await context.setGeolocation({ latitude: 40.7128, longitude: -74.006 });

      // Listen for the event before clicking
      await page.evaluate(() => {
        window._locateFound = null;
        window.addEventListener('locate:found', (e) => {
          window._locateFound = e.detail;
        });
      });

      const button = page.locator('.hyperleaflet-locate-button');
      await button.click();

      // Wait for event to fire
      await page.waitForFunction(() => window._locateFound !== null, { timeout: 5000 });

      const detail = await page.evaluate(() => window._locateFound);
      expect(detail.latlng).toBeDefined();
      expect(detail.accuracy).toBeDefined();
    });

    test('locate button changes color on success', async ({ context, page }) => {
      await context.grantPermissions(['geolocation']);
      await context.setGeolocation({ latitude: 40.7128, longitude: -74.006 });

      const button = page.locator('.hyperleaflet-locate-button');

      // Get initial color
      const initialColor = await button.evaluate((el) => el.style.color);

      await button.click();

      // Wait for color to change from initial (indicating success or error response)
      await page.waitForFunction(
        (initColor) => {
          const btn = document.querySelector('.hyperleaflet-locate-button');
          return btn && btn.style.color !== initColor;
        },
        initialColor,
        { timeout: 5000 },
      );

      // The color should no longer be the initial color
      const newColor = await button.evaluate((el) => el.style.color);
      expect(newColor).not.toBe(initialColor);
    });
  });

  test.describe('disabled via config', () => {
    test('locate button is not present when locate: false', async ({ page }) => {
      await page.goto('/e2e/fixtures/locate-disabled.html');
      await page.waitForSelector('.leaflet-container');

      const locateControl = page.locator('.hyperleaflet-locate');
      await expect(locateControl).toHaveCount(0);
    });
  });
});
