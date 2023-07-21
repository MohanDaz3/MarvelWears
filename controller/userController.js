const User = require("../models/userModel");
const bycrpt = require("bcrypt");
const nodemailer = require("nodemailer");
const Products = require('../models/productModel')
const Category = require('../models/categoryModel')
const Order = require("../models/orderModel")
const Wallet = require("../models/walletModel")


// error page rendernig\
const errorpage = async(req,res)=>{
    try {
        const session = req.session.loggedIn
        res.render('error',{session})
    } catch (error) {
        console.log(error.message);
    }
}

// userprofile displaying

const userprofile= async(req,res)=>{
    try {
        const session = req.session.loggedIn
        const id= req.session.userid
        const userdata = await User.findOne({_id:id})
        console.log(userdata);
        const categorydata = await Category.find({isVerified:{$ne:false}})
        res.render('userprofile',{category:categorydata,user:userdata,session})
        console.log("user profile page is rendering");
    } catch (error) {
        console.log(error.message);
    }
}

// update user profile
const updateuser=async(req,res)=>{
    try {
     
        const userfname=req.body.fname
        const userlname=req.body.lname
        const useremail=req.body.email
        const usermobile=req.body.mobile
        const userbdate=req.body.bdate
        console.log(userfname,userlname,useremail,usermobile);
        const id= req.session.userid
        console.log(id);
        const session = req.session.loggedIn
        const categorydata = await Category.find({isVerified:{$ne:false}})
        await User.findByIdAndUpdate({_id:id},{$set:{Firstname:userfname,Lastname:userlname,email:useremail,mobile:usermobile,Bdate:userbdate}})
        const userdetails= await User.findOne({_id:id})
        res.render('userprofile',{category:categorydata,user:userdetails,session})
        console.log("updated user profile");
    } catch (error) {
        console.log(error.message);
    }
}

// upload user profile image
const uploadimage = async(req,res)=>{
    try {
        const id= req.session.userid
        const updateuser=await User.updateOne({_id:id},{$set:{image:req.file.filename}})
        console.log("updated");
        if(updateuser){
            res.json({success:true,message:"profile picture updated successfully"})
        }else{
            res.json({success:false,message:"Failed to update the profile picture"})
        }
    } catch (error) {
        console.log(error.message);
    }
}

// user Address displaying
const useraddress = async(req,res)=>{
    try {
        const session = req.session.loggedIn
        const id= req.session.userid
        const userdata = await User.findOne({_id:id})
        const categorydata = await Category.find({isVerified:{$ne:false}})
        res.render('useraddress',{category:categorydata,user:userdata,session})
        console.log("user address page is rendering");
    } catch (error) {
        console.log(error.message);
    }
}

// add new user Address 
const addaddress = async (req, res) => {
    try {
        const id = req.session.userid;
        const { type, houseName, village, landmark, pincode, city, district, state, country } = req.body;
        console.log(req.body);
        const user = await User.findOne({ _id: id });
        console.log(user);
        if (user.address.length < 4) {
            const newAddress = {
                type: type,
                houseName: houseName,
                village: village,
                landmark: landmark,
                pincode: pincode,
                city: city,
                district: district,
                state: state,
                country: country
            };
            user.address.push(newAddress);
            console.log(user.address);
            await user.save();
            return res.redirect('/useraddress');
        } else {
            return res.redirect('/useraddress');
        }
    } catch (error) {
        console.error(error);
        return res.status(500).send('Internal Server Error');
    }
};
// edit user address
const editaddress= async(req,res)=>{
  try {
    try {
      const addressId = req.query.addressId;
      const userId = req.session.userid;

      // Find the user and the specific address within the user's address array
      const user = await User.findOne({ _id: userId, 'address._id': addressId });
      const addressIndex = user.address.findIndex(addr => addr._id.toString() === addressId.toString());

      // Update the address details
      user.address[addressIndex].type = req.body.type;
      user.address[addressIndex].houseName = req.body.houseName;
      user.address[addressIndex].village = req.body.village;
      user.address[addressIndex].landmark = req.body.landmark;
      user.address[addressIndex].pincode = req.body.pincode;
      user.address[addressIndex].city = req.body.city;
      user.address[addressIndex].district = req.body.district;
      user.address[addressIndex].state = req.body.state;
      user.address[addressIndex].country = req.body.country;

      // Save the updated user document
      await user.save();

      res.redirect('/useraddress');
  } catch (error) {
      console.log(error);
      res.status(500).send('An error occurred while updating the address.');
  }
  } catch (error) {
    console.log(error.message);
  }
}
// delete user address

const deleteaddress = async(req,res)=>{
    try {
        const userid = req.session.userid;
        const addressid = req.query.id
        const userdetails = await User.updateOne({_id:userid},{$pull:{address:{_id:addressid}}},{safe:true})
        res.redirect('/useraddress')
        console.log("deleted address");
    } catch (error) {
        console.log(error.message);
    }
}






// user password reset or change

const changepassword = async(req,res)=>{
    try {
        const userid=req.session.userid
        const userdata = await User.findOne({_id:userid})
        // const session = req.session.loggedIn
        // const categorydata = await Category.find({isVerified:{$ne:false}})
        const isPasswordMatch = await bycrpt.compare(
            req.body.oldpassword,
            userdata.password
          );
        const securepassword = await seccurePassword(req.body.npassword);
        if(isPasswordMatch){
            await User.updateOne({_id:userid},{$set:{password:securepassword}})
           res.redirect('/profile')
            console.log('password changed');

        }else{
            res.redirect('/profile')
            console.log("failed to reset password");
        }
    } catch (error) {
        console.log(error.message);
    }
}
// userside Oders list displaying
const orderlist = async (req, res) => {
  try {
    const session = req.session.loggedIn;
    const categorydata = await Category.find({ isVerified: { $ne: false } });
    const id = req.session.userid;
    const userdata = await User.findOne({ _id: id });
    const userId = req.session.userid;
    const order = await Order.find({ userid: userId })
      .populate("products.productid")
      .exec(); 
    res.render("orders", {
      title: userId,
      orders: order,
      category: categorydata,
      user: userdata,
      session,
    });
  } catch (error) {
    console.log(error.message);
  }
};
// userside orderdetail page display
const orderdetail = async(req,res)=>{
  try {
    const session = req.session.loggedIn;
    const id = req.session.userid;
    const userdata = await User.findOne({ _id: id });
    const categorydata = await Category.find({ isVerified: { $ne: false } });
    const orderid = req.query.id;
    const orderdetail = await Order.findById({_id:orderid}).populate("products.productid").populate({
      path: "userid",
      populate: { path: "address" },
    })
    const selectedAddressId = orderdetail.Shippingaddress;
    const selectedAddress = orderdetail.userid.address.find((address)=>{
      return address._id.equals(selectedAddressId)
    })
    
    if(orderdetail){
      res.render("orderdetails",{order:orderdetail,user:userdata,category:categorydata,session,selectedAddress:selectedAddress})
    }else{
      res.redirect("/orders")
    }
  } catch (error) {
    console.log(error.message);
  }
}

// userside user wallet displaying

const loadwallet = async(req,res)=>{
  try {
    const session = req.session.loggedIn;
    const categorydata = await Category.find({ isVerified: { $ne: false } });
    const id = req.session.userid;
    const userdata = await User.findOne({ _id: id });
    const userId = req.session.userid;
    const wallet = await Wallet.findOne({userid:userId});
    res.render("wallet",{title:userId,wallet:wallet,user:userdata,category:categorydata,session})
  } catch (error) {
    console.log(error.message);
  }
}



// home page rendering
const homePage = async (req, res) => {
    const categorydata = await Category.find({isVerified:{$ne:false}})
    const productdata = await Products.find({isBlocked:{$ne:true}})
    const session = req.session.loggedIn
  res.render("home",{category:categorydata,session,product:productdata});
  console.log("home page is rendering");
};

//login page rendering

const loginpage = async (req, res) => {
  res.render("login");
  console.log("login page is rendering");
};
// logOut
const logoutpage = async (req, res) => {
  try {
    req.session.destroy();
    res.redirect("/");
    console.log("logout sucessfully");
  } catch (error) {
    console.log(error.message);
  }
};

//signup page rendering

const signuppage = async (req, res) => {
  res.render("signup");
  console.log("signup page is rendering");
};


//User OtpLogin page rendering
const otpLogin = async (req, res) => {
  res.render("otpLogin");
  console.log("otplogin page is rendering");
};

//otp recieving page rendering
const recieveOtp = async (req, res) => {
  res.render("recieveOtp");
  console.log("otp recieving page is rendering");
};

// password hashing

const seccurePassword = async (password) => {
  try {
    const passwordHash = await bycrpt.hash(password, 10);
    return passwordHash;
  } catch (error) {
    console.log(error.message);
  }
};

//Customer signup(account creation)

const accountCreated = async (req, res) => {
    try {
      let checkingmail = await User.findOne({ email: req.body.email });
      let characters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
      let referalcode="";
      for(let i= 0 ; i < 20 ; i++){
        let randomIndex = Math.floor(Math.random()*characters.length);
        referalcode += characters.charAt(randomIndex)
      }
      console.log(req.body.email);
      if (checkingmail) {
        res.status(200).render('signup', { notice: "Email has already been registered" });
      } else {
        console.log("hloiii");
        const spassword = await seccurePassword(req.body.password);
        const data = new User({
          Firstname: req.body.fname,
          Lastname: req.body.lname,
          email: req.body.email,
          password: spassword,
          isAdmin: 0,
          address: [],
          referalcode:referalcode,

        });
       
  
        console.log(data);
        const userDetails = await data.save();
        console.log(userDetails);

        if(req.body.referalcode){
          const enteredreferalcode=req.body.referalcode
          console.log(enteredreferalcode);
          const refereduser = await User.findOne({referalcode:enteredreferalcode})
          console.log(refereduser);
          if(refereduser){
            console.log("fkkkkkkkkkkk");
            const refereduserwallet = await Wallet.findOne({userid:refereduser._id})
            console.log(refereduserwallet);
            if(refereduserwallet){
              console.log("kffffffffffff");
              refereduserwallet.balance += 100;
              refereduserwallet.orderDetails.push({
                amount:100,
                message:"Refferal",
                type:"Added"
              })
              await refereduserwallet.save();
              refereduser.referalCodeUsed=1
              await refereduser.save()
            }else{
              console.log("no wallet found within the user");
            }
          }else{
            console.log("no user found with this referal");
          }
        }
        const wallet = new Wallet({
          userid:userDetails._id,
          balance:0,
          orderDetails:[]
        });
        await wallet.save();
        const validreferal = await User.findOne({referalcode:req.body.referalcode})
        if(validreferal){
          const userwallet = await Wallet.findOne({userid:userDetails._id})
          if(userwallet){
            userwallet.balance +=25;
            userwallet.orderDetails.push({
              amount
            })
          }
        }
  
        let user = await User.findOne({ email: req.body.email });
        console.log(user);
        
  
        if (user) {
          sendVerifyMail(req.body.fname, req.body.email, user._id);
          res.render("signup", { Tnotice: "You're an Avenger now. Please verify your registered email." });
        } else {
          res.render("signup", { notice: "Registration failed!!!" });
        }
      }
    } catch (error) {
      console.error(error);
    }
  };
  
  

// login verifiying

const loginVerify = async (req, res) => {
  try {
    //    console.log(password);
    const userData = await User.findOne({ email: req.body.email });
    console.log(userData);

    const isPasswordMatch = await bycrpt.compare(
      req.body.password,
      userData.password
    );

    if (userData) {
      if (isPasswordMatch) {
        if (userData.isVerified == 1 && userData.block == 0 ) {
        req.session.userid=userData._id
          req.session.user_id = userData.email;
          req.session.loggedIn=true
          req.session.user={
            _id:userData._id,
            email:userData.email
          }
          res.redirect("/");
          console.log("login successfull");
        } else {
          res.status(200).render("login", { notice: "User is not verified/User is been Blocked"});
          console.log("User not verified/blocked");
        }
      } else {
        res.status(200).render("login", { notice: "Password is incorrect" });
        console.log("password not match");
      }
    } else {
      res.status(200).render("login",{notice:"inavlid user"})
    } 
  } catch (error) {
    // res.status(404).render("error",{error:error.message});
    console.log(error.message);
  }
};

// send Email verification
const sendVerifyMail = async (username, email, id) => {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      requireTLS: true,
      auth: {
        user: "mohandass.unni3@gmail.com",
        pass: process.env.emailpassword,
      },
    });
    const mailOptions = {
      from: "mohandass.unni3@gmail.com",
      to: email,
      subject: "For verification mail",
      html:
        "<p>Hi" +" "+
        username +
        ', Please click here to verify your Marvel Wears.com account <a href = "http://localhost:3000/verify?id=' +
        id +
        '">Verify</a>your mail</p>',
    };
    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log("email has been sent:-", info.response);
      }
    });
  } catch (error) {
    console.log(error.message);
  }
};

// verify Email
const verifyMail = async (req, res) => {
  try {
    await User.updateOne({ _id: req.query.id }, { $set: { isVerified: 1 } });
    res.render("signup", { verification: "Verified your mail id" });
    console.log('email verified');
  } catch (error) {
    console.log(error);
  }
};

// Otp email function

const otpVerifyMail = async (username, email, otp) => {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      requireTLS: false,
      auth: {
        user: "mohandass.unni3@gmail.com",
        pass: "vcyqdwpefduuhhld",
      },
    });
    const mailOptions = {
      from: "mohandass.unni3@gmail.com",
      to: email,
      subject: "For OTP login",
      html: "<p>Dear" +" "+ username + ",Your OTP is <a>" + otp + "</a> </p>",
    };
    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log("Email has been sent :-", info.response);
      }
    });
  } catch (error) {
    console.log(error.message);
  }
};

// sending otp for login

const otpSend = async (req, res) => {
  try {
    const userMail = await User.findOne({ email: req.body.email });
    console.log(userMail);
    if (userMail) {
      let OTP = "";
      let digits = "0123456789";
      for (let i = 0; i < 6; i++) {
        OTP += digits[Math.floor(Math.random() * 10)];
      }
      const updatedUser = await User.updateOne(
        { email: req.body.email },
        { $set: { otp: OTP } }
      );
      console.log("hiiiiiiii");
      console.log(updatedUser);
      otpVerifyMail(userMail.Firstname, userMail.email, OTP);
      res.render("recieveOtp");
    } else {
      res.render("otpLogin", { message: "Invalid Mail Id" });
    }
  } catch (error) {
    console.log(error.message);
  }
};

// verifing Otp

const verifyOtp = async (req, res) => {
  try {
    let OTP = req.body.otp;
    let userData = await User.findOne({ otp: OTP });
    console.log("hllooooo");
console.log(userData);
    if (userData) {
      req.session.userid=userData._id
      req.session.loggedIn = true;
      req.session.user={
        _id:userData._id,
        email:userData.email
      }
      res.redirect("/");
    } else {
      res.render("recievOtp", { message: "OTP is invalid" });
    }
  } catch (error) {
    console.log(error.message);
  }
};

module.exports = {
   
  homePage,
  loginpage,
  signuppage,
  accountCreated,
  loginVerify,
  logoutpage,
  otpLogin,
  otpVerifyMail,
  sendVerifyMail,
  recieveOtp,
  verifyMail,
  otpVerifyMail,
  otpSend,
  verifyOtp,
  errorpage,
  userprofile,
  updateuser,
  useraddress,
  uploadimage,
  addaddress,
  deleteaddress,
  changepassword,
    orderlist,
    loadwallet,
    editaddress,
    orderdetail};
