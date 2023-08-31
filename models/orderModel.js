const mongoose = require('mongoose')
const {users} = require('./userModel')
const {products} = require('./productModel');
const { ObjectId } = require('mongodb');

const orderSchema = mongoose.Schema(
    {
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
                    required:true,
                },
                price:{
                    type:Number,
                    required:true,
                },
            },
        ],
        totalAmount:{
            type:Number,
            required:true,
        },
        couponAmount:{
            type:Number,
            required:true,
        },
        paymentMethod:{
            type:String,
            required:true,
        },
        status:{
            type:String,
            default:"pending",
        },
        reason:{
            type:String,
            
        },
        Shippingaddress:{
            type:ObjectId,
            required:true
        },  
           deliverydate:{
            type:Date,
            default:null,
           },
           orderdate:{
            type:Date,
            default:Date.now,
           },
           paymentstatus:{
            type:String,
            default:"unpaid",
           },
           
       },
       {versionkey:false}
);

module.exports = mongoose.model("Orderdetails",orderSchema)