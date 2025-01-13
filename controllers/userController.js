// controllers 
const path = require('path');
const user = require('../model/userModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const tokenService = require('../service/tokenService');
const mongoose = require('mongoose');
const tokenModel = require('../model/tokenModel') 

function getRegistration(req,res,next){
    res.sendFile(path.join(__dirname,'../','views','registration.html')); // Registration You have to provide
}

function getLogin(req,res,next){
    res.sendFile(path.join(__dirname,'../','views','login.html')); 
}

function getMain(req,res,next){
    res.sendFile(path.join(__dirname,'../','views','main.html')); // main You have to provide
}


async function postRegistration(req,res,next){
    const {username,email,password} = req.body;
    try {
        const findEmailUsername = await user.findOne({$or:[
            {username:username},
            {email:email}
        ]});    
        if (findEmailUsername) {
            return res.status(404).send('We already have such a user with this email or username');
        }
        const Hashpassword = await bcrypt.hash(password,10);
        const userInfo = await user.create({
            username:username,
            email:email,
            password:Hashpassword
        });
        // await friendModel.create({userId:userInfo._id});
        return res.status(200).json(
            userInfo,
        );
    } catch (error) {
        return res.status(500).send(error.message);
    }
}


async function postLogin(req,res,next){
    try {
    const {email,password} = req.body
    const findUser = await user.findOne({email:email}); 
    if (!findUser) {
        return res.status(400).json({message:"unauthorized"})
    }
    
    
    const comparePassword = await bcrypt.compare(password, findUser.password)
    if(!comparePassword){
        return res.status(400).json({message:"invalid password"})
    };

    const tokens = tokenService.createTokens({
        id:findUser._id,
        username:findUser.username,
        email:email,
    });
    
    await tokenService.safeTokenDb(findUser._id,tokens.refreshToken);
    res.cookie('refreshToken',tokens.refreshToken,{
        httpOnly:true
    });
    res.status(200).json({
        username:findUser.username,
        email:email,
        accesstoken:tokens.accessToken,
        refreshToken:tokens.refreshToken
    });
    } catch (error) {
        return res.status(500).json({errorMes:error})
    }
}

async function refreshToken(req,res,next) {
    try {
        const refreshToken = req.cookies.refreshToken
        const refreshDb = await tokenModel.findOne({refreshToken:refreshToken});
        
        const decoded = tokenService.validateRefreshToken(refreshToken);
        const decodeDbToken = tokenService.validateRefreshToken(refreshDb.refreshToken);
        console.log(decoded);
        
        if (!decoded || !decodeDbToken) {
            return res.status(404).json({message:"Unauthorized"})
        }
        
        const tokens = tokenService.createTokens({id:decoded.id,username:decoded.username,email:decoded.email});
        console.log(tokens);
        
        refreshDb.refreshToken = tokens.refreshToken;
        await refreshDb.save();
        res.cookie('refreshToken',tokens.refreshToken);
        return res.status(200).json({...tokens});
    } catch (error) {
        return res.status(500).json({errorMes:error})
    }
}



module.exports = {
getRegistration
,postRegistration
,getMain,
postLogin,
getLogin,refreshToken,
};



