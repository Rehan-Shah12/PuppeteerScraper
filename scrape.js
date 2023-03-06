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

  const url = "https://www.daraz.pk/";
  await page.goto(url);

  // waiting for search bar to load
  await page.waitForSelector("#q");
  await page.type("#q", "gym shirts");

  //waiting for the search button to show up
  await page.waitForSelector(".search-box__search--2fC5");
  await page.click(".search-box__search--2fC5");
  await page.waitForNavigation();

  const html = await page.content();
  const $ = cheerio.load(html);

  const products = [];

  $("div.inner--SODwy").each((index, element) => {
    const name = $(element).find("div.title--wFj93 > a").text().trim();
    const price = $(element).find("span.currency--GVKjl").text().trim();
    const image = $(element).find("img.image--WOyuZ ").attr("src");
    // const stars = $(element).find(".rating--ZI3Ol > span > i");

    products.push({ name, price, image });
  });

  console.log(JSON.stringify(products, null, 2));

  await browser.close();
})();
