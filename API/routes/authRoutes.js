const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Define a rota de Login
// Quando recebermos um POST em /api/auth/login, executa authController.login
router.post('/login', authController.login);

// Define a rota do Dashboard (exemplo)
// Quando recebermos um GET em /api/auth/dashboard, executa authController.getDashboardData
router.get('/dashboard', authController.getDashboardData);

module.exports = router;