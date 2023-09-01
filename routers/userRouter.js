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
user_router.get('/profile',userController.userprofile)
user_router.post('/updateuser',userController.updateuser)
user_router.get('/useraddress',userController.useraddress)
user_router.post('/uploadprofileimage',store.single('image'),userController.uploadimage)
user_router.post('/addaddress',userController.addaddress)
user_router.post('/editaddress',userController.editaddress)
user_router.get('/deleteaddress',userController.deleteaddress)
user_router.post('/changepassword',userController.changepassword)
user_router.get('/orders',userController.orderlist)
user_router.get('/orderDetails',userController.orderdetail)
user_router.post('/cancelorder',orderController.cancelRequest)
user_router.post('/returnorder',orderController.returnRequest)
user_router.get('/wallet',userController.loadwallet)
// ----------product management-------------------
user_router.get('/productview',productController.productdetail)
user_router.get('/categoryproducts',productController.categoryproduct)
user_router.get('/cart',cartController.cartload)
user_router.get('/carts/:userId', cartController.cartGet)
user_router.delete('/carts/:userId/products/:productId', cartController.cartProductDelete)
user_router.get('/addtocart',cartController.addcart)
user_router.get('/increment',cartController.increment)
user_router.get('/decrement',cartController.decrement)
user_router.post('/removeFromCart',cartController.deleteProCart)
// ----------payment----------------------
user_router.get('/checkout',cartController.cartcheckout)
user_router.post('/checkvalidcoupon',cartController.validatecoupon)

user_router.post('/razorpay',orderController.createorder)
user_router.post('/placeOrder',orderController.orderplace)








module.exports=user_router