const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/auth");
const parentController = require("../controllers/parentController");

// show all children of a parent
router.use(authMiddleware);

router.get("/children", parentController.getMyChildren);

module.exports = router;
