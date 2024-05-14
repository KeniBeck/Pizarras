import pool from "@/db/MysqlConection";
export const selectLottery = async () => {
    let result = false;
    let error = false;

    try {
        const currentDate = new Date();
        const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
        const formattedDate = `${currentDate.getFullYear()}-${month}-${currentDate.getDate()}`;
        let sql = `SELECT * FROM sorteo WHERE Fecha = ?`;
        let [rows] = await pool.query(sql, [formattedDate]);
        result = rows;

    } catch (err) {
        error = {
            "sql": sql,
            "description": err
        }
        console.log(error);
    }

    let response = {
        "preocess": 'select table',
        "status": true,
        "result": result
    }

    return response;
}