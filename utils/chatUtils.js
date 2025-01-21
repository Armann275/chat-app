const User = require('../model/userModel');
const Chat = require('../model/chatModel')

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
        let usersListStr = "";
        const users = await User.find({
            _id: { $in: userIdArr }
        }).select("username");
        
        for (let i = 0; i < users.length; i++) {
            console.log(users[i].username);
            
            usersListStr += users[i].username;
            if (users[i + 1] && users[i + 1].username) {
                usersListStr += ",";
            }
        }
        return { users, usersListStr };
    } catch (error) {
        
        throw new Error('Database error occurred');
    }
}

async function findChat(filter){
    try {
        const chat = await Chat.findOne(filter)
        .populate('users','-password')
        .select('-visibility').populate("groupAdmin",'-password');
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

module.exports = {
    findUserById,
    findAllUsersByUserIdArr,
    findChat,findChatAndUpdate,
    findChatAndUpdate}
