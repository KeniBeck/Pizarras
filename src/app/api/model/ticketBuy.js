import pool from "@/db/MysqlConection";
export const selectLottery = async () => {
    let result = false;
    let error = false;

    try {
        const currentDate = new Date();
        const dayOfWeek = currentDate.getDay(); // 0 (Sunday) to 6 (Saturday)
        const currentHour = currentDate.getHours(); // Obtener la hora actual
        let targetDate = new Date(currentDate);

        // Definir los días de los sorteos
        const lotteryDays = {
            2: 'Martes', // Martes
            5: 'Viernes', // Viernes
            0: 'Domingo' // Domingo
        };

        // Función para obtener el siguiente día de sorteo
        const getNextLotteryDay = (day) => {
            if (day === 2) return 5; // Martes -> Viernes
            if (day === 5) return 0; // Viernes -> Domingo
            return 2; // Domingo -> Martes
        };

        // Si la hora actual es igual o mayor a las 19:00, obtener el siguiente día de sorteo
        if (currentHour >= 19) {
            targetDate.setDate(currentDate.getDate() + ((getNextLotteryDay(dayOfWeek) - dayOfWeek + 7) % 7));
        } else {
            // Obtener el próximo día de sorteo según el día actual
            if (dayOfWeek === 1 || dayOfWeek === 2) { // Lunes o Martes
                targetDate.setDate(currentDate.getDate() + (2 - dayOfWeek)); // Cargar el sorteo del Martes
            } else if (dayOfWeek >= 3 && dayOfWeek <= 5) { // Miércoles, Jueves o Viernes
                targetDate.setDate(currentDate.getDate() + (5 - dayOfWeek)); // Cargar el sorteo del Viernes
            } else if (dayOfWeek === 6) { // Sábado
                targetDate.setDate(currentDate.getDate() + 1); // Cargar el sorteo del Domingo
            } else if (dayOfWeek === 0) { // Domingo
                targetDate.setDate(currentDate.getDate() + 2); // Cargar el sorteo del Martes
            }
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