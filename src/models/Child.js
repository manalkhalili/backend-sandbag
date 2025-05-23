module.exports = (sequelize, DataTypes) => {
  const Child = sequelize.define("Child", {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    profileImage: DataTypes.STRING,
    birthDate: DataTypes.DATE,
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    city: DataTypes.STRING,
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  });

  Child.associate = (models) => {
    Child.belongsTo(models.User, { foreignKey: "parentId" });
    Child.belongsTo(models.Grade, { foreignKey: "graded" });
    Child.hasMany(models.Score, { foreignKey: "childId" });
  };

  return Child;
};
