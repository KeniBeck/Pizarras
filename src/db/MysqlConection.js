import mysql2 from "mysql2/promise";

const pool = mysql2.createPool({
    host: "roundhouse.proxy.rlwy.net",
    user: "root",
    database: "pizarritas",
    password: "jpDRbKfglEPoWPyuzjrudgKgbMeCKRGE",
    port: "31830",
    timezone: "Z"
})

export default pool;