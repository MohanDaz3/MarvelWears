const Order = require('../models/orderModel')

const salesreport = async(req,res)=>{
    try {
        const orderdetails = await Order.find({})
        .populate("userid")
        .populate("products.productid")
        .exec();
        orderdetails.sort((a,b)=>new Date(b.orderdate)-new Date(a.orderdate));
        res.render("salesreport",{orders:orderdetails});
    } catch (error) {
        console.log(error.message);
    }
}

module.exports={salesreport};