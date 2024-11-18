const mongoose=require("mongoose");
const mn=new mongoose.Schema({
    Title:String
});
module.exports=mongoose.model("Mn",mn);