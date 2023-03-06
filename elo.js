const puppeteer = require("puppeteer");
const cheerio = require("cheerio");

(async () => {
  const browser = await puppeteer.launch({
    headless: false,
    ignoreDefaultArgs: ["--disable-extentions"],
    args: ["--no-sandbox"],
  });

  const page = await browser.newPage();
  await page.setDefaultNavigationTimeout(0);

  // Overrides the hieghts property
  const override = Object.assign(page.viewport(), { width: 1366 });
  await page.setViewport(override);

  // This gives an error for no height
  // const width = 1024;
  // await page.setViewport({ width: width });
  await page.setUserAgent("UA-TEST");

  const url = "https://www.exportleftovers.com/";
  await page.goto(url);

  // waiting for search bar to load
  await page.waitForSelector(
    "div.control.header__search-bar.is-relative > input"
  );
  await page.type(
    "div.control.header__search-bar.is-relative > input",
    "shirts"
  );
  await page.keyboard.press("Enter");

  await page.waitForNavigation();
  await page.waitForSelector(
    "#shopify-section-template--16138296656051__main > section > div.container.search__content > main > div.search__results-list > div:nth-child(2) > div.one-fourth.column.search-result__image-container.small-down--one-whole > a > div > img"
  );

  const html = await page.content();
  const $ = cheerio.load(html);

  const products = [];

  $(
    "#shopify-section-template--16138296656051__main > section > div.container.search__content > main > div.search__results-list > div"
  ).each((index, element) => {
    const name = $(element).find("h3.search-result__title > a").text();
    const price = $(element).find("span.price > span.money").text().trim();
    const saleprice = $(element)
      .find("span.compare-at-price > span.money")
      .text()
      .trim();
    const imgsrc = $(element)
      .find("div.image-element__wrap > img")
      .attr("data-src")
      .trim();
    const desc = $(element).find("div.has-padding-top > p").text().trim();
    const halflink = $(element)
      .find("h3.search-result__title > a")
      .attr("href");
    const link = "https://www.exportleftovers.com" + halflink;
    products.push({ name, price, saleprice, imgsrc, desc, link });
  });

  console.log(JSON.stringify(products, null, 2));

  await browser.close();
})();
