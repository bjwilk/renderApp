// backend/routes/api/spot-images.js
const express = require("express");
const { Op } = require("sequelize");
const bcrypt = require("bcryptjs");

const {
  setTokenCookie,
  restoreUser,
  requireAuth,
} = require("../../utils/auth");
const { User, Spot, SpotImage } = require("../../db/models");
const { forbidden, deleted } = require("../../utils/helperFunctions");

const { check, body, validationResult } = require("express-validator");

const router = express.Router();

//Delete a Spot Image by id
router.delete("/:imageId", requireAuth, async (req, res, next) => {
  const spotImage = await SpotImage.findByPk(req.params.imageId, {
    include: [
      {
        model: Spot,
      },
    ],
  });

  // Checks if SpotImage belongs to the current User's Spot
  if (!spotImage) {
    return res.status(404).json({
      message: "SpotImage not found",
    });
  }

  // Checks for authorization
  if (spotImage.Spot.ownerId !== req.user.id) {
    return forbidden(res);
  }

  await spotImage.destroy();

  return deleted(res);
});

module.exports = router;
