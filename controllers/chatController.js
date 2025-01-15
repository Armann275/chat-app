const Chat = require('../model/chatModel');
const Message = require('../model/messageModel');
const user = require('../model/userModel');
const {checkVisibilityExists,findUserById,findAllUsersByUserIdArr} = require('../utils/chatUtils');
// const {io} = require('../server');
async function createChat(req, res, next) {
    try {
        const { userId } = req.body;
        
        
        if (req.userId === userId) {
            return res.status(404).json({message:"you cant add yourself"})
        }
        
        
        const chechUser = await findUserById(userId)
        
        if (!chechUser) {
            return res.status(404).json({message:"user dont exists"})
        }
        
        
        let chatExist = await Chat.findOne(
            { 
                isGroupChat:false,
                users:{$all:[req.userId,userId]},
            }
        ).populate('users');
        
        
        
        if (chatExist) {
           const checkVisibility = await Chat.findOne({
                isGroupChat:false,
                users:{$all:[req.userId,userId]},
                "visibility.user": req.userId
            }).populate('users','-password').select('-visibility');
            
            
            if (checkVisibility) {
                return res.status(200).json(checkVisibility)
            }
            else{
                const updatedChat = await Chat.findOneAndUpdate({
                    isGroupChat:false,
                    users:{$all:[req.userId,userId]}
                },{
                    $push:{visibility:{user:req.userId}}
                },{new:true}).populate('users','-password').select('-visibility')
                return res.status(200).json(updatedChat)
            }
        }

        const createChat = await Chat.create({
                chatName: "",
                users:[req.userId,userId],
                visibility:[{user:req.userId},{user:userId}]
        }); 
        const getChat = await Chat.findById(createChat._id).populate("users",'-password').select("-visibility")
        
        return res.status(200).json(getChat);
    } catch (error) {
        return res.status(500).json({ message: error.message});
    }
}



async function getAllChats(req,res,next) {
    try {
        const chats = await Chat.find(
            {
                $and:[
                    {users:req.userId},
                    {visibility:{$elemMatch:{user:req.userId}}}
                ]
            }
        ).populate("users",'-password').populate('groupAdmin')
        .select('-visibility')
        return res.status(200).json(chats)
    } catch (error) {
        return res.status(500).json({error:error.message});
    }
}




async function createGroup(req,res,next) {
    try {
        const users = req.body.users;
        const groupName = req.body.groupName;
        if (!users || !groupName) {
            return res.status(404).json({message:'give all parameters'});
        }
        const checkAllUsersExists = await findAllUsersByUserIdArr(users)
        if (checkAllUsersExists.length !== users.length) {
            return res.status(404).json({message:"one of the users dont exists"})
        }

        users.push(req.userId);
        const chat = await Chat.create({
            chatName:groupName,
            users:users,
            isGroupChat:true,
            groupAdmin:req.userId
        });
        
        
        const populatedChat = await Chat.findByIdAndUpdate(chat._id,{
            $addToSet: { visibility: { $each: users.map(user => ({ user })) } }
        },{ new: true } )
        .populate('users','-password')
        .populate('groupAdmin','-password')
        return res.status(200).json(populatedChat)
    } catch (error) {
        return res.status(500).json(error.message);
    }
}

async function renameGroup(req,res,next) {
    try {
        const {chatId, groupName} = req.body
        if (!chatId || !groupName) {
            return res.status(404).json({message:'give all params'})
        }

        const chat = await Chat.findOneAndUpdate({
            _id:chatId,
            users:req.userId,
            isGroupChat:true,
            visibility:{$elemMatch:{user:req.userId}}
        },{
            $set:{chatName:groupName}
        },{new:true}).populate('users','-password')
        .populate('groupAdmin','-password').select('-visibility');

        if (!chat) {
            return res.status(404).json({
                message:'invalid chatId, or dont have access'
            });
        }
        
        return res.status(200).json(chat)
    } catch (error) {
        return res.status(500).json(error.message)
    }
} 

async function groupAdd(req,res,next) {
    try {
        const {chatId,usersArr} = req.body;
        const users = await findAllUsersByUserIdArr(usersArr);
        if (users.length !== usersArr.length) {
            return res.status(200).json({message:"one of this users dont exists"})
        }
        
        const chat = await Chat.findOne({
            _id:chatId,
            isGroupChat:true,
            users:{
                $not:{$in:usersArr},
                $in:[req.userId]
            },
        });
        if (!chat) {
            return res.status(404).json({message:"invalid chat id, or user already user Participate in this chat, or you dont have accsess to add"})
        }
        chat.users.push(...usersArr);
        for(let i = 0; i < usersArr.length; i++){
            chat.visibility.push({user:usersArr[i]})
        }
        await chat.save();
        return res.status(200).json(chat)
    } catch (error) {
        return res.status(500).json({error:error.message});
    }
}

async function removeFromGroup(req,res,next) {
    try {
        const {userId,chatId} = req.body
        const user = await findUserById(userId)
        if (!user) {
            return res.status(404).json({message:`user with this ${userId} dont exists`})
        }
        const chat = await Chat.findOne({
            _id:chatId,
            isGroupChat:true
        });
        if (!chat) {
            return res.status(404).json({message:`groupChat with this ${chatId} dont exists`})
        }
        const isUserInChat = await Chat.findOne({
            _id:chatId,
            isGroupChat:true,
            users:userId,
        })
        if (!isUserInChat) {
            return res.status(404).json({message:`This  ${userId} User is not a member of this ${chatId}chat`})
        }
        
        const updatedChat = await Chat.findOneAndUpdate({
            _id:chatId,
            groupAdmin:req.userId,
            users:userId,
        },
        {
            $pull: {users:userId,visibility:{user:userId}},
        },
        { new: true }).populate('users','-password')
        .populate('groupAdmin','-password').select('-visibility');
        if (!updatedChat) {
            return res.status(404).json({message:"Invalid request or unauthorized action"})
        }
        return res.status(200).json(updatedChat);
    } catch (error) {
        return res.status(500).json({message:error})
    }
}

async function deleteChat(req,res,next) {
    try {
        const chatId = +req.params.chatId
        const chat = await Chat.findOne({
            $and: [
                { _id: chatId },
                { visibility: { $elemMatch: { user: req.userId } } }
            ]
        });
        if (!chat) {
            return res.status(404).json({message:"invalid chatId"})
        }
        if (!chat.isGroupChat) {
            if (chat.visibility.length > 1) {
                const s = await Chat.findByIdAndUpdate(chatId,{
                    $pull: { visibility: {user:req.userId}} 
                },{new:true});
            }else{
                await Chat.deleteOne({_id:chatId});
                await Message.deleteMany({chatId:chatId});
            }
        }else{
            if (chat.users.length > 1) {
                const s = await Chat.findByIdAndUpdate(
                    chatId,
                    {
                        $pull: {
                            visibility: { user: req.userId },
                            users: req.userId
                        }
                    },
                    { new: true } 
                );
            }else{
                await Chat.deleteOne({_id:chatId});
                await Message.deleteMany({chatId:chatId});
            }
        }
        return res.status(200).json({message:"chat deleted"});
    } catch (error) {
        return res.status(500).json({message:error});
    }
}


module.exports = {
createChat
,getAllChats
,createGroup,renameGroup
,groupAdd,removeFromGroup,deleteChat}

