import pool from "@/db/MysqlConection";

export const selectLottery = async () => {
  let result = false;
  let error = false;

  try {
    let sql = `SELECT * FROM sorteo WHERE Tipo_sorteo = 'normal' OR (Tipo_sorteo = 'domingo' AND DAYOFWEEK(Fecha) = 1)`;
    let [rows] = await pool.query(sql);
    result = rows;
  } catch (err) {
    error = {
      sql: sql,
      description: err,
    };
    console.log(error);
  }

  let response = {
    preocess: "select table",
    status: true,
    result: result,
  };

  return response;
};

export const selectLotterySerie = async () => {
  let result = false;
  let error = false;

  try {
    let sql = `SELECT s.Fecha AS 'fecha_sorteo', b.*
                        FROM sorteo s
                        JOIN boletos b ON s.Idsorteo  = b.tipo_sorteo
                        WHERE s.Tipo_sorteo = 'especial' AND s.Estatus = 'abierto';`;
    let [rows] = await pool.query(sql);
    result = rows;
  } catch (err) {
    error = {
      sql: sql,
      description: err,
    };
    console.log(error);
  }

  let response = {
    preocess: "select table",
    status: true,
    result: result,
  };

  return response;
};

export const selectLotteryEspecial = async () => {
  let result = false;
  let error = false;

  try {
    let sql = `SELECT * FROM sorteo WHERE Tipo_sorteo ='especial' AND Estatus = 'abierto'`;
    let [rows] = await pool.query(sql);
    result = rows;
  } catch (err) {
    error = {
      sql: sql,
      description: err,
    };
    console.log(error);
  }

  let response = {
    preocess: "select table",
    status: true,
    result: result,
  };

  return response;
};
