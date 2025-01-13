const jwt = require('jsonwebtoken');
const user = require('../model/userModel');
const tokenDb = require('../model/tokenModel');
require('dotenv').config()

function createTokens(payload){
    const accessToken = jwt.sign(payload,process.env.ACCESS_TOKEN,{expiresIn: '3h'});
    const refreshToken = jwt.sign(payload,process.env.REFRESH_TOKEN,{expiresIn: '30d'});
    return {accessToken,refreshToken}
}

function validateaccessToken(token){
    const decodedObj = jwt.verify(token,process.env.ACCESS_TOKEN);
    return decodedObj;
}

function validateRefreshToken(token){
    const decodedObj = jwt.verify(token,process.env.REFRESH_TOKEN);
    return decodedObj;
}


async function safeTokenDb(userId,refrehToken){
    const tokenInfo = await tokenDb.findOne({userId: userId});
    if (tokenInfo) {
        tokenInfo.refreshToken = refrehToken;
        await tokenInfo.save();
        return 
    }

     const s = await tokenDb.create({
        userId:userId,
        refreshToken:refrehToken
    });
    return s
}


module.exports = {createTokens,validateaccessToken,safeTokenDb,validateRefreshToken}
