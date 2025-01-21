const express = require('express');
const router = express.Router();
const {createChat,getAllChats,createGroup,renameGroup,groupAdd,
    leaveGroup,removeFromGroup,deleteChat,clearChatHistory,becomeAdmin} = require('../controllers/chatController');
const authValidate = require('../middleware/authValidate');
router.post('/createChat',authValidate,createChat);
router.get('/getAllChats',authValidate,getAllChats);
router.post('/createGroup',authValidate,createGroup);
router.post('/renameGroup/:chatId',authValidate,renameGroup);
router.post('/groupAdd',authValidate,groupAdd);
router.delete('/removeFromGroup',authValidate,removeFromGroup);
router.delete('/deleteChat/:chatId',authValidate,deleteChat);
router.post('/clearChatHistory/:chatId',authValidate,clearChatHistory);
router.post('/leaveGroup/:chatId',authValidate,leaveGroup);
router.post('/becomeAdmin',authValidate,becomeAdmin)
module.exports = router
