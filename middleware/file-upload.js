const multer = require("multer");
const uuid = require("uuid");
const TYPE_MAP = {
  "image/png": "png",
  "image/jpeg": "jpeg",
  "image/jpg": "jpg",
};
//we execute it as a function ,a function to which we can pass a configuration object.
//fileUpload -> a group of middlewares
const fileUpload = multer({
  //generates a storage
  storage: multer.diskStorage({
    //where to store
    destination: (req, file, cb) => {
      cb(
        null,
        //path where i want to store it
        "uploads/images"
      );
    },
    filename: (req, file, cb) => {
      //gives us the type of a filess
      const ext = TYPE_MAP[file.mimetype];
      cb(
        //error argument , we don't have any so -> null
        null,
        //generates a random id
        uuid.v4() + "." + ext
      );
    },
  }),

  //set limit of kilobytes
  limits: 50000,
  //which file except(we can't rely on frontend validation)
  fileFilter: (req, file, cb) => {
    const isValid = TYPE_MAP[file.mimetype];
    console.log(isValid);
    let error = isValid ? null : new Error("Invalid mime type!");
    cb(error, isValid);
  },
});

module.exports = fileUpload;
