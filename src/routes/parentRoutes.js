const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/auth");
const parentController = require("../controllers/parentController");
const { checkRole } = require("../middlewares/checkRole");
// show all children of a parent
router.use(authMiddleware, checkRole("parent"));
router.get("/children", parentController.getMyChildren);
router.post("/children", parentController.addChild);
router.put("/children/:childId", parentController.editChild);


module.exports = router;
