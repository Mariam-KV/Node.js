const express = require("express");
const { check } = require("express-validator");
const router = express.Router();
const {
  getusers,
  signup,
  login,
  getByUserId,
} = require("../controllers/users");
router.get("/", getusers);
router.get("/id/:userID", getByUserId);
router.post(
  "/signup",
  check("email").isEmail(),
  // check("password").isStrongPassword(),
  signup
);
router.post("/login", login);

module.exports = router;
