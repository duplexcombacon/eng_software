const sql = require('mssql');
require('dotenv').config();

// vai buscar o servidor da bd sql ao .env
const rawServer = process.env.DB_SERVER || '127.0.0.1';
let server = rawServer;
let instanceName;
let port;

if (rawServer.includes('\\')) {
    // "host\\INSTANCE"
    const parts = rawServer.split('\\');
    server = parts[0];
    instanceName = parts[1];
} else if (rawServer.includes(':')) {
    // "host:port"
    const parts = rawServer.split(':');
    server = parts[0];
    port = parseInt(parts[1], 10);
}

const config = {
    server: server,
    user: process.env.DB_USER || 'sa',
    password: process.env.DB_PASSWORD || '', //pass definida no .env 
    database: process.env.DB_DATABASE || 'VinhosPortugal',
    options: {
        encrypt: false,
        trustServerCertificate: true,
        enableArithAbort: true,
        // só define instanceName se fornecido
        instanceName: instanceName || undefined,
        // só define port se fornecido
        port: port || undefined
    },
    connectionTimeout: 15000,
    requestTimeout: 15000
};

// função para testar e conectar a base de dados
async function connectDB() {
    try {
        let pool = await sql.connect(config);
        console.log("Conectado ao SQL Server com sucesso!");
        return pool;
    } catch (err) {
        console.error("Erro na conexão com a BD:", err.message || err);
        console.error("Configuração usada:", {
            server: server,
            instanceName: instanceName,
            port: port,
            user: config.user,
            database: config.database
        });
        return null;
    }
}

module.exports = { sql, config, connectDB };