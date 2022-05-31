const express = require('express')
const app = express()
const port = process.env.PORT || 8080
const screenshot = require('./screenshot');
const getAllEvents = require('./get_all_events');
const getEvent = require('./get_event');

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
        return res.send(error);
    })
});

app.listen(port, () => console.log(`app listening on port ${port}!`))