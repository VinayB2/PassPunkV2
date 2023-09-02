const express = require("express");
const app = express();
const path = require("path");
const fs = require("fs");
const QrCode = require("qrcode");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const multer = require("multer");
const Register = require("./models/registers");
const ejs = require("ejs");
const appRouter = require("./routes/appRoutes");
app.use(express.static(__dirname + "/public"));
app.use(bodyParser.urlencoded({ extended: true }));

require("./db/conn");

require("dotenv").config();
app.set("view engine", "ejs");
let port = process.env.PORT || 3000;

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.use("/",appRouter);



app.listen(port, (console.log(`Server running on port ${port}`)));