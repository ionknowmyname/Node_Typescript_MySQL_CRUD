"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const bcrypt_1 = __importDefault(require("bcrypt"));
const dbConnection_1 = __importDefault(require("../config/dbConnection"));
const generateToken_1 = __importDefault(require("../config/generateToken"));
const authentication_1 = __importDefault(require("../config/authentication"));
var cacheService = require("express-api-cache");
var cache = cacheService.cache;
const saltround = 10;
const userRouter = (0, express_1.Router)();
userRouter.get('/', (req, res) => {
    return res.json("OK");
});
userRouter.get('/all', authentication_1.default, cache("10 minutes"), (req, res) => {
    dbConnection_1.default.getConnection((err, conn) => {
        if (err) {
            console.log('Entered an error: ', err);
            res.send({
                success: false,
                statusCode: 500,
                message: 'Error during connection'
            });
            return;
        }
        const sqlQuery = 'SELECT id, email, phone, createdAt FROM users';
        dbConnection_1.default.query(sqlQuery, (err, rows) => {
            if (err) {
                console.log('Encountered an error: ', err);
                conn.release();
                return res.send({
                    success: false,
                    statusCode: 400
                });
            }
            if (rows.length < 1) { // DB table is empty
                return res.send({
                    message: 'No Data found',
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
userRouter.post('/register', (req, res) => {
    dbConnection_1.default.getConnection((err, conn) => {
        if (err) {
            console.log('Entered an error: ', err);
            res.send({
                success: false,
                statusCode: 500,
                message: 'Error during connection'
            });
            return;
        }
        bcrypt_1.default.hash(req.body.password, saltround, (error, hash) => {
            if (error) {
                console.log('Entered an error: ', error);
                res.send({
                    success: false,
                    statusCode: 500,
                    message: 'Error during password encryption'
                });
                return;
            }
            else {
                // console.log('req.body: ' + req.body);
                let sqlQuery = `call registeruser(?,?,?)`; // stored procedure on phpmyadmin
                conn.query(sqlQuery, [req.body.email, req.body.phone, hash], (err, rows) => {
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
            }
        });
    });
});
userRouter.post('/login', (req, res) => {
    dbConnection_1.default.getConnection((err, conn) => {
        if (err) {
            console.log('Entered an error: ', err);
            res.send({
                success: false,
                statusCode: 500,
                message: 'Error during connection'
            });
            return;
        }
        dbConnection_1.default.query('SELECT password FROM users WHERE email=?', [req.body.email], (err, rows) => {
            if (err) {
                console.log('Encountered an error: ', err);
                conn.release();
                return res.send({
                    success: false,
                    statusCode: 400
                });
            }
            console.log("hashed password from DB --> " + rows[0].password);
            const passwordfromDB = rows[0].password;
            bcrypt_1.default.compare(req.body.password, passwordfromDB, (err, result) => {
                if (err) {
                    res.send({
                        message: "Failed",
                        statusCode: 500,
                        data: err
                    });
                }
                if (result) {
                    res.send({
                        message: "Success",
                        statusCode: 200,
                        data: { token: (0, generateToken_1.default)(req.body.email) }
                    });
                }
                else {
                    res.send({
                        message: "Failed",
                        statusCode: 500,
                        data: err
                    });
                }
            });
            conn.release(); // close connection
        });
    });
});
exports.default = userRouter;
