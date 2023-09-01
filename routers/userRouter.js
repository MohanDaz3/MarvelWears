const express = require("express")
const path = require("path")
const user_router = express()
const bodyparser = require('body-parser')
const validate = require('../middleware/userAuth')
const store = require('../middleware/multer')
const userController = require('../controller/userController')
const productController = require('../controller/productController')
const cartController = require('../controller/cartController')
const orderController = require('../controller/orderController')
const flash = require('connect-flash')


// attaching static files

user_router.use('/static',express.static('public'))
user_router.use('/assets',express.static('/public/images'))

user_router.use(flash())

// setting view Engine

user_router.set('view engine','ejs')
user_router.set('views','./views/users')


// middleware for parsing incoming requests

user_router.use(express.json())
user_router.use(express.urlencoded({extended:true}))

user_router.get('/',userController.homePage)



user_router.get('/login',validate.isLoggedIn,userController.loginpage)
user_router.post('/login',userController.loginVerify)
user_router.get('/logout',userController.logoutpage)


user_router.get('/signup',userController.signuppage)

user_router.post('/signup',userController.accountCreated)
// ----------otp and mail verification---------------
user_router.get('/otpLogin',userController.otpLogin)

user_router.post('/otpLogin',userController.otpSend)

user_router.get('/recieveOtp',userController.recieveOtp)

user_router.post('/otpverification',userController.verifyOtp)

user_router.get('/verify',userController.verifyMail)
// ----------forgot password----------------
user_router.get('/forgotpassword',userController.forgotpasswordotpLogin)

user_router.post('/forgotpassword',userController.forgototpSend)

user_router.get('/passwordreset',userController.forgotpasswordOtp)

user_router.post('/passwordreset',userController.passwordreset)

// --------------userprofile------------------
user_router.get('/profile',validate.isBlocked,userController.userprofile)
user_router.post('/updateuser',validate.isBlocked,userController.updateuser)
user_router.get('/useraddress',validate.isBlocked,userController.useraddress)
user_router.post('/uploadprofileimage',store.single('image'),validate.isBlocked,userController.uploadimage)
user_router.post('/addaddress',validate.isBlocked,userController.addaddress)
user_router.post('/editaddress',validate.isBlocked,userController.editaddress)
user_router.get('/deleteaddress',validate.isBlocked,userController.deleteaddress)
user_router.post('/changepassword',validate.isBlocked,userController.changepassword)
user_router.get('/orders',validate.isBlocked,userController.orderlist)
user_router.get('/orderDetails',validate.isBlocked,userController.orderdetail)
user_router.post('/cancelorder',validate.isBlocked,orderController.cancelRequest)
user_router.post('/returnorder',validate.isBlocked,orderController.returnRequest)
user_router.get('/wallet',validate.isBlocked,userController.loadwallet)
// ----------product management-------------------
user_router.get('/productview',validate.isBlocked,productController.productdetail)
user_router.get('/categoryproducts',validate.isBlocked,productController.categoryproduct)
user_router.get('/cart',validate.isBlocked,cartController.cartload)
user_router.get('/carts/:userId',validate.isBlocked, cartController.cartGet)
user_router.delete('/carts/:userId/products/:productId',validate.isBlocked, cartController.cartProductDelete)
user_router.get('/addtocart',validate.isBlocked,cartController.addcart)
user_router.get('/increment',validate.isBlocked,cartController.increment)
user_router.get('/decrement',validate.isBlocked,cartController.decrement)
user_router.post('/removeFromCart',validate.isBlocked,cartController.deleteProCart)
// ----------payment----------------------
user_router.get('/checkout',validate.isBlocked,cartController.cartcheckout)
user_router.post('/checkvalidcoupon',validate.isBlocked,cartController.validatecoupon)

user_router.post('/razorpay',validate.isBlocked,orderController.createorder)
user_router.post('/placeOrder',validate.isBlocked,orderController.orderplace)








module.exports=user_router