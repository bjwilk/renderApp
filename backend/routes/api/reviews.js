// backend/routes/api/reviews.js
const express = require("express");
const { Op } = require("sequelize");
const bcrypt = require("bcryptjs");

const {
  setTokenCookie,
  restoreUser,
  requireAuth,
} = require("../../utils/auth");
const {
  User,
  Spot,
  Review,
  ReviewImage,
  SpotImage,
} = require("../../db/models");

const { check } = require("express-validator");
const { handleValidationErrors } = require("../../utils/validation");
const { body, validationResult } = require("express-validator");
const {
  forbidden,
  formatDate,
  deleted,
  noReview,
} = require("../../utils/helperFunctions");

const router = express.Router();

// Get all reviews by current user  if userId === req.user.id
router.get("/current", requireAuth, async (req, res, next) => {
  try {
    const userReviews = await Review.findAll({
      where: {
        userId: req.user.id,
      },
      include: [
        {
          model: User,
          attributes: ["id", "firstName", "lastName"],
        },
        {
          model: Spot,
          attributes: [
            "id",
            "ownerId",
            "address",
            "city",
            "state",
            "country",
            "lat",
            "lng",
            "name",
            "price",
          ],
          include: [
            {
              model: SpotImage,
              attributes: ["url"],
              where: {
                preview: true,
              },
              required: false, // Use 'required: false' for a LEFT JOIN to get all spots even if there is no associated preview image
            },
          ],
        },
        {
          model: ReviewImage,
          attributes: ["id", "url"],
          as: "ReviewImages", // Alias for the ReviewImages association
        },
      ],
    });

    const formattedReviews = userReviews.map((review) => {
      // Get the first preview image from the Spot's associated SpotImages
      const previewImage =
        review.Spot && review.Spot.SpotImages.length > 0
          ? review.Spot.SpotImages[0].url
          : null;

      const mappedReviewImages = review.ReviewImages.map((image) => ({
        id: image.id,
        url: image.url,
      }));
      // Add the previewImage property to the spot object
      const spot = {
        id: review.Spot.id,
        ownerId: review.Spot.ownerId,
        address: review.Spot.address,
        city: review.Spot.city,
        state: review.Spot.state,
        country: review.Spot.country,
        lat: review.Spot.lat,
        lng: review.Spot.lng,
        name: review.Spot.name,
        price: review.Spot.price,
        previewImage: previewImage,
      };

      const formattedReview = {
        id: review.id,
        userId: review.userId,
        spotId: review.spotId,
        review: review.review,
        stars: review.stars,
        createdAt: formatDate(review.createdAt),
        updatedAt: formatDate(review.updatedAt),
        User: {
          id: review.User.id,
          firstName: review.User.firstName,
          lastName: review.User.lastName,
        },
        Spot: spot, // Use the modified spot object
        ReviewImages: mappedReviewImages,
      };

      return formattedReview;
    });

    return res.json({ Reviews: formattedReviews });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Could not retrieve user reviews" });
  }
});

// POST image to review by id
router.post("/:reviewId/images", requireAuth, async (req, res, next) => {
  const { url } = req.body;

  try {
    // Find the review including ReviewImages
    const review = await Review.findByPk(req.params.reviewId, {
      include: "ReviewImages",
    });

    // Error is review does not belong to user
    if (review.userId !== req.user.id) {
      return forbidden(res);
    }

    if (review.ReviewImages.length >= 10) {
      return res.status(403).json({
        message: "Maximum number of images for this resource was reached",
      });
    }

    // Create a new review image
    const reviewImage = await review.createReviewImage({
      reviewId: req.params.reviewId,
      url,
    });

    // Extract only the desired properties
    const sanitizedResponse = {
      id: reviewImage.id,
      url: reviewImage.url,
    };

    // Send the sanitized data in the response
    return res.json(sanitizedResponse);
  } catch (error) {
    console.error(error);
    return noReview(res);
  }
});

// Update review if userId === req.user.id
router.put(
  "/:reviewId",
  requireAuth,
  [
    body("review").notEmpty().withMessage("Review text is required"),
    body("stars")
      .notEmpty()
      .isInt({ min: 1, max: 5 })
      .withMessage("Stars must be an integer from 1 to 5"),
  ],
  handleValidationErrors,
  async (req, res) => {
    const { reviewId } = req.params;
    const { review, stars } = req.body;
    try {
      const userReview = await Review.findByPk(reviewId);

      if (!userReview) {
        return noReview(res);
      }

      if (userReview.userId !== req.user.id) {
        return forbidden(res);
      }

      // Update the userReview
      await userReview.update({
        review,
        stars,
      });

      const filteredUserReview = {
        id: userReview.id,
        userId: userReview.userId,
        spotId: userReview.spotId,
        review: userReview.review,
        stars: userReview.stars,
        createdAt: formatDate(userReview.createdAt),
        updatedAt: formatDate(userReview.updatedAt),
      };

      return res.status(200).json(filteredUserReview);
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        message: "Internal Server Error",
      });
    }
  }
);

// Delete review if userId if === req.user.id
router.delete("/:reviewId", requireAuth, async (req, res, next) => {
  try {
    const deletedReview = await Review.findByPk(req.params.reviewId);

    if (deletedReview.userId !== req.user.id) {
      return forbidden(res);
    }

    await deletedReview.destroy();
    return deleted(res);
  } catch (error) {
    console.error(error);
    return noReview(res);
  }
});
module.exports = router;
