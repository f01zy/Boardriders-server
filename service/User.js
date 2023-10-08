const UserSchema = require("../models/User")
const MailService = require("./Mail")
const TokenService = require("./Token")
const UserDto = require("../dtos/User")

const bcrypt = require("bcrypt")
const uuid = require("uuid")
const ApiError = require("../exceptions/Api")

class UserService {
  async register(username, email, password) {
    const candidate = await UserSchema.findOne({email})

    if(candidate) {
      throw ApiError.BadRequest("Пользователь с таким email уже сушествует")
    }

    const hashPassword = await bcrypt.hash(password, 3)
    const activationLink = uuid.v4()

    const user = await UserSchema.create({username, email, password: hashPassword, activationLink})

    await MailService.sendActivationMail(email, `${process.env.API_URL}/api/activate/${activationLink}`)

    const dto = new UserDto(user)
    const tokens = await TokenService.generateTokens({...dto})
    await TokenService.saveToken(dto.id, tokens.refreshToken)

    return {
      ...tokens,
      user: dto
    }
  }

  async login(email, password) {
    const user = await UserSchema.findOne({email})

    if(!user) {
      throw ApiError.BadRequest("Пользователь с таким email не найден")
    }

    const isPass = await bcrypt.compare(password, user.password)

    if(!isPass) {
      throw ApiError.BadRequest("Неверный пароль")
    }

    const dto = new UserDto(user)
    const tokens = await TokenService.generateTokens({...dto})
    await TokenService.saveToken(dto.id, tokens.refreshToken)

    return {
      ...tokens,
      user: dto
    }
  }

  async logout(refreshToken) {
    const token = await TokenService.removeToken(refreshToken)
    return token
  }

  async activate(activationLink) {
    const user = await UserSchema.findOne({activationLink})

    if(!user) {
      throw ApiError.BadRequest("Неккоректная ссылка активации")
    }

    user.isActivated = true
    await user.save()
  }

  async refresh(refreshToken) {
    if(!refreshToken) {
      throw ApiError.UnauthorizedError()
    }

    const userData = TokenService.validateRefresh(refreshToken)
    const tokenDb = await TokenService.findToken(refreshToken)

    if(!tokenDb || !userData) {
      throw ApiError.UnauthorizedError()
    }

    const user = await UserSchema.findById(userData.id)
    const dto = new UserDto(user)
    const tokens = await TokenService.generateTokens({...dto})
    await TokenService.saveToken(dto.id, tokens.refreshToken)

    return {
      ...tokens,
      user: dto
    }
  }

  async editData(user, username, email) {
    const userData = await UserSchema.findOne({email: user})

    if(!userData) {
      throw ApiError.UnauthorizedError()
    }

    userData.username = username
    userData.email = email
    userData.save()

    const dto = new UserDto(userData)

    return dto
  }

  async editPassword(user, password, newPassword) {
    const userData = await UserSchema.findOne({email: user})

    if(!userData) {
      throw ApiError.UnauthorizedError()
    }

    const isPass = await bcrypt.compare(password, userData.password)

    if(!isPass) {
      throw ApiError.BadRequest("Неверный пароль")
    }

    const hashPassword = await bcrypt.hash(newPassword, 3)

    userData.password = hashPassword
    userData.save()

    const dto = new UserDto(userData)

    return dto
  }
}

module.exports = new UserService()