const sql = require("mssql");
require("dotenv").config();

const dbConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  server: process.env.DB_SERVER,
  database: process.env.DB_NAME,
  options: {
    encrypt: false,
    trustServerCertificate: true
  }
};

const poolPromise = new sql.ConnectionPool(dbConfig)
  .connect()
  .then(pool => {
    console.log("✅ Ligado ao SQL Server");
    return pool;
  })
  .catch(err => {
    console.error("❌ Erro na ligação à BD", err);
    throw err;
  });

module.exports = { sql, poolPromise };
