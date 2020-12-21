const { Router } = require("express");
const User = require("../models/user");
const UserToken = require("../models/userToken");

const bcrypt = require("bcryptjs");
const TokenService = require("../tokenService");

const saltRounds = process.env.SALT_ROUNDS;

const router = Router();

router.post("/register", async (req, res) => {
  try {
    const candidate = await User.findOne({ email: req.body.email });
    if (!candidate) {
      const hashPassword = await bcrypt.hash(
        req.body.password,
        parseInt(saltRounds)
      );

      const user = new User({
        login: req.body.login,
        email: req.body.email,
        password: hashPassword,
      });
      await user.save();
      res.status(201).json({
        id: user._id,
        login: user.login,
        email: user.email,
      });
    } else {
      res.status(400).json({
        error: "This email address has already been used",
      });
    }
  } catch (e) {
    console.log(e);
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const candidate = await User.findOne({ email });

    if (candidate) {
      const areSame = await bcrypt.compare(password, candidate.password);

      if (areSame) {
        const refreshToken = await TokenService.generateRefreshToken();
        const token = await TokenService.generateAccessToken({
          id: candidate._id,
          refresh_token: refreshToken,
        });

        const hashRefreshToken = await bcrypt.hash(
          refreshToken,
          parseInt(saltRounds)
        );

        const userRefreshToken = new UserToken({
          userId: candidate._id,
          token: hashRefreshToken,
        });

        await userRefreshToken.save();

        return res.status(200).json({
          id: candidate._id,
          login: candidate.login,
          email: candidate.email,
          access_token: token,
          refresh_token: refreshToken,
        });
      } else {
        res.status(403).send({ error: "Wrong password" });
      }
    } else {
      res.status(404).send({ error: "User not found" });
    }
  } catch (e) {
    console.log(e);
  }
});

router.post("/refresh", async (req, res) => {
  try {
    const accessToken =
      req.body.access_token ||
      req.query.access_token ||
      req.headers["access_token"];

    const refreshToken =
      req.body.refresh_token ||
      req.query.refresh_token ||
      req.headers["refresh_token"];

    if (accessToken && refreshToken) {
      let decodedAccess = await TokenService.checkAccessToken(accessToken);

      const refreshTokens = await UserToken.find({ userId: decodedAccess.id });

      let refreshTokenFromDb;
      for (let i in refreshTokens) {
        if (bcrypt.compareSync(refreshToken, refreshTokens[i].token)) {
          refreshTokenFromDb = refreshTokens[i];
        }
      }

      if (!refreshTokenFromDb) {
        return res.status(404).send({
          error: true,
          message: "Token not found",
        });
      }

      const areSame = bcrypt.compare(
        decodedAccess.refresh_token,
        refreshTokenFromDb.token
      );

      if (areSame) {
        const newRefreshToken = await TokenService.generateRefreshToken();
        const newAccesstoken = await TokenService.generateAccessToken({
          id: decodedAccess.id,
          refresh_token: newRefreshToken,
        });

        const hashRefreshToken = await bcrypt.hash(
          refreshToken,
          parseInt(saltRounds)
        );

        await UserToken.findByIdAndDelete(refreshTokenFromDb._id);

        const userRefreshToken = new UserToken({
          userId: decodedAccess.id,
          token: hashRefreshToken,
        });

        await userRefreshToken.save();

        return res.status(200).json({
          access_token: newAccesstoken,
          refresh_token: newRefreshToken,
        });
      } else {
        return res.status(403).send({
          error: true,
          message: "Wrong tokens pair",
        });
      }
    } else {
      return res.status(403).send({
        error: true,
        message: "No token provided.",
      });
    }
  } catch (e) {
    console.log(e);
  }
});

module.exports = router;
