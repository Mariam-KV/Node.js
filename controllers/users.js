const httpError = require("../models/http-error");
const { validationResult } = require("express-validator");
const User = require("../models/user");
const mongoose = require("mongoose");
const getUsers = async (req, res, next) => {
  let users;
  try {
    users = await User.find({}, "-password");
    if (!users.length > 0) next(new httpError("Users didn't find", 400));
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
    user = new User({
      name,
      email,
      password,
      image:
        "data:image/jpeg;base64,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",
      places: [],
    });
    user.save();
  } catch {
    return next(new httpError("User can't be created!", 404));
  }

  res.status(200).json({ user: user.toObject({ getters: true }) });
};
const loginUser = async (req, res, next) => {
  const { email, password } = req.body;
  let checkUser;
  try {
    checkUser = await User.findOne({ email });
    if (!checkUser || checkUser.password !== password) {
      return next(new httpError("Couldn't login", 404));
    }
  } catch {
    return next(new httpError("Something went wrong!", 404));
  }

  res.status(201).json({ user: checkUser.toObject({ getters: true }) });
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
