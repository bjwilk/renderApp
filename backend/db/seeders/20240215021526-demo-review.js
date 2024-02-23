'use strict';
const { Review } = require('../models');
const bcrypt = require("bcryptjs");

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;  // define your schema in options object
}
const reviewsData = [
  {
    userId: 1,
    spotId: 3,
    review: 'Great spot with amazing views!',
    stars: 5,
  },
  {
    userId: 2,
    spotId: 1,
    review: 'Nice location, friendly atmosphere.',
    stars: 4,
  },
  {
    userId: 3,
    spotId: 2,
    review: 'Cozy spot, perfect for a weekend getaway.',
    stars: 4,
  },
];
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await Review.bulkCreate(reviewsData, { validate: true })
  },

  async down (queryInterface, Sequelize) {
    return queryInterface.bulkDelete(options, 'Reviews', null, {});

  }
};
