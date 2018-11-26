import { Page } from 'puppeteer';
import * as fs from 'fs';
import { PNG } from 'pngjs';

export const takeFullPageScreeshot = async (page: Page, path: string) => {
  const bodyHandle = (await page.$('body'))!;
  const { width, height } = (await bodyHandle.boundingBox())!;
  await page.screenshot({
    path,
    clip: {
      x: 0,
      y: 0,
      width,
      height,
    },
  });
  await bodyHandle.dispose();
  return new Promise<PNG>(resolve => {
    const png: PNG = fs
      .createReadStream(path)
      .pipe(new PNG())
      .on('parsed', () => resolve(png));
  });
};
