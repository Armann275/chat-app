// authvalidation
const jwt = require('jsonwebtoken');
const {validateaccessToken,validateRefreshToken} = require('../service/tokenService');
function authValidate(req,res,next){
   
    
    const authHeader = req.headers['authorization'];
    const token = authHeader;
    
    if (!token) {
        return res.status(401).json({ message: 'token missing' });
    }
    
    const decoded = validateaccessToken(token);
    
    if (decoded) {
        req.userId = decoded.id,
        req.decoded = decoded
        return next();
    }
    return res.status(401).json({message:"invalid Token"});
}
module.exports = authValidate


