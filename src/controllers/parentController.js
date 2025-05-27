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

exports.addChild = async (req, res) => {
  try {
    const {
      childName,
      childPassword,
      gradeId,
      currentSemester,
      academicYear,
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
      !academicYear ||
      !couponCode
    ) {
      return res.status(400).json({
        success: false,
        message:
          "All fields are required: childName, childPassword, gradeId, currentSemester, academicYear, couponCode.",
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
        graded: gradeId,
        isUsed: false,
      },
    });

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
      username: childName.toLowerCase().replace(/\s+/g, "_") + "_" + Date.now(),
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

    const child = await Child.create({
      name: childName,
      parentId: parentId,
      userId: childUser.id,
      graded: gradeId,
      currentSemester: currentSemester,
      academicYear: academicYear,
      subscriptionType: coupon.type,
      subscriptionStartDate: subscriptionStartDate,
      subscriptionEndDate: subscriptionEndDate,
      birthDate: birthDate,
      city: city,
      isSubscriptionActive: true,
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

    const semesterInfo = {
      semester1: {
        name: "الفصل الأول",
        description: "سبتمبر - ديسمبر",
        months: [9, 10, 11, 12],
      },
      semester2: {
        name: "الفصل الثاني",
        description: "يناير - أبريل",
        months: [1, 2, 3, 4],
      },
    };

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
