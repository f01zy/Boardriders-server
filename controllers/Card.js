const CardService = require("../service/Card")

class CardController {
  async create(req, res, next) {
    try {
      const {title, price, weight, description} = req.body
      const card = await CardService.create(title, price, weight, description)

      return res.json(card)
    } catch (e) {
      next(e)
    }
  }

  async get(req, res, next) {
    try {
      const cards = await CardService.get()

      return res.json(cards)
    } catch (e) {
      next(e)
    }
  }
}

module.exports = new CardController()