// model
const {Schema,model, default: mongoose} = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);
const schema = new Schema({
    _id:Number,
    username:{type:String,unique:true},
    email:{type:String,unique:true},
    password:{type:String},
    friends:[
        {type:Number,ref:'userss',default:[]},
    ],
    reqFriends:[
        {type:Number,ref:'userss',default:[]}
    ]
},{timestamps:true});
schema.plugin(AutoIncrement, { inc_field: '_id' });
module.exports = model('userss',schema);


