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
    console.error("Error in getMyChildren:", err);
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
    else if (gender === "female") avatarUrl = "./assets/girlAvatar.png";

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
    const semesterInfo = {
      semester1: {
        name: "First Semester",
        durationMonths: 4,
        description: "Covers the first four months of the academic year.",
      },
      semester2: {
        name: "Second Semester",
        durationMonths: 4,
        description: "Covers the next four months of the academic year.",
      },
      // You can add more details specific to each semester here if needed
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

exports.editChild = async (req, res, next) => {
  // Added 'next' for consistency with error handling
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
      profileImage, // <-- Added profileImage
      newCouponCode, // <-- Added for changing/assigning a new coupon
    } = req.body;

    const child = await req.app.locals.models.Child.findOne({
      // Corrected model access
      where: { id: childId, parentId },
      include: [
        { model: req.app.locals.models.User, as: "userAccount" },
        {
          model: req.app.locals.models.Code,
          as: "assignedCoupon",
          required: false,
        }, // Include assigned coupon
      ],
    });

    if (!child) {
      return res.status(404).json({
        success: false,
        message: "Child not found or does not belong to this parent.",
      });
    }

    // --- Update Child's User Account ---
    const updatesToUser = {};
    let childUsername = child.userAccount.username; // Keep track of current username
    if (childName && childName !== child.userAccount.name) {
      updatesToUser.name = childName;
      // If childName changes, update username for consistency (lowercase)
      updatesToUser.username = childName.toLowerCase();
      childUsername = childName.toLowerCase(); // Update variable for response
    }
    if (gender && gender !== child.userAccount.gender) {
      updatesToUser.gender = gender;
    }
    if (childPassword) {
      // Only update password if provided
      const hashedPassword = await bcrypt.hash(childPassword, 12);
      updatesToUser.password = hashedPassword;
    }

    if (Object.keys(updatesToUser).length > 0) {
      await child.userAccount.update(updatesToUser);
    }

    // --- Update Child's Profile Image, Grade, Semester, BirthDate, City ---
    const updatesToChild = {};
    if (childName && childName !== child.name) updatesToChild.name = childName;
    if (
      birthDate &&
      new Date(birthDate).toISOString() !== child.birthDate.toISOString()
    )
      updatesToChild.birthDate = birthDate; // Compare ISO strings for dates
    if (city && city !== child.city) updatesToChild.city = city;
    // Handle profileImage update
    if (profileImage && profileImage !== child.profileImage) {
      updatesToChild.profileImage = profileImage;
    } else if (gender && gender !== child.userAccount.gender) {
      // If gender changed and no explicit profileImage, update based on gender
      updatesToChild.profileImage =
        gender === "male"
          ? "./assets/boyAvatar.png"
          : "./assets/girlAvatar.png";
    }

    if (
        currentSemester &&
        !["semester1", "semester2"].includes(currentSemester)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid semester. Allowed: 'semester1' or 'semester2'.",
      });
    }
    if (currentSemester && currentSemester !== child.currentSemester)
      updatesToChild.currentSemester = currentSemester;

    if (gradeId) {
      const grade = await req.app.locals.models.Grade.findByPk(gradeId); // Corrected model access
      if (!grade) {
        return res.status(400).json({
          success: false,
          message: "Grade not found. Please provide a valid grade ID.",
        });
      }
      if (gradeId !== child.graded) updatesToChild.graded = gradeId;
    }

    if (Object.keys(updatesToChild).length > 0) {
      await child.update(updatesToChild);
    }

    // --- Handle Coupon Change/Assignment ---
    if (newCouponCode) {
      // 1. Find the new coupon
      const newCoupon = await req.app.locals.models.Code.findOne({
        // Corrected model access
        where: { code: newCouponCode },
      });

      if (!newCoupon) {
        return res.status(404).json({
          success: false,
          message: "New coupon not found. Please provide a valid coupon code.",
        });
      }
      if (newCoupon.isUsed) {
        return res.status(400).json({
          success: false,
          message: "New coupon has already been used.",
        });
      }
      if (newCoupon.expiryDate && new Date() > newCoupon.expiryDate) {
        return res.status(400).json({
          success: false,
          message: "New coupon has expired.",
        });
      }

      // If the child already has an assigned coupon, you might want to "release" it
      // or simply overwrite it. Overwriting is simpler for this case.
      // If the new coupon is the same as the existing one, do nothing
      if (child.assignedCoupon && child.assignedCoupon.code === newCouponCode) {
        // No change needed
      } else {
        // 2. Assign the new coupon to the child
        await child.setAssignedCoupon(newCoupon); // Sequelize association setter
        child.subscriptionType = newCoupon.type; // Update child's subscription based on new coupon

        // Update subscription dates based on new coupon duration
        const subscriptionStartDate = new Date();
        const subscriptionEndDate = new Date();
        subscriptionEndDate.setMonth(
          subscriptionEndDate.getMonth() + newCoupon.duration
        );
        child.subscriptionStartDate = subscriptionStartDate;
        child.subscriptionEndDate = subscriptionEndDate;
        child.isSubscriptionActive = true; // Assume new coupon means active subscription

        await child.save(); // Save the child model to persist subscription updates

        // 3. Mark the new coupon as used
        await newCoupon.update({
          isUsed: true,
          usedAt: new Date(),
          userId: parentId, // Parent is using it
          childId: child.id,
        });

        // 4. Optionally: If the old coupon was unique to this child,
        // and you wanted to "free it up" (unlikely for a used coupon,
        // but if your logic allows reusing expired coupons or similar scenarios)
        // you'd update child.assignedCoupon (if exists) here to remove childId/userId if needed.
        // For a coupon that was already used by this child, you likely don't need to do anything with the old one.
      }
    }

    // Reload the child with updated associations to send current data
    const updatedChild = await req.app.locals.models.Child.findByPk(child.id, {
      include: [
        {
          model: req.app.locals.models.User,
          as: "userAccount",
          attributes: ["id", "name", "username"],
        },
        {
          model: req.app.locals.models.Code,
          as: "assignedCoupon",
          attributes: [
            "code",
            "type",
            "duration",
            "isUsed",
            "usedAt",
            "applyDate",
            "expiryDate",
            "graded",
          ],
          required: false,
        },
        { model: req.app.locals.models.Grade, attributes: ["id", "name"] },
      ],
    });

    res.json({
      success: true,
      message: "Child updated successfully",
      data: {
        child: {
          ...updatedChild.toJSON(),
          username: updatedChild.userAccount.username, // Include username directly for clarity
          // Password is NOT returned
        },
      },
    });
  } catch (error) {
    console.error("Error updating child:", error);
    next(error); // Pass error to your general error handler
  }
};