// backend/routes/api/bookings.js
const express = require("express");
const { Op } = require("sequelize");
const bcrypt = require("bcryptjs");

const {
  setTokenCookie,
  restoreUser,
  requireAuth,
} = require("../../utils/auth");
const { User, Spot, Booking, SpotImage } = require("../../db/models");

const { check, body, validationResult } = require("express-validator");
const { handleValidationErrors } = require("../../utils/validation");

const router = express.Router();

// Get all bookings by userId
router.get("/current", requireAuth, async (req, res, next) => {
  try {
    const usersBookings = await Booking.findAll({
      where: {
        userId: req.user.id,
      },
      include: [
        {
          model: Spot,
          include: {
            model: SpotImage,
            as: "SpotImages",
            attributes: ["url"],
          },
        },
      ],
    });

    // create formatted response
    const formattedBookings = usersBookings.map((booking) => ({
      id: booking.id,
      spotId: booking.spotId,
      Spot: {
        id: booking.Spot.id,
        ownerId: booking.Spot.ownerId,
        address: booking.Spot.address,
        city: booking.Spot.city,
        state: booking.Spot.state,
        country: booking.Spot.country,
        lat: booking.Spot.lat,
        lng: booking.Spot.lng,
        name: booking.Spot.name,
        price: booking.Spot.price,
        previewImage: booking.Spot.SpotImages.map((image) => image.url),
      },
      userId: booking.userId,
      startDate: booking.startDate,
      endDate: booking.endDate,
      createdAt: booking.createdAt,
      updatedAt: booking.updatedAt,
    }));

    return res.json({
      Bookings: formattedBookings,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

// Update booking
router.put(
  "/:bookingId",
  requireAuth,
  [
    body("startDate")
      .notEmpty()
      .withMessage("startDate cannot be empty")
      .custom((value, { req }) => {
        // Custom validation to check if startDate is not in the past
        const currentDate = new Date();
        const selectedStartDate = new Date(value);

        if (selectedStartDate < currentDate) {
          throw new Error("startDate cannot be in the past");
        }

        return value;
      }),
    body("endDate")
      .notEmpty()
      .withMessage("endDate cannot be empty")
      .custom((value, { req }) => {
        // Custom validation to check if endDate is not in the past
        const currentDate = new Date();
        const selectedEndDate = new Date(value);

        if (selectedEndDate < currentDate) {
          throw new Error("endDate cannot be in the past");
        }

        return value;
      }),
  ],
  async (req, res) => {
    const { bookingId } = req.params;
    const { startDate, endDate } = req.body;

    try {
      const booking = await Booking.findByPk(bookingId);

      if (booking.userId !== req.user.id) {
        return res.status(401).json({
          message: "Forbidden",
        });
      }

      if (!booking) {
        return res.status(404).json({
          message: "Booking couldn't be found",
        });
      }

     // Validate input parameters
     const errors = validationResult(req);
      if (!errors.isEmpty()) {
        const formattedErrors = errors.array().map((err) => err.msg);

        const fieldNames = [
          "startDate",
          "endDate",
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
      await booking.update({
        startDate,
        endDate,
      });

      return res.status(200).json(booking);
    } catch (error) {
      if (error instanceof Sequelize.UniqueConstraintError) {
        // Handle unique constraint violation error specifically if needed
        return res.status(400).json({
          message: "Bad Request",
          errors: ["Unique constraint violation"],
        });
      }
      console.error(error);
      return res.status(500).json({ error: "Could not update the booking" });
    }
  }
);

// Delete booking
router.delete("/:bookingId", requireAuth, async (req, res, next) => {
  const deleteBooking = await Booking.findByPk(req.params.bookingId, {
    include: [
      {
        model: User
      }
    ]
  });

  if (!deleteBooking) {
    return res.json({
      message: "Booking could not be found",
    });
  }

  if(deleteBooking.userId !== req.user.id){
    return res.status(401).json({
      message: "Forbidden"
    })
  }

  // Custom validation to check if startDate has not been started
  const currentDate = new Date();
  const bookingStartDate = new Date(deleteBooking.startDate);

  console.log("Current Date:", currentDate.toISOString()); // Adjusted toISOString()
  console.log("Booking StartDate:", bookingStartDate.toISOString());

  const differenceInMilliseconds = bookingStartDate - currentDate;
  console.log(differenceInMilliseconds);

  if (bookingStartDate.toISOString() <= currentDate.toISOString()) {
    return res.status(400).json({
      message:
        "Deletion is not allowed because the startDate has already passed",
    });
  }

  await deleteBooking.destroy();
  return res.json({
    message: "Successfully deleted",
  });
});

module.exports = router;
