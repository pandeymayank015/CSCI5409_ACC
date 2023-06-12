const express = require('express');
const axios = require('axios');
const fs = require('fs');

const app = express();
const PORT = 6000;

app.use(express.json());

app.post('/store-file', async (req, res) => {
    const { file, data } = req.body;

    if (!file) {
        console.log('Invalid JSON input: file field missing');
        return res.json({
            file: null,
            error: 'Invalid JSON input.'
        });
    }

    try {
        const filePath = `/dockerVolume/${file}`;

        fs.writeFileSync(filePath, data);

        console.log('File stored successfully:', file);
        return res.json({
            file,
            message: 'Success.'
        });
    } catch (error) {
        console.log('Error while storing the file:', error.message);
        return res.json({
            file,
            error: 'Error while storing the file to the storage.'
        });
    }
});


app.post('/calculate', async (req, res) => {
    const { file, product } = req.body;

    if (!file) {
        console.log('Invalid JSON input: file field missing');
        return res.json({
            file: null,
            error: 'Invalid JSON input.'
        });
    }

    try {
        const response = await axios.post('http://container2:7000/sum', {
            file,
            product
        });

        return res.json(response.data);
    } catch (error) {
        console.log('Error occurred:', error.message);
        if (error.response) {
            return res.json(error.response.data);
        }

        return res.json({
            file,
            error: 'An error occurred.'
        });
    }
});


app.listen(PORT, () => {
    console.log(`Container 1 listening on port ${PORT}`);
});
