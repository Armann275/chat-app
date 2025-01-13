// validation
const { check, validationResult } = require("express-validator");
const validateUser = [
    // Email validation
    check("email")
      .isEmail()
      .withMessage("Invalid email address")
      .normalizeEmail(),
    
    // Password validation
    check("password")
      .isLength({ min: 8 })
      .withMessage("Password must be at least 8 characters")
      .matches(/[A-Z]/)
      .withMessage("Password must contain at least one uppercase letter")
      .matches(/[a-z]/)
      .withMessage("Password must contain at least one lowercase letter")
      .matches(/\d/)
      .withMessage("Password must contain at least one digit")
      .matches(/[!@#$%^&*]/)
      .withMessage("Password must contain at least one special character"),
  
    // Username validation
    check("username")
      .isLength({ min: 3, max: 20 })
      .withMessage("Username must be between 3 and 20 characters")
      .isAlphanumeric()
      .withMessage("Username must contain only letters and numbers"),
  
    // Custom middleware to handle errors
    (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array()});
      }
      next();
    },
];
  
module.exports = validateUser;



