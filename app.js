require("dotenv").config();
const puppeteer = require("puppeteer");
const express = require("express");
const app = express();
const PORT = 8800;
const cors = require("cors");

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

const scrapeProduct = async (url) => {
  const browser = await puppeteer.connect({
    browserWSEndpoint:
      `wss://chrome.browserless.io?token=` + process.env.API_KEY,
  });
  //new page
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
    price = await txt2.jsonValue().replace("$", "");
  }
  //orig $$
  const [el4] = await page.$x(
    '//*[@id="corePrice_desktop"]/div/table/tbody/tr[1]/td[2]/span[1]/span[1]'
  );
  if (!el4) {
    orig = 0;
  } else {
    const txt3 = await el4.getProperty("textContent");
    orig = await txt3.jsonValue().replace("$", "");
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
  return { title, image, description, orig, price };
};

app.get("/new/*", async (req, res) => {
  try {
    const url = req.params[0];
    const data = await scrapeProduct(url);
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
