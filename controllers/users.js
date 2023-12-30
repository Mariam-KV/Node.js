const httpError = require("../models/http-error");
const { validationResult } = require("express-validator");
const User = require("../models/user");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const jwtKey = process.env.JWT_KEY;
const getUsers = async (req, res, next) => {
  let users;
  try {
    users = await User.find({}, "-password");
  } catch (err) {
    return next(new httpError("Something went wrong!", 400));
  }
  res
    .status(200)
    .json({ users: users.map((user) => user.toObject({ getters: true })) });
};
const signupUser = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new httpError("Incorrect email or password", 422);
  }

  const { name, email, password } = req.body;

  let user;
  try {
    let checkUser = await User.findOne({ email });
    if (checkUser) {
      return next(new httpError("This user is already created", 400));
    }

    let hashedPassword;

    try {
      //hash the password
      //hash returns a promise
      hashedPassword = await bcrypt.hash(
        password,
        //salt or the number of salting rounds.(strength of the hash)
        12
      );
    } catch (err) {
      return next(
        new httpError("Could not create user, please try again.", 500)
      );
    }
   
    user = new User({
      name,
      email,
      password: hashedPassword,
      image: req.file.path,
      places: [],
    });
    user.save();
  } catch {
    return next(new httpError("User can't be created!", 404));
  }
  let token;
  try {
    //after we know this is a valid user

    token = jwt.sign(
      // payload of the token.So the data you want to encode into the token.
      { userId: user.id, email: user.email },
      //private key (a string)
      jwtKey,
      //optional argument -> we can configure the token with a JavaScript object where you can set up certain options.
      {
        //expiration time -> GOOD PRACTICE
        expiresIn: "1h",
      }
    );
  } catch (err) {
    return next(
      new httpError("Signing up failed, please try again later.", 500)
    );
  }

  res.status(200).json({ userId: user.id, email: user.email });
};
const loginUser = async (req, res, next) => {
  const { email, password } = req.body;
  let checkUser;

  try {
    checkUser = await User.findOne({ email });
    if (!checkUser) {
      return next(new httpError("Couldn't login", 404));
    }
  } catch {
    return next(new httpError("Something went wrong!", 404));
  }

  let isValidPassword = false;
  try {
    isValidPassword = await bcrypt.compare(
      //plain text password (in log in )
      password,
      // hash password that was stored when we signed up
      checkUser.password
    );
  } catch (err) {
    return next(
      new httpError(
        "Could not log you in, please check your credentials and try again."
      )
    );
  }
  if (!isValidPassword) {
    return next(new httpError("Invalid credentials, could not log you in."));
  }
  let token;
  try {
    //after we know this is a valid user

    token = jwt.sign(
      // payload of the token.So the data you want to encode into the token.
      { userId: checkUser.id, email: checkUser.email },
      //private key (a string)
      jwtKey,
      //optional argument -> we can configure the token with a JavaScript object where you can set up certain options.
      {
        //expiration time -> GOOD PRACTICE
        expiresIn: "1h",
      }
    );
  } catch (err) {
   
    return next(
      new httpError("Logging in failed, please try again later.", 500)
    );
  }
  res
    .status(200)
    .json({ userId: checkUser.id, email: checkUser.email, token: token });
};
const getPlacesByUserId = async (req, res, next) => {
  const userId = req.params.userID;
  let user;
  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    user = await User.findById(userId).populate("places");
    await sess.commitTransaction();

    if (!user || user.places.length === 0) {
      return next(new httpError("Places in this user doesn't found", 404));
    }
  } catch (err) {
    return next(new httpError("User doesn't found ", 404));
  }

  res.status(200).json({ places: user.places.map((place) => place) });
};
module.exports = {
  getusers: getUsers,
  signup: signupUser,
  login: loginUser,
  getByUserId: getPlacesByUserId,
};
