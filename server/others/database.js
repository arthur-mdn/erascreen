const mongoose =require("mongoose");
const config = require('./config');

module.exports.connect = () => {
    return mongoose.connect(config.dbUri)
        .then(() => console.log('MongoDB Connected'))
        .catch(err => console.log(err));
}