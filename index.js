const puppeteer = require("puppeteer");

async function browseDaraz() {
  const browser = await puppeteer.launch({
    headless: false,
    ignoreDefaultArgs: ["--disable-extentions"],
    args: ["--no-sandbox"],
  });

  const page = await browser.newPage();

  // Overrides the hieghts property
  const override = Object.assign(page.viewport(), { width: 1366 });
  await page.setViewport(override);

  // This gives an error for no height
  // const width = 1024;
  // await page.setViewport({ width: width });
  await page.setUserAgent("UA-TEST");

  const url = "https://www.daraz.pk/";
  await page.goto(url);

  // waiting for search bar to load
  await page.waitForSelector("#q");
  await page.type("#q", "fidget spinner");

  //waiting for the search button to show up
  await page.waitForSelector(".search-box__search--2fC5");
  await page.click(".search-box__search--2fC5");
}
browseDaraz();
