const { default: axios } = require('axios');
const cheerio = require('cheerio');
const trim = require('../utils/trim');
const formatEventDate = require('../utils/formatEventDate');
const getCityFromText = require('../utils/getCityFromText');

const alleventsInEventUrlRegex = /(?:https?:\/\/)?(?:www\.)?allevents\.(in)\/(?:(?:\w\.)*#!\/)?(?:event\/)?(?:[\w\-\.]*\/)*([\w\-\.]*)/;

module.exports = function(url) {
    return new Promise(async (resolve, reject) => {
        const urlMatches = url.match(alleventsInEventUrlRegex);
        if (!Array.isArray(urlMatches) || !urlMatches.length) { return reject("URL not valid") }

        const eventUrl = urlMatches[0];

        const page = await axios.get(eventUrl)
            .then(({data}) => {
                return data;
            })
            .catch(error => {
                return reject('Error event url ' + eventUrl + ' ' + error);
            });

        const $ = cheerio.load(page);
        const eventTitle = trim($('.head-details h1').text());

        const stime = $('.wdiv.hidden-phone span [data-stime]').text();

        var formatedDateObject;
        try {
            formatedDateObject = await formatEventDate(stime)
            .then(data => data)
            .catch(error => {
                return reject('Error while parsing event date text ' + error);
            })
        } catch(error) {
            return reject('Error while parsing event date text ' + error);
        }

        const imageSource = $('img.event-banner-image').attr('src');

        const descriptionText = trim($('.event-description>div.event-description-html').text());

        const locationText = trim($('.full-venue').text());
        
        const cityName = getCityFromText(locationText);

        resolve({
            ...formatedDateObject,
            eventTitle,
            organizerName: "",
            imageSource,
            eventUrl: url,
            descriptionText,
            locationType: "Venue",
            cityName,
            streetAddress: locationText
        });
    });
}