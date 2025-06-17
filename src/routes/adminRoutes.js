// src/routes/adminRoutes.js
const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/auth");
const { checkRole } = require("../middlewares/checkRole");
const adminController = require("../controllers/adminController");

// All admin routes should be protected by authentication and role checking
router.use(authMiddleware);
router.use(checkRole("admin")); // Ensures only authenticated 'admin' roles can access these routes

// API 1: Generate Coupon
router.post("/coupons/generate", adminController.generateCoupon);

// API 2: Get All Coupons
router.get("/coupons", adminController.getAllCoupons);

// API 3: Get Counts (Child, Parent, Grade, Subject)
router.get("/dashboard/counts", adminController.getDashboardCounts);

// API 4: Add New Subject
router.post("/subjects", adminController.addSubject);

// API 5: Add New Material Item
router.post("/materials", adminController.addMaterial);

module.exports = router;
