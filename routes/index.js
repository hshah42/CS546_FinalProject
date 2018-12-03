const path = require("path");

const constructorMethod = app => {
  
  app.get("/home", (req, res) => {
    res.render("layouts/main");
  });

  app.get("/login", (req, res) => {
    res.render("layouts/login");
  });

  app.get("/createEvents", (req, res) => {
    res.render("layouts/createEvents");
  });

  app.get("/signup", (req, res) => {
    res.render("layouts/signup");
  });

  app.get("/myprofile", (req, res) => {
    res.render("layouts/profile");
  });

  app.get("/event", (req, res) => {
    res.render("layouts/event");
  });

  app.get("/events", (req, res) => {
    res.render("layouts/events");
  });
};

module.exports = constructorMethod;
