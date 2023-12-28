const httpError = require("../models/http-error");
const getCoordsForAdress = require("../util/location");
const { validationResult } = require("express-validator");
const Place = require("../models/place");
const User = require("../models/user");
const mongoose = require("mongoose");
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

  res.json({ place: place.toObject({ getters: true }) });
};
const deletePlacesById = async (req, res, next) => {
  const placeId = req.params.placeId;
  let place;
  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    place = await Place.findByIdAndDelete(placeId).populate("creator");

    //pull will remove an id
    let creator = place.creator;
    creator.places.pull(place);
    await creator.save({ session: sess });
    await sess.commitTransaction();
  } catch (err) {
    return next(
      new httpError("Something went wrong, couldn't delete place. ", 500)
    );
  }
  if (!place) return next(new httpError("Couldn't find a place ", 500));
  res.json("place was deleted");
};
const createPlace = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new httpError("invalid input", 422));
  }
  const { title, description, creator, address } = req.body;

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
    image:
      "data:image/jpeg;base64,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",
    creator,
  });
  let user;
  try {
    //if id of user is existed
    user = await User.findById(creator);
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
