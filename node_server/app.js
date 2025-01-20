const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = 3001;

const corsOptions = {
    origin: 'https://img.dizainsuninterjers.lv/',
    methods: 'GET',
    allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));

app.listen(PORT, () => {
    console.log(`Express server running`);
});

app.get('/get-image', async (req, res) => {
    try {

        if (!req.query?.url || req.query.url.length == 0) {
            console.log("url not given");
            res.status(500).json({ success: false, message: 'Error fetching images' });

            return;
        }

        console.log("Get image data: " + req.query.url);

        const response = await axios.get(req.query.url, {
            responseType: 'arraybuffer',
        });

        const imageBuffer = Buffer.from(response.data, 'binary');
        const base64Image = imageBuffer.toString('base64');
        const image = `data:${response.headers['content-type']};base64,${base64Image}`;

        res.json({ ok: true, data: image });
    } catch (error) {
        console.log("Error: " + error.message);
        res.status(500).json({ success: false, message: 'Error fetching image' });
    }
});