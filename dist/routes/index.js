"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const userRoute_1 = __importDefault(require("./userRoute"));
const customerRoute_1 = __importDefault(require("./customerRoute"));
const booksCRUDroute_1 = __importDefault(require("./booksCRUDroute"));
const router = (0, express_1.Router)();
router.use('/users', userRoute_1.default);
router.use('/customers', customerRoute_1.default);
router.use('/books', booksCRUDroute_1.default);
exports.default = router;
