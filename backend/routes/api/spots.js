// backend/routes/api/spots.js
const express = require("express");
const { Op, ValidationError } = require("sequelize");
const bcrypt = require("bcryptjs");

const { requireAuth, setTokenCookie } = require("../../utils/auth");

const {
  User,
  Spot,
  SpotImage,
  Review,
  ReviewImage,
  Booking,
} = require("../../db/models");

const { handleValidationErrors } = require("../../utils/validation");
const { body, validationResult, query } = require("express-validator");

const router = express.Router();

const setDefaultValues = (req, res, next) => {
  req.query.page = req.query.page || 1; // Default value for page parameter
  req.query.size = req.query.size || 20; // Default value for size parameter
  next(); // Call the next middleware or route handler
};

const isNumericInRange = (value, min, max) => {
  if (isNaN(value)) {
    return false; // Not a number
  }
  const numericValue = parseFloat(value);
  return numericValue >= min && numericValue <= max;
};

const { formatDate } = require('../../utils/dateFormateFunc')

// Get all spots for current user
router.get("/current", requireAuth, async (req, res, next) => {
  try {
    const usersSpots = await Spot.findAll({
      where: {
        ownerId: req.user.id,
      },
      include: [
        {
          model: SpotImage,
        },
      ],
    });

    const filteredResponse = await Promise.all(
      usersSpots.map(async (spot) => {
        const spotData = {
          id: spot.id,
          ownerId: spot.ownerId,
          address: spot.address,
          city: spot.city,
          state: spot.state,
          country: spot.country,
          lat: spot.lat,
          lng: spot.lng,
          name: spot.name,
          description: spot.description,
          price: spot.price,
          createdAt: formatDate(spot.createdAt),
          updatedAt: formatDate(spot.updatedAt)
        };

        // Fetch all reviews for the spot
        const reviews = await Review.findAll({
          where: {
            spotId: spotData.id,
          },
        });

        // Calculate average rating for the spot
        const averageRating =
          reviews.length > 0
            ? reviews.reduce((sum, review) => sum + review.stars, 0) /
              reviews.length
            : null;

        return {
          ...spotData,
          avgRating: averageRating,
          previewImage: spot.SpotImages.map((image) => image.url)[0] || null,
        };
      })
    );

    return res.json({
      Spots: filteredResponse,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

// Get reviews by spotsId
router.get("/:spotId/reviews", async (req, res, next) => {
  try {
    const spotWithReviews = await Spot.findByPk(req.params.spotId, {
      include: [
        {
          model: Review,
          as: "Reviews",
          include: [
            {
              model: User,
              attributes: ["id", "firstName", "lastName"],
            },
            {
              model: ReviewImage,
              as: "ReviewImages",
              attributes: ["id", "url"],
            },
          ],
        },
      ],
    });

    if (!spotWithReviews) {
      return res.status(404).json({
        message: "Spot could not be found",
      });
    }

    // create formatted response
    const formattedReviews = spotWithReviews.Reviews.map((review) => ({
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
      ReviewImages: review.ReviewImages.map((image) => ({
        id: image.id,
        url: image.url,
      })),
    }));

    return res.json({
      Reviews: formattedReviews,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

// Get spot details by Id
router.get("/:spotId", async (req, res, next) => {
  try {
    const spotInfo = await Spot.findByPk(req.params.spotId, {
      include: [
        {
          model: SpotImage,
          as: "SpotImages",
          attributes: ["id", "url", "preview"],
        },
        {
          model: User,
          as: "Owner",
          attributes: ["id", "firstName", "lastName"],
        },
        {
          model: Review,
          as: "Reviews",
          attributes: ["stars"],
        },
      ],
    });

    if (!spotInfo) {
      return res.status(404).json({
        message: "Spot could not be found",
      });
    }

    // Calculate average star rating
    const numReviews = spotInfo.Reviews.length;
    const totalStars = spotInfo.Reviews.reduce(
      (sum, review) => sum + review.stars,
      0
    );
    const avgStarRating = numReviews > 0 ? totalStars / numReviews : null;

    const formattedResponse = {
      id: spotInfo.id,
      ownerId: spotInfo.ownerId,
      address: spotInfo.address,
      city: spotInfo.city,
      state: spotInfo.state,
      country: spotInfo.country,
      lat: spotInfo.lat,
      lng: spotInfo.lng,
      name: spotInfo.name,
      description: spotInfo.description,
      price: spotInfo.price,
      createdAt: formatDate(spotInfo.createdAt),
      updatedAt: formatDate(spotInfo.updatedAt),
      numReviews: numReviews,
      avgStarRating: avgStarRating,
      SpotImages: spotInfo.SpotImages.map((image) => ({
        id: image.id,
        url: image.url,
        preview: image.preview,
      })),
      Owner: {
        id: spotInfo.Owner.id,
        firstName: spotInfo.Owner.firstName,
        lastName: spotInfo.Owner.lastName,
      },
    };

    return res.json(formattedResponse);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

// Get all bookings by spotId
router.get("/:spotId/bookings", requireAuth, async (req, res, next) => {
  try {
    const spot = await Spot.findByPk(req.params.spotId, {
      include: [
        {
          model: Booking,
          attributes: [
            "id",
            "spotId",
            "userId",
            "startDate",
            "endDate",
            "createdAt",
            "updatedAt",
          ],
        },
      ],
    });

    if (spot) {
      const formattedBookings = spot.Bookings.map((booking) => ({
        id: booking.id,
        spotId: booking.spotId,
        userId: booking.userId,
        startDate: booking.startDate,
        endDate: booking.endDate,
        createdAt: formatDate(booking.createdAt),
        updatedAt: formatDate(booking.updatedAt),
      }));

      const notUserBookings = formattedBookings.map((booking) => ({
        spotId: booking.spotId,
        startDate: booking.startDate,
        endDate: booking.endDate,
      }));

      if (req.user.id === spot.ownerId) {
        // If the current user is the owner of the spot
        return res.json({
          Bookings: formattedBookings.map((booking) => ({
            User: {
              id: req.user.id,
              firstName: req.user.firstName,
              lastName: req.user.lastName,
            },
            ...booking,
          })),
        });
      } else {
        // If the current user is not the owner of the spot
        return res.json({
          Bookings: notUserBookings,
        });
      }
    } else {
      return res.status(404).json({
        message: "Spot not found",
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

// POST Booking from Spot by spotId
router.post(
  "/:spotId/bookings",
  requireAuth,
  [
    body("startDate")
      .notEmpty()
      .withMessage("startDate cannot be empty")
      .custom((value, { req }) => {
        const currentDate = new Date();
        const selectedStartDate = new Date(value);


        if (selectedStartDate < currentDate) {
          throw new Error("startDate cannot be in the past");
        }

        return true;
      }),
      body("endDate")
        .notEmpty()
        .withMessage("endDate cannot be empty")
        .custom((value, { req }) => {
          const currentDate = new Date();
          const selectedEndDate = new Date(value);
          const selectedStartDate = new Date(req.body.startDate);

          if (selectedEndDate <= selectedStartDate) {
            throw new Error("endDate cannot be on or before startDate");
          } else if (selectedEndDate < currentDate){
            throw new Error("endDate cannot be in the past")
          }

          return true;
        }),
  ],
  async (req, res, next) => {
    const { spotId } = req.params;
    const { startDate, endDate } = req.body;
    try {
      const spot = await Spot.findByPk(spotId);

      if (!spot) {
        return res.status(404).json({
          message: "Spot not found",
        });
      }

      if (spot.ownerId === req.user.id) {
        return res.status(403).json({
          message: "Spot must NOT belong to the current user.",
        });
      }

      // Validate input parameters
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        const errorsArray = errors.array();
        const errorsObject = {};

        errorsArray.forEach((error) => {
          errorsObject[error.path] = error.msg;
        });

        return res.status(400).json({
          message: "Bad Request",
          errors: errorsObject,
        });
      }

      // Check if there are existing bookings for the specified date range
      const existingBookings = await Booking.findAll({
        where: {
          spotId: spotId,
          [Op.or]: [
            {
              [Op.and]: [
                { startDate: { [Op.lte]: endDate } },
                { endDate: { [Op.gte]: startDate } },
              ],
            },
            {
              [Op.and]: [
                { startDate: { [Op.lte]: startDate } },
                { endDate: { [Op.gte]: startDate } },
              ],
            },
          ],
        },
      });

      for (const booking of existingBookings) {
        const conflictingBooking = {
          startDate: booking.dataValues.startDate,
          endDate: booking.dataValues.endDate,
        };

        if (
          // Dates surrounding existing booking
          (new Date(startDate).toISOString().split("T")[0] <
            new Date(booking.dataValues.startDate)
              .toISOString()
              .split("T")[0] &&
            new Date(endDate).toISOString().split("T")[0] >
              new Date(booking.dataValues.endDate)
                .toISOString()
                .split("T")[0]) ||
          // Dates within existing booking
          (new Date(startDate).toISOString().split("T")[0] >=
            new Date(booking.dataValues.startDate)
              .toISOString()
              .split("T")[0] &&
            new Date(endDate).toISOString().split("T")[0] <=
              new Date(booking.dataValues.endDate).toISOString().split("T")[0])
        ) {
          return res.status(403).json({
            message:
              "Sorry, this spot is already booked for the specified dates",
            errors: {
              startDate: "Start date conflicts with an existing booking",
              endDate: "End date conflicts with an existing booking",
              conflictingBooking: conflictingBooking,
            },
          });
        } else if (
          new Date(startDate).toISOString().split("T")[0] >=
            new Date(booking.dataValues.startDate)
              .toISOString()
              .split("T")[0] &&
          new Date(startDate).toISOString().split("T")[0] <=
            new Date(booking.dataValues.endDate).toISOString().split("T")[0]
        ) {
          // Conflict with start date
          return res.status(403).json({
            message:
              "Sorry, this spot is already booked for the specified dates",
            errors: {
              startDate: "Start date conflicts with an existing booking",
              conflictingBooking: conflictingBooking,
            },
          });
        } else if (
          new Date(endDate).toISOString().split("T")[0] >=
            new Date(booking.dataValues.startDate)
              .toISOString()
              .split("T")[0] &&
          new Date(endDate).toISOString().split("T")[0] <=
            new Date(booking.dataValues.endDate).toISOString().split("T")[0]
        ) {
          // Conflict with end date
          return res.status(403).json({
            message:
              "Sorry, this spot is already booked for the specified dates",
            errors: {
              endDate: "End date conflicts with an existing booking",
              conflictingBooking: conflictingBooking,
            },
          });
        }
      }

      const newBooking = await spot.createBooking({
        userId: req.user.id,
        startDate,
        endDate,
      });

      // Format the response using the created booking
      const formattedResponse = {
        id: newBooking.id,
        spotId: newBooking.spotId,
        userId: newBooking.userId,
        startDate: newBooking.startDate,
        endDate: newBooking.endDate,
        createdAt: formatDate(newBooking.createdAt),
        updatedAt: formatDate(newBooking.updatedAt),
      };

      return res.json(formattedResponse);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  }
);

// Get all spots
router.get(
  "/",
  [
    setDefaultValues,
    query("page")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Page must be greater than or equal to 1"),
    query("size")
      .optional()
      .isInt({ min: 1, max: 20 })
      .withMessage("Size must be between 1 and 20"),
    query("minLat")
      .optional()
      .custom((value) =>
        isNumericInRange(value, -90, 90)
      )
      .withMessage("Latitude must be a valid number between -90 and 90"),
    query("maxLat")
      .optional()
      .custom((value) =>
        isNumericInRange(value, -90, 90)
      )
      .withMessage("Latitude must be a valid number between -90 and 90"),
    query("minLng")
      .optional()
      .custom((value) =>
        isNumericInRange(value, -180, 180)
      )
      .withMessage("Longitude must be a valid number between -180 and 180"),
    query("maxLng")
      .optional()
      .custom((value) =>
        isNumericInRange(value, -180, 180)
      )
      .withMessage("Longitude must be a valid number between -180 and 180"),
    query("minPrice")
      .optional()
      .isInt({ min: 0 })
      .withMessage("Minimum price must be greater than or equal to 0"),
    query("maxPrice")
      .optional()
      .isInt({ min: 0 })
      .withMessage("Maximum price must be greater than or equal to 0"),
  ], handleValidationErrors,
  async (req, res) => {
    try {
      // Extract validated query parameters with default values
      const {
        page = 1,
        size = 20,
        minLat = -90,
        maxLat = 90,
        minLng = -180,
        maxLng = 180,
        minPrice = 0,
        maxPrice = Number.MAX_SAFE_INTEGER,
      } = req.query;

      // Filter spots based on query parameters directly in the database query
      const usersSpots = await Spot.findAll({
        where: {
          lat: { [Op.between]: [minLat, maxLat] },
          lng: { [Op.between]: [minLng, maxLng] },
          price: { [Op.between]: [minPrice, maxPrice] },
        },
        include: [{ model: SpotImage }],
      });

      // Slice the spots based on the requested page and size
      const paginatedSpots = usersSpots.slice((page - 1) * size, page * size);

      const filteredResponse = await Promise.all(
        paginatedSpots.map(async (spot) => {
          // Fetch all reviews for the spot
          const reviews = await Review.findAll({ where: { spotId: spot.id } });

          // Calculate average rating for the spot
          const averageRating =
            reviews.length > 0
              ? reviews.reduce((sum, review) => sum + review.stars, 0) /
                reviews.length
              : null;

          return {
            id: spot.id,
            ownerId: spot.ownerId,
            address: spot.address,
            city: spot.city,
            state: spot.state,
            country: spot.country,
            lat: spot.lat,
            lng: spot.lng,
            name: spot.name,
            description: spot.description,
            price: spot.price,
            createdAt: formatDate(spot.createdAt),
            updatedAt: formatDate(spot.updatedAt),
            avgRating: averageRating,
            previewImage: spot.SpotImages.map((image) => image.url)[0] || null,
          };
        })
      );

      return res.json({
        Spots: filteredResponse,
        page: page,
        size: size,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  }
);

// Post a review for a spot based on spotId
router.post(
  "/:spotId/reviews",
  requireAuth,
  [
    body("review").notEmpty().withMessage("Review text is required"),
    body("stars")
      .notEmpty()
      .isInt({ min: 1, max: 5 })
      .withMessage("Stars must be an integer from 1 to 5"),
  ],
  async (req, res, next) => {
    const { review, stars } = req.body;

    try {
      const spot = await Spot.findByPk(req.params.spotId, {
        include: [
          {
            model: Review,
            as: "Reviews",
          },
        ],
      });

      if (!spot) {
        return res.status(404).json({
          message: "Spot couldn't be found",
        });
      }

      // Handle validation response
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        const formattedErrors = errors.array().map((err) => err.msg);

        const fieldNames = ["review", "stars"];
        const errorsObject = {};

        for (let i = 0; i < fieldNames.length; i++) {
          errorsObject[fieldNames[i]] = formattedErrors[i];
        }

        return res.status(400).json({
          message: "Bad Request",
          errors: errorsObject,
        });
      }

      // checks if userId exists in Reviews table
      if (spot.Reviews.some((review) => review.userId === req.user.id)) {
        return res.status(500).json({
          message: "User already has a review for this spot",
        });
      }

      const newReview = await spot.createReview({
        userId: req.user.id,
        spotId: req.params.spotId,
        review,
        stars,
      });

      const filteredReview = {
        id: newReview.id,
        userId: newReview.userId,
        spotId: newReview.spotId,
        review: newReview.review,
        stars: newReview.starts,
        createdAt: formatDate(newReview.createdAt),
        updatedAt: formatDate(newReview.updatedAt)
      }

      return res.status(201).json(filteredReview);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  }
);

// Post a spot
router.post(
  "/",
  requireAuth,
  [
    body("address").notEmpty().withMessage("Street address is required"),
    body("city").notEmpty().withMessage("City is required"),
    body("state").notEmpty().withMessage("State is required"),
    body("country").notEmpty().withMessage("Country is required"),
    body("lat")
      .isFloat({ min: -90, max: 90 })
      .withMessage("Latitude must be within -90 and 90"),
    body("lng")
      .isFloat({ min: -180, max: 180 })
      .withMessage("Longitude must be within -180 and 180"),
    body("name")
      .isLength({ min: 1, max: 50 })
      .withMessage("Name must be between 1 and 50 characters"),
    body("description").notEmpty().withMessage("Description is required"),
    body("price")
      .isFloat({ gt: 0 })
      .withMessage("Price per day must be a positive number"),
  ],
  async (req, res, next) => {
    // Validate input parameters
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorsArray = errors.array();
      const errorsObject = {};

      errorsArray.forEach((error) => {
        errorsObject[error.path] = error.msg;
      });

      return res.status(400).json({
        message: "Bad Request",
        errors: errorsObject,
      });
    }

    const {
      address,
      city,
      state,
      country,
      lat,
      lng,
      name,
      description,
      price,
    } = req.body;

    try {
      const newSpot = await Spot.create({
        ownerId: req.user.id,
        address,
        city,
        state,
        country,
        lat,
        lng,
        name,
        description,
        price,
      });

      const filteredNewSpot = {
        id: newSpot.id,
        ownerId: newSpot.ownerId,
        address: newSpot.address,
        city: newSpot.city,
        state: newSpot.state,
        country: newSpot.country,
        lat: newSpot.lat,
        lng: newSpot.lng,
        name: newSpot.name,
        description: newSpot.description,
        price: newSpot.price,
        createdAt: formatDate(newSpot.createdAt),
        updatedAt: formatDate(newSpot.updatedAt),
      };

      return res.status(201).json(filteredNewSpot);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Could not create a new spot" });
    }
  }
);

// POST create a new image for a spot
router.post("/:spotId/images", requireAuth, async (req, res) => {
  const { spotId } = req.params;
  const { url, preview } = req.body;

  try {
    // Check if the spot with the specified ID exists
    const spot = await Spot.findByPk(spotId);

    // Check if user owns spot
    if (spot.ownerId !== req.user.id) {
      return res.status(403).json({
        message: "Forbidden",
      });
    }

    // Create a new image for the spot
    const newImage = await SpotImage.create({
      url,
      preview,
      spotId: req.params.spotId,
    });

    formattedResponse = {
      id: newImage.id,
      url: newImage.url,
      preview: newImage.preview,
    };
    return res.status(200).json(formattedResponse);
  } catch (error) {
    console.log(error);
    return res.status(404).json({
      message: "Spot couldn't be found",
    });
  }
});

// PUT edit existing spot
router.put(
  "/:spotId",
  requireAuth,
  [
    body("address").notEmpty().withMessage("Street address is required"),
    body("city").notEmpty().withMessage("City is required"),
    body("state").notEmpty().withMessage("State is required"),
    body("country").notEmpty().withMessage("Country is required"),
    body("lat")
      .isFloat({ min: -90, max: 90 })
      .withMessage("Latitude must be within -90 and 90"),
    body("lng")
      .isFloat({ min: -180, max: 180 })
      .withMessage("Longitude must be within -180 and 180"),
    body("name")
      .isLength({ min: 1, max: 50 })
      .withMessage("Name must be between 1 and 50 characters"),
    body("description").notEmpty().withMessage("Description is required"),
    body("price")
      .isFloat({ gt: 0 })
      .withMessage("Price per day must be a positive number"),
  ],

  async (req, res) => {
    const { spotId } = req.params;
    const {
      address,
      city,
      state,
      country,
      lat,
      lng,
      name,
      description,
      price,
    } = req.body;

    // Validate input parameters
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorsArray = errors.array();
      const errorsObject = {};

      errorsArray.forEach((error) => {
        errorsObject[error.path] = error.msg;
      });

      return res.status(400).json({
        message: "Bad Request",
        errors: errorsObject,
      });
    }

    try {
      // Check if the spot with the specified ID exists
      const spot = await Spot.findByPk(spotId);
      if (spot.ownerId !== req.user.id) {
        return res.status(403).json({
          message: "Forbidden",
        });
      }

      // Validate input parameters
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        const formattedErrors = errors.array().map((err) => err.msg);

        const fieldNames = [
          "address",
          "city",
          "state",
          "country",
          "lat",
          "lng",
          "name",
          "description",
          "price",
        ];
        const errorsObject = {};

        for (let i = 0; i < fieldNames.length; i++) {
          errorsObject[fieldNames[i]] = formattedErrors[i];
        }

        return res.status(400).json({
          message: "Bad Request",
          errors: errorsObject,
        });
      }

      // Update the spot
      await spot.update({
        ownerId: req.user.id,
        address,
        city,
        state,
        country,
        lat,
        lng,
        name,
        description,
        price,
      });

      const filteredNewSpot = {
        id: spot.id,
        ownerId: spot.ownerId,
        address: spot.address,
        city: spot.city,
        state: spot.state,
        country: spot.country,
        lat: spot.lat,
        lng: spot.lng,
        name: spot.name,
        description: spot.description,
        price: spot.price,
        createdAt: formatDate(spot.createdAt),
        updatedAt: formatDate(spot.updatedAt),
      };

      return res.status(200).json(filteredNewSpot);
    } catch (error) {
      console.error(error);
      return res.status(404).json({ message: "Spot couldn't be found" });
    }
  }
);
// DELETE route to delete an existing spot
router.delete("/:spotId", requireAuth, async (req, res) => {
  const { spotId } = req.params;

  try {
    // Check if the spot with the specified ID exists
    const spot = await Spot.findByPk(spotId);

    if (!spot) {
      return res.status(404).json({
        message: "Spot couldn't be found",
      });
    } else if (spot.ownerId !== req.user.id) {
      return res.status(403).json({
        message: "Forbidden",
      });
    }

    // Delete the spot
    await spot.destroy();

    return res.status(200).json({
      message: "Successfully deleted",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Could not delete the spot" });
  }
});

module.exports = router;
