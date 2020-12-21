const { Schema, model } = require("mongoose");

const userTokenScheme = new Schema({
  token: {
    type: String,
    required: true,
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
});

module.exports = model("UserToken", userTokenScheme);
