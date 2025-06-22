const { Child, Subject, Card, MaterialItem, Grade } = require("../models");
const { Op } = require("sequelize");
const semesterInfo = {
  semester1: "الفصل الدراسي الأول",
  semester2: "الفصل الدراسي الثاني"
};
exports.getDashboard = async (req, res) => {
  try {
    const { childId } = req.user.id;
    const child = await Child.findByPk(childId);

    if (!child) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const subjects = await Subject.findAll({
      include: {
        model: Card,
        include: {
          model: MaterialItem,
          where: {
            gradeId: child.graded,
            semester: child.currentSemester,
          },
          required: false,
        },
      },
    });

    res.json({
      success: true,
      data: {
        childName: child.name,
        semester: child.currentSemester,
        gradeId: child.graded,
        subjects,
      },
    });
  } catch (error) {
    console.error("Error fetching dashboard:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

async function getAuthenticatedChildProfile(req, res) {
  const authenticatedUserId = req.user.id;
  const childProfile = await Child.findOne({
    where: { userId: authenticatedUserId },
    include: [{ model: Grade }],
  });

  if (!childProfile) {
    res.status(404).json({
      success: false,
      message: "Child profile not found for the authenticated user.",
    });
    return null;
  }
  return childProfile;
}

// NEW: API to get all subjects (for a static dropdown)
exports.getAllSubjects = async (req, res) => {
  try {
    const subjects = await Subject.findAll({
      attributes: ["id", "name"], // Only return ID and name
      order: [["name", "ASC"]],
    });
    res.json({ success: true, data: subjects });
  } catch (error) {
    console.error("Error fetching all subjects:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error while fetching subjects for dropdown.",
      error: error.message,
    });
  }
};

// API 1: Get Cards for a Subject (filtered by authenticated child's context) - (Existing)
exports.getSubjectCardsForChild = async (req, res) => {
  // ... (Your existing code for this function) ...
  try {
    const child = await getAuthenticatedChildProfile(req, res);
    if (!child) return;

    const { subjectId } = req.params;

    const subject = await Subject.findByPk(subjectId);
    if (!subject) {
      return res
        .status(404)
        .json({ success: false, message: "Subject not found." });
    }

    const cards = await Card.findAll({
      where: {
        subjectId: subject.id,
 
      },
      attributes: ["id", "title"],
      order: [["title", "ASC"]],
    });
    

    res.json({
      success: true,
      data: {
        childId: child.id,
        childName: child.name,
        currentSemester: child.currentSemester,
        grade: child.Grade ? child.Grade.name : null,
        subject: { id: subject.id, name: subject.name },
        cards,
      },
    });
  } catch (error) {
    console.error("Error fetching subject cards for child:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error while fetching cards.",
      error: error.message,
    });
  }
};

// API 2: Get Material Items for a Card (for the authenticated child) - (Existing)
exports.getCardMaterialsForChild = async (req, res) => {
  // ... (Your existing code for this function) ...
  try {
    const child = await getAuthenticatedChildProfile(req, res);
    if (!child) return;

    const { cardId } = req.params;

    const card = await Card.findByPk(cardId, {
      include: [{ model: Subject, attributes: ["id", "name"] }],
    });

    if (!card) {
      return res
        .status(404)
        .json({ success: false, message: "Card not found." });
    }

    const materials = await MaterialItem.findAll({
      where: {
        cardId: cardId,
        gradeId: child.graded,
        semester: child.currentSemester,
      },
      attributes: ["id", "type", "title", "url"],
      order: [["title", "ASC"]],
    });

    res.json({
      success: true,
      data: {
        childId: child.id,
        childName: child.name,
        currentSemester: child.currentSemester,
        grade: child.Grade ? child.Grade.name : null,
        card: { id: card.id, title: card.title },
        subject: card.Subject
          ? { id: card.Subject.id, name: card.Subject.name }
          : null,
        materials,
      },
    });
  } catch (error) {
    console.error("Error fetching card materials for child:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error while fetching materials.",
      error: error.message,
    });
  }
};
