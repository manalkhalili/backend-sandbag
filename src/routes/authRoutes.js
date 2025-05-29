const express = require("express");
const router = express.Router();
const { check } = require("express-validator");
const authController = require("../controllers/authController");
const authMiddleware = require("../middlewares/auth");
router.post(
  "/signup",
  [
    check("name").not().isEmpty(),
    check("email").isEmail(),
    check("password").isLength({ min: 6 }),
    check("phone").not().isEmpty().isLength({ equal: 10 }),
  ],
  authController.signup
);

router.post(
  "/signin",
  [check("email").isEmail().optional(), check("password").isLength({ min: 6 })],
  authController.signin
);

router.post(
  "/forgot-password",
  [check("email").isEmail()],
  authController.forgotPassword
);

// Reset password using token
router.post(
  "/reset-password",
  [check("token").not().isEmpty(), check("password").isLength({ min: 6 })],
  authController.resetPassword
);

module.exports = router;
