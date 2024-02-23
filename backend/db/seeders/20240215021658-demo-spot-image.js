'use strict';
const { SpotImage } = require('../models');
const bcrypt = require("bcryptjs");

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;  // define your schema in options object
}
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
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await SpotImage.bulkCreate(spotImagesData, { validate: true })
  },

  async down (queryInterface, Sequelize) {
    return queryInterface.bulkDelete(options, 'SpotImages', null, {});

  }
};
