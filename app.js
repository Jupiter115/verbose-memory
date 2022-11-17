require("dotenv").config();
const cheerio = require("cheerio");
const puppeteer = require("puppeteer");
const express = require("express");
const app = express();
const cors = require("cors");
const PORT = process.env.PORT || 8800;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

const obj = {};
const scrapeProduct = async (url) => {
  let browser = null;
  try {
    browser = await puppeteer.connect({
      browserWSEndpoint:
        `wss://chrome.browserless.io?token=` + process.env.API_KEY,
      headless: true,
      args: ["--no-sandbox"],
    });
    browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url);

    let html = await page.evaluate(() => document.body.innerHTML);
    const $ = await cheerio.load(html);

    await $("#productTitle", html).each(function () {
      let title = $(this).text();
      obj.title = title.trim();
    });

    await $(".attach-base-product-price", html).each(function () {
      let price = $(this).val();
      obj.price = price;
    });

    //description point 1
    const [el5] = await page.$x('//*[@id="feature-bullets"]/ul/li[2]');
    if (!el5) {
      description1 = "";
    } else {
      const txt4 = await el5.getProperty("textContent");
      description1 = await txt4.jsonValue();
    }
    //description point 2
    const [el6] = await page.$x('//*[@id="feature-bullets"]/ul/li[3]/span');
    if (!el6) {
      description2 = "";
    } else {
      const txt5 = await el6.getProperty("textContent");
      description2 = await txt5.jsonValue();
    }
    obj.description = description1 + " " + description2;

    const [el] = await page.$x(`//*[@id="landingImage"]`);
    const src = await el.getProperty("src");
    obj.image = await src.jsonValue();

    return obj;
  } catch (err) {
    console.log("error " + err);
  } finally {
    if (browser) {
      browser.close();
    }
  }

  /*   //new page
  const page = await browser.newPage();
  await page.goto(url);
  //title

  const getTitle = await page.$$eval("h1 span.a-size-large", (nodes) =>
    nodes.map((n) => n.innerText)
  );
  const title = getTitle[0];
  //  //image
  const [el] = await page.$x(`//*[@id="landingImage"]`);
  const src = await el.getProperty("src");
  const image = await src.jsonValue();
  //price $$
  const [el3] = await page.$x(
    '//*[@id="corePrice_desktop"]/div/table/tbody/tr[2]/td[2]/span[1]/span[1]'
  );
  if (!el3) {
    price = 0;
  } else {
    const txt2 = await el3.getProperty("textContent");
    const price = awaittxt2.jsonValue();
  }
  //orig $$
  const [el4] = await page.$x(
    '//*[@id="corePrice_desktop"]/div/table/tbody/tr[1]/td[2]/span[1]/span[1]'
  );
  if (!el4) {
    orig = 0;
  } else {
    const txt3 = await el4.getProperty("textContent");
    const orig = await txt3.jsonValue();
  }

  //description point 1
  const [el5] = await page.$x('//*[@id="feature-bullets"]/ul/li[2]');
  if (!el5) {
    description1 = "";
  } else {
    const txt4 = await el5.getProperty("textContent");
    description1 = await txt4.jsonValue();
  }
  //description point 2
  const [el6] = await page.$x('//*[@id="feature-bullets"]/ul/li[3]/span');
  if (!el6) {
    description2 = "";
  } else {
    const txt5 = await el6.getProperty("textContent");
    description2 = await txt5.jsonValue();
  }
  const description = description1 + " " + description2;
  browser.close();
  return { title, image, description, orig, price }; */
};

/* app.get("/new/*", async (req, res) => {
  try {
    const url = req.params[0];
    const data = await scrapeProduct(url);
    res.json(data);
  } catch (err) {
    res.send(console.log("error " + err));
  }
}); */

app.post("/scrape/", async (req, res) => {
  try {
    console.log(req.body);
    const data = await scrapeProduct(req.body.url);
    res.json(data);
  } catch (err) {
    res.send(console.log("error " + err));
  }
});

app.get("/", async (req, res) => {
  res.send("Jupiter Scrapper. Please use /new/url");
});

app.listen(process.env.PORT || PORT, () => {
  console.log("running on " + PORT);
});
