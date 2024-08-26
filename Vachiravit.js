const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const app = express();
const port = 3000;

// Database connection
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "1234",
    database: "shopdee"
});
db.connect();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Create product
app.post('/product', function(req, res){
    const { productName, productDetail, price, cost, quantity } = req.body;

    // Using parameterized queries to prevent SQL Injection
    let sql = "INSERT INTO product (productName, productDetail, price, cost, quantity) VALUES (?, ?, ?, ?, ?)";
    db.query(sql, [productName, productDetail, price, cost, quantity], function(err, result) {
        if (err) {
            console.error(err); // Log error to server console
            return res.status(500).send({'message':'Error saving data','status':false});
        }
        res.send({'message':'บันทึกข้อมูลสำเร็จ','status':true});
    });
});

// Get product by ID
app.get('/product/:id', function(req, res){
    const productID = req.params.id;

    // Using parameterized queries to prevent SQL Injection
    let sql = "SELECT * FROM product WHERE productID = ?";
    db.query(sql, [productID], function(err, result) {
        if (err) {
            console.error(err); // Log error to server console
            return res.status(500).send({'message':'Error retrieving data','status':false});
        }
        res.send(result);
    });
});

// Login
app.post('/login', function(req, res){
    const {username, password} = req.body;

    // Using parameterized queries to prevent SQL Injection
    let sql = "SELECT * FROM customer WHERE username = ? AND isActive = 1";
    db.query(sql, [username], function(err, result) {
        if (err) {
            console.error(err); // Log error to server console
            return res.status(500).send({'message':'Error during login','status':false});
        }
        if(result.length > 0) {
            let customer = result[0];
            // Compare hashed password
            bcrypt.compare(password, customer.password, function(err, match) {
                if (err) {
                    console.error(err); // Log error to server console
                    return res.status(500).send({'message':'Error comparing password','status':false});
                }
                if (match) {
                    customer['message'] = "เข้าสู่ระบบสำเร็จ";
                    customer['status'] = true;
                    res.send(customer);
                } else {
                    res.send({"message":"กรุณาระบุรหัสผ่านใหม่อีกครั้ง", "status":false});
                }
            });
        } else {
            res.send({"message":"กรุณาระบุรหัสผ่านใหม่อีกครั้ง", "status":false});
        }
    });
});

app.listen(port, function() {
    console.log(`Server listening on port ${port}`);
});
