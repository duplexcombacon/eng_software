const { sql, config } = require('../config/dbConfig');

// logica de login (rota /login)
exports.login = async (req, res) => {
    // obter user e pass do json
    const { username, password } = req.body;

    // validação simples
    if (!username || !password) {
        return res.status(400).json({ message: "Username e password são obrigatórios." });
    }

    try {
        // conectar bd
        let pool = await sql.connect(config);

        // consultar bd
        let result = await pool.request()
            .input('username_param', sql.VarChar, username)
            .query("SELECT Password, Perfil FROM Utilizador WHERE Username = @username_param");

        if (result.recordset.length === 0) {
            return res.status(401).json({ message: "Utilizador não encontrado." });
        }

        const user = result.recordset[0];

        // validar password (se o professor quiser podemos implementar hash mais tarde)
        if (user.Password === password) {
            res.status(200).json({
                message: "Login bem-sucedido!",
                perfil: user.Perfil
            });
        } else {
            res.status(401).json({ message: "Password incorreta." });
        }

    } catch (err) {
        console.error("Erro no login:", err.message);
        res.status(500).json({ message: "Erro no servidor." });
    }
};

// logica da rota dashboard
exports.getDashboardData = (req, res) => {
    res.status(200).json({
        message: "Bem-vindo ao Dashboard!",
        dados: [
            { id: 1, info: "Total de Vendas", valor: 15000 },
            { id: 2, info: "Stock de Garrafas", valor: 8500 }
        ]
    });
};