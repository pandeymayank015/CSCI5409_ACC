const express = require('express');
const axios = require('axios');

const app = express();
const PORT = 6000;

app.use(express.json());

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
