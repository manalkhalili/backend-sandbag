module.exports = (sequelize, DataTypes) => {
  const Code = sequelize.define("Code", {
    code: {
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM("semester1", "semester2", "full_year"),
      allowNull: false,
      defaultValue: "semester1",
      comment: "semester1: 4 months, semester2: 4 months, full_year: 12 months",
    },
    duration: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 4,
      comment: "Duration in months",
    },
    isUsed: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },
    usedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    applyDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    expiryDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    // Foreign Keys
    graded: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: "Grades",
        key: "id",
      },
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "Users",
        key: "id",
      },
    },
    childId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "Children",
        key: "id",
      },
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  });

  Code.associate = (models) => {
    Code.belongsTo(models.Grade, { foreignKey: "graded" });
    Code.belongsTo(models.User, { foreignKey: "userId", as: "usedBy" });
    Code.belongsTo(models.Child, {
      foreignKey: "childId",
      as: "assignedChild",
    });
  };

  Code.addHook("beforeCreate", (code, options) => {
    switch (code.type) {
      case "semester1":
      case "semester2":
        code.duration = 4;
        break;
      case "full_year":
        code.duration = 12;
        break;
    }
  });

  Code.addHook("beforeUpdate", (code, options) => {
    if (code.changed("type")) {
      switch (code.type) {
        case "semester1":
        case "semester2":
          code.duration = 4;
          break;
        case "full_year":
          code.duration = 12;
          break;
      }
    }
  });

  return Code;
};
