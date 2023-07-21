const express = require('express')
const admin_router = express()
const path = require('path')
const store = require('../middleware/multer')
const validate = require('../middleware/adminAuth')
const flash = require('connect-flash')

const adminController = require('../controller/adminController')
const categoryController = require('../controller/categoryController')
const productController = require('../controller/productController')
const orderController = require('../controller/orderController')

admin_router.use('/static',express.static('public'))
admin_router.use('/assets',express.static('public'))
admin_router.use(flash())

// setting view Engine

admin_router.set('view engine','ejs')
admin_router.set('views','./views/admin')


// middleware for parsing incoming requests

admin_router.use(express.json())
admin_router.use(express.urlencoded({extended:true}))


admin_router.get('/' ,validate.isLoggedIn,adminController.loginpage)

admin_router.post('/login',validate.isLoggedIn,adminController.adminlogin)

admin_router.get('/dashboard',adminController.homepage)

admin_router.get('/logout',adminController.logout)

//************************user************************

admin_router.get('/users',adminController.userList)

admin_router.post('/blockuser',adminController.blockuser)

admin_router.post('/unblockuser',adminController.unblockuser)

// =======================ends================================

// *********************products******************************

admin_router.get('/productlist',productController.loadproductlist)

admin_router.get('/addproduct',productController.loadaddproduct)

admin_router.post('/addproduct',store.array('images',3),productController.addproduct)

admin_router.get('/loadeditproduct',productController.loadeditproduct)

admin_router.post('/editproduct',store.array('images',3),productController.editproduct)

admin_router.post('/disableproduct',productController.disableproduct)

admin_router.post('/enableproduct',productController.enableproduct)

admin_router.get('/deleteproduct',productController.removeproduct)

// ========================ends=================================

// ***********************category******************************

admin_router.get('/categorylist',categoryController.categorylist)
admin_router.get('/addcategory',categoryController.loadAddcategory)
admin_router.post('/categoryadd',store.single('image'),categoryController.addcategory)
admin_router.post('/deletecategory',categoryController.disablecategory)
admin_router.post('/enablecategory',categoryController.enablecategory)
admin_router.get('/loadeditcategory',categoryController.loadeditcategory)
admin_router.post('/editcategory',store.single('image'), categoryController.editcategory)
admin_router.get('/removecategory',categoryController.removecategory)


// ==========================ends==================================

admin_router.get("/orders",adminController.loadorder)
admin_router.get("/orderdetail",adminController.orderdetail)
admin_router.post("/statusupdate",adminController.updatestatus)
admin_router.post('/returnapprove',orderController.approveReturn)

admin_router.get("/couponList",adminController.listcoupon)
admin_router.get('/addcoupon',adminController.addcouponpage)
admin_router.post('/addCoupon',adminController.addcoupon)
admin_router.get('/editcouponpage',adminController.editcouponpage)
admin_router.post('/editcoupon',adminController.editcoupon)
admin_router.get('/deletecoupon',adminController.deletecoupon)

module.exports=admin_router