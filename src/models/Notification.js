module.exports = (sequelize, DataTypes) => {
  const Notification = sequelize.define("Notification", {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    message: DataTypes.STRING,
    title: DataTypes.STRING,
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  });

  Notification.associate = (models) => {
    Notification.belongsTo(models.User, { foreignKey: "recipientId" });
  };

  return Notification;
};
