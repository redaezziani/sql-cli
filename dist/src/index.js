"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const prompts_1 = require("@clack/prompts");
const mysql2_1 = __importDefault(require("mysql2"));
const s = (0, prompts_1.spinner)();
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        (0, prompts_1.intro)(`Welcome back!`);
        const user = yield (0, prompts_1.text)({
            message: 'Enter the user name :',
            placeholder: '....',
            initialValue: '',
            validate(value) {
                if (value.length === 0)
                    return `Value is required!`;
            },
            defaultValue: 'root',
        });
        const password = yield (0, prompts_1.text)({
            message: 'Enter the password :',
            placeholder: '....',
            initialValue: '',
            validate(value) {
                if (value.length === 0)
                    return `Value is required!`;
            },
            defaultValue: '',
        });
        const database = yield (0, prompts_1.text)({
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
        db.connect((err) => {
            if (err) {
                console.error('error connecting: ' + err.stack);
                return;
            }
        });
        let choice;
        do {
            choice = yield choices();
            switch (choice) {
                case '1': {
                    const tables = yield getTables(db);
                    if (tables.length === 0) {
                        console.log('No tables found');
                    }
                    else {
                        console.table(tables);
                    }
                    break;
                }
                case '4': {
                    const tables = yield getTables(db);
                    if (tables.length === 0) {
                        console.log('No tables found');
                    }
                    else {
                        const tableToDelete = yield (0, prompts_1.select)({
                            message: 'Pick a table to delete :',
                            options: tables.map((table) => ({ value: table, label: table })),
                        });
                        s.start(`Deleting table ${tableToDelete}`);
                        //@ts-ignore
                        const isDeleted = yield deleteTable(db, tableToDelete);
                        s.stop();
                        if (isDeleted) {
                            console.log(`Table ${tableToDelete} deleted successfully`);
                        }
                    }
                    break;
                }
                case '5': {
                    db.end();
                    (0, prompts_1.outro)('Goodbye!');
                    process.exit(0);
                }
            }
        } while (choice !== '5');
    });
}
const getTables = (db) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const [rows, fields] = yield db.promise().query('SHOW TABLES');
        const tables = rows.map((row) => Object.values(row)[0]);
        return tables;
    }
    catch (error) {
        console.error('Error fetching tables:', error);
        (0, prompts_1.cancel)('Error fetching tables:');
    }
});
const deleteTable = (db, tableName) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Check if the table exists
        const tableExists = yield checkTableExists(db, tableName);
        if (!tableExists) {
            console.log(`Table '${tableName}' does not exist.`);
            return false;
        }
        const dependentTables = yield getDependentTables(db, tableName);
        if (dependentTables.length > 0) {
            console.log('Dependent tables:', dependentTables.join(', ') + '.');
            const confirmDelete = yield (0, prompts_1.select)({
                message: `The table '${tableName}' is referenced by other tables. Do you want to delete the dependent tables as well?`,
                options: [
                    { value: 'yes', label: 'Yes' },
                    { value: 'no', label: 'No' }
                ]
            });
            if (confirmDelete === 'yes') {
                // Delete dependent tables
                for (const dependentTable of dependentTables) {
                    yield deleteTable(db, dependentTable);
                }
            }
        }
        // Proceed with deleting the original table
        yield db.promise().query(`DROP TABLE ${tableName}`);
        return true;
    }
    catch (error) {
        console.error('Error deleting table:', error);
        return false;
    }
});
const checkTableExists = (db, tableName) => __awaiter(void 0, void 0, void 0, function* () {
    const [rows] = yield db.promise().query(`SHOW TABLES LIKE ?`, [tableName]);
    return rows.length > 0;
});
const getDependentTables = (db, tableName) => __awaiter(void 0, void 0, void 0, function* () {
    const [rows] = yield db.promise().query(`SELECT TABLE_NAME 
                                             FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
                                             WHERE REFERENCED_TABLE_NAME = ?`, [tableName]);
    return rows.map((row) => row.TABLE_NAME);
});
const choices = () => __awaiter(void 0, void 0, void 0, function* () {
    const choice = yield (0, prompts_1.select)({
        message: 'Pick a a choice :',
        options: [
            { value: '1', label: 'see all tables' },
            { value: '2', label: 'create a table' },
            { value: '3', label: 'select a table' },
            { value: '4', label: 'delete a table' },
            { value: '5', label: 'exit' },
        ],
    });
    return choice;
});
main();
