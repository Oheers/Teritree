const mysql = require("mysql");

const connection = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : 'root',
    database : 'teritree_db1'
});

connection.connect(function(err) {
    if (err) {
        console.error('Error Connecting: ' + err.stack);
        return;
    }

    console.log('Connected as ID ' + connection.threadId);
});

connection.end();