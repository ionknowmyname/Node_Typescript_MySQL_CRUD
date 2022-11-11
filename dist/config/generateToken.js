"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// import { Jwt } from 'jsonwebtoken';
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const generateToken = function generate(user) {
    const tokenSecret = 'my-token-secret';
    return jsonwebtoken_1.default.sign({ data: user }, tokenSecret, { expiresIn: process.env.EXPIRESIN });
};
exports.default = generateToken;
