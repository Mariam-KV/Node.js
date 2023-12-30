const httpError = require("../models/http-error");
const jwt = require("jsonwebtoken");
const jwtKey = process.env.JWT_KEY;
//a middleware which checks an incoming request for a valid token.
module.exports = (req, res, next) => {
  if (req.method === "OPTIONS") {
    return next();
  }
  try {
    // we should not add token to req.body because get/delete requests don't have body so we can't use token there.
    // headers -> encoding the token in the headers of the incoming request
    //in app.js we're allowing the client to add auth header (in res.setHeader)
    const token = req.headers.authorization.split(" ")[1]; // Authorization : 'Bearer TOKEN'
    if (!token) throw new Error("Authentication  failed!");
    //return string or obejct -> It returns the payload that was encoded into the token.
    const decodedToken = jwt.verify(token, jwtKey);
    // we can always dynamically add data to the request object like this.
    // every request after that will be able to us this userId.
    req.userData = { userId: decodedToken.userId };
    //allow the request to continue its journey so that it is able to reach any other routes thereafter that require authentication.
    next();
  } catch (err) {
    return next(new httpError("Authentication failed!", 401));
  }
};
