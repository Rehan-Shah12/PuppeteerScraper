const puppeteer = require("puppeteer");
const fs = require("fs");
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

  const url = "https://www.ishopping.pk/";
  await page.goto(url);

  // waiting for search bar to load
  await page.waitForSelector("input#search");
  await page.type("input#search", "shirts");
  await page.keyboard.press("Enter");

  await page.waitForNavigation();
  const html = await page.content();
  const $ = cheerio.load(html);
  await page.waitForSelector("li.col-xs-6.col-sm-4.col-md-3.item");

  const products = [];

  $("li.col-xs-6.col-sm-4.col-md-3.item ").each((index, element) => {
    const name = $(element).find("h2.product-name > a").text();
    const price = $(element)
      .find("p.special-price > span.price, span.regular-price > span.price")
      .text()
      .trim();
    const oldprice = $(element).find("p.old-price > span.price").text().trim();
    const imgsrc = $(element)
      .find("div.inner-grid > a.product-image > img")
      .attr("src");
    //   const desc = $(element).find("div.has-padding-top > p").text().trim();
    const link = $(element).find("h2.product-name > a").attr("href");
    products.push({ name, price, oldprice, imgsrc, link });
  });
  //   console.log(JSON.stringify(products, null, 2));

  const jsonData = JSON.stringify(products, null, 2); // This line stringifies the response
  // console.log(products);
  fs.writeFileSync("ishopping_search_data.json", jsonData);

  await browser.close();
})();
