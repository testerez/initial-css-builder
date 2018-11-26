import puppeteer from 'puppeteer';
import initialCssBuilder from '..';
import { takeFullPageScreeshot } from './takeFullPageScreeshot';
import * as path from 'path';
import pixelmatch from 'pixelmatch';
import sizeOf from 'buffer-image-size';
import filesize from 'filesize';
import * as mkdirp from 'mkdirp';
import * as fs from 'fs';
import { PNG } from 'pngjs';

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

        fs.writeFileSync(
          path.resolve(__dirname, 'results', d, 'page.html'),
          html.replace(
            /<head>/i,
            `<head><link rel="stylesheet" type="text/css" href="./critical.css">`,
          ),
        );
        fs.writeFileSync(
          path.resolve(__dirname, 'results', d, 'critical.css'),
          criticalCss,
        );

        for (const pageWidth of pageWidths) {
          await page.setViewport({ width: pageWidth, height: 800 });
          await page.setContent(htmlOriginalCss);
          const resultPath = path.resolve(
            __dirname,
            'results',
            d,
            pageWidth + 'px',
          );
          mkdirp.sync(resultPath);
          const screenshotOriginalCss = await takeFullPageScreeshot(
            page,
            path.join(resultPath, 'original.png'),
          );
          await page.setContent(htmlCriticalCss);
          const screenshotCriticalCss = await takeFullPageScreeshot(
            page,
            path.join(resultPath, 'critical.png'),
          );

          const { width, height } = screenshotOriginalCss;
          const diff = new PNG({ width, height });
          const diffCount = pixelmatch(
            screenshotOriginalCss.data,
            screenshotCriticalCss.data,
            diff.data,
            width,
            height,
          );
          if (diffCount) {
            diff.pack().pipe(
              fs.createWriteStream(path.join(resultPath, 'diff.png')),
              { end: true },
            );
          }

          expect(diffCount).toEqual(0);
        }
      } finally {
        await browser.close();
      }
    });
  });
});
