const mongoose = require('mongoose')
const {users} = require('./userModel')
const {products} = require('./productModel')

const cartSchema = mongoose.Schema({
    userid:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true,
    },
    products:[
    {
      productid:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Products",
        required:true,
      },
      quantity:{
        type:Number,
        required:true
      },
    }
    ]
},{versionkey:false})

module.exports = mongoose.model('Cartdetails',cartSchema)