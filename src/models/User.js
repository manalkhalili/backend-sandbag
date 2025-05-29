// models/User.js
module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define("User", {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: DataTypes.STRING,
    phone: DataTypes.STRING,
    password: DataTypes.STRING,
    role: DataTypes.ENUM("parent", "child", "admin"),
    email: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        isEmail: true,
      },
    },
    username: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
    },
    gender: DataTypes.STRING,
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  });

  User.associate = (models) => {
    User.hasMany(models.Child, {
      foreignKey: "parentId",
      as: "children",
    });

    User.hasMany(models.Child, {
      foreignKey: "userId",
      as: "childProfile",
    });

    User.hasMany(models.Notification, { foreignKey: "recipientId" });
    User.hasMany(models.Code, { foreignKey: "userId" });
  };

  return User;
};
