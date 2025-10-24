const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { connectDB } = require('./config/dbConfig');

// importar as rotas
const authRoutes = require('./routes/authRoutes');

const app = express();
const port = process.env.PORT || 3000;

// middlewares
app.use(cors()); // permite pedidos de outros domínios
app.use(express.json()); // servidor lê json
app.use(express.urlencoded({ extended: true })); 

// --- ROTAS ---
// como esperado, as rotas encontram-se em /api/auth
app.use('/api/auth', authRoutes);

// só inicia o servidor depois de conectar à base de dados
async function startServer() {
    const pool = await connectDB();
    if (!pool) {
        console.error("Falha ao conectar à base de dados. O servidor não será iniciado.");
        process.exit(1); 
        return;
    }

    app.listen(port, () => {
        console.log(`Servidor API a correr na porta http://localhost:${port}`);
    });
}

startServer();