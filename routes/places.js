const express = require("express");
const { check } = require("express-validator");
const checkAuth = require("../middleware/check-auth");
const router = express.Router();
const fileUpload = require("../middleware/file-upload");
const {
  places,
  patchPlace,
  deletePlace,
  createPlace,
} = require("../controllers/places");
router.get(`/:placeId`, places);
//All requests after this middleware without a valid token will never reach the bottom roots here because it will always be handled by this middleware.
router.use(checkAuth);
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
