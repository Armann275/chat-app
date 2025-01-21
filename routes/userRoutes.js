// Routes
const express = require('express');
const router = express.Router();
const validateUser = require('../middleware/validation')
const {postRegistration,postLogin,refreshToken} = require('../controllers/userController');
const authValidate = require('../middleware/authValidate');
router.post('/registration',validateUser,postRegistration);
router.post('/login',postLogin);
router.post('/refresh',refreshToken);
module.exports = router



