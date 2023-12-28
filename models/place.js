const mongoose = require("mongoose");

//creating a schema
const placeSchema = new mongoose.Schema(
  //define the document that we want to store.
  {
    //define the type of property
    title: { type: String, required: true },
    description: { type: String, required: true },
    image: { type: String, required: true },
    address: { type: String, required: true },
    location: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },
    creator: { type: mongoose.Types.ObjectId, required: true, ref: "User" },
  }
);

module.exports = mongoose.model("Place", placeSchema);
