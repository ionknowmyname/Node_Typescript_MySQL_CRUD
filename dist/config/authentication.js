"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const authenticate = (req, res, next) => {
    const token = req.headers.authorization;
    if (!token) {
        res.send({
            success: false,
            statusCode: 401,
            message: "No token found"
        });
    }
    else {
        const tokenSecret = 'my-token-secret';
        jsonwebtoken_1.default.verify(token.split(' ')[1], tokenSecret, (err, value) => {
            if (err) {
                res.send({
                    success: false,
                    statusCode: 401,
                    message: "Invalid token!"
                });
            }
            else {
                req.user = value.data;
                console.log("(<any>req).user: " + req.user);
                next();
            }
        });
    }
};
exports.default = authenticate;
