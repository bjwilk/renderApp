'use strict';
const { SpotImage } = require('../models');
const bcrypt = require("bcryptjs");

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;  // define your schema in options object
}

const spotImagesData = [];

for (let spotId = 1; spotId <= 20; spotId++) {
  for (let imageIndex = 1; imageIndex <= 5; imageIndex++) {
    spotImagesData.push({
      spotId,
      url: `https://t3.ftcdn.net/jpg/02/32/72/98/240_F_232729870_7OheyiLRXMPMgtuKh0lddl70v7alqTyo.jpg?spot=${spotId}&image=${imageIndex}`,
      preview: imageIndex === 1, // First image is the preview
    });
  }
}


module.exports = {
  up: async (queryInterface, Sequelize) => {
    await SpotImage.bulkCreate(spotImagesData, { validate: true })
  },

  async down (queryInterface, Sequelize) {
    options.tableName = "SpotImages"
    const Op = Sequelize.Op;
    return queryInterface.bulkDelete(options, {
      spotId: { [Op.in]: [ 1, 2, 3] }
    ,}, {});
  }
};
