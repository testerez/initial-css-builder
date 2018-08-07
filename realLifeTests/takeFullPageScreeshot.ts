import { Page } from "puppeteer";

export const takeFullPageScreeshot = async (page: Page, path: string) => {
  const bodyHandle = (await page.$("body"))!;
  const { width, height } = (await bodyHandle.boundingBox())!;
  await page.screenshot({
    path,
    clip: {
      x: 0,
      y: 0,
      width,
      height
    }
  });
  await bodyHandle.dispose();
};
