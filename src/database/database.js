const pg = require('pg');
const Pool = pg.Pool;

const pool = new Pool ({
    user: 'postgres',
    host: 'localhost',
    database: 'todolist',
    password: '1234',
    port: 5432,
});

module.exports = pool;
