const fs = require("fs");
const files = fs
  .readdirSync(__dirname)
  .filter(
    (file) => !file.startsWith("index.") && !file.startsWith("notready.")
  );

files.forEach((model) => require(`./${model}`));
