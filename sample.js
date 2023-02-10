const puppeteer = require("puppeteer");

const initialPage = "https://website.com/path";
const selectors = [
  'div[id$="-bVMpYP"] article a',
  'div[id$="-KcazEUq"] article a',
];

(async () => {
  let selector, handles, handle;
  const width = 1024,
    height = 1600;
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: { width, height },
  });
  const page = await browser.newPage();
  await page.setViewport({ width, height });
  page.setUserAgent("UA-TEST");

  // Load first page
  let stat = await page.goto(initialPage, { waitUntil: "domcontentloaded" });

  // Click on selector 1 - works ok
  selector = selectors[0];
  await page.waitForSelector(selector);
  handles = await page.$$(selector);
  handle = handles[12];
  console.log("Clicking on: ", await page.evaluate((el) => el.href, handle));
  await handle.click(); // OK

  // Click that selector 2 - fails
  selector = selectors[1];
  await page.waitForSelector(selector);
  handles = await page.$$(selector);
  handle = handles[12];
  console.log("Clicking on: ", await page.evaluate((el) => el.href, handle));
  await handle.click(); // Error: Node is either not visible or not an HTMLElement
})();
