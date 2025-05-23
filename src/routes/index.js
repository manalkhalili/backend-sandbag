// routes/index.js
const express = require("express");
const authRoutes = require("./authRoutes");
// const parentRoutes = require("./parentRoutes");
// const childRoutes = require("./childRoutes");
// const adminRoutes = require("./adminRoutes");

const router = express.Router();

router.use("/api/auth", authRoutes);
// router.use("/api/parents", parentRoutes);
// router.use("/api/children", childRoutes);
// router.use("/api/admin", adminRoutes);

module.exports = router;
