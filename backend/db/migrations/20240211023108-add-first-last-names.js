'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('User', 'firstName', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: '' // You can set any default value you prefer
    });

    await queryInterface.addColumn('User', 'lastName', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: ''
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('User', 'firstName');
    await queryInterface.removeColumn('User', 'lastName');
  }
};
