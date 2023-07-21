const mongoose = require('mongoose')
const {users} = require('./userModel')

const categorySchema = mongoose.Schema({
    categoryname:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    image:{
        type:String,
        required:true
    },
    isVerified:{
        type:Boolean,
        default:true
    }

})

module.exports = mongoose.model('category',categorySchema)