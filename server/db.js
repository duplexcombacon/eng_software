import sql from "mssql";
import dotenv from "dotenv";

dotenv.config();

if (!process.env.DB_SERVER || !process.env.DB_USER || !process.env.DB_PASS || !process.env.DB_NAME) {
  console.error("Erro: Variáveis de ambiente não configuradas corretamente!");
  console.error("Verifique o ficheiro .env e certifique-se de que contém:");
  console.error("  - DB_SERVER");
  console.error("  - DB_USER");
  console.error("  - DB_PASS");
  console.error("  - DB_NAME");
  process.exit(1);
}

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

export const poolPromise = new sql.ConnectionPool(dbConfig)
  .connect()
  .then(pool => {
    console.log("Ligado ao SQL Server");
    return pool;
  })
  .catch(err => {
    console.error("Erro na ligação à BD:", err);
    throw err;
  });

export { sql };
