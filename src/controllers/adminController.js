// src/controllers/adminController.js
const {
  User,
  Child,
  Code,
  Grade,
  Subject,
  Card,
  MaterialItem,
} = require("../models");
const crypto = require("crypto"); // For generating unique coupon codes
const { Op, Sequelize } = require("sequelize");  // <- أضف Sequelize هنا

// Helper to generate a unique coupon code
const generateUniqueCouponCode = async () => {
  let code;
  let existingCoupon;
  do {
    // Generate a random 8-character alphanumeric code
    code = crypto.randomBytes(4).toString("hex").toUpperCase();
    existingCoupon = await Code.findByPk(code);
  } while (existingCoupon); // Keep generating until a unique code is found
  return code;
};

// API 1: Generate Coupon
// POST /api/admin/coupons/generate
// Body: { type: "semester1"|"semester2"|"full_year", graded: "gradeId", expiryDate: "YYYY-MM-DD" }
exports.generateCoupon = async (req, res) => {
  // Removed 'next' from parameters
  try {
    const { type, graded, expiryDate } = req.body;

    if (!type || !graded) {
      return res
        .status(400)
        .json({ success: false, message: "Type and grade ID are required." });
    }

    if (!["semester1", "semester2", "full_year"].includes(type)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid coupon type. Allowed: 'semester1', 'semester2', 'full_year'.",
      });
    }

    // Validate if the grade exists
    const grade = await Grade.findByPk(graded);
    if (!grade) {
      return res.status(404).json({
        success: false,
        message: "Grade not found. Please provide a valid grade ID.",
      });
    }

    const couponCode = await generateUniqueCouponCode();

    // The 'beforeCreate' hook in the Code model will set the duration based on the type
    const newCoupon = await Code.create({
      code: couponCode,
      type: type,
      graded: graded,
      expiryDate: expiryDate ? new Date(expiryDate) : null,
      isUsed: false, // Default to false
      // userId and childId will be null initially, set upon usage
    });

    res.status(201).json({
      success: true,
      message: "Coupon generated successfully.",
      data: newCoupon,
    });
  } catch (error) {
    console.error("Error generating coupon:", error);
    // Handle error directly without 'next'
    res.status(500).json({
      success: false,
      message: "Internal server error while generating coupon.",
      error: error.message,
    });
  }
};

// API 2: Return all coupons with their type
// GET /api/admin/coupons
exports.getAllCoupons = async (req, res) => {
  // Removed 'next' from parameters
  try {
    const coupons = await Code.findAll({
      attributes: { exclude: ["createdAt", "updatedAt"] }, // Exclude timestamps if not needed
      order: [["createdAt", "DESC"]],
    });

    res.json({
      success: true,
      data: coupons,
    });
  } catch (error) {
    console.error("Error fetching coupons:", error);
    // Handle error directly without 'next'
    res.status(500).json({
      success: false,
      message: "Internal server error while fetching coupons.",
      error: error.message,
    });
  }
};

// API 3: Return child count, parent count, grade count, subject count
// GET /api/admin/dashboard/counts
exports.getDashboardCounts = async (req, res) => {
  // Removed 'next' from parameters
  try {
    const childCount = await Child.count();
    // Assuming 'parent' role is stored in the User model
    const parentCount = await User.count({ where: { role: "parent" } });
    const gradeCount = await Grade.count();
    const subjectCount = await Subject.count();

    res.json({
      success: true,
      data: {
        childCount,
        parentCount,
        gradeCount,
        subjectCount,
      },
    });
  } catch (error) {
    console.error("Error fetching dashboard counts:", error);
    // Handle error directly without 'next'
    res.status(500).json({
      success: false,
      message: "Internal server error while fetching dashboard counts.",
      error: error.message,
    });
  }
};

// API 4: Add New Subject
// POST /api/admin/subjects
// Body: { name: "New Subject Name" }
exports.addSubject = async (req, res) => {
  // Removed 'next' from parameters
  try {
    const { name } = req.body;

    if (!name) {
      return res
        .status(400)
        .json({ success: false, message: "Subject name is required." });
    }

    const existingSubject = await Subject.findOne({
      where: Sequelize.where(
          Sequelize.fn("LOWER", Sequelize.col("name")),
          "LIKE",
          name.toLowerCase()
      ),
    });

    if (existingSubject) {
      return res.status(409).json({
        success: false,
        message: "Subject with this name already exists.",
      });
    }

    const newSubject = await Subject.create({ name });

    res.status(201).json({
      success: true,
      message: "Subject added successfully.",
      data: newSubject,
    });
  } catch (error) {
    console.error("Error adding subject:", error);
    // Handle error directly without 'next'
    res.status(500).json({
      success: false,
      message: "Internal server error while adding subject.",
      error: error.message,
    });
  }
};

// API 5: Add New Material Item
// POST /api/admin/materials
// Body: { type: "youtube"|"pdf"|..., title: "Material Title", url: "http://example.com", gradeId: "gradeId", semester: "semester1"|"semester2", cardId: 123 }
exports.addMaterial = async (req, res) => {
  // Removed 'next' from parameters
  try {
    const { type, title, url, gradeId, semester, cardId } = req.body;

    // Basic validation for required fields
    if (!type || !title || !url || !gradeId || !semester || !cardId) {
      return res.status(400).json({
        success: false,
        message:
          "All fields (type, title, url, gradeId, semester, cardId) are required.",
      });
    }

    // Validate material type (assuming MaterialItem model defines these enums)
    const validMaterialTypes = ["youtube", "pdf", "ppt", "link", "assignment"];
    if (!validMaterialTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        message: `Invalid material type. Allowed: ${validMaterialTypes.join(
          ", "
        )}.`,
      });
    }

    // Validate semester type
    if (!["semester1", "semester2"].includes(semester)) {
      return res.status(400).json({
        success: false,
        message: "Invalid semester. Allowed: 'semester1' or 'semester2'.",
      });
    }

    // Validate if gradeId exists
    const grade = await Grade.findByPk(gradeId);
    if (!grade) {
      return res.status(404).json({
        success: false,
        message: "Grade not found. Please provide a valid grade ID.",
      });
    }

    // Validate if cardId exists
    const card = await Card.findByPk(cardId);
    if (!card) {
      return res.status(404).json({
        success: false,
        message: "Card not found. Please provide a valid card ID.",
      });
    }

    const newMaterial = await MaterialItem.create({
      type,
      title,
      url,
      gradeId,
      semester,
      cardId,
    });

    res.status(201).json({
      success: true,
      message: "Material item added successfully.",
      data: newMaterial,
    });
  } catch (error) {
    console.error("Error adding material item:", error);
    // Handle error directly without 'next'
    res.status(500).json({
      success: false,
      message: "Internal server error while adding material item.",
      error: error.message,
    });
  }
};

// NEW CONTROLLER FUNCTION: Get All Subjects for Admin
// GET /api/admin/subjects
exports.getAllSubjects = async (req, res) => {
  try {
    const subjects = await Subject.findAll({
      attributes: ["id", "name"], // Only fetch ID and name
      order: [["name", "ASC"]],
    });

    res.json({
      success: true,
      data: subjects,
    });
  } catch (error) {
    console.error("Error fetching all subjects for admin:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error while fetching subjects.",
      error: error.message,
    });
  }
};

// NEW CONTROLLER FUNCTION: Get Cards by Subject ID for Admin
// GET /api/admin/subjects/:subjectId/cards
exports.getCardsBySubjectId = async (req, res) => {
  try {
    const { subjectId } = req.params;

    // Validate if subjectId is a valid number
    if (isNaN(subjectId) || parseInt(subjectId) <= 0) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid subject ID provided." });
    }

    const subject = await Subject.findByPk(subjectId);
    if (!subject) {
      return res
        .status(404)
        .json({ success: false, message: "Subject not found." });
    }

    const cards = await Card.findAll({
      where: { subjectId: subjectId },
      attributes: ["id", "title"], // Only fetch ID and title
      order: [["title", "ASC"]],
    });

    res.json({
      success: true,
      data: {
        subject: { id: subject.id, name: subject.name },
        cards: cards,
      },
    });
  } catch (error) {
    console.error(
      `Error fetching cards for subject ${req.params.subjectId} for admin:`,
      error
    );
    res.status(500).json({
      success: false,
      message: "Internal server error while fetching cards for subject.",
      error: error.message,
    });
  }
};
