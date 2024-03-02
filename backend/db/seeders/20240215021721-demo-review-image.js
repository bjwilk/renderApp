'use strict';
const { ReviewImage } = require('../models');
const bcrypt = require("bcryptjs");

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;  // define your schema in options object
}
const reviewImagesData = [
  {
    reviewId: 1,
    url: 'review_image_url_1.jpg',
  },
  {
    reviewId: 2,
    url: 'review_image_url_2.jpg',
  },
  {
    reviewId: 3,
    url: 'review_image_url_3.jpg',
  },
];
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await ReviewImage.bulkCreate(reviewImagesData, { validate: true })
  },

  async down (queryInterface, Sequelize) {
    options.tableName = "ReviewImages"
    return queryInterface.bulkDelete(options, 'ReviewImages', null, {});

  }
};
