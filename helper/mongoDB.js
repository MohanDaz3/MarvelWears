const mongoose =require('mongoose')

async function connectToDataBase() {
    mongoose
      .connect(process.env.DB_CONNECT, { useNewUrlParser: true })
      .then(() => {
        console.log("MongoDB Connected");
      })
      .catch(() => {
        console.log("Failed to connect MongoDB");
      });
  }

module.exports = connectToDataBase