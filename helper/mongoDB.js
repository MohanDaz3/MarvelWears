const mongoose =require('mongoose')

async function connectToDataBase() {
    mongoose
      .connect(process.env.dbconnect, { useNewUrlParser: true })
      .then(() => {
        console.log("MongoDB Connected");
      })
      .catch(() => {
        console.log("Failed to connect MongoDB");
      });
  }

module.exports = connectToDataBase