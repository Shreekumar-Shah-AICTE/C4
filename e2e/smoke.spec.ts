import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test.describe('Wayfare end-to-end', () => {
  test('plans the demo route on load and has no accessibility violations', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    // The demo route is planned automatically once metadata loads.
    await expect(page.getByRole('list', { name: /directions/i })).toBeVisible();

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();
    expect(results.violations).toEqual([]);
  });

  test('narrates the route when requested', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /narrate/i }).click();
    await expect(page.getByText(/offline narration|Gemini model/i)).toBeVisible();
  });
});
