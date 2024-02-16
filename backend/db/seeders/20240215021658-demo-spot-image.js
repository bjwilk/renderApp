'use strict';
const { User, Spot } = require('../models');
const bcrypt = require("bcryptjs");

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;  // define your schema in options object
}

module.exports = {
  async up (queryInterface, Sequelize) {
    const spotImagesData = [
      {
        id: 1,
        spotId: 1,
        url: 'image_url_1.jpg',
        preview: true,
      },
      {
        id: 2,
        spotId: 2,
        url: 'image_url_2.jpg',
        preview: false,
      },
      {
        id: 3,
        spotId: 3,
        url: 'image_url_3.jpg',
        preview: true,
      },
    ];

    return queryInterface.bulkInsert('SpotImages', spotImagesData, {});
  },

  async down (queryInterface, Sequelize) {
    return queryInterface.bulkDelete('SpotImages', null, {});

  }
};
