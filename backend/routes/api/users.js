// backend/routes/api/users.js
const express = require("express");
const bcrypt = require("bcryptjs");

const { setTokenCookie, requireAuth } = require("../../utils/auth");
const { User } = require("../../db/models");

const { check } = require("express-validator");
const { handleValidationErrors } = require("../../utils/validation");

const router = express.Router();

const validateSignup = [
  check("firstName")
  .exists({ checkFalsy: true })
  .withMessage("Please provide a firstName."),
  check("lastName")
  .exists({ checkFalsy: true })
  .withMessage("Please provide a lastName."),
  check("email")
    .exists({ checkFalsy: true })
    .isEmail()
    .withMessage("Please provide a valid email."),
  check("username")
    .exists({ checkFalsy: true })
    .isLength({ min: 4 })
    .withMessage("Please provide a username with at least 4 characters."),
  check("username").not().isEmail().withMessage("Username cannot be an email."),
  check("password")
    .exists({ checkFalsy: true })
    .isLength({ min: 6 })
    .withMessage("Password must be 6 characters or more."),
  handleValidationErrors,
];

router.get("/", async (req, res) => {
  const users = await User.findAll();
  return res.json(users);
});


// Sign up
router.post("/", validateSignup, async (req, res) => {
  try {
    const { firstName, lastName, email, password, username } = req.body;
    const hashedPassword = bcrypt.hashSync(password);
    const user = await User.create({
      firstName,
      lastName,
      email,
      username,
      hashedPassword,
    });
    const safeUser = {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      username: user.username,
    };

    await setTokenCookie(res, safeUser);

    return res.json({
      user: safeUser,
    });
  } catch (error) {
    // Check if the error is a Sequelize validation error
    // name: 'SequelizeUniqueConstraintError',
    // errors: [
    //   ValidationErrorItem {
    //     message: 'email must be unique',
    //     type: 'unique violation',
    //     path: 'email',
    
    if (error.name === 'SequelizeUniqueConstraintError') {
      const errors = {};
      error.errors.forEach((err) => {
        errors[err.path] = err.message;
      });

      const response = {
        message: 'Validation error',
        errors: errors,
      };

      return res.status(400).json(response);
    }
    console.error(error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
});


module.exports = router;
