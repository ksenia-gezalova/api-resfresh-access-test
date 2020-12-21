const jwt = require("jsonwebtoken");

const tokenKey = process.env.TOKEN_KEY;
const refreshTokenKey = process.env.REFRESH_TOKEN_KEY;
const tokenExp = process.env.TOKEN_EXP;
const refreshTokenExp = process.env.REFRESH_TOKEN_EXP;
const algorithm = process.env.JWT_ALGORITHM;

class tokenService {
  constructor() {
    if (tokenService.instance) {
      return tokenService.instance;
    }
    tokenService.instance = this;

    return this;
  }

  async generateAccessToken(obj) {
    let options = { algorithm, expiresIn: tokenExp };
    return jwt.sign(obj, tokenKey, options);
  }

  async generateRefreshToken() {
    let options = { expiresIn: refreshTokenExp };
    return jwt.sign({}, refreshTokenKey, options);
  }

  async checkRefreshToken(token) {
    return jwt.verify(token, refreshTokenKey);
  }

  async checkAccessToken(token, flag = false) {
    let options;
    if (flag) {
      options = { ignoreExpiration: true };
    }
    return jwt.verify(token, tokenKey, options);
  }
}

module.exports = new tokenService();
