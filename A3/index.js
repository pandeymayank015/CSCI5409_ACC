const express = require('express');
const mysql = require('mysql2');
const app = express();
app.use(express.json());

function createDatabase() {
    const connection = mysql.createConnection({
        host: 'tutorial-db-instance-instance-1.codlczxwlynn.us-east-1.rds.amazonaws.com',
        user: 'tutorial_user',
        password: 'tutorial_user'
    });

    connection.connect((err) => {
        if (err) {
            console.error('Error connecting to the database server:', err);
            return;
        }

        const createDbQuery = 'CREATE DATABASE IF NOT EXISTS tutorial';
        const useDbQuery = 'USE tutorial';
        const createTableQuery = `CREATE TABLE IF NOT EXISTS products (
            name varchar(100),
            price varchar(100),
            availability boolean
        )`;

        connection.query(createDbQuery, (err) => {
            if (err) {
                console.error('Error creating the database:', err);
                connection.end();
                return;
            }

            connection.query(useDbQuery, (err) => {
                if (err) {
                    console.error('Error using the database:', err);
                    connection.end();
                    return;
                }

                connection.query(createTableQuery, (err) => {
                    if (err) {
                        console.error('Error creating the table:', err);
                    } else {
                        console.log('Database and table created successfully');
                    }

                    connection.end();
                });
            });
        });
    });
}

// Create the database and table before starting the server
createDatabase();

app.post('/store-products', (req, res) => {
    const products = req.body.products;
    const connection = mysql.createConnection({
        host: 'tutorial-db-instance-instance-1.codlczxwlynn.us-east-1.rds.amazonaws.com',
        user: 'tutorial_user',
        password: 'tutorial_user',
        database: 'tutorial'
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
        connection.end();
    });
});

app.get('/list-products', (req, res) => {
    const connection = mysql.createConnection({
        host: 'tutorial-db-instance-instance-1.codlczxwlynn.us-east-1.rds.amazonaws.com',
        user: 'tutorial_user',
        password: 'tutorial_user',
        database: 'tutorial'
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
        connection.end();
    });
});

const port = 443;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
