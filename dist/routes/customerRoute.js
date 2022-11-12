"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const dbConnection_1 = __importDefault(require("../config/dbConnection"));
const authentication_1 = __importDefault(require("../config/authentication"));
const customerRouter = (0, express_1.Router)();
customerRouter.get('/', (req, res) => {
    return res.json("OK");
});
customerRouter.get('/details/:id', authentication_1.default, (req, res) => {
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
            if (rows.length < 1) { // selected customerNumber dont exist
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
exports.default = customerRouter;
