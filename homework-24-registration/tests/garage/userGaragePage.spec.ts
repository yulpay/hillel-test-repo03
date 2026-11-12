import { test, expect } from '../../fixtures/userGaragePage.fixture';
import { GaragePage } from '../../pages/GaragePage';
import type { Car } from '../../pages/AddCarForm';

test.describe('Garage for a logged-in user (storage state)', () => {
  test('opens the garage without logging in', async ({ userGaragePage }) => {
    await expect(userGaragePage.page).toHaveURL(GaragePage.URL);
    await expect(userGaragePage.heading).toBeVisible();
    await expect(userGaragePage.addCarButton).toBeVisible();
    await expect(userGaragePage.myProfileButton).toBeVisible();
  });

  test('adds a car', async ({ userGaragePage }) => {
    const car: Car = { brand: 'BMW', model: 'X5', mileage: 1234 };
    const { page } = userGaragePage;

    const form = await userGaragePage.openAddCarForm();
    await form.fill(car);
    const [response] = await Promise.all([
      page.waitForResponse((r) => r.url().endsWith('/api/cars') && r.request().method() === 'POST'),
      form.addButton.click(),
    ]);
    expect(response.status()).toBe(201);
    const carId: number = (await response.json()).data.id;

    try {
      await expect(form.modal).toBeHidden();
      await expect(userGaragePage.cars.filter({ hasText: `${car.brand} ${car.model}` }).first()).toBeVisible();
    } finally {
      // Clean up so the shared test user's garage doesn't grow on every run (same session cookie)
      await page.request.delete(`/api/cars/${carId}`);
    }
  });
});
