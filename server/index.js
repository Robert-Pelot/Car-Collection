const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

// Database connection
const connection = mysql.createConnection({
  host: 'mydemoserver-mysql-rwp.mysql.database.azure.com',   // Replace with your Azure MySQL host
  user: 'rpelot',           // Replace with your Azure MySQL username
  password: 'yC=WvCN^7zztM>g',       // Replace with your Azure MySQL password
  database: 'hotwheelscarcollection'   // Replace with your Azure database name
});

// Middleware
app.use(bodyParser.json());

// Route to add car data
app.post('/addCar', (req, res) => {
  const { brand, model_name, year_of_release, car_condition, price_paid } = req.body;

  const query = `
    INSERT INTO Cars (brand, model_name, year_of_release, condition, price_paid)
    VALUES (?, ?, ?, ?, ?)
  `;

  connection.query(query, [brand, model_name, year_of_release, car_condition, price_paid], (err, results) => {
    if (err) {
      res.status(500).json({ error: 'Error adding car' });
      return;
    }
    res.status(200).json({ message: 'Car added successfully', carId: results.insertId });
  });
});

// Start server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});