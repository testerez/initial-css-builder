import puppeteer from "puppeteer";
import path from "path";
import mkdirp from "mkdirp";
import * as fs from "fs";
import initialCssBuilder from "../src";
import { takeFullPageScreeshot } from "./takeFullPageScreeshot";

const pageWidths = [1200, 400];

const toFileName = (s: string) =>
  s
    .replace(/[^\d\w]+/g, "-")
    .trim()
    .toLocaleLowerCase();

(async () => {
  const pagePath = process.argv[2];
  const pagePathNoExt = pagePath.replace(/\.htm$/i, "");
  const filesPath = pagePathNoExt + "_files";
  const testDirectory = path.join(
    __dirname,
    "tests",
    toFileName(path.basename(pagePathNoExt))
  );
  mkdirp.sync(testDirectory);

  const html = fs.readFileSync(pagePath, "utf-8");
  const css = fs
    .readdirSync(filesPath)
    .filter(f => /\.css$/i.test(f))
    .map(f => fs.readFileSync(path.resolve(filesPath, f), "utf-8"))
    .join("\n");

  // fs.writeFileSync(JSON.stringify({html, css}))

  const browser = await puppeteer.launch({ headless: true });
  try {
    const page = await browser.newPage();
    await page.setJavaScriptEnabled(false);

    for (const pageWidth of pageWidths) {
      const takeScreenshot = (name: string) =>
        takeFullPageScreeshot(
          page,
          path.join(testDirectory, `${toFileName(name)}_${pageWidth}.png`)
        );

      page.setViewport({ width: pageWidth, height: 800 });

      await page.setContent(html);
      await takeScreenshot("no-css");

      const htmlOriginalCss = html.replace(
        /<head>/i,
        `<head><style>${css}</style>`
      );
      await page.setContent(htmlOriginalCss);
      await takeScreenshot("original-css");

      const criticalCss = initialCssBuilder(css)(html);
      const htmlCriticalCss = html.replace(
        /<head>/i,
        `<head><style>${criticalCss}</style>`
      );
      await page.setContent(htmlCriticalCss);
      await takeScreenshot("critical-css");
    }
  } finally {
    await browser.close();
  }
})();
