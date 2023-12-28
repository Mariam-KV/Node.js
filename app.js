const express = require("express");
const app = express();
const httpError = require("./models/http-error");
const routesPlace = require("./routes/places");
const routesUser = require("./routes/users");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
app.use(bodyParser.json());
app.use((req, res, next) => {
  // we just add certain headers to the response so that when later a response is sent back from our more specific routes, it does have these headers attached.

  //1 header
  res.setHeader(
    "Access-Control-Allow-Origin",
    //2 value ->  controls which domains should have access
    "*"
  );
  // 2 header =>  which headers incoming requests may have so that they are handled.
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept,Authorization"
  );
  // 3 header => controls which HTTP methods may be used on the front end.
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PATCH,DELETE");
  next();
});

app.use("/api/places", routesPlace);
app.use("/api/users", routesUser);
//this middleware is only reached if we have some request
//which didn't get a response before.
app.use((req, res, next) => {
  const error = new httpError("could not find this route", 404);
  throw error;
});
app.use((error, req, res, next) => {
  //we check if response has been already sent (we can have only 1 response)
  if (res.headerSent) {
    return next(error);
  }
  //send response
  res.status(error.code || 500);
  res.json({ message: error.message } || "Something went wrong!");
});
mongoose
  .connect(
    "mongodb+srv://marikanik1999:marikanik1999@marikanik1999.rkm1dfu.mongodb.net/mern?retryWrites=true&w=majority"
  )
  .then(() => app.listen(5000))
  .catch((err) => console.log("Connection failed!", err));
