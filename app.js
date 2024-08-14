"use strict";
const express = require("express");
const logger = require("./lib/logger");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const routes = require("./lib/routes");
const expressWinston = require("express-winston");
const app = express();
const cors = require("cors");

function connectMongoose() {
  const mongoose = require("mongoose");
  mongoose.Promise = Promise;
  return mongoose.connect(
    `mongodb+srv://pedroloria003:PkPetPP6iSwDMYoy@cluster0.4lqoi6f.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`
    //
  );
}

function initialize() {
  app.use(
    expressWinston.logger({
      winstonInstance: logger,
      expressFormat: true,
      colorize: false,
      meta: false,
      statusLevels: true,
    })
  );
  app.use(cors());
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(cookieParser());

  Object.keys(routes).forEach((key) => {
    app.use("/api", routes[key]);
  });

  app.use(function (req, res, next) {
    let err = new Error("Not Found");
    err.status = 404;
    next(err);
  });

  app.use(function (err, req, res, next) {
    if (res.headersSent) {
      return next(err);
    }
    let error = {};
    error.status = err.status;
    if (req.app.get("env") === "development") {
      error.message = err.message;
      error.stack = err.stack;
    }
    return res.status(err.status || 500).json({
      error,
    });
  });

  return app;
}

module.exports = {
  initialize,
  connectMongoose,
};
