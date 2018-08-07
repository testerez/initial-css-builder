import puppeteer from 'puppeteer';
import initialCssBuilder from '../src';
import { takeFullPageScreeshot } from './takeFullPageScreeshot';
import * as path from 'path';
import * as fs from 'fs';
import pixelmatch from 'pixelmatch';
import sizeOf from 'buffer-image-size';
import filesize from 'filesize';

jest.setTimeout(60000);

const pageWidths = [1200, 400];

describe('realLifeTests', () => {
  const testsDirectory = path.join(__dirname, 'testsData');
  fs.readdirSync(testsDirectory).forEach(d => {
    it(d, async () => {
      const { css, html } = require(path.join(testsDirectory, d));
      const browser = await puppeteer.launch({ headless: true });
      try {
        const page = await browser.newPage();
        await page.setJavaScriptEnabled(false);
        page.screenshot({});

        const htmlOriginalCss = html.replace(
          /<head>/i,
          `<head><style>${css}</style>`,
        );

        const criticalCss = initialCssBuilder(css)(html);
        const htmlCriticalCss = html.replace(
          /<head>/i,
          `<head><style>${criticalCss}</style>`,
        );
        console.log(
          `Original: ${filesize(css.length)}, Initial: ${filesize(
            criticalCss.length,
          )}`,
        );

        for (const pageWidth of pageWidths) {
          await page.setViewport({ width: pageWidth, height: 800 });
          await page.setContent(htmlOriginalCss);
          const screenshotOriginalCss = await takeFullPageScreeshot(page);
          await page.setContent(htmlCriticalCss);
          const screenshotCriticalCss = await takeFullPageScreeshot(page);

          const { width, height } = sizeOf(screenshotOriginalCss);

          const diffCount = pixelmatch(
            screenshotOriginalCss,
            screenshotCriticalCss,
            null,
            width,
            height,
          );

          expect(diffCount).toEqual(0);
        }
      } finally {
        await browser.close();
      }
    });
  });
});
