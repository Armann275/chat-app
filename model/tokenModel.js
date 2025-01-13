const {Schema,model,} = require('mongoose');
const tokenSchema = new Schema({
    userId:{type:Number,ref:'userss'},
    refreshToken:{type:String}
});
module.exports = model('token',tokenSchema);