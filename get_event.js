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
        var eventDate;
        try {
            eventDate = await page.$$eval("h2", (allH2) => {
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
        } catch (error) {
            reject(error);
        }

        // get event title
        var eventTitle;
        try {
            eventTitle = await page.$$eval("h2", (allH2) => {
                const titleElement = allH2[1];
                return titleElement.textContent;
            });
        } catch (error) {
            reject(error);
        }

        // Get event organizer
        var organizerName;
        try {
            const eventByElements = await page.$x("//*[text()[contains(.,'Event by')]]");
            const classByElements = await page.$x("//*[text()[contains(.,'Class by')]]")
            if ((!eventByElements || !eventByElements.length) && (!classByElements || !classByElements.length)) { 
                reject("Element not found with xpath while parsing event orgranizer name") 
            };

            const eventByElement = eventByElements.length?eventByElements[0]:classByElements[0];
            organizerName = await eventByElement.$eval("a", (organizerNameLink) => {
                return organizerNameLink.textContent;
            });
            if (!organizerName || organizerName == undefined || organizerName == "") { reject("Error parsing event organizer name") };

        } catch (error) {
            reject(error);
        }

        // Get event cover photo
        var imageSource;
        try {
            imageSource = await page.$eval("img[data-imgperflogname='profileCoverPhoto']", (img) => {
                return img.getAttribute("src");
            });
            if (!imageSource || imageSource == undefined || imageSource == "") { reject("Error parsing event image src") };
        } catch(error) {
            reject(error);
        }

        // Get event description
        var descriptionText;
        try {
            const seeMoreTextMatches = await page.$x("//*[text()[contains(.,'See more')]]");
            if (!seeMoreTextMatches || !seeMoreTextMatches.length) { reject("Element not found with xpath while trying to find See more button") };
            const seeMoreButton = seeMoreTextMatches[0];
            await seeMoreButton.click();
            descriptionText = await page.$eval(".dati1w0a.hv4rvrfc > .p75sslyk", (descriptionContainer) => {
                return descriptionContainer.textContent;
            });
        } catch(error) {
            reject(error);
        }

        await browser.close();
        resolve({
            ...formatedDateObject,
            eventTitle,
            organizerName,
            imageSource,
            eventUrl,
            descriptionText
        });


    })
}