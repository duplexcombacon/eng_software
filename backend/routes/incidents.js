const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// GET todos os incidentes (com filtros)
router.get('/', async (req, res) => {
    try {
        const { status, category, priority, userId } = req.query;
        let query = 'SELECT i.*, u.full_name as creator_name FROM incidents i JOIN users u ON i.created_by = u.id WHERE 1=1';
        const params = [];

        if (status) {
            query += ' AND i.status = ?';
            params.push(status);
        }
        if (category) {
            query += ' AND i.category = ?';
            params.push(category);
        }
        if (priority) {
            query += ' AND i.priority = ?';
            params.push(priority);
        }
        if (userId) {
            query += ' AND (i.created_by = ? OR i.assigned_to = ?)';
            params.push(userId, userId);
        }

        query += ' ORDER BY i.created_at DESC LIMIT 50';

        const connection = await pool.getConnection();
        const [incidents] = await connection.query(query, params);
        connection.release();

        res.json({ success: true, data: incidents });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// GET incidente por ID
router.get('/:id', async (req, res) => {
    try {
        const connection = await pool.getConnection();
        const [incident] = await connection.query('SELECT * FROM incidents WHERE id = ?', [req.params.id]);
        connection.release();

        if (incident.length === 0) {
            return res.status(404).json({ success: false, error: 'Incidente não encontrado' });
        }

        res.json({ success: true, data: incident[0] });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// POST novo incidente
router.post('/', async (req, res) => {
    try {
        const { title, description, category, priority, affected_users, created_by } = req.body;

        if (!title || !description || !category || !priority) {
            return res.status(400).json({ success: false, error: 'Campos obrigatórios faltando' });
        }

        const connection = await pool.getConnection();
        const [result] = await connection.query(
            'INSERT INTO incidents (title, description, category, priority, affected_users, created_by, status) VALUES (?, ?, ?, ?, ?, ?, "Aberto")',
            [title, description, category, priority, affected_users || 1, created_by || 1]
        );
        connection.release();

        res.status(201).json({ success: true, data: { id: result.insertId, ...req.body } });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// PUT atualizar incidente
router.put('/:id', async (req, res) => {
    try {
        const { status, assigned_to, priority } = req.body;
        const updates = [];
        const values = [];

        if (status) {
            updates.push('status = ?');
            values.push(status);
        }
        if (assigned_to) {
            updates.push('assigned_to = ?');
            values.push(assigned_to);
        }
        if (priority) {
            updates.push('priority = ?');
            values.push(priority);
        }

        if (status === 'Resolvido') {
            updates.push('resolved_at = NOW()');
        }

        updates.push('updated_at = NOW()');
        values.push(req.params.id);

        const connection = await pool.getConnection();
        await connection.query(`UPDATE incidents SET ${updates.join(', ')} WHERE id = ?`, values);
        connection.release();

        res.json({ success: true, message: 'Incidente atualizado' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;
