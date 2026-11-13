import { test, expect } from '@playwright/test';

const MOCKED_NAME = 'Mocked';
const MOCKED_LAST_NAME = 'User';

// The test user is already logged in via storageState from the `setup` project.
test.describe('Profile page with mocked /api/users/profile', () => {
  test('shows the name from the mocked response', async ({ page }) => {
    let realFullName = '';

    // Must be registered BEFORE navigating, otherwise the request is already sent.
    await page.route('**/api/users/profile', async (route) => {
      const response = await route.fetch();
      const body = await response.json();
      realFullName = `${body.data.name} ${body.data.lastName}`;

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        json: {
          ...body,
          data: { ...body.data, name: MOCKED_NAME, lastName: MOCKED_LAST_NAME },
        },
      });
    });

    const profileResponse = page.waitForResponse('**/api/users/profile');
    await page.goto('/panel/profile');
    await profileResponse;

    const profileName = page.locator('.profile_name');
    await expect(profileName).toHaveText(`${MOCKED_NAME} ${MOCKED_LAST_NAME}`);
    expect(realFullName).not.toBe('');
    await expect(profileName).not.toHaveText(realFullName);
  });
});
