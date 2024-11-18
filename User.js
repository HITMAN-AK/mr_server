const mongoose=require("mongoose");
const us=new mongoose.Schema({
    name:String,
    uname:String,
    pass:String,
    scode:Number,
    uuid:{type:Number,default:123456},
});
module.exports=mongoose.model("User",us);
