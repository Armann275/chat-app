// server side
const {createServer} = require('node:http');
const express = require('express');
require('dotenv').config();
const bodyParser = require('body-parser');
const userRouter = require('./routes/userRoutes');
const chatRouter = require('./routes/chatRoutes');
const messageRouter = require('./routes/messageRout');
const friendsRouter = require('./routes/friendRoutes')
const cookieParser = require('cookie-parser')
const connectDb = require('./config/connectDb');
connectDb();
const app = express();
app.use(cookieParser());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use('/auth',userRouter);
app.use('/chat',chatRouter);
app.use('/message',messageRouter);
app.use('/friend',friendsRouter);
const {Server} = require('socket.io');
const PORT = process.env.PORT || 3000;
const server = createServer(app);
const io = new Server(server);

io.on('connection',(socket) => {

    socket.on('join',(room) => {
        socket.join(room);
    });
    
    socket.on('message',(message,room) => {
        io.to(room).emit('message',message);
    });
    
    socket.on("disconnecting", (room) => {
        socket.leave(room)
    });

    // socket.on("markAsRead",(chatId,userId) => {
    //     io.to(chatId).emit('userReadAllMessages',userId)
    // });
});

server.listen(PORT);



