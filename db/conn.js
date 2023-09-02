const mongoose = require("mongoose");
uri = "mongodb+srv://vinay:JEEvinayB@cluster0.qzoqgmi.mongodb.net/?retryWrites=true&w=majority";
// const uri = 'mongodb://127.0.0.1:27017/PassUsers'
mongoose.connect(uri,{
    useNewUrlParser:true,
    useUnifiedTopology:true
}).then(()=>{
    console.log("connection succcesful");
}).catch(err => {console.log(err)});