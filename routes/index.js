const path = require("path");

const constructorMethod = app => {

  app.get("*", (req, res) => {
    res.render("layouts/main");
  });
};

module.exports = constructorMethod;
