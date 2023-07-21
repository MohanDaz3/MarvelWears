const express=require("express")
const app=express()
const session = require("express-session")
const nocache = require("nocache")
require("dotenv").config();

const port=process.env.PORT||3000

const connectDB = require('./helper/mongoDB')
const collection = require('./models/userModel')

connectDB();
app.use(nocache())

app.use(session({
  secret:'secret',
  resave:true,
  saveUninitialized:true
}))



// user path

const userRouter = require("./routers/userRouter")
app.use('/',userRouter)

const adminRouter = require("./routers/adminRouter")
app.use('/admin',adminRouter)


app.listen(port,()=>{
    console.log(`server started:http://localhost:${port}`);
  })