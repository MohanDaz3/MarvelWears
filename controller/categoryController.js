const User = require('../models/userModel')
const Category = require('../models/categoryModel')
const Products = require('../models/productModel')
const bycrpt = require('bcrypt')
const mongoose = require('mongoose')


// ********************************Adminside Category Controller************************************


// adminside categorylist displaying

const categorylist = async(req,res)=>{
    try {
        const categoryData = await Category.find()
        res.render('category',{data:categoryData,error:"Your Categories"})

    } catch (error) {
        console.log(error.message);
    }
}
// adminside add category page displaying

const loadAddcategory = async(req,res)=>{
    try {
        res.render('add_category')
        console.log("adminside add category page is rendering");
    } catch (error) {
        console.log(error.message);
    }
   
}

// adminside adding new category
 const addcategory = async(req,res)=>{
        const categoryname=req.body.name
        const categorydescription=req.body.description
        const categoryimage=req.file
        const lowerCategoryName = categoryname.toLowerCase();
        

        try {
            
            const categoryexist = await Category.findOne({
                categoryname: { $regex: new RegExp('^' + lowerCategoryName + '$', 'i') }
              });
            console.log(categoryexist);
            if(!categoryexist){
                
                const category = new Category({
                    categoryname:categoryname,
                    description:categorydescription,
                    image:categoryimage.filename

                })
                await category.save()
                res.redirect('/admin/categorylist')
            }else{
                res.render('add_category',{notice:"Category already Exists"})
            }
        } catch (error) {
            
        }
 }

//  Adminside delete category

const removecategory = async(req,res)=>{
   try {
    const categoryid = req.query.id
    await Category.deleteOne({_id:categoryid})
    res.redirect('/admin/categorylist')
   } catch (error) {
    console.log(error.message);
   }
}

//  adminside disabling category
const disablecategory=async(req,res)=>{
    try {
        const id= req.query.id
        const categorydata = await Category.findByIdAndUpdate({_id:id},{$set:{isVerified:false}})
        
    
        if(categorydata){
            res.send({message:"unlisted category Successfully"})
        }
    } catch (error) {
        console.log(error.message);
    }
   
}

// adminside enabling category

const enablecategory = async(req,res)=>{
    try {
        const id=req.query.id
        const categorydata = await Category.findByIdAndUpdate({_id:id},{$set:{isVerified:true}})
       

       if(categorydata){
        res.send({message:"listed category Successfully"})
    }
    } catch (error) {
        console.log(error.message);
    }
}

// adminside Edit category page displaying
const loadeditcategory = async(req,res)=>{
    try {
        const id=req.query.id
        const categorydata=await Category.findOne({_id:id})
        console.log(categorydata);
        
        if(categorydata){
            res.render('edit_category',{data:categorydata})
        }else{
            res.render('category',{error:"can't edit this category",data:categorydata})
        }
        
    } catch (error) {
        console.log(error.message);
    }
}

// adminside Editing category
const editcategory=async(req,res)=>{
    try {
        const id=req.body.id
      
        const categoryname=req.body.name
        
        const categorydescription=req.body.description
        
        const categoryimage=req.file
        
        await Category.findByIdAndUpdate({_id:id},{$set:{categoryname:categoryname,description:categorydescription,image:categoryimage.filename}})
        const categoryData = await Category.find()
        
        if(categoryData){
            res.render('category',{error:"your update as been sucessfull",data:categoryData})
        }else{
            res.render('category',{error:"updating category has been failed",data:categoryData})
        }

    } catch (error) {
        console.log((error.message));
    }
}
// **************************************ends**********************************


module.exports = {
    loadAddcategory,
            categorylist,
              addcategory,
            disablecategory,
            loadeditcategory,
              editcategory,
             enablecategory,
              removecategory,
}