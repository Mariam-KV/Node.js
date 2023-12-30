const httpError = require("../models/http-error");
const getCoordsForAdress = require("../util/location");
const { validationResult } = require("express-validator");
const Place = require("../models/place");
const User = require("../models/user");
const mongoose = require("mongoose");
const fs = require("fs");
const getPlacesById = async (req, res, next) => {
  const placeId = req.params.placeId;
  //doesn't return a promise
  let place;

  try {
    place = await Place.findById(placeId);
  } catch (err) {
    return next(new httpError("Couldn't find a place", 500));
  }
  if (!place) {
    return next(new httpError("Couldn't find a place", 500));
  }
  //convert to normal JS object
  res.json({ place: place.toObject({ getters: true }) });
};

const patchPlacesById = async (req, res, next) => {
  const errors = validationResult(req);
  const { title, description } = req.body;
  if (!errors.isEmpty()) {
    return next(new httpError("invalid input on patch ", 422));
  }
  const placeId = req.params.placeId;
  let place;
  try {
    place = await Place.findById(placeId);
    place.title = title;
    place.description = description;
    place.save();
  } catch (err) {
    return next(new httpError("Couldn't update a place", 500));
  }

  if (place.creator.toString() !== req.userData.userId) {
    return next(new httpError("You're not allowed to update this place", 401));
  }
  res.json({ place: place.toObject({ getters: true }) });
};
const deletePlacesById = async (req, res, next) => {
  const placeId = req.params.placeId;
  let place;
  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    place = await Place.findById(placeId).populate("creator");
    let creator = place.creator;

    if (creator.id.toString() !== req.userData.userId) {
      return next(
        new httpError("You're not allowed to delete this place", 401)
      );
    }
    //pull will remove an id
    place = await Place.findByIdAndDelete(placeId).populate("creator");
    creator.places.pull(place);
    await creator.save({ session: sess });
    await sess.commitTransaction();
  } catch (err) {
    return next(
      new httpError("Something went wrong, couldn't delete place. ", 500)
    );
  }

  if (!place) return next(new httpError("Couldn't find a place ", 500));
  fs.unlink(place.image, (err) => {});
  res.json("place was deleted");
};
const createPlace = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new httpError("invalid input", 422));
  }
  const { title, description, address } = req.body;

  let coordinates;
  try {
    coordinates = await getCoordsForAdress(address);
  } catch (error) {
    return next(error);
  }

  const createdPlace = new Place({
    title,
    description,
    location: coordinates,
    address,
    image: req.file.path,
    creator: req.userData.userId,
  });
  let user;
  try {
    //if id of user is existed
    user = await User.findById(req.userData.userId);
  } catch {
    const error = new httpError(
      "Creating place failed ,please try again.",
      500
    );
    return next(error);
  }
  if (!user) {
    return next(new httpError("Couldn't find user for provided ID .", 500));
  }
  try {
    //this session starts when we want to create a new place
    const currentSession = await mongoose.startSession();
    // on our current session we will start a transaction
    currentSession.startTransaction();
    await createdPlace.save({ session: currentSession });
    await createdPlace.save();
    //make sure that the place ID is also added to our user,
    //push it mongoose's specific method -> establish the connection between the two models we are referring to here.
    //we add createdPlace to user
    user.places.push(createdPlace);
    //save  updated user (also need to add ref to session )
    await user.save({ session: currentSession });
    //finish session
    await currentSession.commitTransaction();
  } catch {
    const error = new httpError(
      "Creating place failed ,please try again.",
      500
    );
    return next(error);
  }

  res.status(201).json({ place: createdPlace });
};

module.exports = {
  places: getPlacesById,
  patchPlace: patchPlacesById,
  deletePlace: deletePlacesById,

  createPlace: createPlace,
};
