const express = require("express");
const app = express();
const cors = require("cors");
const { errorHandler } = require("./middleware/errorMiddleware");
const dontenv = require("dotenv").config({ path: "backend/config/config.env" });
const { connectDB } = require("./config/database");
const products = require("./routes/productRoute");
const users = require("./routes/userRoute");
const orders = require("./routes/orderRoute");
const cookieParser = require("cookie-parser");
connectDB();
app.use(cookieParser());

app.use(errorHandler);
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("welcome");
});

app.use("/api/products", products);
app.use("/api/users", users);
app.use("/api/orders", orders);
app.listen(process.env.PORT, () => {
  console.log(`Server started on port http://localhost:${process.env.PORT}`);
});
