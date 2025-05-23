module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define("User", {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: DataTypes.STRING,
    phone: DataTypes.STRING,
    password: DataTypes.STRING,
    role: DataTypes.ENUM("parent", "child", "admin"),
    email: DataTypes.STRING,
    gender: DataTypes.STRING,
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  });

  User.associate = (models) => {
    User.hasMany(models.Child, { foreignKey: "parentId" });
    User.hasMany(models.Notification, { foreignKey: "recipientId" });
  };

  return User;
};
