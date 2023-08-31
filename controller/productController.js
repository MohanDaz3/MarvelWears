const User = require('../models/userModel')
const Category = require('../models/categoryModel')
const Products = require('../models/productModel')
const bycrpt = require('bcrypt')
const mongoose = require('mongoose')


// ********************user side product controller******************
//  userside product detail page rendering

const productdetail = async (req, res) => {
    try {
        const categorydata = await Category.find({isVerified:{$ne:false}})
        const session = req.session.loggedIn
        const id=req.query.id
    const productdata = await Products.findOne({_id:id})
    
     res.render('productdetail',{product:productdata,category:categorydata,session,messageAlert: req.flash("messageAlert"), success: req.flash("success")})
     

    } catch (error) {
       res.status(404).render("error", { error: error.message });
    }
  
};

// userside categorywise products page rendering
const categoryproduct = async(req,res)=>{
    try {
    
    const id =req.query.id
    const allcategorydata = await Category.find({isVerified:{$ne:false}})

    const categorydata = await Category.find({_id:id})
   
    const categoryname = categorydata[0].categoryname
    
    const productdata = await Products.find({category:categoryname})
    
    const session = req.session.loggedIn
    res.render('allproducts',{product:productdata,category:categorydata,session,cat:allcategorydata})
    
    } catch (error) {
       res.status(404).render("error", { error: error.message });
    }
}

// **************************Adminside products controller*********************
// adminside productlist displaying
const loadproductlist = async(req,res)=>{
    try {
        const categorylist = await Category.find({isVerified:{$ne:false}})
        const productData = await Products.find()
        

        res.render('product_list',{product:productData,category:categorylist,error:"your products"})
    } catch (error) {
       res.status(404).render("error", { error: error.message });
    }
 }

// adminside addproduct page displaying

const loadaddproduct= async(req,res)=>{
    try {
        const categorylist = await Category.find({isVerified:{$ne:false}})
        res.render('add_new_product',{category:categorylist})
    } catch (error) {
       res.status(404).render("error", { error: error.message });
    }
}

// adminside adding new product

const addproduct = async (req, res) => {
    try {
        
      const files = req.files; // Retrieve the uploaded files
      const productImages = [];
  
      files.forEach((file) => {
        productImages.push(file.filename);
      });
  
      const { name, price, description,productoffer } = req.body;
      if(!productoffer||productoffer==undefined){
        productoffer=0;
      }
      let offerprice=price-productoffer

      const product = new Products({
        productname: name,
        price: price,
        description: description,
        category: req.body.categoryname,
        productimage: productImages,
        stock: req.body.stock,
        productoffer:productoffer,
        offerprice:offerprice,
      });
  
      await product.save();
  
      
  
      res.redirect('/admin/productlist');
    } catch (error) {
     res.status(404).render("error", { error: error.message });
      // Handle any errors
    }
  };
  
  

// Adminside Edit product page displaying
const loadeditproduct = async (req, res) => {
    try {
      const productid = req.query.id;
      const productdata = await Products.findOne({ _id: productid });
      const categorylist = await Category.find({ isVerified: { $ne: false } });
  
      if (productdata) {
        res.render("edit_product", { product: productdata, category: categorylist });
      } else {
        res.render("product_list", {
          error: "Can't edit the product",
          product: productdata,
          category: categorylist,
        });
      }
    } catch (error) {
     res.status(404).render("error", { error: error.message });
    }
  };
  

// Adminside Edit product
const editproduct = async (req, res) => {
    try {
      const categorylist = await Category.find({ isVerified: { $ne: false } });
      const productid = req.body.id;
      const product = await Products.findById(productid);
      const oldimages = product.productimage;
      const files = req.files;
      let updateimages = [];
  
      if (files && files.length > 0) {
        const newimages = files.map((file) => file.filename);
        updateimages = [...newimages];
        product.productimage = updateimages;
      } else {
        updateimages = oldimages;
      }
  
      const { name, price, description,productoffer } = req.body;
      const offerprice = price-productoffer;
      await Products.findByIdAndUpdate(
        { _id: productid },
        {
          $set: {
            productname: name,
            price: price,
            description: description,
            category: req.body.category,
            productimage: updateimages,
            stock: req.body.stock,
            productoffer:productoffer,
            offerprice:offerprice,
          },
        }
      );
      const productData = await Products.find();
  
      if (productData) {
        res.render("product_list", {
          error: "Your updates have been successful",
          product: productData,
          category: categorylist,
        });
      } else {
        res.render("product_list", {
          error: "Your change can't be processed",
          product: productData,
          category: categorylist,
        });
      }
    } catch (error) {
     res.status(404).render("error", { error: error.message });
    }
  };
  

//  Adminside Disabling Product

const disableproduct = async(req,res)=>{
    try {
        const id = req.query.id
       const productdata = await Products.findByIdAndUpdate({_id:id},{$set:{isBlocked:false}})

       if(productdata){
        res.send({message:"Unlisted product sucessfully"})
       }
    } catch(error) {
       res.status(404).render("error", { error: error.message });
    }
}

// Adminside Enabling Product

const enableproduct = async(req,res)=>{
    try {
        const id = req.query.id
        const productdata = await Products.findByIdAndUpdate({_id:id},{$set:{isBlocked:true}})

        if(productdata){
            res.send({message:"Listed product sucessfully"})
        }
    } catch (error) {
       res.status(404).render("error", { error: error.message });
    }
}

// Adminside product deleting
 const removeproduct = async(req,res)=>{
    
    try {
        const productid=req.query.id
        await Products.deleteOne({_id:productid})
        res.redirect("/admin/productlist")
    } catch (error) {
       res.status(404).render("error", { error: error.message });
    }
 } 

 module.exports = {
    loadproductlist,
         loadaddproduct,
         addproduct,
         loadeditproduct,
       editproduct,
        disableproduct,
        enableproduct,
    removeproduct,
 productdetail,
 categoryproduct}