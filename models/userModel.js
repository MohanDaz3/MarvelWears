const mongoose = require('mongoose')


const UserSchema =new mongoose.Schema({
    Firstname: {
        type: String,
        required: true,
        
    },
    Lastname: {
        type: String,
        required: true,
        
    },
    email: {
        type:String,
        required:true
    },
    password: {
        type: String,
        required: true
    },
    mobile:{
        type:Number
    },
    Bdate:{
        type:String
    },
    address:[
     {
        type:{
            type:String,
        },
        houseName:{
            type:String,
        },
        village:{
            type:String,
        },
        landmark:{
            type:String
        },
        pincode:{
            type:Number,
        },
        city:{
            type:String,
        },
        district:{
            type:String,
        },
        state:{
            type:String,
        },
        country:{
            type:String
        }
      }
    ],
    image:{
        type:String,
        required: false,
        
    },
    isAdmin: {
        type: Number,
        required: true
    },
    isVerified: {
        type:Number,
        default:0
    },
    otp:{
        type:Number
        
    },
    block:{
        type:Number,
        default:0
    },
    referalcode:{
        type:String,
    },
    referalCodeUsed:{
        type:Number,
        default:0,
    }

})

module.exports = mongoose.model("User",UserSchema)
 
 