const express = require('express');
const router = express.Router();
const authValidate = require('../middleware/authValidate');
const {sendMessage,getAllMessages,deleteMessage} = require('../controllers/messageController');
router.post('/addMessage',authValidate,sendMessage);
router.get('/getMessages/:chatId',authValidate,getAllMessages);
router.post('/deleteMessage/:messageId',authValidate,deleteMessage);
module.exports = router
