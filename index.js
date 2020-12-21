const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const mongoose = require("mongoose");

const createRoutes = require("./router");
//const userMiddleware = require("./middleware/user");

require("dotenv").config();

require("./models");

const app = express();
app.use(bodyParser.json());
app.use(cors());
//app.use(userMiddleware);

createRoutes(app);

const PORT = process.env.PORT || 27017;

async function start() {
  try {
    const dbUrl = `mongodb://localhost:27017`;

    await mongoose.connect(dbUrl, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
      dbName: "test-base",
    });

    app.listen(PORT, () => {
      console.log("Start");
    });
  } catch (e) {
    console.log(e);
  }
}

start();
