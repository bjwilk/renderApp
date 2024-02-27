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

const router = express.Router();

// Get all reviews by current user  if userId === req.user.id
router.get("/:id", requireAuth, async (req, res, next) => {
  try {
    const userReviews = await Review.findAll({
      where: {
        userId: req.params.id,
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
          attributes: ["reviewId", "url"],
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
        createdAt: review.createdAt,
        updatedAt: review.updatedAt,
        User: {
          id: review.User.id,
          firstName: review.User.firstName,
          lastName: review.User.lastName,
        },
        Spot: spot, // Use the modified spot object
        ReviewImages: review.ReviewImages,
      };

      return formattedReview;
    });

    return res.json({ Reviews: formattedReviews });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Could not retrieve user reviews" });
  }
});

// Add image to review if userId === req.user.id
router.post('/:reviewId/images', requireAuth, async (req, res, next) => {
  const { url } = req.body;

  try {
    // Find the review including ReviewImages
    const review = await Review.findByPk(req.params.reviewId, {
      include: 'ReviewImages'
    });

    // Error if no :reviewId
    if(!review){
      return res.json({
        message: "Review could not be found"
      })
    }
    console.log('Review:', review.ReviewImages.length)

    if(review.ReviewImages.length > 10){
      return res.json({
        message: "Maximum number of images for this resource was reached"
      })
    }

    // Create a new review image
    const reviewImage = await review.createReviewImage({
      reviewId: req.params.reviewId,
      url
    });


    // Extract only the desired properties
    const sanitizedResponse = {
      id: reviewImage.id,
      url: reviewImage.url
    };

    // Send the sanitized data in the response
    return res.json(sanitizedResponse);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Could not create a new review image' });
  }
});



// Update review if userId === req.user.id

// Delete review if userId if === req.user.id

module.exports = router;
