const User = require('../models/userModel')
const Category = require('../models/categoryModel')
const Products = require('../models/productModel')
const Order = require('../models/orderModel')
const Admin = require('../models/adminModel')
const Coupons = require('../models/couponModel')
const moment = require('moment')
const bycrpt = require('bcrypt')
const mongoose = require('mongoose')


// admin login page rendering

const loginpage = async(req,res)=>{
    try {
       res.render('login')
        console.log("admin loginpage is rendering");
    } catch (error) {
        // res.status(404).res.render('error',{error:error.message})
    }
   
}

// Adminside logout

const logout = async(req,res)=>{
    try {
        req.session.destroy()
        res.redirect('/admin')
        
    } catch (error) {
        console.log(error.message);
    }
}


// admin dashboard rendering

const homepage = async(req,res)=>{
    try {

        const details = await Order.aggregate([
            {$match:{status:"Delivered"}},
            {$group:{_id:null,totalSales:{$sum:"$totalAmount"}}}
        ])
        const TotalSales=details[0].totalSales;
        const ordercount=await Order.find({}).count();
        const productcount=await Products.find({}).count();
        const categorycount=await Category.find({}).count();
        
        const salesData = await Order.aggregate([
            {$match:{status:"Delivered"}},
            {
                $group:{
                    _id:{
                        $dateToString:{
                            format:"%Y-%m",
                            date:{$toDate:"$orderdate"},
                        },
                    },
                    totalRevenue:{$sum:"$totalAmount"},
                },
            },
            {$sort:{_id:-1}},
            {$project:{_id: 0,date:"$_id",totalRevenue:1}},
            {$limit:7},
        ]);

        const data=[];
        const date=[];

        for(const totalRevenue of salesData){
            data.push(totalRevenue.totalRevenue);
            const monthName= new Date(totalRevenue.date + "-01").toLocaleString(
                "en-US",
                {month:"long"}
            );
            date.push(monthName);
        }

        const monthly=data[0];
        const current=await Order.aggregate([
            {
                $match:{
                    orderdate:{
                        $gte:new Date(
                            new Date().getFullYear(),
                            new Date().getMonth(),
                            1
                        ),
                        $lt:new Date(
                            new Date().getFullYear(),
                            new Date().getMonth() + 1,
                            1
                        ),
                    },
                },
            },
            {
                $group:{
                    _id:null,
                    totalAmount:{
                        $sum:"$totalAmount",
                    },
                },
            },
        ]);

        const orders = await Order.find({}).populate("userid").exec();
       res.render('dashboard',{
        revenue:TotalSales,
        order:ordercount,
        product:productcount,
        category:categorycount,
        orders:orders,
        current:current,
        monthlysale:monthly,
       });
    
    } catch (error) {
        console.log(error.message);
        // res.status(404).res.render('error',{error:error.message})
    }
}

// 

const chartdata=async(req,res)=>{
    try {
        const salesdata= await Order.aggregate([
            {$match:{status:"Delivered"}},
            {
                $group:{
                    _id:{
                        $dateToString:{
                            format:"%Y-%m-%d",
                            date:{$toDate:"$orderdate"},
                        },
                    },
                    totalRevenue:{$sum:"$totalAmount"},
                },
            },
            {$sort:{_id:-1}},
            {$project:{_id:0,date:"$_id",totalRevenue:1}},
            {$limit:7},
        ]);
        const data =[];
        const date=[];

        for(const totalRevenue of salesdata){
            data.push(totalRevenue.totalRevenue);   
        }
        for(const items of salesdata){
            date.push(items.date);
        }
        data.reverse();
        date.reverse();
        res.send({data:data,date:date})
    } catch (error) {
        console.log(error.message);
    }
}

const chartdata2=async(req,res)=>{
    try {
        const salesdata= await Order.aggregate([
            {$match:{status:"Delivered"}},
            {
                $group:{
                    _id:{
                        $dateToString:{
                            format:"%Y-%m",
                            date:{$toDate:"$orderdate"},
                        },
                    },
                    totalRevenue:{$sum:"$totalAmount"},
                },
            },
            {$sort:{_id:-1}},
            {$project:{_id:0,date:"$_id",totalRevenue:1}},
            {$limit:7},
        ]);
        const data =[];
        const date=[];

        for(const totalRevenue of salesdata){
            data.push(totalRevenue.totalRevenue);
            const monthName = new Date(totalRevenue.date + "-01").toLocaleString(
                "en-US",
                {month:"long"}
            );
            date.push(monthName)
        };
        data.reverse();
        date.reverse();
        res.json({date:date,data:data})

    } catch (error) {
        console.log(error.message);
    }
}

// admin login Verification
const adminlogin = async(req,res)=>{
    try {
        const adminData = await Admin.findOne({adminid:req.body.email})
      
        // const isPasswordMatch = await bycrpt.compare(
        //     req.body.password,
        //     adminData.adminkey
        //   );
        if(adminData){
            
            if(req.body.password === adminData.adminkey){
                req.session.adminid=adminData._id
                req.session.loggedIn=true
                res.render('dashboard')
                
            }else{
                res.render('login',{notice:"password is inncorrect"})
                
            }
        }else{
           res.render('login',{notice:"User is not found"})
         
        }
    } catch (error) {
        // res.status(404).res.render('error',{error:error.message})
        console.log("error");
    }
}


// ****************************AdminSide User controller***************************

// adminside Users List displaying

const userList = async(req,res)=>{
    try {
        const userData = await User.find({isAdmin:{$ne:1}})
        res.render('user_list',{user:userData})
        
    } catch (error) {
        console.log(error.message);
    }
   
}

// adminside User Block

const blockuser = async(req,res)=>{
    try {
        const id = req.query.id

        const user = await User.findByIdAndUpdate(
            {_id:id},{$set:{block:1}}
     )
     if(user){
        res.send({message:"Blocked User successfully"})
     }

    } catch (error) {
        // res.render('error',{error:error.message})
        console.log("error");
    }
}

// adminside User Unblock

const unblockuser = async(req,res)=>{
    try {
        const id = req.query.id
        const userdata = await User.findByIdAndUpdate(
            {_id:id},{$set:{block:0}}
        )
        if(userdata){
            res.send({message:"Unblocked User Successfully"})
        }
    } catch (error) {
        console.log("error");
    }
}



// ***********************************ends*************************************

// adminside orders list displaying

const loadorder = async(req,res)=>{
    try {
        const order = await Order.find({}).populate("userid").exec();
        res.render("order",{orders:order})
    } catch (error) {
        console.log(error.message);
    }
}


const orderdetail = async (req, res) => {
    try {
        const orderid = req.query.id;
        const orderdetail = await Order.findById({ _id: orderid })
            .populate("products.productid")
            .populate({
                path: "userid",
                populate: { path: "address" },
            })
            .exec();

        
        const selectedAddressId = orderdetail.Shippingaddress;
        

        const selectedAddress = orderdetail.userid.address.find((address) => {
            return address._id.equals(selectedAddressId);
        });

    

        res.render("orderdetail", { orderDetail: orderdetail, selectedAddress: selectedAddress });
    } catch (error) {
        console.log(error.message);
    }
};


  const updatestatus = async(req,res)=>{
    try {
        const orderid = req.body.orderid;
        const status = req.body.status;
        const order = await Order.findOne({_id:orderid});
        let order_update;
        if(status=="Delivered" && order.paymentMethod=="COD"){
            order_update = await Order.findByIdAndUpdate(
                {_id:orderid},
                {$set:{status:status,paymentstatus:"Paid"}}
            )
        }else{
            order_update = await Order.findByIdAndUpdate(
                {_id:orderid},
                {$set:{status:status}}
            );
        }
        if(status=="Delivered"){
            const deliverydate = new Date();
            await Order.findByIdAndUpdate(
                orderid,
                {deliverydate:deliverydate},
                {new:true}
            );
            const completionTime = moment(deliverydate).add(7,"days");
            setTimeout(async()=>{
                const updatedOrder = await Order.findById(orderid);
                if(
                    updatedOrder &&
                    updatedOrder.status !== "Completed" &&
                    updatedOrder.status !== "Return Requested" &&
                    updatedOrder.status !== "Returned"
                ){
                    updatedOrder.status = "Completed";
                    await updatedOrder.save();
                }
            },completionTime.diff(moment()));
        }
        if(order_update){
            res.send({message:"1"})
        }else{
            res.send({message:"0"})
        }
    } catch (error) {
        console.log(error.message);
    }
  }

//   coupons management

const listcoupon = async(req,res)=>{
    try {
        let coupon = await Coupons.find({});
        res.render("couponlist",{error:"Your Coupons",coupons:coupon});
    } catch (error) {
        console.log(error.message);
    }
}

// add new coupon page displaying
const addcouponpage = async(req,res)=>{
    try {
        res.render("addcoupon")
    } catch (error) {
        console.log(error.message);
    }
}

// add new coupon
const addcoupon = async(req,res)=>{
    const couponCode = req.body.code;
    const lowercouponCode=couponCode.toLowerCase();
    try {
        const couponexist = await Coupons.findOne({couponCode:{$regex:new RegExp('^' + lowercouponCode + '$','i')}})
        
        if(!couponexist){
        const coupon = new Coupons({
            couponCode:couponCode,
            couponAmount:req.body.discountprice,
            expireDate:req.body.expiry,
            couponDescription:req.body.coupondescription,
            minimumAmount:req.body.min_purchase,
        });
        coupon.save();
        res.redirect("/admin/couponList")
    }else{
        res.render('addcoupon',{notice:"coupon already exist"})
    }
    } catch (error) {
        console.log(error.message);
    }
}

// edit coupon page displaying

const editcouponpage = async(req,res)=>{
    try {
        const coupon = await Coupons.findOne({_id:req.query.id});
        res.render("editcoupon",{coupon:coupon});
    } catch (error) {
        console.log(error.message);
    }
}

const editcoupon = async(req,res)=>{
    try {
         await Coupons.updateOne(
            {_id:req.body.id},
            {
                $set:{
                    couponCode: req.body.code,
                    couponAmount: req.body.discountprice,
                    expireDate: req.body.expiry,
                    couponDescription: req.body.coupondescription,
                    minimumAmount: req.body.min_purchase,
                },
            }
        )
        const coupon = await Coupons.find({})
        if(coupon){
            res.render("couponlist",{error:"your update as been sucessfull",coupons:coupon});
        }else{
            res.render("couponlist",{error:"updating category has been failed",coupons:coupon});
        }
       
    } catch (error) {
        console.log(error.message);
    }
}
  
const deletecoupon = async(req,res)=>{
    try {
     const couponid = req.query.id
     await Coupons.deleteOne({_id:couponid})
     res.redirect('/admin/couponlist')
    } catch (error) {
     console.log(error.message);
    }
 }


 





module.exports = {homepage,
                  loginpage,
                 userList,
                 adminlogin,
                  blockuser,
                unblockuser,
                    logout,
                loadorder,
                orderdetail,
                updatestatus,
                listcoupon,
                addcouponpage,
                addcoupon,
            editcouponpage,
        editcoupon,
        deletecoupon,
        chartdata,
        chartdata2}