const puppeteer = require("puppeteer");
const cheerio = require("cheerio");
const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");

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
    const orignalprice = $(element)
      .find("span.origPrice--AJxRs > del.currency--GVKjl")
      .text();
    const link = $(element).find("div.title--wFj93 > a").attr("href").trim();

    products.push({ name, price, orignalprice, image, link });
  });

  const jsonData = JSON.stringify(products, null, 2);
  fs.writeFileSync("daraz_search_data.json", jsonData);

  await browser.close();
})();
