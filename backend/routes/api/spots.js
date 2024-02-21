// backend/routes/api/spots.js
const express = require('express');
const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');

const { requireAuth, setTokenCookie } = require('../../utils/auth');
const { User, Spot, SpotImage } = require('../../db/models');

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

// Get all spots
router.get('/', async(req,res,next) => {
    const spots = await Spot.findAll();
    return res.json(spots);
});



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
router.post('/:spotId/images', requireAuth, async (req, res) => {
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

        // Check ownership and delete the spot
        if (spot.ownerId === req.user.id) {
            // User is the owner, proceed with deletion
            await spot.destroy();
            return res.status(200).json({
                message: "Successfully deleted"
            });
        } else {
            return res.status(403).json({
                message: "Permission denied, must be owner to delete"
            });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Could not delete the spot' });
    }
});


module.exports = router;

  

  module.exports = router;