const Admin = require('../models/adminModel')

const isLoggedIn = (req,res,next)=>{
    try {
        if(req.session.loggedIn){
            res.redirect('/admin/dashboard')
        }else{
            next()
        }
    } catch (error) {
        console.log(error.message);
    }
}


module.exports={
    isLoggedIn,
}