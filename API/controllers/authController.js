const { sql, config } = require('../config/dbConfig');

// Lógica de Login (Tarefa: Rota /login)
exports.login = async (req, res) => {
    // 1. Obter username e password do corpo do pedido (JSON)
    const { username, password } = req.body;

    // Validação simples
    if (!username || !password) {
        return res.status(400).json({ message: "Username e password são obrigatórios." });
    }

    try {
        // 2. Conectar à BD
        let pool = await sql.connect(config);

        // 3. Consultar a BD (igual ao que fizeste em Python)
        let result = await pool.request()
            .input('username_param', sql.VarChar, username)
            .query("SELECT Password, Perfil FROM Utilizador WHERE Username = @username_param");

        if (result.recordset.length === 0) {
            return res.status(401).json({ message: "Utilizador não encontrado." });
        }

        const user = result.recordset[0];

        // 4. Validar a password (simples, sem hash, como no teu projeto Python)
        if (user.Password === password) {
            // SUCESSO!
            // (Numa app real, criaríamos um Token JWT aqui)
            res.status(200).json({
                message: "Login bem-sucedido!",
                perfil: user.Perfil
            });
        } else {
            // Password errada
            res.status(401).json({ message: "Password incorreta." });
        }

    } catch (err) {
        console.error("Erro no login:", err.message);
        res.status(500).json({ message: "Erro no servidor." });
    }
};

// Lógica do Dashboard (Tarefa: Rota /dashboard)
exports.getDashboardData = (req, res) => {
    // (Numa app real, esta rota devia ser protegida por Token)
    // Por agora, é apenas um exemplo de resposta.
    res.status(200).json({
        message: "Bem-vindo ao Dashboard!",
        dados: [
            { id: 1, info: "Total de Vendas", valor: 15000 },
            { id: 2, info: "Stock de Garrafas", valor: 8500 }
        ]
    });
};