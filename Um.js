const mongoose=require("mongoose");
const um=new mongoose.Schema({
    uname:String,
    ml:[String]
})
module.exports=mongoose.model("Um",um);