import type { Locator, Page } from '@playwright/test';

export type Car = { brand: string; model: string; mileage: number };

/** The "Add a car" modal on the Garage page. */
export class AddCarForm {
  readonly modal: Locator;
  readonly title: Locator;
  readonly brandSelect: Locator;
  readonly modelSelect: Locator;
  readonly mileageInput: Locator;
  readonly addButton: Locator;

  constructor(readonly page: Page) {
    this.modal = page.locator('app-add-car-modal');
    this.title = this.modal.locator('.modal-title');
    this.brandSelect = page.locator('#addCarBrand');
    this.modelSelect = page.locator('#addCarModel');
    this.mileageInput = page.locator('#addCarMileage');
    this.addButton = this.modal.getByRole('button', { name: 'Add' });
  }

  async fill(car: Car): Promise<void> {
    await this.brandSelect.selectOption({ label: car.brand });
    await this.modelSelect.selectOption({ label: car.model });
    await this.mileageInput.fill(String(car.mileage));
  }
}
