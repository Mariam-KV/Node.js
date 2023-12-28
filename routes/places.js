const express = require("express");
const { check } = require("express-validator");
const router = express.Router();
const httpError = require("../models/http-error");
const {
  places,
  patchPlace,
  deletePlace,
  createPlace,
} = require("../controllers/places");
router.get(`/:placeId`, places);

router.post(
  "/",
  check("title").not().isEmpty(),

  createPlace
);

router.patch(
  "/:placeId",
  check("title").not().isEmpty(),

  patchPlace
);
router.delete("/:placeId", deletePlace);
module.exports = router;
