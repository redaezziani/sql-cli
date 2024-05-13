import { intro, text, select, spinner,cancel, outro } from '@clack/prompts';
import mysql, { ConnectionOptions } from 'mysql2';

const s = spinner();


async function main() {
    intro(`Welcome back!`);
    const user = await text({
        message: 'Enter the user name :',
        placeholder: '....',
        initialValue: '',
        validate(value: string) {
            if (value.length === 0) return `Value is required!`;
        },
        defaultValue: 'root',
    });

    const password = await text({
        message: 'Enter the password :',
        placeholder: '....',
        initialValue: '',
        validate(value: string) {
            if (value.length === 0) return `Value is required!`;
        },
        defaultValue: '',
    });

    const database = await text({
        message: 'Enter the database name :',
        placeholder: '....',
        initialValue: '',
        validate(value: string) {
            if (value.length === 0) return `Value is required!`;
        },
    });

    const access: ConnectionOptions = {
        //@ts-ignore
        user: user ?? 'root',
        //@ts-ignore
        password: password ?? '',
        //@ts-ignore
        database: database ?? 'train',
    };
    const db = mysql.createConnection(access);

    db.connect((err) => {
        if (err) {
            console.error('error connecting: ' + err.stack);
            return;
        }
    });

    let choice;
    do {
        choice = await choices();

        switch (choice) {
            case '1': {
                const tables: string[] = await getTables(db);

                if (tables.length === 0) {
                    console.log('No tables found');
                } else {
                    console.table(tables);
                }
                break;
            }
            case '4': {
                const tables: string[] = await getTables(db);

                if (tables.length === 0) {
                    console.log('No tables found');
                } else {
                    const tableToDelete = await select({
                        message: 'Pick a table to delete :',
                        options: tables.map((table) => ({ value: table, label: table })),
                    });
                    s.start(`Deleting table ${tableToDelete}`);
                    //@ts-ignore
                    const isDeleted = await deleteTable(db, tableToDelete);
                    s.stop();
                    if (isDeleted) {
                        console.log(`Table ${tableToDelete} deleted successfully`);
                    }
                }
                break;
            }
            case '5': {
                db.end();
                outro('Goodbye!');
                process.exit(0);
            }
        }
    } while (choice !== '5');
}

const getTables = async (db: any) => {
    try {
        const [rows, fields] = await db.promise().query('SHOW TABLES');
        const tables = rows.map((row: any) => Object.values(row)[0]);
        return tables;
    } catch (error) {
        console.error('Error fetching tables:', error);
       cancel('Error fetching tables:');
    }
}

const deleteTable = async (db: any, tableName: string): Promise<boolean> => {
    try {
        // Check if the table exists
        const tableExists = await checkTableExists(db, tableName);
        if (!tableExists) {
            console.log(`Table '${tableName}' does not exist.`);
            return false;
        }

        const dependentTables = await getDependentTables(db, tableName);
        if (dependentTables.length > 0) {
            console.log('Dependent tables:', dependentTables.join(', ') + '.');
            const confirmDelete = await select({
                message: `The table '${tableName}' is referenced by other tables. Do you want to delete the dependent tables as well?`,
                options: [
                    { value: 'yes', label: 'Yes' },
                    { value: 'no', label: 'No' }
                ]
            });

            if (confirmDelete === 'yes') {
                // Delete dependent tables
                for (const dependentTable of dependentTables) {
                    await deleteTable(db, dependentTable);
                }
            }
        }

        // Proceed with deleting the original table
        await db.promise().query(`DROP TABLE ${tableName}`);
        return true;
    } 
    catch (error:any) {
        console.error('Error deleting table:', error);
        return false;
    }
}

const checkTableExists = async (db: any, tableName: string): Promise<boolean> => {
    const [rows] = await db.promise().query(`SHOW TABLES LIKE ?`, [tableName]);
    return rows.length > 0;
}


const getDependentTables = async (db: any, tableName: string) => {
    const [rows] = await db.promise().query(`SELECT TABLE_NAME 
                                             FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
                                             WHERE REFERENCED_TABLE_NAME = ?`, [tableName]);
    return rows.map((row: any) => row.TABLE_NAME);
}

const choices = async () => {
    const choice = await select({
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
}


main();
