const User = require("../models/userModel");
const bycrpt = require("bcrypt");
const nodemailer = require("nodemailer");
const Products = require('../models/productModel')
const Category = require('../models/categoryModel')
const Order = require("../models/orderModel")
const Wallet = require("../models/walletModel")
const Cart = require('../models/cartModel')


// error page rendernig\
const errorpage = async(req,res)=>{
    try {
        const session = req.session.loggedIn
        res.render('error',{session})
    } catch (error) {
        consolee.log("error");
    }
}

// userprofile displaying

const userprofile= async(req,res)=>{
    try {
        const session = req.session.loggedIn
        const id= req.session.userid
        const userdata = await User.findOne({_id:id})
        const categorydata = await Category.find({isVerified:{$ne:false}})
        res.render('userprofile',{category:categorydata,user:userdata,session})
       
    } catch (error) {
       res.status(404).render("error", { error: error.message });
    }
}

// update user profile
const updateuser=async(req,res)=>{
    try {
     
        const userfname=req.body.fname;
        const userlname=req.body.lname;
        const useremail=req.body.email;
        const usermobile=req.body.mobile;
        const userbdate=req.body.bdate;
        const id= req.session.userid;
        const session = req.session.loggedIn;
        const categorydata = await Category.find({isVerified:{$ne:false}})
        await User.findByIdAndUpdate({_id:id},{$set:{Firstname:userfname,Lastname:userlname,email:useremail,mobile:usermobile,Bdate:userbdate}})
        const userdetails= await User.findOne({_id:id})
        res.render('userprofile',{category:categorydata,user:userdetails,session})
        
    } catch (error) {
       res.status(404).render("error", { error: error.message });
    }
}

// upload user profile image
const uploadimage = async(req,res)=>{
    try {
        const id= req.session.userid
        const updateuser=await User.updateOne({_id:id},{$set:{image:req.file.filename}})
        
        if(updateuser){
            res.json({success:true,message:"profile picture updated successfully"})
        }else{
            res.json({success:false,message:"Failed to update the profile picture"})
        }
    } catch (error) {
       res.status(404).render("error", { error: error.message });
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
        
    } catch (error) {
       res.status(404).render("error", { error: error.message });
    }
}

// add new user Address 
const addaddress = async (req, res) => {
    try {
        const id = req.session.userid;
        const { type, houseName, village, landmark, pincode, city, district, state, country } = req.body;
        
        const user = await User.findOne({ _id: id });
        
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
   res.status(404).render("error", { error: error.message });
  }
}
// delete user address

const deleteaddress = async(req,res)=>{
    try {
        const userid = req.session.userid;
        const addressid = req.query.id
        const userdetails = await User.updateOne({_id:userid},{$pull:{address:{_id:addressid}}},{safe:true})
        res.redirect('/useraddress')
        
    } catch (error) {
       res.status(404).render("error", { error: error.message });
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
            

        }else{
            res.redirect('/profile')
            
        }
    } catch (error) {
       res.status(404).render("error", { error: error.message });
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
   res.status(404).render("error", { error: error.message });
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
   res.status(404).render("error", { error: error.message });
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
   res.status(404).render("error", { error: error.message });
  }
}



// home page rendering
const homePage = async (req, res) => {
    const categorydata = await Category.find({isVerified:{$ne:false}})
    // const productdata = await Products.find({isBlocked:{$ne:true}})
    const productdata = await Products.find({ isBlocked: { $ne: true }, isVerified: { $ne: false } });
    const session = req.session.loggedIn;
    const userid = req.session.userid; 
    const notice = req.flash("notice")
  res.render("home",{category:categorydata,session,product:productdata,notice:notice[0]||""});
  
};

//login page rendering

const loginpage = async (req, res) => {
  const categorydata = await Category.find({isVerified:{$ne:false}})
  const notice = req.flash("notice")
  const session = req.session.loggedIn
  res.render("login",{category:categorydata,session,notice:notice[0]||""});
  
};
// logOut
const logoutpage = async (req, res) => {
  try {
    req.session.destroy();
    res.redirect("/");
    
  } catch (error) {
   res.status(404).render("error", { error: error.message });
  }
};

//signup page rendering

const signuppage = async (req, res) => {
  const categorydata = await Category.find({isVerified:{$ne:false}})
  const notice = req.flash("notice")
  const Tnotice = req.flash("Tnotice")
  const session = req.session.loggedIn
  res.render("signup",{category:categorydata,session,notice:notice[0]||"",Tnotice:Tnotice[0]||""});
  
};


//User OtpLogin page rendering
const otpLogin = async (req, res) => {
  const categorydata = await Category.find({isVerified:{$ne:false}})
  const session = req.session.loggedIn
  res.render("otpLogin",{category:categorydata,session});
  
};
//User forgotpassword otp page rendering
const forgotpasswordotpLogin = async (req, res) => {
  const categorydata = await Category.find({isVerified:{$ne:false}})
  const session = req.session.loggedIn
  res.render("forgotpassword",{category:categorydata,session});
  
};

//otp recieving page rendering
const recieveOtp = async (req, res) => {
  const categorydata = await Category.find({isVerified:{$ne:false}})
  const session = req.session.loggedIn
  res.render("recieveOtp",{category:categorydata,session});
  
};

//forgot password otp recieving page rendering
const forgotpasswordOtp = async (req, res) => {
  const categorydata = await Category.find({isVerified:{$ne:false}})
  const session = req.session.loggedIn
  res.render("passwordOtp",{category:categorydata,session});
  
};


// password hashing

const seccurePassword = async (password) => {
  try {
    const passwordHash = await bycrpt.hash(password, 10);
    return passwordHash;
  } catch (error) {
   res.status(404).render("error", { error: error.message });
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
      
      if (checkingmail) {
        res.status(200).render('signup', { notice: "Email has already been registered" });
      } else {
        
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
       
  
      
        const userDetails = await data.save();
       

        if(req.body.referalcode){
          const enteredreferalcode=req.body.referalcode
          
          const refereduser = await User.findOne({referalcode:enteredreferalcode})
         
          if(refereduser){
            
            const refereduserwallet = await Wallet.findOne({userid:refereduser._id})
            
            if(refereduserwallet){
              
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
              amount:25,
              message:"Bonus",
              type:"Added"
            })
            await userwallet.save();
          }else{
            console.log("no wallet found");
          }
        }else{
          console.log("not valid referal");
        }
  
        let user = await User.findOne({ email: req.body.email });
        
        
  
        if (user) {
          req.flash("Tnotice", "You're an Avenger now. Please verify your registered email.");
          sendVerifyMail(req.body.fname, req.body.email, user._id);
          res.redirect("/signup");
        } else {
          req.flash("notice", "Registration failed!!!");
          res.redirect("/signup");
        }
      }
    } catch (error) {
      res.status(404).render("error", { error: error.message });
    }
  };
  
  

// login verifiying

const loginVerify = async (req, res) => {
  
  try {
    
    const userData = await User.findOne({ email: req.body.email });
    if (userData) {
      const isPasswordMatch = await bycrpt.compare(
        req.body.password,
        userData.password
      );
      if (isPasswordMatch) {
        if (userData.isVerified == 1 && userData.block == 0 ) {
        req.session.userid=userData._id
          req.session.user_id = userData.email;
          req.session.loggedIn=true
          req.session.user={
            _id:userData._id,
            email:userData.email
          }
          req.flash("notice", "login successfull");
          res.redirect("/");
          
        } else {
          req.flash("notice", "User not verified/blocked");
          res.status(200).redirect("/login");
          
        }
      } else {
        req.flash("notice", "password incorrect");
        res.status(200).redirect("/login");
       
      }
    } else {
      req.flash("notice", "User not Found");
      res.status(200).redirect("/login");
      
    } 
  } catch (error) {
   res.status(404).render("error", { error: error.message });
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
        pass: process.env.EMAIL_SECRET_KEY,
      },
    });
    const mailOptions = {
      from: "MarvelWears<mohandass.unni3@gmail.com>",
      to: email,
      subject: "MarvelWears verification mail",
      html:
        "<p>Hi" +" "+
        username +
        ', Please click here to verify your MarvelWears.com account <a href = "http://52.66.124.99/verify?id=' +
        id +
        '">Verifing</a>your mail</p>',
    };
    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log("email has been sent:-", info.response);
      }
    });
  } catch (error) {
   res.status(404).render("error", { error: error.message });
  }
};

// verify Email
const verifyMail = async (req, res) => {
  try {
    await User.updateOne({ _id: req.query.id }, { $set: { isVerified: 1 } });
    res.render("signup", { verification: "Verified your mail id" });
    
  } catch (error) {
    res.status(404).render("error", { error: error.message });
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
        pass: process.env.EMAIL_SECRET_KEY,
      },
    });
    const mailOptions = {
      from: "MarvelWears<mohandass.unni3@gmail.com>",
      to: email,
      subject: "MarvelWears OTP",
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
   res.status(404).render("error", { error: error.message });
  }
};

// sending otp for login

const otpSend = async (req, res) => {
  try {
    const userMail = await User.findOne({ email: req.body.email });
    
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
      
      
      otpVerifyMail(userMail.Firstname, userMail.email, OTP);
      res.redirect("/recieveOtp");
    } else {
      req.flash("success","Invalid Mail Id")
      res.redirect("/otpLogin");
    }
  } catch (error) {
   res.status(404).render("error", { error: error.message });
  }
};

// forgot password otp send
const forgototpSend = async (req, res) => {
  try {
    const userMail = await User.findOne({ email: req.body.email });
    
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
      
      otpVerifyMail(userMail.Firstname, userMail.email, OTP);
      res.redirect("/passwordreset");
    } else {
      req.flash("success","Invalid Mail Id")
      res.redirect("/forgotpassword");
    }
  } catch (error) {
   res.status(404).render("error", { error: error.message });
  }
};

// verifing Otp

const verifyOtp = async (req, res) => {
  try {
    let OTP = req.body.otp;
    let userData = await User.findOne({ otp: OTP });
    

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
   res.status(404).render("error", { error: error.message });
  }
};

const passwordreset = async(req,res)=>{
  try {
    let OTP=req.body.otp;
    let user = await User.findOne({otp:OTP})
    let newpassword = await seccurePassword(req.body.confirmpassword);
    
    if(user){
      
      await User.updateOne(
        {otp:OTP},
        {$set:{password:newpassword}}
      )
      
      res.redirect('/')
    }else{
      res.redirect("/passwordreset")
    }
  } catch (error) {
    res.status(404).render("error", { error: error.message });
  }
}

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
    orderdetail,
    forgotpasswordotpLogin,
    forgotpasswordOtp,
    passwordreset,
    forgototpSend};
