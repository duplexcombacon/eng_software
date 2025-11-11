const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// GET todos os utilizadores
router.get('/', async (req, res) => {
    try {
        const connection = await pool.getConnection();
        const [users] = await connection.query('SELECT id, username, email, role, full_name FROM users');
        connection.release();

        res.json({ success: true, data: users });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// GET utilizador por ID
router.get('/:id', async (req, res) => {
    try {
        const connection = await pool.getConnection();
        const [user] = await connection.query('SELECT id, username, email, role, full_name FROM users WHERE id = ?', [req.params.id]);
        connection.release();

        if (user.length === 0) {
            return res.status(404).json({ success: false, error: 'Utilizador não encontrado' });
        }

        res.json({ success: true, data: user[0] });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;
