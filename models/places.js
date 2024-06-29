const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const review = require("./review")
const placeSchema = new Schema({
  title: String,
  description: String,
  image:{
    url:String,
    filename:String,
  },
  price: Number,
  location: String,
  country: String,
  reviews:[
    {
      type: Schema.Types.ObjectId,
      ref:"Review"
    }
  ],
  owner:{
    type:Schema.Types.ObjectId,
    ref:"User"
  },
  geometry:{
    type: {
    type: String, // Don't do `{ location: { type: String } }`
    enum: ['Point'], // 'location.type' must be 'Point'
    
  },
  coordinates: {
    type: [Number],
   
    required: true
  }
}
});

placeSchema.post("findOneAndDelete",async(req,res)=>{
  if(place){
    await review.deleteMany({_id:{$in:place.reviews}});

  }
});

const place = mongoose.model("Place", placeSchema);
module.exports = place;
