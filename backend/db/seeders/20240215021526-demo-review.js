'use strict';
const { User, Spot } = require('../models');
const bcrypt = require("bcryptjs");

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;  // define your schema in options object
}

module.exports = {
  async up (queryInterface, Sequelize) {
    const reviewsData = [
      {
        id: 1,
        userId: 1,
        spotId: 3,
        review: 'Great spot with amazing views!',
        stars: 5,
      },
      {
        id: 2,
        userId: 2,
        spotId: 1,
        review: 'Nice location, friendly atmosphere.',
        stars: 4,
      },
      {
        id: 3,
        userId: 3,
        spotId: 2,
        review: 'Cozy spot, perfect for a weekend getaway.',
        stars: 4,
      },
    ];

    return queryInterface.bulkInsert('Reviews', reviewsData, {});
  },

  async down (queryInterface, Sequelize) {
    return queryInterface.bulkDelete('Reviews', null, {});

  }
};
