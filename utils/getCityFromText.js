const cities = ["dhaka", "khulna", "chittagong", "mymensingh", "rajshahi", "rangpur", "sylhet", "barishal"];

module.exports = function(text) {
    if(typeof text !== 'string') {
        return;
    }
    const textFormated = text.toLowerCase();

    var cityName = "";
    for (var i=0; i < cities.length; i++) {
        if(textFormated.includes(cities[i])) {
            cityName = cities[i];
            break;
        } else {
            continue;
        }
    }

    return cityName;
}