const mongoose = require('mongoose');
const mongooseSequence = require('mongoose-sequence')(mongoose);
const { Schema, model } = mongoose;
const messageSchema = new Schema({
    _id:Number,
    senderId:{type:Number,ref:'userss'},
    content:{type:String},
    chatId:{type:Number,ref:"chats"},
    receivedBy:[{type:Number,ref:"userss",default:[]}],
},{timestamps:true});
module.exports = model('message',messageSchema);
messageSchema.plugin(mongooseSequence, { inc_field: '_id', id: 'message_seq' });
module.exports = model('messages',messageSchema);