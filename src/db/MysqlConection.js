import mysql2 from "mysql2/promise";

const pool = mysql2.createPool({
    host: "162.240.174.79",
    user: "pizarras_andres",
    database: "pizarras_pizarritas",
    password: "r@@tPizaras",
    port: "3306",
    timezone: "Z"
})

export default pool;