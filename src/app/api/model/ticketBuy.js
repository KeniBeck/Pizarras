import pool from "@/db/MysqlConection";
export const selectLottery = async () => {
    let result = false;
    let error = false;

    try {
        const currentDate = new Date();
        const dayOfWeek = currentDate.getDay(); // 0 (Sunday) to 6 (Saturday)
        let targetDate = new Date(currentDate);

        if (dayOfWeek === 1 || dayOfWeek === 2) { // Monday or Tuesday
            targetDate.setDate(currentDate.getDate() + (2 - dayOfWeek)); // Set to Tuesday
        } else if (dayOfWeek >= 3 && dayOfWeek <= 5) { // Wednesday, Thursday, or Friday
            targetDate.setDate(currentDate.getDate() + (5 - dayOfWeek)); // Set to Friday
        } else if (dayOfWeek === 6) { // Saturday
            targetDate.setDate(currentDate.getDate() + 1); // Set to Sunday
        }

        const month = (targetDate.getMonth() + 1).toString().padStart(2, '0');
        const day = targetDate.getDate().toString().padStart(2, '0');
        const formattedDate = `${targetDate.getFullYear()}-${month}-${day}`;

        let sql = `SELECT * FROM sorteo WHERE Fecha = ? AND (Tipo_sorteo = 'normal' OR (Tipo_sorteo = 'domingo' AND DAYOFWEEK(Fecha) = 1))`;
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
export const selectLotterySerie = async () => {
    let result = false;
    let error = false;

    try {
        let sql = `SELECT s.Fecha AS 'fecha_sorteo', b.*
                        FROM sorteo s
                        JOIN boletos b ON s.Idsorteo  = b.tipo_sorteo
                        WHERE s.Tipo_sorteo = 'especial' AND s.Estatus = 'abierto';`
        let [rows] = await pool.query(sql);
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
export const selectLotteryEspecial = async () => {
    let result = false;
    let error = false;

    try {
        let sql = `SELECT * FROM sorteo WHERE Tipo_sorteo ='especial' AND Estatus = 'abierto'`;
        let [rows] = await pool.query(sql);
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