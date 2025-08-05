const bcrypt = require("bcryptjs");
const { validationResult } = require("express-validator");
const { generateToken } = require("../utils/jwt");
const { User } = require("../models");
const crypto = require("crypto");
const sendEmail = require("../utils/sendEmail");

// تسجيل حساب جديد
exports.signup = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "فشل التحقق من البيانات",
      errors: errors.array(),
    });
  }

  const { name, email, password, phone } = req.body;

  try {
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "البريد الإلكتروني مستخدم بالفعل",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "parent",
      phone,
    });

    const token = generateToken(newUser.id, newUser.role);

    return res.status(201).json({
      success: true,
      message: "تم إنشاء المستخدم بنجاح",
      data: {
        token,
        userId: newUser.id,
      },
    });
  } catch (error) {
    console.error("خطأ في انشاء الحساب", error);
    return res.status(500).json({
      success: false,
      message: "خطأ داخلي في الخادم",
    });
  }
};

// تسجيل الدخول
exports.signin = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "فشل التحقق من صحة البيانات",
      errors: errors.array(),
    });
  }

  const { email, username, password, role } = req.body;

  try {
    let user;

    if (role === "child") {
      if (!username) {
        return res.status(400).json({
          success: false,
          message: "اسم المستخدم مطلوب لتسجيل دخول الطفل",
        });
      }

      user = await User.findOne({ where: { username, role: "child" } });
    } else if (role === "parent" || role === "admin") {
      if (!email) {
        return res.status(400).json({
          success: false,
          message: "البريد الإلكتروني مطلوب لتسجيل الدخول",
        });
      }

      user = await User.findOne({ where: { email, role } });
    } else {
      return res.status(400).json({
        success: false,
        message: "الدور غير صالح. الأدوار المسموح بها: طفل، أب، مسؤول",
      });
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "المستخدم غير موجود",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "بيانات الدخول غير صحيحة",
      });
    }

    const token = generateToken(user.id, user.role);

    return res.status(200).json({
      success: true,
      message: "تم تسجيل الدخول بنجاح",
      data: {
        token,
        userId: user.id,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Signin error:", error);
    return res.status(500).json({
      success: false,
      message: "خطأ داخلي في الخادم",
    });
  }
};

// إرسال كود إعادة تعيين كلمة المرور
exports.forgotPassword = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "فشل التحقق من البيانات",
      errors: errors.array(),
    });
  }

  try {
    const { email } = req.body;

    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "لا يوجد مستخدم بهذا البريد الإلكتروني",
      });
    }

    const resetToken = crypto.randomBytes(4).toString("hex");

    await User.update(
        {
          resetPasswordToken: resetToken,
          resetPasswordExpires: null,
        },
        { where: { id: user.id } }
    );

    const message = `${resetToken} \n\nاستخدمه لإعادة تعيين كلمة المرور الخاصة بك. إذا لم تطلب ذلك، يرجى تجاهل هذا البريد.`;

    await sendEmail({
      email: user.email,
      subject: "طلب إعادة تعيين كلمة المرور",
      message,
    });

    return res.status(200).json({
      success: true,
      message: "تم إرسال بريد إعادة تعيين كلمة المرور",
    });
  } catch (error) {
    console.error("خطأ في طلب نسيت كلمة المرور:", error);
    return res.status(500).json({
      success: false,
      message: "خطأ في الخادم",
    });
  }
};

// إعادة تعيين كلمة المرور
exports.resetPassword = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "فشل التحقق من البيانات",
      errors: errors.array(),
    });
  }

  try {
    const { token, password } = req.body;

    const user = await User.findOne({
      where: {
        resetPasswordToken: token,
      },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "الرمز غير صالح أو منتهي الصلاحية",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    await User.update(
        {
          password: hashedPassword,
          resetPasswordToken: null,
          resetPasswordExpires: null,
        },
        { where: { id: user.id } }
    );

    return res.status(200).json({
      success: true,
      message: "تم إعادة تعيين كلمة المرور بنجاح",
    });
  } catch (error) {
    console.error("خطأ في إعادة تعيين كلمة المرور:", error);
    return res.status(500).json({
      success: false,
      message: "خطأ في الخادم",
    });
  }
};
