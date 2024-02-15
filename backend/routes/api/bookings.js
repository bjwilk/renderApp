// backend/routes/api/bookings.js
const express = require('express');
const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');

const { setTokenCookie, restoreUser } = require('../../utils/auth');
const { User, Spot, Booking } = require('../../db/models');

const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');



const router = express.Router();

// Get all bookings by spotId
// Get all bookings by userId
// Post booking
// Update booking
// Delete booking



  

  module.exports = router;