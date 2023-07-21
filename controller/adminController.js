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
        console.log("logout successfully");
    } catch (error) {
        console.log(error.message);
    }
}


// admin dashboard rendering

const homepage = async(req,res)=>{
    try {
       res.render('dashboard')
    console.log("admin dashboard is rendering");
    } catch (error) {
        // res.status(404).res.render('error',{error:error.message})
    }
}

// admin login Verification
const adminlogin = async(req,res)=>{
    try {
        const adminData = await Admin.findOne({adminid:req.body.email})
        console.log(adminData);
        // const isPasswordMatch = await bycrpt.compare(
        //     req.body.password,
        //     adminData.adminkey
        //   );
        if(adminData){
            
            if(req.body.password === adminData.adminkey){
                req.session.adminid=adminData._id
                req.session.loggedIn=true
                res.render('dashboard')
                console.log("logind successfully and dashboard rendering");
            }else{
                res.render('login',{notice:"password is inncorrect"})
                console.log("incorrect paasword");
            }
        }else{
           res.render('login',{notice:"User is not found"})
           console.log("invalid user");
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
        console.log("Adminside User list rendering");
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

        console.log(orderdetail);
        const selectedAddressId = orderdetail.Shippingaddress;
        console.log("dhjtjghchdujhgjgydjytgfdc");
        console.log(selectedAddressId);

        const selectedAddress = orderdetail.userid.address.find((address) => {
            return address._id.equals(selectedAddressId);
        });

        console.log("tduyutfdsutrsjd");
        console.log(selectedAddress);

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
            const deliveredDate = new Date();
            await Order.findByIdAndUpdate(
                orderid,
                {deliveredDate:deliveredDate},
                {new:true}
            );
            const completionTime = moment(deliveredDate).add(7,"days");
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
        console.log(couponexist);
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
        deletecoupon}