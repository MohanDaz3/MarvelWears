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
        console.log(error.message);
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
        
    }
}

module.exports = {
    isLoggedIn,
    isLoggedOut
}