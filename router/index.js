const Router = require("express").Router
const router = new Router()
const {body} = require("express-validator")
const UserController = require("../controllers/User")

// User router

router.post("/register",
  body("username").isLength({min: 3, max: 10}),
  body("email").isEmail(),
  body("password").isLength({min: 6, max: 20}),
  UserController.register
)
router.post("/login", UserController.login)
router.post("/logout", UserController.logout)
router.post("/edit/data", UserController.editData)
router.get("/activate/:link", UserController.activate)
router.get("/refresh", UserController.refresh)

module.exports = router