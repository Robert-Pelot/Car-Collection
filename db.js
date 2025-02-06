const mysql = require('mysql');

const connection = mysql.createConnection({
  host: 'yourserver.mysql.database.azure.com',
  user: 'yourusername@yourserver',
  password: 'yourpassword',
  database: 'hotwheelscarcollection'
});

connection.connect((err) => {
  if (err) throw err;
  console.log('Connected to the database!');
});