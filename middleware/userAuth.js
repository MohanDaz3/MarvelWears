const user = require('../models/userModel')
const users = require('../controller/userController')

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
const isBlocked = async (req, res, next) => {
    try {
      const userdata = await user.findOne({ _id: req.session.userid });
      if (userdata&&userdata.block==1) {
        req.session.destroy();
        res.redirect('/');
      } else {
        next();
      }
    } catch (error) {
      res.render('error', { error: error.message });
    }
  };
  

module.exports = {
    isLoggedIn,
    isLoggedOut,
    isBlocked
}