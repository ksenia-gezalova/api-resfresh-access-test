const fs = require("fs");
const files = fs
  .readdirSync(__dirname)
  .filter((file) => !file.startsWith("index.") && !file.startsWith("notready."))
  .map((file) => file.split(".")[0]);

const createRouter = (app) => {
  files.forEach((name) => {
    app.use(`/${name}`, require(`./${name}`));
  });
};

module.exports = createRouter;
