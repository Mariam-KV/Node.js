const express = require("express");
const { check } = require("express-validator");

const router = express.Router();
const fileUpload = require("../middleware/file-upload");
const {
  places,
  patchPlace,
  deletePlace,
  createPlace,
} = require("../controllers/places");
router.get(`/:placeId`, places);

router.post(
  "/",
  fileUpload.single("image"),
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
