// mongoose 
const mongoose = require('mongoose');

const connectDb = () => {
    return mongoose.connect(process.env.MONGODB).then((res) => console.log("connected DataBase")).catch((err) => console.log("Error"));
}

module.exports = connectDb



