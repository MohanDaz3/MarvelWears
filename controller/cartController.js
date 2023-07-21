const User = require("../models/userModel");
const Cart = require("../models/cartModel");
const Category = require("../models/categoryModel");
const Products = require("../models/productModel");
const Coupons = require("../models/couponModel");
const bycrpt = require("bcrypt");
const mongoose = require("mongoose");

const cartGet = async (req, res) => {
  try {
    const cart = await Cart.findOne({
      userid: new mongoose.Types.ObjectId(req.params.userId),
    }).lean();

    if (!cart) {
      res.send({ isOk: false, error: "No cart found for this user" });
      return;
    }

    res.send({ isOk: true, cart });
  } catch (err) {
    console.trace(err);
    res.send({ isOk: false, error: err.message });
  }
};

// cart page dislaying

const cartload = async (req, res) => {
  try {
    console.log("hiiiiii");
    const session = req.session.loggedIn;
    const userdata = req.session.user;
    const userData = await User.findOne({ _id: userdata._id });
    console.log(userData);
    const categorydata = await Category.find({ isVerified: { $ne: false } });
    const cartdata = await Cart.findOne({ userid: userData }).populate(
      "products.productid"
    );
    res.render("cart", {
      cart: cartdata,
      user: userdata,
      category: categorydata,
      session,
    });
    console.log("hloooo");
  } catch (error) {
    console.log(error.message);
  }
};

// adding products to the cart

const addcart = async (req, res) => {
  try {
    console.log("entered");
    let flag = 0;
    const productid = req.query.id;
    const quantity = parseInt(req.query.qty); // Parse the quantity as an integer

    const userdata = req.session.user;
    const productdata = await Products.findById(productid);
    let productqty = productdata.stock;

    if (productqty >= quantity) {
      console.log("okee");
      const cart = await Cart.findOne({ userid: userdata._id });

      if (cart) {
        const productExist = cart.products.findIndex((product) => {
          return product.productid.equals(productid);
        });

        if (productExist !== -1) {
          flag = 1;
          req.flash("messageAlert", "Product already in cart");
          res.redirect(req.get("referer"));
        } else {
          await Cart.findOneAndUpdate(
            { userid: userdata._id },
            {
              $push: { products: { productid: productid, quantity: quantity } },
            },
            { new: true }
          );
        }
      } else {
        const cart = new Cart({
          userid: userdata._id,
          products: [{ productid: productid, quantity: quantity }],
        });
        await cart.save();
      }

      if (flag == 0) {
        req.flash("success", "Product added to cart");
        res.redirect("back");
      }
    } else {
      req.flash("messageAlert", "Product out of stock");
      res.redirect(req.get("referer"));
    }
  } catch (error) {
    console.log(error.message);
  }
};

const increment = async (req, res) => {
  try {
    const productid = req.query.id;
    const value = req.query.val;
    const cartid = req.query.cartid;
    const incr = parseInt(value) + 1;
    const product = await Products.findById(productid);
    if (product.stock >= incr) {
      await Cart.updateOne(
        {
          _id: cartid,
          "products.productid": productid,
        },
        {
          $inc: {
            "products.$.quantity": 1,
          },
        }
      );
      res.send({ message: "1" });
    } else {
      res.send({ message: "0" });
    }
  } catch (error) {
    console.log("error in increment", error);
    res.send({ message: "Error occurred" });
  }
};

const decrement = async (req, res) => {
  try {
    const productid = req.query.id;
    const value = req.query.val;
    const cartid = req.query.cartid;
    const decr = parseInt(value) - 1;
    if (decr > 0) {
      await Cart.updateOne(
        {
          _id: cartid,
          "products.productid": productid,
        },
        {
          $inc: {
            "products.$.quantity": -1,
          },
        }
      );
      res.send({ message: "1" });
    } else {
      res.send({ message: "0" });
    }
  } catch (error) {
    console.log("error in decrement", error);
    res.send({ message: "Error occurred" });
  }
};

//   deleting the product in the cart

const deleteProCart = async (req, res) => {
  try {
    const productId = req.body.productId; // Corrected variable name
    const userdata = req.session.user;
    const qty = req.body.quantity; // Corrected variable name

    // Perform the deletion of the product from the cart
    const result = await Cart.updateOne(
      { userid: userdata._id },
      { $pull: { products: { productid: productId } } }
    );

    // Check if any documents were updated
    if (result.nModified === 0) {
      // No documents were updated, product might not be in the cart
      return res
        .status(404)
        .json({ success: false, message: "Product not found in cart" });
    }

    // Send a success response to the client
    res.json({ success: true, message: "Product deleted successfully" });
    console.log("Deleted product from cart");
  } catch (error) {
    console.log(error.message);
    // Send an error response to the client
    res.status(500).json({ success: false, error: "Error deleting product" });
  }
};

// checkout page displayinig
const cartcheckout = async (req, res) => {
  try {
    const userData = req.session.user;
    const session = req.session.loggedIn;
    const categorydata = await Category.find({ isVerified: { $ne: false } });
    const user = await User.findById(userData._id).populate("address");
    const addresses = user.address;
    const coupon = await Coupons.find({});
    const cartData = await Cart.findOne({ userid: userData._id }).populate(
      "products.productid"
    );

    if (cartData) {
      res.render("checkout", {
        addresses: addresses,
        user: userData,
        products: cartData,
        category: categorydata,
        coupons: coupon,
        session: session,
      });
    } else {
      res.redirect("/cart");
    }
  } catch (error) {
    res.render("error", { error: error.message });
  }
};

const validatecoupon = async (req, res) => {
  try {
    let couponCode = req.body.code;
    let user = req.session.user;
    let orderAmount = req.body.amount;
    const coupon = await Coupons.findOne({ couponCode: couponCode });
    console.log(couponCode);
    console.log(orderAmount);
    console.log(coupon);
    if (coupon) {
      if (!coupon.usedUsers.includes(user._id)) {
        if (orderAmount >= parseInt(coupon.minimumAmount)) {
          res.send({ msg: "1", discount: coupon.couponAmount });
        } else {
          res.send({
            msg: "2",
            message: "This Coupon Is Not Applicable For This Purchase Amount",
          });
        }
      } else {
        res.send({ msg: "2", message: "Coupon Has Been Already Applied" });
      }
    } else {
      res.send({ msg: "2", message: "Invalid Coupon Code" });
    }
  } catch (error) {
    console.log(error.message);
  }
};

module.exports = {
  cartGet,
  cartload,
  addcart,
  increment,
  decrement,
  deleteProCart,
  cartcheckout,
  validatecoupon,
};
