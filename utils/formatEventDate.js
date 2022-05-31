module.exports = function (dateString) {
    return new Promise((resolve, reject) => {
        if (!dateString || dateString == "") { reject("Invalid date string") };

        const allRegex = [
            {
                name: "patern1",
                example: "3 JUN AT 10:00 – 4 JUN AT 13:00",
                regex: /\d+ [A-Z]+ AT \d+:\d+ – \d+ [A-Z]+ AT \d+:\d+/,
                format: (patern1DateString) => {
                    var startDate = patern1DateString.split(" – ")[0].split(" AT ")[0]
                    var startTime = patern1DateString.split(" – ")[0].split(" AT ")[1];

                    var endDate = patern1DateString.split(" – ")[1].split(" AT ")[0];
                    var endTime = patern1DateString.split(" – ")[1].split(" AT ")[1];
                    return {
                        startDate: `${startDate} ${new Date().getFullYear()}`,
                        startTime: startTime,
                        endDate: `${endDate} ${new Date().getFullYear()}`,
                        endTime: endTime
                    };
                }
            },
            {
                name: "patern2",
                example: "SUNDAY, 25 DECEMBER 2022 AT 10:30 UTC+06",
                regex: /[A-Z]+, \d+ [A-Z]+ \d+ AT \d+:\d+/,
                format: (patern2DateString) => {
                    var startDate = patern2DateString.split(" AT ")[0]
                    var startTime = patern2DateString.split(" AT ")[1];

                    var endDate = patern2DateString.split(" AT ")[0]
                    var endTime = patern2DateString.split(" AT ")[1];
                    return { startDate, startTime, endDate, endTime };
                }
            },
            {
                name: "patern3",
                example: "FRIDAY, 27 MAY 2022 FROM 20:30-22:30 UTC+06",
                regex: /[A-Z]+, \d+ [A-Z]+ \d+ FROM \d+:\d+-\d+:\d+/,
                format: (patern2DateString) => {
                    var startDate = patern2DateString.split(" FROM ")[0]
                    var startTime = patern2DateString.split(" FROM ")[1].split("-")[0];

                    var endDate = patern2DateString.split(" FROM ")[0]
                    var endTime = patern2DateString.split(" FROM ")[1].split("-")[1];
                    return { startDate, startTime, endDate, endTime };
                }
            }

        ];


        for (var i = 0; i < allRegex.length; i++) {
            const matches = dateString.match(allRegex[i].regex);
            if (matches && matches.length) {
                try {
                    const eventDateObject = allRegex[i].format(matches[0]);
                    const validStartDate = new Date(eventDateObject.startDate);
                    const validEndDate = new Date(eventDateObject.endDate);

                    if (validStartDate !== "Invalid Date" && validEndDate !== "Invalid Date") {
                        resolve({
                            startDate: validStartDate,
                            endDate: validEndDate,
                            startTime: eventDateObject.startTime,
                            endTime: eventDateObject.endTime,
                        })
                    } else {
                        reject(`Error parsing ${allRegex[i].name}. Trying to parse ${dateString} SCOPE-1`)
                    }
                } catch (err) {
                    reject(`Error parsing ${allRegex[i].name}. Trying to parse ${dateString} SCOPE-2`)
                }
            } else {
                if(i == allRegex.length-1) {
                  reject(`No patern found while trying to parse ${dateString}`)
                }
              }
        }
    })
}