// src/controllers/adminController.js
const {
  User,
  Child,
  Code,
  Grade,
  Subject,
  Card, // <--- Ensure Card model is imported
  MaterialItem,
} = require("../models");
const crypto = require("crypto");
const { Op } = require("sequelize");

// Helper to generate a unique coupon code
const generateUniqueCouponCode = async () => {
  let code;
  let existingCoupon;
  do {
    code = crypto.randomBytes(4).toString("hex").toUpperCase();
    existingCoupon = await Code.findByPk(code);
  } while (existingCoupon);
  return code;
};

// API 1: Generate Coupon
// POST /api/admin/coupons/generate
// Body: { type: "semester1"|"semester2"|"full_year", graded: "gradeId", expiryDate: "YYYY-MM-DD" }
exports.generateCoupon = async (req, res) => {
  try {
    const { type, graded, expiryDate } = req.body;

    if (!type || !graded) {
      return res
        .status(400)
        .json({ success: false, message: "نوع واي دي الصف مطلوبان." });
    }

    if (!["semester1", "semester2", "full_year"].includes(type)) {
      return res.status(400).json({
        success: false,
        message:
          "نوع القسيمة غير صالح. الأنواع المسموح بها: 'semester1', 'semester2', 'full_year'."
      });
    }

    const grade = await Grade.findByPk(graded);
    if (!grade) {
      return res.status(404).json({
        success: false,
        message: "الصف غير موجود. الرجاء تقديم اي دي صف صحيح",
      });
    }

    const couponCode = await generateUniqueCouponCode();

    const newCoupon = await Code.create({
      code: couponCode,
      type: type,
      graded: graded,
      expiryDate: expiryDate ? new Date(expiryDate) : null,
      isUsed: false,
    });

    res.status(201).json({
      success: true,
      message: "تم إنشاء القسيمة بنجاح.",
      data: newCoupon,
    });
  } catch (error) {
    console.error("خطأ أثناء إنشاء القسيمة:", error);
    res.status(500).json({
      success: false,
      message: "خطأ داخلي في الخادم أثناء إنشاء القسيمة.",
      error: error.message,
    });
  }
};

// API 2: Return all coupons with their type
// GET /api/admin/coupons
exports.getAllCoupons = async (req, res) => {
  try {
    const coupons = await Code.findAll({
      attributes: { exclude: ["createdAt", "updatedAt"] },
      order: [["createdAt", "DESC"]],
    });

    res.json({
      success: true,
      data: coupons,
    });
  } catch (error) {
    console.error("خطأ أثناء جلب القسائم:", error);
    res.status(500).json({
      success: false,
      message: "خطأ داخلي في الخادم أثناء جلب القسائم.",
      error: error.message,
    });
  }
};

// API 3: Return child count, parent count, grade count, subject count
// GET /api/admin/dashboard/counts
exports.getDashboardCounts = async (req, res) => {
  try {
    const childCount = await Child.count();
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
    console.error("خطأ أثناء جلب إحصائيات لوحة التحكم:", error);
    res.status(500).json({
      success: false,
      message: "خطأ داخلي في الخادم أثناء جلب إحصائيات لوحة التحكم.",
      error: error.message,
    });
  }
};

// API 4: Add New Subject
// POST /api/admin/subjects
// Body: { name: "New Subject Name" }
exports.addSubject = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res
        .status(400)
        .json({ success: false, message: "اسم المادة مطلوب." });
    }

    const existingSubject = await Subject.findOne({
      where: {
        name: { [Op.iLike]: name },
      },
    });

    if (existingSubject) {
      return res.status(409).json({
        success: false,
        message: "المادة بهذا الاسم موجودة بالفعل.",
      });
    }

    const newSubject = await Subject.create({ name });

    // --- NEW LOGIC: Automatically create 5 cards for the new subject ---
    const defaultCardNames = [
      "عروض تقديمية", // Presentations
      "كروت تعليمية", // Educational Cards
      "فيديوهات تعليمية", // Educational Videos
      "العاب تعليمية", // Educational Games
      "خرائط ذهنية", // Mind Maps
    ];

    const cardsToCreate = defaultCardNames.map((cardName) => ({
      title: cardName,
      subjectId: newSubject.id, // Link cards to the newly created subject
    }));

    // Use bulkCreate for efficiency to create all cards at once
    const createdCards = await Card.bulkCreate(cardsToCreate);
    // --- END NEW LOGIC ---

    res.status(201).json({
      success: true,
      message: "تم إضافة المادة بنجاح وتم إنشاء البطاقات .",
      data: {
        subject: newSubject,
        defaultCards: createdCards, // Optionally return the created cards in the response
      },
    });
  } catch (error) {
    console.error("خطأ أثناء إضافة المادة أو البطاقات :", error);
    res.status(500).json({
      success: false,
      message: "خطأ داخلي في الخادم أثناء إضافة المادة أو البطاقات.",
      error: error.message,
    });
  }
};

// API 5: Add New Material Item
// POST /api/admin/materials
// Body: { type: "youtube"|"pdf"|..., title: "Material Title", url: "http://example.com", gradeId: "gradeId", semester: "semester1"|"semester2", cardId: 123 }
exports.addMaterial = async (req, res) => {
  try {
    const { type, title, url, gradeId, semester, cardId } = req.body;

    if (!type || !title || !url || !gradeId || !semester || !cardId) {
      return res.status(400).json({
        success: false,
        message:
          "جميع الحقول (النوع، العنوان، الرابط، اي دي الصف، الفصل الدراسي، اي دي البطاقة) مطلوبة",
      });
    }

    const validMaterialTypes = [
      "youtube",
      "pdf",
      "ppt",
      "link",
      "assignment",
      "game",
    ]; // Updated here as well for consistency
    if (!validMaterialTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        message: ` نوع المادة غير صالح. الأنواع المسموح بها: ${validMaterialTypes.join(
          ", "
        )}.`,
      });
    }

    if (!["semester1", "semester2"].includes(semester)) {
      return res.status(400).json({
        success: false,
        message: "Invalid semester. Allowed: 'semester1' or 'semester2'.",
      });
    }

    const grade = await Grade.findByPk(gradeId);
    if (!grade) {
      return res.status(404).json({
        success: false,
        message: "الصف غير موجود. الرجاء تقديم اي دي صف صحيح.",
      });
    }

    const card = await Card.findByPk(cardId);
    if (!card) {
      return res.status(404).json({
        success: false,
        message: "البطاقة غير موجودة. الرجاء تقديم اي دي بطاقة صحيح.",
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
      message: "تم إضافة مادة تعليمية بنجاح.",
      data: newMaterial,
    });
  } catch (error) {
    console.error("خطأ أثناء إضافة المادة التعليمية:", error);
    res.status(500).json({
      success: false,
      message: "خطأ داخلي في الخادم أثناء إضافة عنصر المادة.",
      error: error.message,
    });
  }
};

// NEW CONTROLLER FUNCTION: Get All Subjects for Admin
// GET /api/admin/subjects
exports.getAllSubjects = async (req, res) => {
  try {
    const subjects = await Subject.findAll({
      attributes: ["id", "name"],
      order: [["name", "ASC"]],
    });

    res.json({
      success: true,
      data: subjects,
    });
  } catch (error) {
    console.error("خطأ أثناء جلب جميع المواد للمسؤول:", error);
    res.status(500).json({
      success: false,
      message: "خطأ داخلي في الخادم أثناء جلب المواد.",
      error: error.message,
    });
  }
};

// NEW CONTROLLER FUNCTION: Get Cards by Subject ID for Admin
// GET /api/admin/subjects/:subjectId/cards
exports.getCardsBySubjectId = async (req, res) => {
  try {
    const { subjectId } = req.params;

    if (isNaN(subjectId) || parseInt(subjectId) <= 0) {
      return res
        .status(400)
        .json({ success: false, message: "اي دي المادة غير صالح." });
    }

    const subject = await Subject.findByPk(subjectId);
    if (!subject) {
      return res
        .status(404)
        .json({ success: false, message: "المادة غير موجودة." });
    }

    const cards = await Card.findAll({
      where: { subjectId: subjectId },
      attributes: ["id", "title"],
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
      message: "خطأ داخلي في الخادم أثناء جلب البطاقات الخاصة بالمادة.",
      error: error.message,
    });
  }
};
