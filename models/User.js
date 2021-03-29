const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const moment = require('moment-timezone');
const dateInd = moment.tz(Date.now(), "Asia/Jakarta");

const userSchema = new Schema({
    name : {
        type : String,
        required : true
    },
    email : {
        type : String,
        required : true
    },
    password : {
        type : String,
        required : true
    },
    avatar : {
        type : String,
    },
    created_at : {
        type : Date,
        required : true,
        default : dateInd
    },
    updated_at : {
        type : Date,
        required : true,
        default : dateInd
    }
})

module.exports = User = mongoose.model('users', userSchema);