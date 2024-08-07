import pool from "@/db/MysqlConection";
export const selectLottery = async () => {
    let result = false;
    let error = false;

    try {
        const currentDate = new Date();
        const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
        const formattedDate = `${currentDate.getFullYear()}-${month}-${currentDate.getDate()}`;
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
        let sql = `SELECT b.Idsorteo, b.Fecha, b.Primerpremio, b.Segundopremio, b.Boleto, b.Costo, b.comprador, b.Idvendedor, b.tipo_sorteo FROM boletos b JOIN sorteo s ON b.tipo_sorteo = s.idsorteo WHERE s.Tipo_sorteo = 'especial' AND s.Estatus = 'abierto';`;
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