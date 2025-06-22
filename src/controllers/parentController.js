const { Child, User, Code, Grade } = require("../models");
const bcrypt = require("bcryptjs");
const semesterInfo = {
  semester1: "الفصل الدراسي الأول",
  semester2: "الفصل الدراسي الثاني"
};
exports.getMyChildren = async (req, res, next) => {
  try {
    const parentId = req.user.id;
    const children = await Child.findAll({ where: { parentId: parentId } });
    res.json(children);
  } catch (err) {
    next(err);
  }
};

exports.addChild = async (req, res) => {
  try {
    const {
      childName,
      childPassword,
      gradeId,
      currentSemester,
      couponCode,
      birthDate,
      city,
      gender,
    } = req.body;

    const parentId = req.user.id;

    if (
      !childName ||
      !childPassword ||
      !gradeId ||
      !currentSemester ||
      !couponCode
    ) {
      return res.status(400).json({
        success: false,
        message:
          "All fields are required: childName, childPassword, gradeId, currentSemester, couponCode.",
      });
    }

    if (!["semester1", "semester2"].includes(currentSemester)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid semester. Allowed values are 'semester1' or 'semester2'.",
      });
    }

    const grade = await Grade.findByPk(gradeId);
    if (!grade) {
      return res.status(404).json({
        success: false,
        message: "Grade not found. Please provide a valid grade ID.",
      });
    }
    const coupon = await Code.findOne({
      where: {
        code: couponCode,
      },
    });
    console.log("Coupon found:", coupon);
    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: "Coupon not found or already used. Please use a valid coupon.",
      });
    }

    if (coupon.expiryDate && new Date() > coupon.expiryDate) {
      return res.status(400).json({
        success: false,
        message: "Coupon has expired. Please use a valid coupon.",
      });
    }

    const existingChild = await Child.findOne({
      where: { name: childName },
    });

    if (existingChild) {
      return res.status(400).json({
        success: false,
        message: "Name already exists. Please choose a different name.",
      });
    }

    const hashedPassword = await bcrypt.hash(childPassword, 12);
    const childUser = await User.create({
      name: childName,
      username: childName.toLowerCase(),
      password: hashedPassword,
      role: "child",
      gender: gender,
      isActive: true,
    });

    const subscriptionStartDate = new Date();
    const subscriptionEndDate = new Date();
    subscriptionEndDate.setMonth(
      subscriptionEndDate.getMonth() + coupon.duration
    );
    let avatarUrl = "";
    if (gender == "male") avatarUrl = "./assets/boyAvatar.png";
    else if ((gender = "female")) avatarUrl = "./assets/girlAvatar.png";

    const child = await Child.create({
      name: childName,
      parentId: parentId,
      userId: childUser.id,
      graded: gradeId,
      currentSemester: currentSemester,
      subscriptionType: coupon.type,
      subscriptionStartDate: subscriptionStartDate,
      subscriptionEndDate: subscriptionEndDate,
      birthDate: birthDate,
      city: city,
      isSubscriptionActive: true,
      profileImage: avatarUrl,
    });

    await coupon.update({
      isUsed: true,
      usedAt: new Date(),
      userId: parentId,
      childId: child.id,
    });

    const childWithDetails = await Child.findByPk(child.id, {
      include: [
        {
          model: User,
          as: "userAccount",
          attributes: ["id", "name", "username"],
        },
        { model: Grade, attributes: ["id", "name"] },
        {
          model: Code,
          as: "assignedCoupon",
          attributes: ["code", "type", "duration"],
        },
      ],
    });

    res.status(201).json({
      success: true,
      message: "Added child successfully",
      data: {
        child: {
          ...childWithDetails.toJSON(),
          semesterInfo: semesterInfo[currentSemester],
        },
        loginCredentials: {
          username: childUser.username,
          message: "Use this username and password to log in.",
          password: childPassword,
        },
      },
    });
  } catch (error) {
    console.error("Error adding child:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error while adding child.",
      error: error.message,
    });
  }
};

exports.editChild = async (req, res) => {
  try {
    const parentId = req.user.id;
    const childId = req.params.childId;

    const {
      childName,
      childPassword,
      gradeId,
      currentSemester,
      birthDate,
      city,
      gender,
    } = req.body;

    const child = await Child.findOne({
      where: { id: childId, parentId },
      include: [{ model: User, as: "userAccount" }],
    });

    if (!child) {
      return res.status(404).json({
        success: false,
        message: "Child not found or does not belong to this parent.",
      });
    }

    const updatesToUser = {};
    if (childName) {
      updatesToUser.name = childName;
      updatesToUser.username = childName.toLowerCase();
    }
    if (gender) updatesToUser.gender = gender;
    if (childPassword) {
      const hashedPassword = await bcrypt.hash(childPassword, 12);
      updatesToUser.password = hashedPassword;
    }
    await child.userAccount.update(updatesToUser);

    if (
      currentSemester &&
      !["semester1", "semester2"].includes(currentSemester)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid semester. Allowed: 'semester1' or 'semester2'.",
      });
    }

    if (gradeId) {
      const grade = await Grade.findByPk(gradeId);
      if (!grade) {
        return res.status(400).json({
          success: false,
          message: "Grade not found.",
        });
      }
    }

    await child.update({
      name: childName || child.name,
      graded: gradeId || child.graded,
      currentSemester: currentSemester || child.currentSemester,
      birthDate: birthDate || child.birthDate,
      city: city || child.city,
    });

    res.json({
      success: true,
      message: "Child updated successfully",
      data: {
        child: {
          ...child.toJSON(),
          user: {
            id: child.userAccount.id,
            name: child.userAccount.name,
            username: child.userAccount.username,
          },
        },
      },
    });
  } catch (error) {
    console.error("Error updating child:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error while updating child.",
      error: error.message,
    });
  }
};
