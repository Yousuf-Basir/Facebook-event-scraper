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

            const listParentDiv = await page.$eval(".rl04r1d5.oygrvhab.dlv3wnog.tr9rh885.lhclo0ds.j83agx80.bp9cbjyn", el => el.innerHTML);

            await browser.close();
            resolve(listParentDiv);
        })()
    })
}