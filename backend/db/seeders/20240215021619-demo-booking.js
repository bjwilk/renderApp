'use strict';
const { User, Spot } = require('../models');
const bcrypt = require("bcryptjs");

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;  // define your schema in options object
}

module.exports = {
  async up (queryInterface, Sequelize) {
    const bookingsData = [
      {
        userId: 1,
        spotId: 3,
        startDate: '2024-02-20',
        endDate: '2024-02-25',
      },
      {
        userId: 2,
        spotId: 1,
        startDate: '2024-03-01',
        endDate: '2024-03-10',
      },
      {
        userId: 3,
        spotId: 2,
        startDate: '2024-03-15',
        endDate: '2024-03-20',
      },
    ];

    return queryInterface.bulkInsert('Bookings', bookingsData, {});
  },

  async down (queryInterface, Sequelize) {
    return queryInterface.bulkDelete('Bookings', null, {});
  }
};
