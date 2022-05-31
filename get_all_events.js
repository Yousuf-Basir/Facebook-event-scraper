const puppeteer = require('puppeteer')

module.exports = function (url) {
    return new Promise((resolve, reject) => {
        ; (async () => {
            const browser = await puppeteer.launch({
                // headless: true, // debug only
                headless: true,
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-dev-shm-usage',
                    '--single-process'
                ],
            })

            const page = await browser.newPage()

            await page.goto("https://www.facebook.com/events", {
                waitUntil: ['load', 'networkidle0', 'domcontentloaded']
            });
            await page.waitForTimeout(1000);

            const h2 = await page.$eval("h2", el => el.innerHTML);

            await browser.close();
            resolve(h2);
        })()
    })
}