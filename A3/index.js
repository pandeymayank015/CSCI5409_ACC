const express = require('express');
const mysql = require('mysql2');
const app = express();
app.use(express.json());
app.post('/store-products', (req, res) => {
    const products = req.body.products;
    const connection = mysql.createConnection({
        host: '<RDS_HOST>',
        user: '<RDS_USER>',
        password: '<RDS_PASSWORD>',
        database: '<RDS_DATABASE>'
    });
    connection.connect((err) => {
        if (err) {
            console.error('Error connecting to the database:', err);
            res.sendStatus(500);
            return;
        }
        products.forEach((product) => {
            const { name, price, availability } = product;
            const query = `INSERT INTO products (name, price, availability) VALUES (?, ?, ?)`;
            connection.query(query, [name, price, availability], (err, result) => {
                if (err) {
                    console.error('Error inserting product:', err);
                }
            });
        });
        res.json({ message: 'Success.' });
    });
    connection.end();
});
app.get('/list-products', (req, res) => {
    const connection = mysql.createConnection({
        host: '<RDS_HOST>',
        user: '<RDS_USER>',
        password: '<RDS_PASSWORD>',
        database: '<RDS_DATABASE>'
    });
    connection.connect((err) => {
        if (err) {
            console.error('Error connecting to the database:', err);
            res.sendStatus(500);
            return;
        }
        const query = 'SELECT * FROM products';
        connection.query(query, (err, results) => {
            if (err) {
                console.error('Error querying products:', err);
                res.sendStatus(500);
                return;
            }
            res.json({ products: results });
        });
    });
    connection.end();
});
const port = 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
