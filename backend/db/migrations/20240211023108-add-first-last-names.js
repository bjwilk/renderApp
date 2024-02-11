'use strict';

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;  // define your schema in options object
}

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Users', 'firstName', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: '', // You can set any default value you prefer
      ...options
    },
    
    );

    await queryInterface.addColumn('Users', 'lastName', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: '',
      ...options
    },
    
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Users', 'firstName', options);
    await queryInterface.removeColumn('Users', 'lastName', options);
  }
};
