const User = require('../models/userModel')
const Cart = require('../models/cartModel')
const Category = require('../models/categoryModel')
const Products = require('../models/productModel')
const Order = require('../models/orderModel')
const Wallet = require('../models/walletModel')
const Razorpay = require('razorpay')

const { RAZORPAY_ID_KEY, RAZORPAY_SECRET_KEY }= process.env;
const razorpayInstance = new Razorpay({
  key_id:RAZORPAY_ID_KEY,
  key_secret:RAZORPAY_SECRET_KEY
});

async function checkStock(userId) {
    const cart = await Cart.findOne({ userid: userId }).populate('products.productid');
    let flag = 0;
  
    for (const product of cart.products) {
      const { quantity, productid } = product;
      const prod = await Products.findOne({ _id: productid });
  
      if (prod.stock < quantity) {
        flag = 1;
        break;
      }
    }
  
    return flag;
  }
  
  const orderplace = async (req, res) => {
    try {
      const { loggedIn: session, user: { _id: userId } } = req.session;
      const { address, total, paymentmethod,coupon,discount} = req.body;
      console.log("dwqaff"+req.body);
      console.log("letsss checkkkkkk");
      console.log(address,total,paymentmethod,coupon,discount);
      const parsedTotal = parseFloat(total);
  
      let flag = await checkStock(userId);
      if (flag === 0 && !isNaN(parsedTotal)) {
        const paymentMethod = paymentmethod;
        const orderdetail = new Order({
          userid: userId,
          totalAmount: parsedTotal,
          paymentMethod: paymentMethod,
          Shippingaddress: address,
          couponAmount:discount,
        });
        if(coupon) orderdetail.couponcode == coupon;
        const cart = await Cart.findOne({ userid: userId }).populate('products.productid');
        if(paymentMethod!="COD") orderdetail.paymentstatus = "paid";
        let subtotal = 0;
  
        for (const product of cart.products) {
          const { quantity, productid } = product;
          const prod = await Products.findOne({ _id: productid });
          const price = prod.price;
  
          subtotal += quantity * price;
  
          orderdetail.products.push({
            productid: productid,
            quantity: quantity,
            price: price,
          });
  
          await Products.updateOne(
            { _id: productid },
            { $inc: { stock: -quantity } }
          );
        }
  
        orderdetail.subtotal = subtotal;
        await orderdetail.save();
        await Cart.findOneAndDelete({ userid: userId });
  
        res.send({ message: '1' });
      } else {
        res.send({ message: '0', msg: 'Products are out of stock' });
      }
    } catch (error) {
      console.log(error.message);
      res.status(500).send('An error occurred while placing the order.');
    }
  };


  const createorder = async (req, res) => {
    try {
      console.log("oooiiii");
      const user = req.session.user;
      const amount = parseInt(req.body.amount) * 100;
      let flag = await checkStock(user);
      if (flag == 0) {
        console.log("iiiiiii");
        const options = {
          amount: amount,
          currency: "INR",
          receipt: "mohandass.unni3@gmail.com", 
        };
        razorpayInstance.orders.create(options, (err, order) => {
          if (!err) {
            console.log("lllllllllll");
            res.status(200).send({
              success: true,
              msg: "Order Created",
              amount: amount,
              key_id: RAZORPAY_ID_KEY,
              contact: "9526322124",
              name: user.Firstname,
              email: "mohandass.unni3@gmail.com",
              message: true,
            });
            
          } else {
            console.log("Error:", err); // Log the actual error object
            res.status(400).send({
              message: true,
              success: false,
              msg: "Something Went Wrong!",
            });
          }
        });
      } else {
        res.send({ message: false, msg: "some products are out of stock" });
      }
    } catch (error) {
      console.log(error.message);
    }
  };
  

  const cancelRequest = async (req, res) => {
    try {
      console.log("hiiiii");
      let user = req.session.user;
      let orderid = req.body.id;
      console.log("Order ID:", orderid);
      let order = await Order.findById(orderid);
      console.log("Order:", order);
      if (order.paymentMethod !== "COD") {
        const userwallet = await Wallet.findOne({ userid: user._id });
        if (userwallet) {
          await Wallet.findByIdAndUpdate(
            userwallet._id,
            {
              $inc: { balance: order.totalAmount },
              $push: {
                orderDetails: {
                  orderid: orderid,
                  amount: order.totalAmount,
                  type: "Added",
                },
              },
            },
            { new: true }
          );
        } else {
          let wallet = new Wallet({
            userid: user._id,
            balance: order.totalAmount,
            orderDetails: [
              {
                orderid: orderid,
                amount: order.totalAmount,
                type: "Added",
              },
            ],
          });
          await wallet.save();
        }
      }
      for (const product of order.products) {
        await Products.findByIdAndUpdate(
          product.productid,
          {
            $inc: { stock: product.quantity },
          },
          { new: true }
        );
      }
      order = await Order.findByIdAndUpdate(
        orderid,
        { status: "Cancelled" },
        { new: true }
      );
      console.log("Updated Order:", order);
      if (order) {
        res.send({ message: "1" });
      } else {
        res.send({ message: "0" });
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  const returnRequest = async(req,res)=>{
    try {
      let orderid = req.body.id;
      let order = await Order.findByIdAndUpdate(
        orderid,
        {status:"Return Requested"},
        {new:true}
      );
      if(order){
        res.send({message:"1"})
      }else{
        res.send({message:"0"})
      }
    } catch (error) {
      console.log(error.message);
    }
  }
  
  const approveReturn = async (req, res) => {
    try {
      let user = req.session.user;
      let orderid = req.body.id;
      let order = await Order.findById(orderid);
  
      if (order.paymentMethod !== 'COD') {
        // Only process refunds for non-COD orders
        const userwallet = await Wallet.findOne({ userid: user._id });
        if (userwallet) {
          // Add refund amount to the user's wallet
          await Wallet.findByIdAndUpdate(
            userwallet._id,
            {
              $inc: { balance: order.totalAmount },
              $push: {
                orderDetails: {
                  orderid: orderid,
                  amount: order.totalAmount,
                  type: "Added",
                },
              },
            },
            { new: true }
          );
        } else {
          // Create a new wallet entry for the user and add the refund amount
          let wallet = new Wallet({
            userid: user._id,
            balance: order.totalAmount,
            orderDetails: [
              {
                orderid: orderid,
                amount: order.totalAmount,
                type: "Added",
              },
            ],
          });
          await wallet.save();
        }
      }
  
      // Update product stock and order status
      for (const product of order.products) {
        await Products.findByIdAndUpdate(
          product.productid,
          {
            $inc: { stock: product.quantity },
          },
          { new: true }
        );
      }
  
      // Update order payment status and status as "Returned"
      order = await Order.findByIdAndUpdate(
        orderid,
        { paymentstatus: "Refund", status: "Returned" },
        { new: true }
      );
  
      if (order) {
        res.send({ message: "1" });
      } else {
        res.send({ message: "0" });
      }
    } catch (error) {
      console.log(error.message);
    }
  };
  
  
  

module.exports = {
    orderplace,
    cancelRequest,
    returnRequest,
    approveReturn,
    createorder,
}