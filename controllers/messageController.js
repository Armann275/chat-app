const Message = require('../model/messageModel'); 
const User = require('../model/userModel');
const Chat = require('../model/chatModel'); 
const {findChatAndUpdate,findChat} = require('../utils/chatUtils'); 

async function sendMessage(req,res,next) {
    try {
    const {chatId,content} = req.body;
    const message = {
        senderId:req.userId,
        content:content,
        chatId:chatId
    }
    
    const messages = await Message.create(message);
    const filter = {
        _id:chatId
    } 
    const update = {
        latestMessage: messages._id
    }
    const options = {new:true}
    const chat = await findChatAndUpdate(filter,update,options)
    return res.status(200).json({ message: messages, chat });
    } catch (error) {
        return res.status(500).json(error.message)
    }
}

async function getAllMessages(req,res,next) {
    try {
        const { page, limit } = req.query; 
        const skip = (page - 1) * limit;
        const chatId = req.params.chatId;
        
        const findChat = await Chat.findById(chatId);
        if (!findChat) {
            return res.status(404).json({message:"invalid chatId"})
        }
        
        const visibilityObj = await Chat.findOne(
            {
                _id: chatId,  
                "visibility.user": req.userId  
            },
            {
                "visibility.$": 1  
            }
        );
        
        const visibleDate = visibilityObj.visibility[0].date
        
        const filter = {
            chatId,
            createdAt: { $gt: visibleDate }
        };
        
        const messages = await Message.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate('senderId', '-password');
        return res.status(200).json(messages);
    } catch (error) {
        return res.status(500).json(error.message)
    }
}

async function deleteMessage(req,res,next) {
    try { 
        const messageId = req.params.messageId;
        await Message.deleteOne({_id:messageId,senderId:req.userId});
        return res.status(200).json({message:"message deleted"});
    } catch (error) {
        return res.status(500).json(error.message)
    }
}


module.exports = {sendMessage,getAllMessages,deleteMessage}
