const express = require('express');
const router = express.Router();
const {createChat,getAllChats,createGroup,renameGroup,groupAdd,removeFromGroup,deleteChat,clearChatHistory} = require('../controllers/chatController');
const authValidate = require('../middleware/authValidate');
router.post('/createChat',authValidate,createChat);
router.get('/getAllChats',authValidate,getAllChats);
router.post('/createGroup',authValidate,createGroup);
router.post('/renameGroup',authValidate,renameGroup);
router.post('/groupAdd',authValidate,groupAdd);
router.post('/removeFromGroup',authValidate,removeFromGroup);
router.delete('/deleteChat/:chatId',authValidate,deleteChat);
router.post('/clearChatHistory/:chatId',authValidate,clearChatHistory);
module.exports = router
