// backend/routes/api/review-images.js
const express = require("express");
const { Op } = require("sequelize");
const bcrypt = require("bcryptjs");

const {
  setTokenCookie,
  restoreUser,
  requireAuth,
} = require("../../utils/auth");
const { User, Spot, ReviewImage, Review } = require("../../db/models");

const { check, body, validationResult } = require("express-validator");
const { handleValidationErrors } = require("../../utils/validation");
const { forbidden, deleted} = require("../../utils/helperFunctions");

const router = express.Router();

//Delete a Review Image by id
router.delete("/:imageId", requireAuth, async (req, res, next) => {
  const reviewImage = await ReviewImage.findByPk(req.params.imageId, {
    include: [
      {
        model: Review,
      },
    ],
  });

  // Checks if reviewImage exist
  if (!reviewImage) {
    return res.status(404).json({
      message:
      "Review Image couldn't be found",
    });
  }

  // Checks if authorized
  if(reviewImage.Review.userId !== req.user.id){
    return forbidden(res)
  }

  await reviewImage.destroy();

  return deleted(res)
});

module.exports = router;
