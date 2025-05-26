const {
  Child,
  User,
  Score,
  Notification,
  Grade,
  Material,
  Report,
} = require("../models");

exports.getMyChildren = async (req, res, next) => {
  try {
    const parentId = req.user.id;
    console.log("Parent ID:", parentId);
    const children = await Child.findAll({ where: { parentId: parentId } });
    res.json(children);
  } catch (err) {
    next(err);
  }
};

exports.getChildWithReports = async (req, res, next) => {
  try {
    const childId = req.params.id;

    const child = await Child.findByPk(childId, {
      include: [
        { model: Grade, attributes: ["name"] },
        {
          model: Score,
          include: [{ model: Material, attributes: ["title", "type"] }],
        },
      ],
    });

    if (!child) return res.status(404).json({ message: "Child not found" });

    res.json(child);
  } catch (err) {
    next(err);
  }
};
