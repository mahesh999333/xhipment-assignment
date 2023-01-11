const express = require("express");
const mongoose = require("mongoose");
const route = require("./route/route");
const app = express();
const bodyParser = require('body-parser');
const multer = require('multer');
require("dotenv").config();


app.use(express.json());


app.use(express.json()) 
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/uploads', express.static('uplaods'))
app.use(multer().any());
// mongoDb connection
mongoose
  .connect(
    process.env.MONGODB_URL,
    {
      useNewUrlParser: true,
    }
  )
  .then(() => console.log("MongoDb connected"))
  .catch((err) => console.log(err));

  
app.use("/", route);


app.listen(process.env.PORT, function () {
  console.log("Express app running on port " + (process.env.PORT));
});