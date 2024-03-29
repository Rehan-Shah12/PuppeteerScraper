const puppeteer = require("puppeteer");
const cheerio = require("cheerio");
const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");

const app = express();
const port = 3100;

app.use(bodyParser.json());

app.post("/search", async (req, res) => {
  const query = req.body.query;
  // const querylink = req.body.querylink;
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
  await page.type("#q", query);

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
    const orignalprice = $(element)
      .find("span.origPrice--AJxRs > del.currency--GVKjl")
      .text();
    const halflink = $(element)
      .find("div.title--wFj93 > a")
      .attr("href")
      .trim();
    const link = "https:" + halflink;

    products.push({ name, price, orignalprice, image, link });
  });

  console.log("Hello");
  const jsonData = JSON.stringify(products, null, 2);
  fs.writeFileSync("daraz_search_data.json", jsonData);

  // Click on the first product link to scrape its details
  console.log("here");
  const productPage = await browser.newPage();
  console.log("here2");
  await productPage.goto(products[0].link);
  console.log("here3");
  // await productPage.waitForSelector("div.score > span.score-average");

  const productHtml = await productPage.content();
  const $$ = cheerio.load(productHtml);

  const productDetails = {
    rating: $$(
      "#module_product_review > div > div > div:nth-child(1) > div.mod-rating > div > div > div.summary > div.score > span.score-average"
    ).text(),
    reviews: $$("div.mod-reviews > div > div.item-content > div.content")
      .text()
      .trim(),
    description: $$("div.html-content.detail-content").text().trim(),
    deliverytime: $$("div.delivery-option-item__time").text(),
  };

  const productJsonData = JSON.stringify(productDetails, null, 2);
  fs.writeFileSync("daraz_product_data.json", productJsonData);

  await browser.close();
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
