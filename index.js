require("dotenv").config()
const express = require("express")
const app = express()
const cookieParser = require("cookie-parser")
const cors = require("cors")
const mongoose = require("mongoose")
const router = require("./router")
const errMiddleware = require("./middlewares/Error")

app.use(express.json())
app.use(cookieParser())
app.use(cors({
  credentials: true,
  origin: process.env.CLIENT_URL
}))
app.use("/api", router)
app.use(errMiddleware)

const PORT = process.env.PORT || 3000

const start = async () => {
  try {
    await mongoose.connect(process.env.DATABASE, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })

    app.listen(PORT, () => {
      console.log(`app started in ${PORT} port`);
    })
  } catch (e) {
    console.log(e);
  }
}

start()