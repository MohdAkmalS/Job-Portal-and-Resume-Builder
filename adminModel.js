const mongoose = require('mongoose')
// const { type } = require('os')

const userSchema = mongoose.Schema({
    username :{
        type : String,
        required : true,
        unique : true,
    },
    email :{
        type : String,
        required : true,
        unique : true,
    },
    password :{
        type : String,
        required : true,
        
    }
})

module.exports = mongoose.model('user' , userSchema);