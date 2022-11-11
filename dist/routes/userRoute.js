"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const mysql_1 = __importDefault(require("mysql"));
const userRouter = (0, express_1.Router)();
userRouter.get('/', (req, res) => {
    return res.json("OK");
});
userRouter.get('/details/:id', (req, res) => {
    var pool = mysql_1.default.createPool({
        host: process.env.HOST,
        user: process.env.USER,
        password: process.env.PASSWORD,
        database: process.env.DATABASE,
        connectionLimit: 10,
        multipleStatements: true
    });
    pool.getConnection((err, conn) => {
        if (err) {
            console.log('Entered an error: ', err);
            res.send({
                success: false,
                statusCode: 500,
                message: 'Error during connection'
            });
            return;
        }
        console.log('id from req.params: ' + req.params.id);
        conn.query('SELECT * FROM customers WHERE customerNumber=?', [req.params.id], (err, rows) => {
            if (err) {
                console.log('Encountered an error: ', err);
                conn.release();
                return res.send({
                    success: false,
                    statusCode: 400
                });
            }
            if (rows.length < 1) {
                return res.send({
                    message: 'Data not found',
                    statusCode: 404,
                });
            }
            res.send({
                message: 'Successul',
                statusCode: 200,
                data: rows
            });
            conn.release(); // close connection
        });
    });
});
userRouter.post('/register/', (req, res) => {
    var pool = mysql_1.default.createPool({
        host: process.env.HOST,
        user: process.env.USER,
        password: process.env.PASSWORD,
        database: process.env.DATABASE,
        connectionLimit: 10,
        multipleStatements: true
    });
    pool.getConnection((err, conn) => {
        if (err) {
            console.log('Entered an error: ', err);
            res.send({
                success: false,
                statusCode: 500,
                message: 'Error during connection'
            });
            return;
        }
        console.log('req.body: ' + req.body);
        let sqlQuery = `call registeruser(?,?,?)`;
        conn.query(sqlQuery, [req.body.email, req.body.phone, req.body.password], (err, rows) => {
            if (err) {
                console.log('Encountered an error: ', err);
                conn.release();
                return res.send({
                    success: false,
                    statusCode: 400
                });
            }
            res.send({
                message: 'Successul',
                statusCode: 200,
                // data: rows
            });
            conn.release(); // close connection
        });
    });
});
exports.default = userRouter;
