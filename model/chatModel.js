const mongoose = require('mongoose');
const mongooseSequence = require('mongoose-sequence')(mongoose);
const { Schema, model } = mongoose;

const schema = new Schema({
    _id: Number,
    chatName: { type: String, trim: true },
    isGroupChat: { type: Boolean, default: false },
    users: [{ type: Number, ref: "userss" }],
    latestMessage: {
        type: Number,
        ref: "Message",
    },
    groupAdmin: { type: Number, ref: "userss" },
    visibility: [{
        user: { type: Number, ref: 'userss' },
        date: { type: Date, default: Date.now }
    }]
}, { timestamps: true });

// Apply the auto-increment plugin with a unique sequence name
schema.plugin(mongooseSequence, { inc_field: '_id', id: 'chat_seq' });

module.exports = model('chats',schema);
