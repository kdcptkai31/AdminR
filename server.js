/**
 * Server - Handles HTTP requests and has a connection to the database.
 */
var mysql = require('mysql');
const express = require('express');
const app = express();
const bp = require('body-parser');
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    next();
});
app.use(bp.json())
app.use(bp.urlencoded({ extended: true }))

//Sets up database connection
const conn = mysql.createConnection({
    host: "interview-ezoic.cs6p5rczr2xv.us-east-1.rds.amazonaws.com",
    port: '3306',
    user: "ezinterview",
    password: "98DIM9yBhZh1",
    database: "Sales"
});
conn.connect(function (err) {
    if (err) {
        throw err;
    }
    else {
        console.log('Connected');
    }
});

/**
 * Given a search string, attempts to find customers where the string matches their number, name,
 * or contact name. An empty search string will yield all customers.
 */
app.post('/searchCust', function (req, res) {

    let searchString = req.body.text;
    let query = "SELECT * FROM customers";

    //Does a specific search if the string is not empty
    if (searchString !== "") {
        let selectQuery = "SELECT * FROM customers WHERE customerNumber = ? OR customerName = ? OR contactLastName = ? OR contactFirstName = ?";
        query = mysql.format(selectQuery, [searchString, searchString, searchString, searchString]);
    }

    conn.query(query, (err, result, fields) => {

        if (err) throw err;
        res.send(JSON.stringify(result));

    });

});

/**
 * Given a search string, attempts to find products where the string matches their code, name, or product
 * line. An empty search string will yield all products.
 */
app.post('/searchProd', function (req, res) {

    let searchString = req.body.text;
    let query = "SELECT * FROM products";

    //Does a specific search if the string is not empty
    if (searchString !== "") {
        let selectQuery = "SELECT * FROM products WHERE productCode = ? OR productName = ? OR productLine = ?";
        query = mysql.format(selectQuery, [searchString, searchString, searchString]);
    }

    conn.query(query, (err, result, fields) => {

        if (err) throw err;
        res.send(JSON.stringify(result));

    });

});

/**
 * Given a search string, attempts to find orders where the string matches their order number, status,
 * or customer number. An emptyt search string will yield all orders.
 */
app.post('/searchOrds', function (req, res) {

    let searchString = req.body.text;
    let query = "SELECT * FROM orders";

    //Does a specific search if the string is not empty
    if (searchString !== "") {
        let selectQuery = "SELECT * FROM orders WHERE orderNumber = ? OR status = ? OR customerNumber = ?";
        query = mysql.format(selectQuery, [searchString, searchString, searchString]);
    }

    conn.query(query, (err, result, fields) => {

        if (err) throw err;
        res.send(JSON.stringify(result));

    });

});

/**
 * Given a set of customer information, it will try to add it to the database.
 * If there was a given sales rep number, that number will be verified before saving the customer.
 * All other input data will be verified before it reaches this call.
 */
app.post('/addCust', function (req, res) {

    let data = req.body;
    let salesRepNum = data[10];
    
    //Check if they sales rep number is valid
    if (salesRepNum !== -1) {

        let query = "SELECT * FROM employees WHERE employeeNumber = ?";
        query = mysql.format(query, [salesRepNum]);
        conn.query(query, (err, result, fields) => {

            if (result.length < 1){
                res.send(JSON.stringify({ "success": false }));
                return;
            }

        });

    } else { data[10] = null; }
    if (data[11] == -1) { data[11] = 0; }

    //All data is valid, attempt to save to database.
    query = "INSERT INTO customers (customerNumber, customerName, contactLastName, contactFirstName, phone, " +
        "addressLine1, addressLine2, city, state, postalCode, country, salesRepEmployeeNumber, creditLimit) " +
        "VALUES (null, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
    query = mysql.format(query, data);
    conn.query(query, (err, result) => {

        if (err) throw err;
        console.log(data[0] + " added");
        res.send(JSON.stringify({ "success": true }));

    });

});

/**
 * For the given customer ID, their orders and payments will be returned, if any.
 */
app.post('/custDetails', (req, res) =>{

    let custID = req.body.data;
    let returnData;

    //Get Selected Customer Orders
    let query = "SELECT orderNumber, orderDate, requiredDate, shippedDate, status, comments FROM orders " + 
                "WHERE customerNumber = ?";
    query = mysql.format(query, custID);
    conn.query(query, (err, result) => {

        if (err) throw err;
        returnData = {"success": true, "orderData": result};

    });

    //Get Selected Customer Payments
    query = "SELECT checkNumber, paymentDate, amount FROM payments WHERE customerNumber = ?";
    query = mysql.format(query, custID);
    conn.query(query, (err, result) =>{

        if(err) throw err;
        returnData = {...returnData, "paymentData": result};
        res.send(JSON.stringify(returnData));

    });

});

/**
 * Keeps the server listening for requests.
 */
app.listen(8082, '127.0.0.1');
