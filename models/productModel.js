const mongoose = require('mongoose')
const {user} = require('../models/userModel')
const { array } = require('../middleware/multer')

const productSchema = mongoose.Schema({
    productname:{
        type:String,
        required:true,
    },
    description:{
        type:String,
        required:true,
    },
    category:{
        type:String,
        required:true
    },
    stock:{
        type:Number,
        required:true,
    },
    price:{
        type:Number,
        required:true,
    },
    productoffer:{
        type:Number,
        required:true
    },
    offerprice:{
        type:Number,
    },
    productimage:{
        type:Array,
        required:true
    },
    isBlocked:{
        type:Boolean,
        default:false,
    }
})

module.exports = mongoose.model('Products',productSchema)