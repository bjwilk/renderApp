'use strict';

const { Model, Validator } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      User.hasMany(models.Spot, {
       foreignKey: 'ownerId'
      });

      User.belongsToMany(models.Spot, {
        through: {
          model: 'Booking',
          foreignKey: 'userId',
          otherKey: 'spotId'
        }
      });

      User.belongsToMany(models.Spot, {
        through: {
          model: 'Review',
          foreignKey: 'userId',
          otherKey: 'spotId'
        },
        as: 'ReviewdSpots'
      })
    }
  };

  User.init(
    {
      firstName: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: ''
      },
      lastName: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: ''
      },
      username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          len: [4, 30],
          isNotEmail(value) {
            if (Validator.isEmail(value)) {
              throw new Error("Cannot be an email.");
            }
          }
        }
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          len: [3, 256],
          isEmail: true
        }
      },
      hashedPassword: {
        type: DataTypes.STRING.BINARY,
        allowNull: false,
        validate: {
          len: [60, 60]
        }
      }
    }, {
      sequelize,
      modelName: 'User',
      defaultScope: {
        attributes: {
          exclude: ['hashedPassword', 'email', 'createdAt', 'updatedAt']
        }
      }
    }
  );
  return User;
};
