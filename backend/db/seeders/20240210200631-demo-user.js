'use strict';

const { User } = require('../models');
const bcrypt = require("bcryptjs");

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;  // define your schema in options object
}

module.exports = {
  async up (queryInterface, Sequelize) {
    await User.bulkCreate([
      {
        id: 1,
        firstName: 'Demo',
        lastName: 'User',
        email: 'demo@user.io',
        username: 'FakerUser1',
        hashedPassword: bcrypt.hashSync('password')
      },
      {
        id: 2,
        firstName: 'Demo',
        lastName: 'User',
        email: 'user1@user.io',
        username: 'FakeUser2',
        hashedPassword: bcrypt.hashSync('password2')
      },
      {
        id: 3,
        firstName: 'Demo',
        lastName: 'User',
        email: 'user2@user.io',
        username: 'FakeUser3',
        hashedPassword: bcrypt.hashSync('password3')
      }
    ], { validate: true });
  },

  async down (queryInterface, Sequelize) {
    options.tableName = 'Users';
    const Op = Sequelize.Op;
    return queryInterface.bulkDelete(options, {
      username: { [Op.in]: [ 'FakeUser1', 'FakeUser2', 'FakeUser3'] }
    }, {});
  }
};
