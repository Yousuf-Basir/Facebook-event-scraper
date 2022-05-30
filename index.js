const express = require('express')
const app = express()
port = process.env.PORT || 8080;


const puppeteer = require('puppeteer');


const runScraper = async () => {
    const browser = await puppeteer.launch({
        // executablePath: '/usr/bin/google-chrome',
        args: ["--no-sandbox"]
    });
    const page = await browser.newPage();
    await page.goto('https://google.com');
    // await page.screenshot({ path: 'example.png' });
  
    await browser.close();

    return "ALL OK 101";
}

app.get('/', async (req, res) => {
    const puppeteerResponse = await runScraper();
    res.send(puppeteerResponse);
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})