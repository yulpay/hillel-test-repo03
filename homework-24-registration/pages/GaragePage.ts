import type { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';

/** Opened after a successful registration, at `/panel/garage`. */
export class GaragePage extends BasePage {
  static readonly URL = /\/panel\/garage$/;

  readonly heading: Locator;
  /** Shown only to a logged-in user */
  readonly myProfileButton: Locator;

  constructor(page: Page) {
    super(page);
    this.heading = page.getByRole('heading', { name: 'Garage', level: 1 });
    this.myProfileButton = page.getByRole('button', { name: 'My profile' });
  }
}
