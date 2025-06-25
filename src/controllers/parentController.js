const { Child, User, Code, Grade } = require("../models");
const bcrypt = require("bcryptjs");
const semesterInfo = {
  semester1: "الفصل الدراسي الأول",
  semester2: "الفصل الدراسي الثاني"
};
exports.getMyChildren = async (req, res, next) => {
  try {
    const parentId = req.user.id; // Authenticated parent's ID

    const children = await Child.findAll({
      where: { parentId: parentId },
      include: [
        {
          model: User, // Include the User model for parent details
          as: "parent", // Use the specific alias 'parent' defined in Child.belongsTo
          attributes: ["name", "email", "phone"], // Select desired parent attributes
        },
        {
          model: Code, // Include the Code model for coupon details
          as: "assignedCoupon", // Use the specific alias 'assignedCoupon' defined in Child.hasOne
          attributes: [
            "code",
            "type",
            "duration",
            "isUsed",
            "usedAt",
            "applyDate",
            "expiryDate",
          ], // Select all desired coupon attributes
          required: false, // Use 'false' for LEFT JOIN, so children without a coupon are still returned
        },
        {
          model: Grade, // Include the Grade model for grade name
          attributes: ["name"], // Assuming 'name' is the relevant field for grade
          required: true, // Child must have a grade, so INNER JOIN is appropriate
        },
      ],
    });

    // Format the response for cleaner output
    const formattedChildren = children.map((child) => {
      const childData = child.toJSON(); // Convert Sequelize instance to plain JSON object

      return {
        id: childData.id,
        name: childData.name,
        profileImage: childData.profileImage,
        birthDate: childData.birthDate,
        city: childData.city,
        // The parent details are directly available via the 'parent' alias
        parentId: childData.parentId,
        parentName: childData.parent ? childData.parent.name : null,
        parentEmail: childData.parent ? childData.parent.email : null,
        parentPhone: childData.parent ? childData.parent.phone : null,
        // Grade details
        grade: childData.Grade ? childData.Grade.name : null, // Access grade name via direct model name (default alias)
        // Subscription details
        currentSemester: childData.currentSemester,
        subscriptionType: childData.subscriptionType,
        subscriptionStartDate: childData.subscriptionStartDate,
        subscriptionEndDate: childData.subscriptionEndDate,
        // Coupon details are available via the 'assignedCoupon' alias
        coupon: childData.assignedCoupon || null, // Will be null if no coupon is assigned
      };
    });

    res.json({ success: true, data: formattedChildren });
  } catch (err) {
    console.error("Error in getMyChildren:", err); // Log the error for debugging
    next(err); // Pass error to the Express error handling middleware
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
    if (coupon.isUsed) {
      return res.status(400).json({
        success: false,
        message: "Coupon has already been used.",
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