const express = require('express');
const router = express.Router();
const { registerUser, loginUser } = require('../../controllers/attendants/authController');

// Rota de cadastro
router.post('/register', registerUser);

// Rota de login
router.post('/login', loginUser);

module.exports = router;
