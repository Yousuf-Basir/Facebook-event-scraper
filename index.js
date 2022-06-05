const express = require('express')
var cors = require('cors')


const app = express()
app.use(cors());
const port = process.env.PORT || 8080
const screenshot = require('./screenshot');
const getAllEvents = require('./get_all_events');
const getEvent = require('./get_event');
const { default: axios } = require('axios');

const JAABO_SERVER = process.env.JAABO_SERVER || "https://api.jaabo.today";

app.get('/', (req, res) => res.status(200).json({ status: 'Server ok 👌' }))

app.get('/screenshot', (req, res) => {
    const url = "https://www.facebook.com/events"
        ; (async () => {
            const buffer = await screenshot(url)
            res.setHeader('Content-Disposition', 'attachment; filename="screenshot.png"')
            res.setHeader('Content-Type', 'image/png')
            res.send(buffer)
        })()
});

app.get('/get_all_events', async (req, res) => {
    const allEvents = await getAllEvents()
    res.send(allEvents)
});

app.get('/get_event', async (req, res) => {
    const { url } = req.query;
    getEvent(url).then((response) => {
        return res.send(response);
    }).catch((error) => {
        return res.send("Error: [Scope: 0.1] " + error);
    })
});

app.get('/create_event', async (req, res) => {
    try {
        const { url } = req.query;
        axios.post(`${JAABO_SERVER}/auth/login`, {
            "username": "gourabxz@gmail.com",
            "password": "letsrock"
        }).then(response => {
            const { access_token, _id } = response.data;
            const config = {
                headers: { Authorization: `Bearer ${access_token}` }
            };
            getEvent(url).then(response => {
                // reject this event if no city name of bangladesh is found in event description text
                if(response?.locationType && response?.locationType == 'Venue' && response.cityName == "") {
                    return res.send("Error: This event is offline and does not have any valid city name. Rejecting this event from importing to Jaabo server.");
                }

                axios.post(`${JAABO_SERVER}/admin/event/create`, {
                    userId: _id,
                    // Event basic info
                    eventTitle: response.eventTitle || "Not found",
                    organizer: response.organizerName || "Not found",
                    type: "facebook-scrapped",
                    category: undefined,
                    tags: undefined,
    
                    locationType: response.locationType || "Not found",
                    streetAddress: undefined,
                    area: undefined,
                    city: undefined,
    
                    eventUrl: response.eventUrl || "Not found",
    
                    startDate: response.startDate || "Not found",
                    startTime: response.startTime || "Not found",
                    endDate: response.endDate || "Not found",
                    endTime: response.endTime || "Not found",
    
                    // Event details
                    coverImageFileName: response.imageSource || "Not found",
                    summary: response.descriptionText || "Not found",
    
                    // publish status
                    isPrivate: false,
    
                    openForAll: true,
    
                    isDisapproved: false,
                }, config).then(response => {
                    res.send(response.data);
                }).catch(error => {
                    console.log("Error making post request to jaabo server", error);
                    return res.send("Error: [Scope: 0.2] " + error);
                })
            }).catch(error => {
                console.log("Error scraping event", error);
                return res.send("Error: [Scope: 0.3] " + error);
            })
    
        }).catch(error => {
            console.log("Error login jaabo server ", error);
            return res.send("Error: [Scope: 0.4] " + error);
        })
    } catch(error) {
        console.log(error);
        res.send("ERROR: scope 000" + error);
    }
});

app.listen(port, () => console.log(`app listening on port ${port}!`))