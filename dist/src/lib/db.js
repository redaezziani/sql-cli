"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const prompts_1 = require("@clack/prompts");
const mysql2_1 = __importDefault(require("mysql2"));
const prompts_2 = require("@clack/prompts");
(0, prompts_1.intro)(`Welcome back!`);
const user = (0, prompts_2.text)({
    message: 'Enter the user name :',
    placeholder: '....',
    initialValue: '',
    validate(value) {
        if (value.length === 0)
            return `Value is required!`;
    },
    defaultValue: 'root',
});
const password = (0, prompts_2.text)({
    message: 'Enter the password :',
    placeholder: '....',
    initialValue: '',
    validate(value) {
        if (value.length === 0)
            return `Value is required!`;
    },
    defaultValue: '',
});
const database = (0, prompts_2.text)({
    message: 'Enter the database name :',
    placeholder: '....',
    initialValue: '',
    validate(value) {
        if (value.length === 0)
            return `Value is required!`;
    },
});
const access = {
    //@ts-ignore
    user: user !== null && user !== void 0 ? user : 'root',
    //@ts-ignore
    password: password !== null && password !== void 0 ? password : '',
    //@ts-ignore
    database: database !== null && database !== void 0 ? database : 'train',
};
const db = mysql2_1.default.createConnection(access);
exports.default = db;
