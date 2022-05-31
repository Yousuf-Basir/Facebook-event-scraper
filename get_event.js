const puppeteer = require('puppeteer');
const formatDate = require("./utils/formatEventDate");

const facebookEventUrlRegex = /https:\/\/www.facebook.com\/events\/\d+\//;

module.exports = function (url) {
    return new Promise(async (resolve, reject) => {
        const urlMatches = url.match(facebookEventUrlRegex);
        if (!Array.isArray(urlMatches) || !urlMatches.length) { reject("URL not valid") }

        const eventUrl = urlMatches[0];

        const browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--single-process'],
        });
        const page = await browser.newPage();
        await page.goto(eventUrl, {
            waitUntil: ['load', 'networkidle0', 'domcontentloaded']
        });

        // get event date and time
        const eventDate = await page.$$eval("h2", (allH2) => {
            const dateElement = allH2[0];
            return dateElement.textContent;
        })
        if (!eventDate || eventDate == undefined || eventDate == "") { reject("Error parsing event date") };

        var formatedDateObject;
        try {
            formatedDateObject = await formatDate(eventDate);
        } catch (error) {
            reject(error);
        }

        // get event title
        const eventTitle = await page.$$eval("h2", (allH2) => {
            const titleElement = allH2[1];
            return titleElement.textContent;
        });

        // Get event organizer
        const eventByElements = await page.$x("//*[text()[contains(.,'Event by')]]");
        if (!eventByElements || !eventByElements.length) { reject("Element not found with xpath while parsing event orgranizer name") };
        const eventByElement = eventByElements[0];
        const organizerName = await eventByElement.$eval("a", (organizerNameLink) => {
            return organizerNameLink.textContent;
        });
        if (!organizerName || organizerName == undefined || organizerName == "") { reject("Error parsing event organizer name") };


        // Get event cover photo
        const imageSource = await page.$eval("img[data-imgperflogname='profileCoverPhoto']", (img) => {
            return img.getAttribute("src");
        });
        if (!imageSource || imageSource == undefined || imageSource == "") { reject("Error parsing event image src") };


        await browser.close();
        resolve({
            ...formatedDateObject,
            eventTitle,
            organizerName,
            imageSource
        });


    })
}