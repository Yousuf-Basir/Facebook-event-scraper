module.exports = function (dateString) {
    return new Promise((resolve, reject) => {
        try {
            if (!dateString || dateString == "") { return reject("Invalid date string") };

            const allRegex = [
                {
                    name: "pattern1",
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
                    name: "pattern2",
                    example: "SUNDAY, 25 DECEMBER 2022 AT 10:30 UTC+06",
                    regex: /[A-Z]+, \d+ [A-Z]+ \d+ AT \d+:\d+/,
                    format: (pattern2DateString) => {
                        var startDate = pattern2DateString.split(" AT ")[0]
                        var startTime = pattern2DateString.split(" AT ")[1];

                        var endDate = pattern2DateString.split(" AT ")[0]
                        var endTime = pattern2DateString.split(" AT ")[1];
                        return { startDate, startTime, endDate, endTime };
                    }
                },
                {
                    name: "pattern3",
                    example: "FRIDAY, 27 MAY 2022 FROM 20:30-22:30 UTC+06",
                    regex: /[A-Z]+, \d+ [A-Z]+ \d+ FROM \d+:\d+-\d+:\d+/,
                    format: (pattern3DateString) => {
                        var startDate = pattern3DateString.split(" FROM ")[0]
                        var startTime = pattern3DateString.split(" FROM ")[1].split("-")[0];

                        var endDate = pattern3DateString.split(" FROM ")[0]
                        var endTime = pattern3DateString.split(" FROM ")[1].split("-")[1];
                        return { startDate, startTime, endDate, endTime };
                    }
                },
                {
                    name: "pattern4",
                    example: "WEDNESDAY, JULY 13, 2022 AT 12:30 AM – 6:30 PM UTC+01",
                    regex: /[A-Z]+, [A-Z]+ \d+, \d+ AT \d+:\d+ ((?:A|P)\.?M\.?) – \d+:\d+ ((?:A|P)\.?M\.?)/,
                    format: (pattern4DateString) => {
                        var startDate = pattern4DateString.split(" – ")[0].split(" AT ")[0]
                        var startTime = pattern4DateString.split(" – ")[0].split(" AT ")[1];

                        var endDate = pattern4DateString.split(" – ")[0].split(" AT ")[0];
                        var endTime = pattern4DateString.split(" – ")[1];
                        return { startDate, startTime, endDate, endTime };
                    }
                },
                {
                    name: "pattern5",
                    example: "JUN 23 AT 10:30 AM – JUN 25 AT 8:30 PM UTC+06",
                    regex: /[A-Z]+ \d+ AT \d+:\d+ ((?:A|P)\.?M\.?) – [A-Z]+ \d+ AT \d+:\d+ ((?:A|P)\.?M\.?)/,
                    format: (patern5DateString) => {
                        var startDate = patern5DateString.split(" – ")[0].split(" AT ")[0]
                        var startTime = patern5DateString.split(" – ")[0].split(" AT ")[1];

                        var endDate = patern5DateString.split(" – ")[1].split(" AT ")[0];
                        var endTime = patern5DateString.split(" – ")[1].split(" AT ")[1];
                        return {
                            startDate: `${startDate} ${new Date().getFullYear()}`,
                            startTime: startTime,
                            endDate: `${endDate} ${new Date().getFullYear()}`,
                            endTime: endTime
                        };
                    }
                },
                {
                    name: "pattern6",
                    example: "SUNDAY, JUNE 5, 2022 AT 10:00 AM UTC+06",
                    regex: /[A-Z]+, [A-Z]+ \d+, \d+ AT \d+:\d+ ((?:A|P)\.?M\.?)/,
                    format: (pattern6DateString) => {
                        var startDate = pattern6DateString.split(" AT ")[0]
                        var startTime = pattern6DateString.split(" AT ")[1];

                        var endDate = pattern6DateString.split(" AT ")[0]
                        var endTime = pattern6DateString.split(" AT ")[1];
                        return { startDate, startTime, endDate, endTime };
                    }
                },
                {
                    name: "pattern7",
                    example: "Wed Jun 22 2022 at 10:30 am to Sat Jun 25 2022 at 07:30 pm",
                    regex: /.+ at \d+:\d+ .+ to .+ \d+:\d+ .+/,
                    format: (pattern7DateString) => {
                        var startDate = pattern7DateString.split(" to ")[0].split(" at ")[0]
                        var startTime = pattern7DateString.split(" to ")[0].split(" at ")[1]

                        var endDate = pattern7DateString.split(" to ")[1].split(" at ")[0]
                        var endTime = pattern7DateString.split(" to ")[1].split(" at ")[1]
                        return { startDate, startTime, endDate, endTime };
                    }
                },
                {
                    name: "pattern8",
                    example: "Sat Jun 18 2022 at 03:00 pm",
                    regex: /.+ at \d+:\d+ ((?:a|p)\.?m\.?)/,
                    format: (pattern8DateString) => {
                        var startDate = pattern8DateString.split(" at ")[0]
                        var startTime = pattern8DateString.split(" at ")[1]

                        var endDate = pattern8DateString.split(" at ")[0]
                        var endTime = pattern8DateString.split(" at ")[1]
                        return { startDate, startTime, endDate, endTime };
                    }
                },

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
                            return reject(`Error parsing ${allRegex[i].name}. Trying to parse ${dateString} SCOPE-1`)
                        }
                    } catch (err) {
                        return reject(`Error parsing ${allRegex[i].name}. Trying to parse ${dateString} SCOPE-2`)
                    }
                } else {
                    if (i == allRegex.length - 1) {
                        return reject(`No patern found while trying to parse ${dateString}`)
                    }
                }
            }
        } catch(error) {
            return reject('Error parsing date string ' + error);
        }
    })
}