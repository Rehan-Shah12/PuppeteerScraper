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
  const querylink = req.body.querylink;
  const browser = await puppeteer.launch({
    headless: false,
    ignoreDefaultArgs: ["--disable-extentions"],
    args: ["--no-sandbox"],
  });

  const productPage = await browser.newPage();
  await productPage.setDefaultNavigationTimeout(30000);
  const override = Object.assign(productPage.viewport(), { width: 1366 });
  await productPage.setViewport(override);
  await productPage.setUserAgent("UA-TEST");

  console.log("here2");
  await productPage.goto(
    "https://www.daraz.pk/products/platic-mens-short-sleeve-with-minor-fault-polo-shirt-i382763100-s1884375602.html?search=1"
  );
  console.log("here3");

  await autoScroll(productPage);
  const targetElement = await productPage.$(
    "#module_product_review > div > div > div:nth-child(1) > div.mod-rating > div > div > div.summary > div.score > span.score-average"
  );
  if (targetElement) {
    // await targetElement.scrollIntoView();
    await productPage.waitForSelector("div.pdp-mod-review", { timeout: 30000 });
    await productPage.waitForSelector(
      "#module_product_review > div > div > div:nth-child(1) > div.mod-rating > div > div > div.summary > div.score > span.score-average",
      { timeout: 30000 }
    );
    const productHtml = await productPage.content();
    const $$ = cheerio.load(productHtml);

    const productDetails = {
      rating: $$(
        "#module_product_review > div > div > div:nth-child(1) > div.mod-rating > div > div > div.summary > div.score > span.score-average"
      ).text(),
      reviews: $$(
        "#module_product_review > div > div > div:nth-child(3) > div.mod-reviews > div > div.item-content > div.content"
      ).text(),
      description: $$("div.html-content.detail-content").text().trim(),
      deliverytime: $$("div.delivery-option-item__time").text(),
    };

    const productJsonData = JSON.stringify(productDetails, null, 2);
    fs.writeFileSync("daraz_product_data.json", productJsonData);
  } else {
    console.log("Target element not found.");
  }

  await browser.close();
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

async function autoScroll(page) {
  await page.evaluate(async () => {
    await new Promise((resolve) => {
      var totalHeight = 0;
      var distance = 100;
      var timer = setInterval(() => {
        var scrollHeight = document.body.scrollHeight;
        window.scrollBy(0, distance);
        totalHeight += distance;

        if (totalHeight >= scrollHeight - window.innerHeight) {
          clearInterval(timer);
          setTimeout(() => {
            resolve();
          }, 5000); // add a 2-second timeout after scrolling
        }
      }, 100);
    });
  });
}
