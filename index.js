const express = require('express')
const app = express()
const port = process.env.PORT || 8080
const screenshot = require('./screenshot');
const getAllEvents = require('./get_all_events');

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

app.get('/get_all_events', (req, res) => {
    ; (async () => {
        const allEvents = await getAllEvents()
        res.send(allEvents)
    })()
});

app.listen(port, () => console.log(`app listening on port ${port}!`))