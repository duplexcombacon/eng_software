const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// rotas de login

// /api/auth/login
router.post('/login', authController.login);

// 
// /api/auth/dashboard
router.get('/dashboard', authController.getDashboardData);

module.exports = router;