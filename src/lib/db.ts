import { intro } from '@clack/prompts';
import mysql, { ConnectionOptions } from 'mysql2';
import { text } from '@clack/prompts';

intro(`Welcome back!`);

const user = text({
    message: 'Enter the user name :',
    placeholder: '....',
    initialValue: '',
    validate(value: string) {
        if (value.length === 0) return `Value is required!`;
    },
    defaultValue: 'root',
});

const password = text({
    message: 'Enter the password :',
    placeholder: '....',
    initialValue: '',
    validate(value: string) {
        if (value.length === 0) return `Value is required!`;
    },
    defaultValue: '',
});

const database = text({
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

export default db;
