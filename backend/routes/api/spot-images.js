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

const { check, body, validationResult } = require("express-validator");
const { handleValidationErrors } = require("../../utils/validation");

const router = express.Router();

//Delete a Spot Image
router.delete("/:imageId", requireAuth, async (req, res, next) => {
  const spotImage = await SpotImage.findByPk(req.params.imageId, {
    include: [
      {
        model: Spot,
        where: { ownerId: req.user.id },
      },
    ],
  });

  // Checks if SpotImage belongs to the current User's Spot
  if (!spotImage || !spotImage.Spot) {
    return res.json({
      message:
        "SpotImage not found or not associated with the current user's Spot",
    });
  }

  await spotImage.destroy();

  return res.json({
    message: "Successfully deleted",
  });
});

module.exports = router;
