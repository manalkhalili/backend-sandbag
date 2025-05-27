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

exports.getChildWithDetailes = async (req, res, next) => {
  try {
    const childId = req.params.id; // and then     // return the child name , and the code expirydate
    const child = await Child.findOne({
      where: { id: childId },
      include: [
        {
          model: User,
          as: "parent",
          attributes: ["id", "name", "email"],
        },
        {
          model: Grade,
          as: "graded",
          attributes: ["id", "name"],
        },
        {
          model: Score,
          as: "scores",
          attributes: ["id", "score", "createdAt"],
        },
        {
          model: Notification,
          as: "notifications",
          attributes: ["id", "message", "createdAt"],
        },
        {
          model: Material,
          as: "materials",
          attributes: ["id", "title", "content"],
        },
      ],
    });
  } catch (err) {
    next(err);
  }
};

// parent create child
