const express = require('express')
const app = express()

const port = 3000
const bodyParser = require('body-parser')
const jsonexport = require('jsonexport');
const jsonxml = require('jsontoxml');
const fs = require('fs');

const mysql = require('mysql');
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'robobank'
});

connection.connect(function (err) {
    if (err) {
        console.error('error connecting: ' + err.stack);
        return;
    }

    console.log('connected as id ' + connection.threadId);
});





app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())


app.post('/robo_bank_data_creation', (req, res) => {
    console.log(req.body)
    var sql = `INSERT INTO record (transaction_reference, account_number,start_balance,mutation,description,end_balance) VALUES 
    (${req.body.transaction_reference},${req.body.account_number},${req.body.start_balance},${req.body.start_balance},
        '${req.body.description}', ${req.body.end_balance})`;

    connection.query(sql, function (error, results, fields) {
        if (error) {
            res.send(error)
        } else if (results) {
            res.send("insert success")
        }
    });
})

app.get("/download_report_csv", function (req, res) {
    var sql = `select * from record`;
    connection.query(sql, function (error, results, fields) {
        if (error) {
            res.send(error)
        } else {
            jsonexport(results, function (err, csv) {
                if (err) return console.log(err);
                fs.writeFile('report_csv.csv', csv, function (err) {
                    if (err) throw err;
                    res.download('report_csv.csv')
                });
            });
        }
    });
});

app.get("/download_report_xml", function (req, res) {
    var sql = `select * from record`;
    connection.query(sql, function (error, results, fields) {
        if (error) {
            res.send(error)
        } else {
            var xml = jsonxml({
                node:'record',
                parent:results
            })
             
            fs.writeFile('report_xml.xml', xml, function (err) {
                if (err) throw err;
                res.download('report_xml.xml')
            });
        }
    });
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`))