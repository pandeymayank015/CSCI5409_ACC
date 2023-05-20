const express = require('express');
const csv = require('csv-parser');
const fs = require('fs');

const app = express();
const PORT = 7000;

app.use(express.json());

app.post('/sum', (req, res) => {
    const { file, product } = req.body;

    if (!file) {
        console.log('Invalid JSON input: file field missing');
        return res.json({
            file: null,
            error: 'Invalid JSON input.'
        });
    }

    const filePath = `/Users/mayankpandey/IdeaProjects/mpandey/A1/${file}`;
    if (!fs.existsSync(filePath)) {
        console.log('File not found:', filePath);
        return res.json({
            file,
            error: 'File not found.'
        });
    }

    let sum = 0;
    let isCSVFormat = true;

    const delimiter = ',';

    fs.createReadStream(filePath)
        .pipe(csv({ delimiter }))
        .on('data', (data) => {
            if (data.product && data.amount) {
                if (data.product === product) {
                    sum += parseInt(data.amount);
                }
            } else {
                console.log('Invalid CSV format');
                isCSVFormat = false;
                return res.json({
                    file,
                    error: 'Input file not in CSV format.'
                });
            }
        })
        .on('end', () => {
            console.log('Calculation completed successfully');
            if (isCSVFormat) {
                return res.json({
                    file,
                    sum
                });
            }
        })
        .on('error', (error) => {
            console.log('Error parsing CSV file:', error.message);
            return res.json({
                file,
                error: 'Input file not in CSV format.'
            });
        });
});

app.listen(PORT, () => {
    console.log(`Container 2 listening on port ${PORT}`);
});
