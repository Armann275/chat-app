const express = require('express');
const router = express.Router();
const authValidate = require('../middleware/authValidate');
const {addFriend,getRequestFriend,handleRequest,
getFriends,searchUser,deleteFriend,cancelRequest,requestTo} = require('../controllers/friendsController');
router.post('/addFriend',authValidate,addFriend);
router.get('/friendRequest',authValidate,getRequestFriend);
router.post('/handleRequest',authValidate,handleRequest);
router.get('/getFriends',authValidate,getFriends);
router.get('/searcUser',authValidate,searchUser)
router.delete('/deleteFriend',authValidate,deleteFriend)
router.delete('/cancelRequest',authValidate,cancelRequest)
router.get('/requstTo',authValidate,requestTo)
module.exports = router
