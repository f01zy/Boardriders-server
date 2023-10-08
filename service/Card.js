const CardSchema = require("../models/Card")

class CardService {
  async create(title, price, weight, description) {
    const card = await CardSchema.create({title, price, weight, description})
    
    return card
  }

  async get() {
    const cards = await CardSchema.find()

    return cards
  }
}

module.exports = new CardService()