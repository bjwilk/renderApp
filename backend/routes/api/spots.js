// backend/routes/api/spots.js
const express = require('express');
const { Op, ValidationError } = require('sequelize');
const bcrypt = require('bcryptjs');

const { requireAuth, setTokenCookie } = require('../../utils/auth');
const { User, Spot, SpotImage, Review, ReviewImage, Booking } = require('../../db/models');

const { handleValidationErrors } = require('../../utils/validation');
const { body, validationResult } = require('express-validator');


const router = express.Router();

// Get all spots for current user
router.get('/user', requireAuth, async(req,res,next) => {
    const usersSpots = await Spot.findAll({
        where: {
            ownerId: req.user.id
        },
    });

   

    return res.json(usersSpots)
});

// Get reviews by spotsId
router.get('/:spotId/reviews', async (req, res, next) => {
    try {
      const spotWithReviews = await Spot.findByPk(req.params.spotId, {
        include: [
          {
            model: Review,
            as: 'Reviews',
            include: [
              {
                model: User,
                attributes: ['id', 'firstName', 'lastName'],
              },
              {
                model: ReviewImage,
                as: 'ReviewImages',
                attributes: ['id', 'url'],
              },
            ],
          },
        ],
      });
  
      if (!spotWithReviews) {
        return res.status(404).json({
          message: 'Spot could not be found',
        });
      }
  
      // create formatted response
      const formattedReviews = spotWithReviews.Reviews.map((review) => ({
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
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  });
  

// Get spot by Id
router.get('/:spotId', async (req, res, next) => {
    try {
        const spotInfo = await Spot.findByPk(req.params.spotId, {
            include: [
                {
                    model: SpotImage,
                    as: 'SpotImages',
                    attributes: ['id', 'url', 'preview']
                },
                {
                    model: User,
                    as: 'Owner',
                    attributes: ['id', 'firstName', 'lastName'],
                },
            ],
        });

        if (!spotInfo) {
            return res.status(404).json({
                message: 'Spot could not be found'
            });
        }

        return res.json(spotInfo);

    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Get all bookings by spotId
router.get('/:spotId/bookings', requireAuth, async (req, res, next) => {
    try {
        const spot = await Spot.findByPk(req.params.spotId, {
            include: [
                {
                    model: Booking,
                    attributes: ['id', 'spotId', 'userId', 'startDate', 'endDate', 'createdAt', 'updatedAt'],
                },
            ],
        });

        if (spot) {
            const formattedBookings = spot.Bookings.map((booking) => ({
                spotId: booking.spotId,
                startDate: booking.startDate,
                endDate: booking.endDate,
                createdAt: booking.createdAt,
                updatedAt: booking.updatedAt,
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
                        ...booking,
                        id: booking.id,
                        userId: req.user.id,
                        User: {
                            id: req.user.id,
                            firstName: req.user.firstName,
                            lastName: req.user.lastName,
                        },
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
                message: 'Spot not found',
            });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});

// POST Booking from Spot by spotId
router.post('/:spotId/bookings', requireAuth, [
    body('startDate').notEmpty().withMessage("startDate cannot be in the past"),
    body('endDate').notEmpty().withMessage("endDate cannot be on or before startDate")
], async(req,res,next) => {
    // validationResult is built in to sequelize to extract errors from req 
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.error('Validation errors:', errors.array())
        return res.status(400).json({
            message: 'Bad Request',
            errors: errors.array().reduce((acc, err) => {
                acc[err.param] = err.msg;
                return acc;
            }, {})
        });
    }
    const { startDate, endDate } = req.body;

    try {
        const spot = await Spot.findByPk(req.params.spotId);
        if (!spot) {
            return res.status(404).json({
                message: 'Spot not found',
            });
        }

        // Check if there are existing bookings for the specified date range
        const existingBookings = await Booking.findOne({
            where: {
                spotId: req.params.spotId,
                [Op.and]: [
                    { startDate: { [Op.lte]: endDate } },
                    { endDate: { [Op.gte]: startDate } }
                ]
            }
        });
        

        if (existingBookings) {
            const response = {
                message: 'The spot is already booked for the specified date range',
                startDate: existingBookings.startDate,
                endDate: existingBookings.endDate,
            };
        
            if (req.body.startDate >= existingBookings.startDate && req.body.startDate <= existingBookings.endDate) {
                return res.status(400).json(response);
            }
        
            if (req.body.endDate >= existingBookings.startDate && req.body.endDate <= existingBookings.endDate) {
                return res.status(400).json(response);
            }
        }
        

        // Assuming you have set up the association correctly in the Spot model
        const newBooking = await spot.createBooking({
            userId: req.user.id,
            startDate,
            endDate
        });

        // Format the response using the created booking
        const formattedResponse = {
            spotId: newBooking.spotId,
            userId: newBooking.userId,
            startDate: newBooking.startDate,
            endDate: newBooking.endDate,
            createdAt: newBooking.createdAt,
            updatedAt: newBooking.updatedAt
        };

        return res.json(formattedResponse);

    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
})

// Get all spots
router.get('/', async(req,res,next) => {
    const spots = await Spot.findAll();
    return res.json(spots);
});

// Post a review for a spot based on spotId

// Post a spot
router.post('/', requireAuth, [
    body('address').notEmpty().withMessage('Street address is required'),
    body('city').notEmpty().withMessage('City is required'),
    body('state').notEmpty().withMessage('State is required'),
    body('country').notEmpty().withMessage('Country is required'),
    body('lat').isFloat({ min: -90, max: 90 }).withMessage('Latitude must be within -90 and 90'),
    body('lng').isFloat({ min: -180, max: 180 }).withMessage('Longitude must be within -180 and 180'),
    body('name').isLength({ max: 50 }).withMessage('Name must be less than 50 characters'),
    body('description').notEmpty().withMessage('Description is required'),
    body('price').isFloat({ gt: 0 }).withMessage('Price per day must be a positive number'),
], async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            message: 'Bad Request',
            errors: errors.array().reduce((acc, err) => {
                acc[err.param] = err.msg;
                return acc;
            }, {})
        });
    }

    const { address, city, state, country, lat, lng, name, description, price } = req.body;

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
            price
        });

        return res.status(201).json(newSpot);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Could not create a new spot' });
    }
});

// POST route to create a new image for a spot
router.post('/images/:spotId', requireAuth, async (req, res) => {
    const { spotId } = req.params;
    const { url, preview } = req.body;

    try {
        // Check if the spot with the specified ID exists
        const spot = await Spot.findByPk(spotId);

        if (!spot) {
            return res.status(404).json({
                message: "Spot couldn't be found"
            });
        }

        // Create a new image for the spot
        const newImage = await SpotImage.create({
            url,
            preview,
            spotId: req.params.spotId
        });

        return res.status(201).json(newImage);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Could not create a new image for the spot' });
    }
});

// PUT route to update and return an existing spot
router.put('/:spotId', requireAuth, [
    body('address').notEmpty().withMessage('Street address is required'),
    body('city').notEmpty().withMessage('City is required'),
    body('state').notEmpty().withMessage('State is required'),
    body('country').notEmpty().withMessage('Country is required'),
    body('lat').isFloat({ min: -90, max: 90 }).withMessage('Latitude must be within -90 and 90'),
    body('lng').isFloat({ min: -180, max: 180 }).withMessage('Longitude must be within -180 and 180'),
    body('name').isLength({ max: 50 }).withMessage('Name must be less than 50 characters'),
    body('description').notEmpty().withMessage('Description is required'),
    body('price').isFloat({ gt: 0 }).withMessage('Price per day must be a positive number'),
], async (req, res) => {
    const { spotId } = req.params;
    const { address, city, state, country, lat, lng, name, description, price } = req.body;

    try {
        // Check if the spot with the specified ID exists
        const spot = await Spot.findByPk(spotId);

        if (!spot) {
            return res.status(404).json({
                message: "Spot couldn't be found"
            });
        }

        // Validate input parameters
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                message: 'Bad Request',
                errors: errors.array().reduce((acc, err) => {
                    acc[err.param] = err.msg;
                    return acc;
                }, {})
            });
        };


        // Update the spot
        await spot.update({
            address,
            city,
            state,
            country,
            lat,
            lng,
            name,
            description,
            price
        });


        return res.status(200).json(spot);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Could not update the spot' });
    }
});

// DELETE route to delete an existing spot
router.delete('/:spotId', requireAuth, async (req, res) => {
    const { spotId } = req.params;

    try {
        // Check if the spot with the specified ID exists
        const spot = await Spot.findByPk(spotId);

        if (!spot) {
            return res.status(404).json({
                message: "Spot couldn't be found"
            });
        }

        // Delete the spot
        await spot.destroy();

        return res.status(200).json({
            message: "Successfully deleted"
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Could not delete the spot' });
    }
});

module.exports = router;

  

  module.exports = router;