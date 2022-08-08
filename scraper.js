const puppeteer = require('puppeteer')
const express = require('express')
const app = express()
const PORT = 8080

async function scrapeProduct(url){
  //launch browser
  const browser = await puppeteer.launch()
  //new page
  const page = await browser.newPage()
  await page.goto(url)

  //image
  const [el] = await page.$x('//*[@id="landingImage"]')
  const src = await el.getProperty('src')
  const image = await src.jsonValue()

  //title
  const [el2] = await page.$x('//*[@id="productTitle"]')
  const txt = await el2.getProperty('textContent')
  const title2 = await txt.jsonValue()
  let title = title2.trim()

  //sale price
  const [el3] = await page.$x('//*[@id="corePrice_desktop"]/div/table/tbody/tr[2]/td[2]/span[1]/span[1]')
  const txt2 = await el3.getProperty('textContent')
  const price = await txt2.jsonValue()

  //orig price
  const [el4] = await page.$x('//*[@id="corePrice_desktop"]/div/table/tbody/tr[1]/td[2]/span[1]/span[1]')
  const txt3 = await el4.getProperty('textContent')
  const orig = await txt3.jsonValue()

  //description point 1
  const [el5] = await page.$x('//*[@id="feature-bullets"]/ul/li[2]')
  const txt4 = await el5.getProperty('textContent')
  const description1 = await txt4.jsonValue()

  //description point 2
  const [el6] = await page.$x('//*[@id="feature-bullets"]/ul/li[3]/span')
  const txt5 = await el6.getProperty('textContent')
  const description2 = await txt5.jsonValue()

  const description = description1 + ' ' + description2

  return {image, title, price, orig, description, url}
  browser.close()


}

app.get('/new/*', async (req, res)=>{
  const url = req.params[0]
  const data = await scrapeProduct(url)
  res.json(data)
})


app.listen(process.env.PORT || PORT, ()=>{
  console.log('running on ' + PORT)
})