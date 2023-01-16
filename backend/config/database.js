const mongoose = require("mongoose");
const connectDB = async (req, res) => {
  try {
    const conn =new mongoose.connect(process.env.MONGO_URL);
  } catch (err) {
    console.log(err);
    process.exit(1);
  }
};
module.exports = { connectDB };
