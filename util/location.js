const API_KEY = process.env.GOOGLE_API_KEY;
const httpError = require("../models/http-error");
async function getCoordsForAdress(address) {
  const res = await fetch(
    `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
      address
    )}&key=${API_KEY}`
  );

  const data = await res.json();
  if (!data || data.status === "ZERO_REZULTS") {
    throw new httpError("Couldn't find a location", 422);
  }
  const coordinates = data.results[0].geometry.location;
  return coordinates;
}

module.exports = getCoordsForAdress;
