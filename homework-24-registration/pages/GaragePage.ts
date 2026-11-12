import type { Locator, Page } from '@playwright/test';
import { GARAGE_PATH } from '../config/constants';
import { AddCarForm } from './AddCarForm';
import { BasePage } from './BasePage';

/** `/panel/garage`, available only to a logged-in user. */
export class GaragePage extends BasePage {
  static readonly URL = /\/panel\/garage$/;

  readonly heading: Locator;
  /** Shown only to a logged-in user */
  readonly myProfileButton: Locator;
  readonly addCarButton: Locator;
  /** Car cards in the garage list */
  readonly cars: Locator;

  constructor(page: Page) {
    super(page);
    this.heading = page.getByRole('heading', { name: 'Garage', level: 1 });
    this.myProfileButton = page.getByRole('button', { name: 'My profile' });
    this.addCarButton = page.getByRole('button', { name: 'Add car' });
    this.cars = page.locator('app-car');
  }

  override async open(path = GARAGE_PATH): Promise<void> {
    await super.open(path);
  }

  async openAddCarForm(): Promise<AddCarForm> {
    await this.addCarButton.click();
    const form = new AddCarForm(this.page);
    await form.title.waitFor();
    return form;
  }
}
