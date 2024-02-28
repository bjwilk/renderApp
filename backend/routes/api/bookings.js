// backend/routes/api/bookings.js
const express = require('express');
const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');

const { setTokenCookie, restoreUser, requireAuth } = require('../../utils/auth');
const { User, Spot, Booking, SpotImage } = require('../../db/models');

const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');



const router = express.Router();

// Get all bookings by userId
router.get('/current', requireAuth, async (req, res, next) => {
  try {
    const usersBookings = await Booking.findAll({
      where: {
        userId: req.user.id
      },
      include: [
        {
          model: Spot,
          include: {
            model: SpotImage,
            as: 'SpotImages',
            attributes: ['url']
          }
        }
      ]
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
        previewImage: booking.Spot.SpotImages.map(image => image.url) 
      },
      userId: booking.userId,
      startDate: booking.startDate,
      endDate: booking.endDate,
      createdAt: booking.createdAt,
      updatedAt: booking.updatedAt
    }));

    return res.json({
      Bookings: formattedBookings
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});


// Get all bookings by spotId





// Update booking



// Delete booking



  

  module.exports = router;