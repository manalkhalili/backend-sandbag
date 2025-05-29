const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/auth");
const childController = require("../controllers/childController");

// Middleware to protect child routes
router.use(authMiddleware);
router.get("/", childController.getDashboard);

module.exports = router;
