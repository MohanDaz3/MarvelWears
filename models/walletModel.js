const mongoose = require("mongoose")

const walletSchema = mongoose.Schema({
    userid:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true,
    },
    balance:{
        type:Number,
        required:true,
    },
    
    orderDetails:[
        {
            orderid:{
                type:mongoose.Schema.Types.ObjectId,
                ref:"Orderdetails",
                
            },
            message:{
                type:String,
            },
            amount:{
                type:Number,
                
            },
            date:{
                type:Date,
                default:Date.now,
                
            },
            type:{
            type:String,
            required:true,
            },
        },
    ],
})

module.exports = mongoose.model("Wallet",walletSchema)