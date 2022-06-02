const puppeteer = require('puppeteer');
const formatDate = require("./utils/formatEventDate");

const facebookEventUrlRegex = /(?:https?:\/\/)?(?:www\.)?(mbasic.facebook|m\.facebook|facebook|fb)\.(com|me)\/(?:(?:\w\.)*#!\/)?(?:event\/)?(?:[\w\-\.]*\/)*([\w\-\.]*)/;

module.exports = function (url) {
    return new Promise(async (resolve, reject) => {
        const urlMatches = url.match(facebookEventUrlRegex);
        if (!Array.isArray(urlMatches) || !urlMatches.length) { return reject("URL not valid") }

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
            if (!eventDate || eventDate == undefined || eventDate == "") { return reject("Error parsing event date") };

            var formatedDateObject;
            try {
                formatedDateObject = await formatDate(eventDate);
            } catch (error) {
                return reject(error);
            }
        } catch (error) {
            return reject(error);
        }

        // get event title
        var eventTitle;
        try {
            eventTitle = await page.$$eval("h2", (allH2) => {
                const titleElement = allH2[1];
                return titleElement.textContent;
            });
        } catch (error) {
            return reject(error);
        }

        // Get event organizer
        var organizerName;
        try {
            const eventByElements = await page.$x("//*[text()[contains(.,'Event by')]]");
            const classByElements = await page.$x("//*[text()[contains(.,'Class by')]]")
            if ((!eventByElements || !eventByElements.length) && (!classByElements || !classByElements.length)) { 
                return reject("Element not found with xpath while parsing event orgranizer name") 
            };

            const eventByElement = eventByElements?.length?eventByElements[0]:classByElements[0];
            organizerName = await eventByElement.evaluate(el => {
                if(el.textContent.includes("by")){
                    return el.textContent.split("by")[1]?.trim();
                } else {
                    return "Unknown organizer"
                }
            });

            if (!organizerName || organizerName == undefined || organizerName == "") { return reject("Error parsing event organizer name") };

        } catch (error) {
            return reject("Error finding organization name " + error);
        }

        // Get event cover photo
        var imageSource;
        try {
            imageSource = await page.$eval("img[data-imgperflogname='profileCoverPhoto']", (img) => {
                return img.getAttribute("src");
            });
            if (!imageSource || imageSource == undefined || imageSource == "") { return reject("Error parsing event image src") };
        } catch(error) {
            return reject(error);
        }

        // Get event description
        var descriptionText;
        try {
            const seeMoreTextMatches = await page.$x("//*[text()[contains(.,'See more')]]");
            if (!seeMoreTextMatches || !seeMoreTextMatches.length) { return reject("Element not found with xpath while trying to find See more button") };
            const seeMoreButton = seeMoreTextMatches[0];
            await seeMoreButton.click();
            descriptionText = await page.$eval(".dati1w0a.hv4rvrfc > .p75sslyk", (descriptionContainer) => {
                return descriptionContainer.textContent;
            });
        } catch(error) {
            return reject(error);
        }

        // Get location type. Online or Offline
        var locationType;
        try {
            const locationTypeText = await page.$$eval(".bi6gxh9e.aov4n071", (match) => {
                try {
                    return  match[2].textContent;
                } catch(error) {
                    return reject("Finding location type container element" + error);
                }
            });

            if(locationTypeText.toLowerCase().includes("online")) {
                locationType = "Online event"
            } else {
                locationType = "Venue"
            }
            
        } catch (error) {
            return reject("Finding location type element " + error);
        }

        // TODO: get event venue location. e.g street address, area, city.

        await browser.close();
        return resolve({
            ...formatedDateObject,
            eventTitle,
            organizerName,
            imageSource,
            eventUrl,
            descriptionText,
            locationType
        });


    })
}