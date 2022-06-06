const { default: axios } = require('axios');
const cheerio = require('cheerio');

module.exports = function(cityName) {
    return new Promise(async (resolve, reject) => {
        const page = await axios.get("https://allevents.in/" + cityName)
            .then(({data}) => {
                return data;
            })
            .catch(error => {
                return reject('Error loading allevents.in/'+cityName+' page ' + error);
            });

        const $ = cheerio.load(page);
        const links = $('ul li.item a');
        var hrefs = [];
        for(var i = 0; i < links.length; i++) {
            const href = $(links[i]).attr('href');
            hrefs.push({
                href: href
            });
        }
        resolve (hrefs);
    });
}