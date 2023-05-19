const express = require('express');
const csv = require('csv-parser');
const fs = require('fs');

const app = express();
const PORT = 7000;

app.use(express.json());

const csvFormatRegex = /^([^,]+,[^,]+,)*[^,]+,[^,]+$/;

app.post('/sum', (req, res) => {
    const { file, product } = req.body;

    if (!file) {
        console.log('Invalid JSON input: file field missing');
        return res.json({
            file: null,
            error: 'Invalid JSON input.'
        });
    }

    const filePath = `/app/data/${file}`;
    if (!fs.existsSync(filePath)) {
        console.log('File not found:', filePath);
        return res.json({
            file,
            error: 'File not found.'
        });
    }

    const results = [];
    let sum = 0;
    let isCSVFormat = true;
    let firstChunk = '';

    const fileStream = fs.createReadStream(filePath);

    fileStream.on('data', (chunk) => {
        firstChunk += chunk.toString('utf-8');
    });

    fileStream
        .pipe(csv())
        .on('data', (data) => {
            if (data.product === product) {
                sum += parseInt(data.amount);
            }
        })
        .on('end', () => {
            console.log('Calculation completed successfully');
            if (isCSVFormat) {
                if (sum === 0) {
                    return res.json({
                        file,
                        error: 'Input file not in CSV format.'
                    });
                } else {
                    return res.json({
                        file,
                        sum
                    });
                }
            }
        })
        .on('error', (error) => {
            console.log('Error parsing CSV file:', error.message);
            isCSVFormat = false;
            return res.json({
                file,
                error: 'Input file not in CSV format.'
            });
        })
        .on('finish', () => {
            if (!csvFormatRegex.test(firstChunk)) {
                console.log('Input file not in CSV format');
                isCSVFormat = false;
                return res.json({
                    file,
                    error: 'Input file not in CSV format.'
                });
            }
        });
});

app.listen(PORT, () => {
    console.log(`Container 2 listening on port ${PORT}`);
});
