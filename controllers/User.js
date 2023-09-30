const ApiError = require("../exceptions/Api")
const UserService = require("../service/User")
const {validationResult} = require("express-validator")

class UserController {
  async register(req, res, next) {
    try {
      const errors = validationResult(req)

      if(!errors.isEmpty()) {
        return next(ApiError.BadRequest("Ошибка валидации", errors.array()))
      }

      const {email, password} = req.body
      const userData = await UserService.register(email, password)
      res.cookie("refreshToken", userData.refreshToken, {maxAge: 1000 * 60 * 60 * 24 * 30, httpOnly: false})
      return res.json(userData)
    } catch (e) {
      next(e)
    }
  }

  async login(req, res, next) {
    try {
      const {email, password} = req.body
      const userData = await UserService.login(email, password)
      res.cookie("refreshToken", userData.refreshToken, {maxAge: 1000 * 60 * 60 * 24 * 30, httpOnly: false})
      return res.json(userData)
    } catch (e) {
      next(e)
    }
  }

  async logout(req, res, next) {
    try {
      const {refreshToken} = req.cookies
      const token = await UserService.logout(refreshToken)
      res.clearCookie("refreshToken")
      return res.json(token)
    } catch (e) {
      next(e)
    }
  }

  async activate(req, res, next) {
    try {
      const activationLink = req.params.link
      await UserService.activate(activationLink)

      return res.redirect(process.env.CLIENT_URL)
    } catch (e) {
      next(e)
    }
  }

  async refresh(req, res, next) {
    try {
      const {refreshToken} = req.cookies
      const userData = await UserService.refresh(refreshToken)
      res.cookie("refreshToken", userData.refreshToken, {maxAge: 1000 * 60 * 60 * 24 * 30, httpOnly: false})
      return res.json(userData)
    } catch (e) {
      next(e)
    }
  }
}

module.exports = new UserController()