import mysql2 from "mysql2/promise";

const pool = mysql2.createPool({
    host: "localhost",
    user: "root",
    database: "pizarritas",
    password: "****",
    port: "3306",
    timezone: 'Z'
})

export default pool;