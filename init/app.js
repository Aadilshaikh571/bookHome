const mongoose = require("mongoose");
const initData = require("./data");
const place = require("../models/places");


mongoose
  .connect("mongodb://127.0.0.1:27017/bookHome")
  .then(() => console.log("Connected!"))
  .catch((err) => {
    console.log(`error ${err}`);
  });


 const initDb = async()=>{
   await place.deleteMany({});
   initData.data= initData.data.map((obj)=>({
    ...obj, owner:"667805024b2f2279be3ae400",
   }));
   await place.insertMany(initData.data);
   console.log("data inserted");

 } 

 initDb();