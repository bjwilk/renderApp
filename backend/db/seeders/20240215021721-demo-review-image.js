'use strict';
const { User, Spot } = require('../models');
const bcrypt = require("bcryptjs");

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;  // define your schema in options object
}

module.exports = {
  async up (queryInterface, Sequelize) {
    const reviewImagesData = [
      {
        id: 1,
        reviewId: 1,
        url: 'review_image_url_1.jpg',
      },
      {
        id: 2,
        reviewId: 2,
        url: 'review_image_url_2.jpg',
      },
      {
        id: 3,
        reviewId: 3,
        url: 'review_image_url_3.jpg',
      },
    ];

    return queryInterface.bulkInsert('ReviewImages', reviewImagesData, {});
  },

  async down (queryInterface, Sequelize) {
    return queryInterface.bulkDelete('ReviewImages', null, {});

  }
};
