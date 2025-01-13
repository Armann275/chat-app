// Routes
const express = require('express');
const router = express.Router();
const validateUser = require('../middleware/validation')
const {getRegistration,postRegistration,getMain,postLogin,refreshToken,getLogin} = require('../controllers/userController');
const authValidate = require('../middleware/authValidate');
router.get('/main',authValidate,getMain);
router.get('/registration',getRegistration);
router.post('/registration',validateUser,postRegistration);

router.get('/login',getLogin);
router.post('/login',postLogin);
router.post('/refresh',refreshToken);
module.exports = router



