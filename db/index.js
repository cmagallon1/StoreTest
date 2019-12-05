const Mysql = require('mysql');

const Connection = Mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '12345678',
    database: 'StoreTest'
});

module.exports = Connection;