const express = require('express');
const router = express.Router();
const { loginUser } = require('../../controllers/attendants/login/controllerReqLogin');
const { registerUser } = require('../../controllers/attendants/register/controllerReqRegister');


// Rota de cadastro
router.post('/register', registerUser);

// Rota de login
router.post('/login', loginUser);

module.exports = router;
