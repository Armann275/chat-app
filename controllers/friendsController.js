const User = require('../model/userModel');
const mongoose = require('mongoose');
const io = require('../server')

async function searchUser(req,res,next) {
    try {
        const { page, limit } = req.query; 
        const skip = (page - 1) * limit;
        const {username} = req.body;
        
        const users = await User.find({
             username: { $regex: username, $options: 'i' },
             _id:{$ne:req.userId},
             reqFriends:{$ne:req.userId},
             friends:{$ne:req.userId}
         }).skip(skip)
         .limit(limit);
         return res.status(200).json(users)
    } catch (error) {
        return res.status(500).json({errorMes:error.message});
    }
}



async function addFriend(req,res,next) {
    const {userId} = req.query
    if (userId === req.userId) {
        return res.status(404).json({message:"you cant add yourself"})
    }
    try {
        const me = await User.findById(req.userId).select("-password","-friends","-reqFriends");

        const checkUserExists = await User.findById(userId)
        if (!checkUserExists) {
            return res.status(404).json({message:"Such a user dont exists"})
        }
        const alreadyAddRequest = await User.findOne({
            _id:userId,
            reqFriends:req.userId
        });
        if (alreadyAddRequest) {
            return res.status(404).json({message:"you already add requsest"})
        }
        const checkFriends = await User.findOne({
            _id:req.userId,
            friends:userId
        });
        if (checkFriends) {
           return res.status(404).json({message:"you already have such a friend"})
        }
        const checkRequest = await User.findOne({
            _id:req.userId,
            reqFriends:userId
        });

        if (checkRequest) {
            const session = await mongoose.startSession(); 
            session.startTransaction();
            try {

                const addFriend = await User.findOneAndUpdate({
                    _id:req.userId
                },{
                    $pull:{reqFriends:userId},
                    $push:{friends:userId}
                });

                const updateOppositeUser = await User.findOneAndUpdate({
                    _id:userId
                },{
                    $push:{friends:req.userId}
                });
                await session.commitTransaction();
                session.endSession();
                return res.status(200).json({message:"friend added Successfully"});
            } catch (error) {
                await session.abortTransaction();
                session.endSession();
                return res.status(500).json({errorMes:error.message});
            }
        }

        const addRequest = await User.findOneAndUpdate({
            _id:userId
        },{
            $push:{reqFriends:req.userId}
        });
        io.to(userId).emit("newFriendRequest",me)
        return res.status(200).json({messsage:"Requst added Successfully"})
    } catch (error) {
        return res.status(500).json({errorMes:error.message});
    }
}




async function getRequestFriend(req,res,next) {
    try {
    const user = await User.findById(req.userId).populate('reqFriends');
    return res.status(200).json(user.reqFriends);
    } catch (error) {
        return res.status(500).json(error.message);
    }
}

async function handleRequest(req,res,next) {
    try {
        const {choise,userId} = req.body
        const userExists = await User.findById(userId);
        if (!userExists) {
            return res.status(200).json({message:"User dont exists with this Id"})
        }
        if (choise === "accept") {
            const session = await mongoose.startSession(); 
            session.startTransaction();
            try {
            const me = await User.findByIdAndUpdate(req.userId,{
                    $pull:{reqFriends:userId},
                    $addToSet:{friends:userId}
            },{new:true})
            
            await User.findOneAndUpdate({
                _id:userId
            },{
                $addToSet:{friends:req.userId}
            });
            io.to(userId).emit("newFriend",me)
            await session.commitTransaction();
            session.endSession();
            return res.status(200).json(me)
            } catch (error) {
                await session.abortTransaction();
                session.endSession();
                return res.status(500).json(error.message);
            }
        }else{
            const updateRequestFriend = await User.findByIdAndUpdate(req.userId,{
                $pull:{reqFriends:userId}
            });
            return res.status(200).json(updateRequestFriend)
        }
    } catch (error) {
        return res.status(500).json(error.message);
    }
}

async function getFriends(req,res,next) {
    try {
        const user = await User.findById(req.userId).populate('friends');
        return res.status(200).json(user.friends)
    } catch (error) {
        res.status(500).json({message:error});
    }
}

async function deleteFriend(req,res,next) {
    try {
        const {userId} = req.query
        const userExists = await User.findById(userId);
        if (!userExists) {
            return res.status(404).json({message:"user with this id dont exists"})
        }
        const isUserFriend = await User.findOne({
            _id:req.userId,
            friends:userId
        });
        if (isUserFriend) {
            const session = await mongoose.startSession(); 
            session.startTransaction();
            try {

                const me = await User.findByIdAndUpdate(req.userId,{
                    $pull:{friends:userId}
                },{new:true}).populate('friends');

                await User.findByIdAndUpdate(userId,{
                    $pull:{friends:req.userId}
                })
                io.to(userId).emit("deleteFriend",req.userId)
                await session.commitTransaction();
                session.endSession();
                return res.status(200).json(me)
                
            } catch (error) {
                await session.abortTransaction();
                session.endSession();
                return res.status(500).json(error.message);
            }
        }else{
            return res.status(404).json({message:"you are not friends"})
        } 
    } catch (error) {
        return res.status(500).json(error.message);
    }
}

async function cancelRequest(req,res,next) {
    try {
        const {userId} = req.query
        const userExists = await User.findById(userId);
        if (!userExists) {
            return res.status(404).json({message:"user with this id dont exists"})
        }
        
        const requestExists = await User.findOne({
            _id:userId,
            reqFriends:req.userId
        });
        if (requestExists) {
            await User.updateOne({
                _id:userId,
                $pull:{reqFriends:req.userId}
            });
            io.to(userId).emit("canceledRequest",req.userId)
            return res.status(200).json({message:"request removed Successfully"})
        }
        return res.status(404).json({message:"request dont exists"})
    } catch (error) {
        return res.status(500).json(error.message);
    }
}


async function requestTo(req,res,next) {
    try {
        const requstTo = await User.find({
            reqFriends:req.userId
        });
        return res.status(200).json(requstTo)
    } catch (error) {
        return res.status(500).json(error.message);
    }
}

module.exports = {getFriends,handleRequest,
    getRequestFriend,addFriend,
    searchUser,deleteFriend,cancelRequest
    ,requestTo}

