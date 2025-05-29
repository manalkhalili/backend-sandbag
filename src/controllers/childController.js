const { Child, Subject, Card, MaterialItem, Grade } = require("../models");

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
