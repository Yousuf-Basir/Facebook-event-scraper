const puppeteer = require('puppeteer');

const eventLinkRegex = /(?:https?:\/\/)?(?:www\.)?(mbasic.facebook|m\.facebook|facebook|fb)\.(com|me)\/events\/\d+\/\?/

module.exports = function (url) {
    return new Promise((resolve, reject) => {
        ; (async () => {
            const browser = await puppeteer.launch({
                headless: true, // debug only
                // headless: false,
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
            var eventLinks = [];
            try {
                const hrefs = await page.$$eval('a', matches => matches.map((a, i) => {
                    let textContent = `Event ${i+1}`;
                    if( a.textContent.split("HAPPENING NOW").length){
                        textContent = a.textContent.split("HAPPENING NOW")[1];
                    }else {
                        textContent = a.textContent;
                    }
                    return {
                        href: a.href, 
                        eventName: textContent
                    }
                }));

                if(!hrefs || !hrefs.length) { return reject("No link element found") };

                eventLinks = hrefs.filter((link) => link.href.match(eventLinkRegex));

                if(!eventLinks.length) { return reject("No event link found") };
                
                await browser.close();
                resolve(eventLinks);
            } catch (error) {
                return reject("Error while getting event list" + error);
            }
        })()
    })
}