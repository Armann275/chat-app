const User = require('../model/userModel');
const Chat = require('../model/chatModel')
function addVizibilityOrNot(users,visibility,userId){
    let addVizibility = false;
    let oppontUserId;
    for(let i = 0; i < users.length; i++){
        if (users[i] !== userId) {
            oppontUserId = users[i]
        }
    }
    
    for(let i = 0; i < visibility.length; i++){
        addVizibility = true
        if (visibility[i].user === oppontUserId) {
            addVizibility = false
            break;
        }
    }
    return {addVizibility,oppontUserId}
}

function checkVisibilityExists(visibility,userId){
    for(let i = 0; i < visibility.length; i++){
        if (visibility[i].user === userId) {
            return true
        }
    }
    return false;
}




async function findUserById(userId) {
    try {
        const user = await User.findById(userId)
        return user
    } catch (error) {
        throw new Error('Database error occurred');
    }
}

async function findAllUsersByUserIdArr(userIdArr) {
    try {
        const users = await User.find({
            _id:{$in:userIdArr}
        });
        return users
    } catch (error) {
        throw new Error('Database error occurred');
    }
}

async function findChat(filter){
    try {
        const chat = await Chat.findOne(filter)
        .populate('users','-password').select('-visibility');
        return chat
    } catch (error) {
        throw new Error('Database error occurred');
    }
}

async function findChatAndUpdate(filter,update,options){
    try {
        const updateChat = await Chat.findOneAndUpdate(filter,update,options)
        .populate('users','-password').select('-visibility')
        return updateChat
    } catch (error) {
        throw new Error('Database error occurred');
    }
}

module.exports = {addVizibilityOrNot,checkVisibilityExists,
    findUserById,
    findAllUsersByUserIdArr,
    findChat,findChatAndUpdate,
    findChatAndUpdate}
