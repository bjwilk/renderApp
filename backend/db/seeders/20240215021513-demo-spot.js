'use strict';
const { Spot } = require('../models');
const bcrypt = require("bcryptjs");

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;  // define your schema in options object
}
const spotsData = [
      
  {
    ownerId: 1,
    address: '123 Main Street',
    city: 'Example City',
    state: 'CA',
    country: 'USA',
    lat: 37.7749,
    lng: -122.4194,
    name: 'Example Spot 1',
    description: 'A wonderful spot',
    price: 100,
  },
  {
    ownerId: 2,
    address: '456 Oak Avenue',
    city: 'Another City',
    state: 'NY',
    country: 'USA',
    lat: 40.7128,
    lng: -74.0060,
    name: 'Example Spot 2',
    description: 'A beautiful location',
    price: 150,
  },
  {
    ownerId: 3,
    address: '789 Pine Street',
    city: 'Yet Another City',
    state: 'TX',
    country: 'USA',
    lat: 29.7604,
    lng: -95.3698,
    name: 'Example Spot 3',
    description: 'A cozy corner',
    price: 120,
  },
]

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await Spot.bulkCreate(spotsData, { validate: true })
  },

  async down (queryInterface, Sequelize) {
    options.tableName = "Spots"
    const Op = Sequelize.Op;
    return queryInterface.bulkDelete(options, {
      ownerId: { [Op.in]: [ 1, 2, 3] }
    ,}, {});  }
};
