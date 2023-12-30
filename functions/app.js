const express = require("express");
const app = express();
const serverless = require("serverless-http");
const httpError = require("../models/http-error");
const routesPlace = require("../routes/places");
const routesUser = require("../routes/users");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");

app.use(bodyParser.json());

app.use("/uploads/images", express.static(path.join("uploads", "images")));

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE");
  next();
});

app.use("/api/places", routesPlace);
app.use("/api/users", routesUser);

app.use((req, res, next) => {
  const error = new httpError("Could not find this route", 404);
  throw error;
});

app.use((error, req, res, next) => {
  if (req.file) {
    fs.unlink(req.file.path, (err) => {
      console.log(err);
    });
  }

  if (res.headersSent) {
    return next(error);
  }

  res.status(error.code || 500);
  res.json({ message: error.message || "Something went wrong!" });
});

mongoose
  .connect(
    `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@marikanik1999.rkm1dfu.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`
  )
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(5000, () => {
      console.log("Server started on port 5000");
    });
  })
  .catch((err) => console.log("Connection failed!", err));

// Combine routesPlace and routesUser into a single router
const combinedRouter = express.Router();
combinedRouter.use("/router1", routesPlace);
combinedRouter.use("/router2", routesUser);

// Mount combinedRouter on a base path
app.use("/.netlify/functions/app", combinedRouter);

// Export as a serverless function
module.exports.handler = serverless(app);
