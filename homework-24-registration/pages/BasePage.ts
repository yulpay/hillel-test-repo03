import type { Page } from '@playwright/test';

export abstract class BasePage {
  constructor(readonly page: Page) {}

  /** Path is relative to `baseURL` from .env */
  async open(path = '/'): Promise<void> {
    await this.page.goto(path);
  }
}
