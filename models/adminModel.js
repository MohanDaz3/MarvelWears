const {users} = require('./userModel')
const mongoose = require('mongoose')


const adminSchema = mongoose.Schema({
    adminid:{
        type:String,
        required:true,
    },
    adminkey:{
        type:String,
        required:true,
    },
    isAdmin:{
        type:Number,
        default:0
    }
})

module.exports = mongoose.model('admin',adminSchema)