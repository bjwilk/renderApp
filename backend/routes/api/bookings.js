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
const {
  forbidden,
  formatDate,
  deleted,
} = require("../../utils/helperFunctions");

const router = express.Router();

// Get all current users bookings
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
        previewImage:
          booking.Spot.SpotImages.length > 0
            ? booking.Spot.SpotImages[0].url
            : null,
      },
      userId: booking.userId,
      startDate: booking.startDate,
      endDate: booking.endDate,
      createdAt: formatDate(booking.createdAt),
      updatedAt: formatDate(booking.updatedAt),
    }));

    return res.json({
      Bookings: formattedBookings,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

// Update booking by id
router.put(
  "/:bookingId",
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
        } else if (selectedEndDate < currentDate) {
          throw new Error("endDate cannot be in the past");
        }

        return true;
      }),
  ],
  handleValidationErrors,
  async (req, res) => {
    const { bookingId } = req.params;
    const { startDate, endDate } = req.body;

    try {
      const booking = await Booking.findByPk(bookingId);
      const currentDate = new Date();

      if (booking.userId !== req.user.id) {
        return forbidden(res);
      }

      if (
        new Date(booking.startDate) <= currentDate ||
        new Date(booking.endDate) <= currentDate
      ) {
        return res.status(403).json({
          message: "Past bookings can't be modified",
        });
      }

      // Check if there are existing bookings for the specified date range
      const existingBookings = await Booking.findAll({
        where: {
          id: { [Op.ne]: booking.id },
          spotId: booking.spotId,
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

      for (const updateBooking of existingBookings) {
        console.log(existingBookings);
        const conflictingBooking = {
          startDate: updateBooking.dataValues.startDate,
          endDate: updateBooking.dataValues.endDate,
        };

        if (
          // Dates surrounding existing updateBooking
          (new Date(startDate).toISOString().split("T")[0] <
            new Date(updateBooking.dataValues.startDate)
              .toISOString()
              .split("T")[0] &&
            new Date(endDate).toISOString().split("T")[0] >
              new Date(updateBooking.dataValues.endDate)
                .toISOString()
                .split("T")[0]) ||
          // Dates within existing updateBooking
          (new Date(startDate).toISOString().split("T")[0] >=
            new Date(updateBooking.dataValues.startDate)
              .toISOString()
              .split("T")[0] &&
            new Date(endDate).toISOString().split("T")[0] <=
              new Date(updateBooking.dataValues.endDate)
                .toISOString()
                .split("T")[0])
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
            new Date(updateBooking.dataValues.startDate)
              .toISOString()
              .split("T")[0] &&
          new Date(startDate).toISOString().split("T")[0] <=
            new Date(updateBooking.dataValues.endDate)
              .toISOString()
              .split("T")[0]
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
            new Date(updateBooking.dataValues.startDate)
              .toISOString()
              .split("T")[0] &&
          new Date(endDate).toISOString().split("T")[0] <=
            new Date(updateBooking.dataValues.endDate)
              .toISOString()
              .split("T")[0]
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

      // Update the booking
      await booking.update({
        startDate,
        endDate,
      });

      const filteredBooking = {
        id: booking.id,
        spotId: booking.spotId,
        userId: booking.userId,
        startDate: booking.startDate,
        endDate: booking.endDate,
        createdAt: formatDate(booking.createdAt),
        updatedAt: formatDate(booking.updatedAt),
      };

      return res.status(200).json(filteredBooking);
    } catch (error) {
      console.log(error);
      return res.status(404).json({ message: "Booking couldn't be found" });
    }
  }
);

// Delete booking by id
router.delete("/:bookingId", requireAuth, async (req, res, next) => {
  const deleteBooking = await Booking.findByPk(req.params.bookingId, {
    include: [
      {
        model: User,
      },
    ],
  });

  if (!deleteBooking) {
    return res.status(404).json({
      message: "Booking could not be found",
    });
  }

  if (deleteBooking.userId !== req.user.id) {
    return forbidden(res);
  }

  // Custom validation to check if startDate has not been started
  const currentDate = new Date();
  const bookingStartDate = new Date(deleteBooking.startDate);

  console.log("Current Date:", currentDate.toISOString()); // Adjusted toISOString()
  console.log("Booking StartDate:", bookingStartDate.toISOString());

  const differenceInMilliseconds = bookingStartDate - currentDate;
  console.log(differenceInMilliseconds);

  if (bookingStartDate.toISOString() <= currentDate.toISOString()) {
    return res.status(403).json({
      message:
        "Deletion is not allowed because the startDate has already passed",
    });
  }

  await deleteBooking.destroy();
  return deleted(res);
});

module.exports = router;
