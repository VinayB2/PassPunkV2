const express = require("express");
const app = express();
const path = require("path");
const QrCode = require("qrcode");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const Register = require("../models/registers");
const ejs = require("ejs");
app.use(express.static(__dirname + "/public"));
app.use(bodyParser.urlencoded({ extended: true }));


module.exports = ({
    home: (req, res) => {
        res.render("index");
    },

    registerGet: (req, res) => {
        res.render("register");
    },

    viewPassGet: (req, res) => {
        res.render("viewPass");
    },

    verifyPassGet: (req, res) => {
        res.render("qrScanner");
    },

    admin: (req, res) => {
        res.render("admin");
    },
    viewContact:(req,res)=>{
        res.render("contact");
    },


    authorizeUserPost: async (req, res) => {
        const key = req.body.secret;
        if (key !== process.env.SECRET_KEY) {
            res.render('pop', {
                title: "Key error",
                message: "Please enter correct key",
                route: "/admin"
            });
            return;
        }
        const phn = req.body.phn;
        try {
            const Document = await Register.findOne({ phone: phn });
            if (!Document) {
                res.render('pop', {
                    title: "No data found",
                    message: "The pass you are trying to authorize is not yet registered",
                    route: "/admin"
                });
                return;
            }
            else {
                const now = new Date().getTime();
                var doc = Register.findOneAndUpdate({ phone: phn }, {
                    isRegistered: true,
                    createdDate: now
                }).then(data => {
                    res.render("verificationTrue", {
                        title: "Verification Successful",
                        message: "Valid User",
                        route: "/admin"
                    });
                }).catch(e => {
                    res.render('pop', {
                        title: "- 500 -",
                        message: "Internal Server error, please try again after some time",
                        route: "/"
                    });
                });
            }
        } catch (err) {
            res.render('pop', {
                title: "- 500 -",
                message: "Internal Server error, please try again after some time",
                route: "/"
            });
        }
    },

    registerPost: async (req, res) => {
        try {
            const date = new Date().getTime();
            const passHolder = new Register({
                _id: new mongoose.Types.ObjectId(),
                name: req.body.name,
                email: req.body.email,
                phone: req.body.phone,
                address: req.body.address,
                pin: req.body.pin,
                isRegistered: false,
                createdDate: date,
                image: req.file.buffer,
                plan:req.body.rad
            });
            let plan = req.body.rad;
            let payImg;
            if(plan === "Silver"){
                payImg = "./images/silverQR.png";
            }else if(plan === "Gold"){
                payImg = "./images/goldQR.jpeg";
            }else{
                payImg = "./images/diamondQR.jpeg";
            }
            await passHolder.save();
            res.render("payQr",{qrImage:payImg});
        }
        catch (err) {
            console.log(err);
            res.render('pop', {
                title: "- 500 -",
                message: "Internal Server error, please try again after some time",
                route: "/"
            });
        }
    },

    viewPassPost: async (req, res) => {
        const phn = req.body.phone;
        try {
            const Document = await Register.findOne({ phone: phn });
            if (!Document) {
                res.render('pop', {
                    title: "You pass was not found",
                    message: "Please register for the bus pass, if you have already registered, then please check after some time",
                    route: "/register"
                });
                return;
            }
            if (Document.isRegistered === false) {
                res.render('pop', {
                    title: "Payment issue",
                    message: "Please complete your payment process, if done then please wait untill your pass gets authorized",
                    route: "/view"
                });
                return;
            }
            if (Document.pin !== req.body.pin) {
                res.render('pop', {
                    title: "Invalid Pin",
                    message: "Please enter correct pin",
                    route: "/view"
                });
                return;
            }
            else {
                let plan = Document.plan;
                let planImg;
                if(plan === "Silver"){
                    var date = Document.createdDate + 600000;
                    planImg = "./images/silver.png";
                }else if(plan === "Gold"){
                    var date = Document.createdDate + 1200000;
                    planImg = "./images/gold.png";
                }else{
                    var date = Document.createdDate + 1800000;
                    planImg = "./images/diamond.png";
                }
                var present = new Date().getTime();
                if (date < present) {
                    await Register.findOneAndDelete({ phone: phn });
                    res.render('pop', {
                        title: "Pass Expired",
                        message: "Your Pass has been expired, Please register again to avail servses",
                        route: "/register"
                    });
                }
                const imageData = Document.image.toString('base64');
                QrCode.toFile(path.join(__dirname, "../public/images/qrcode.png"), phn, (err) => {
                    if (err) throw err;
                });
                res.render('IDCardNew', {
                    holderName: Document.name,
                    phoneNo: Document.phone,
                    holderAddress: Document.address,
                    imageData: Document.image.toString('base64'),
                    holderEmail: Document.email,
                    plan:planImg
                });
            }
        } catch (err) {
            res.render('pop', {
                title: "- 500 -",
                message: "Internal Server error, please try again after some time",
                route: "/"
            });
        }
    },

    verifyPassPost: async (req, res) => {
        const phn = req.body.data;
        try {
            const Document = await Register.findOne({ phone: phn });
            if (!Document) {
                res.render("verificationFalse");
            }
            else {
                if(Document.plan === "Silver"){
                    var date = Document.createdDate + 600000;
                }else if(Document.plan === "Gold"){
                    var date = Document.createdDate + 1200000;
                }else{
                    var date = Document.createdDate + 1800000;
                }
                var present = new Date().getTime();
                if (date < present) {
                    await Register.findOneAndDelete({ phone: phn });
                    res.render('pop', {
                        title: "Pass Expired",
                        message: "Your Pass has been expired, Please register again to avail servses",
                        route: "/register"
                    });
                }
                res.render("verificationTrue", {
                    title: "Verification Successful",
                    message: "Valid User",
                    plan: Document.plan,
                    route: "/verifyPass"
                });
            }
        } catch (err) {
            res.render('pop', {
                title: "- 500 -",
                message: "Internal Server error, please try again after some time",
                route: "/"
            });
        }
    }

});