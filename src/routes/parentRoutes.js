const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/auth");
const parentController = require("../controllers/parentController");
const { checkRole } = require("../middlewares/checkRole");
// show all children of a parent
router.use(authMiddleware);

router.get("/children", checkRole("parent"), parentController.getMyChildren);
router.post("/add-child", checkRole("parent"), parentController.addChild);

module.exports = router;
