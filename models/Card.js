const {Schema , model} = require("mongoose")

const CardSchema = new Schema({
  title: {type: String, required: true},
  price: {type: Number, required: true},
  weight: {type: String, required: true},
  description: {type: String, required: true},
})

module.exports = model("Card", CardSchema)