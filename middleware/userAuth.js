const user = require('../models/userModel')

// login authentication

const isLoggedIn = (req,res,next)=>{
    try {
        if(req.session.loggedIn){
            res.redirect('/')
        }else{
            next()
        }
    } catch (error) {
        res.render('error',{error:error.message});
    }
}

const isLoggedOut = (req,res,next)=>{
    try {
        if(req.session.loggedIn){
            next()
        }else{
            res.redirect('/login')
        }
    } catch (error) {
        res.render('error',{error:error.message});
    }
}
 const isBlocked = async(req,res,next)=>{
    try {
        const user = await user.findOne({_id:req.session.user._id})
        if(user.block){
            req.session.destroy();
            res.render('home',{noticeAlert:"User Has Been Blocked"})
        }else{
            next();
        }
    } catch (error) {
        res.render('error',{error:error.message});
    }
 }

module.exports = {
    isLoggedIn,
    isLoggedOut,
    isBlocked
}