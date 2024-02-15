// backend/routes/api/spots.js
const express = require('express');
const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');

const { setTokenCookie, restoreUser } = require('../../utils/auth');
const { User, Spot } = require('../../db/models');

const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');



const router = express.Router();

// Get all spots
// Get all spots for user by Id
// Get all spots by State
// Get spot by name
// Get all spots by price range
// Get all spots where stars ===...


// Post a spot
// Update a spot
// Delete a spot


router.get('/', async(req,res,next) => {
    const spots = await Spot.findAll();
    return res.json(spots);
})



  

  module.exports = router;