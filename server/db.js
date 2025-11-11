import sql from "mssql";
import dotenv from "dotenv";

dotenv.config();

// Lógica NOVA (condicional)

// Configuração base
const dbConfig = {
    server: process.env.DB_SERVER,
    database: process.env.DB_NAME,
    options: {
        encrypt: false // Mude para true se estiver a usar Azure, etc.
    },
    pool: { // Exemplo se estiver a usar pooling
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000
    }
};

// Adiciona autenticação SQL apenas se DB_USER existir no .env
if (process.env.DB_USER) {
    dbConfig.user = process.env.DB_USER;
    dbConfig.password = process.env.DB_PASS;
} else {
    // Caso contrário, usa a Autenticação do Windows
    dbConfig.options.trustedConnection = true;
}

// Agora use 'dbConfig' para criar a sua ligação
// ex: await sql.connect(dbConfig)

export const poolPromise = new sql.ConnectionPool(dbConfig)
  .connect()
  .then(pool => {
    console.log("✅ Ligado ao SQL Server");
    return pool;
  })
  .catch(err => {
    console.error("❌ Erro na ligação à BD:", err);
    throw err;
  });

export { sql };
