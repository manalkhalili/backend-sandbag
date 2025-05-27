module.exports = (sequelize, DataTypes) => {
  const Child = sequelize.define("Child", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    profileImage: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    birthDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    city: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    parentId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Users",
        key: "id",
      },
    },
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
      allowNull: false,
      references: {
        model: "Users",
        key: "id",
      },
    },
    currentSemester: {
      type: DataTypes.ENUM("semester1", "semester2"),
      allowNull: false,
      defaultValue: "semester1",
    },
    subscriptionType: {
      type: DataTypes.ENUM("semester1", "semester2", "full_year"),
      allowNull: false,
      defaultValue: "semester1",
    },
    subscriptionStartDate: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    subscriptionEndDate: {
      type: DataTypes.DATE,
      allowNull: true,
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

  Child.associate = (models) => {
    Child.belongsTo(models.User, {
      foreignKey: "parentId",
      as: "parent",
    });
    Child.belongsTo(models.User, {
      foreignKey: "userId",
      as: "userAccount",
    });
    Child.belongsTo(models.Grade, { foreignKey: "graded" });
    Child.hasMany(models.Score, { foreignKey: "childId" });
    Child.hasOne(models.Code, { foreignKey: "childId", as: "assignedCoupon" });
  };

  Child.prototype.checkSubscriptionStatus = function () {
    const now = new Date();
    if (this.subscriptionEndDate && now > this.subscriptionEndDate) {
      return false;
    }
    return this.isSubscriptionActive;
  };

  Child.prototype.getDaysRemaining = function () {
    if (!this.subscriptionEndDate) return 0;
    const now = new Date();
    const diffTime = this.subscriptionEndDate - now;
    return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  };

  return Child;
};
