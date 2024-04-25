function forbid(res) {
  return res.status(403).json({
    message: "Forbidden",
  });
}

function deleted(res) {
  return res.status(200).json({
    message: "Successfully deleted",
  });
}

function noSpot(res) {
  return res.status(404).json({
    message: "Spot couldn't be found",
  });
}

function noReview(res) {
  return res.status(404).json({ message: "Review could not be found" });
}

function noBooking(res) {
  return res.status(404).json({ message: "Booking couldn't be found" });
}

function formatDate(dateTimeString) {
  const date = new Date(dateTimeString);

  // Adjust to Pacific Standard Time (PST) by subtracting 7 hours (in milliseconds)
  const pstDate = new Date(date.getTime() - 7 * 60 * 60 * 1000);

  const year = pstDate.getFullYear();
  const month = String(pstDate.getMonth() + 1).padStart(2, "0");
  const day = String(pstDate.getDate()).padStart(2, "0");
  const hours = String(pstDate.getHours()).padStart(2, "0");
  const minutes = String(pstDate.getMinutes()).padStart(2, "0");
  const seconds = String(pstDate.getSeconds()).padStart(2, "0");

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

function isNumericInRange(value, min, max) {
  if (isNaN(value)) {
    return false; // Not a number
  }
  const numericValue = parseFloat(value);
  return numericValue >= min && numericValue <= max;
}

function setDefaultValues(req, res, next) {
  req.query.page = req.query.page || 1; // Default value for page parameter
  req.query.size = req.query.size || 20; // Default value for size parameter
  next(); // Call the next middleware or route handler
}

module.exports = {
  forbidden: forbid,
  formatDate: formatDate,
  isNumericInRange: isNumericInRange,
  setDefaultValues: setDefaultValues,
  deleted: deleted,
  noSpot: noSpot,
  noReview: noReview,
  noBooking: noBooking
};
