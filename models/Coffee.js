const mongoose = require('mongoose')

const coffeeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true },
  quantity: { type: Number, default: 0 },
  image: { type: String, default: "/images/images/default_coffee.png" }
}, { versionKey: false, collection: 'coffee' }); 
// Specify 'coffee' explicitly if not pluralized, sometimes 'coffees'?
// Exclude __v field

module.exports = mongoose.model('Coffee', coffeeSchema);


