module.exports = (sequelize, DataTypes) => {
  const Grade = sequelize.define("Grade", {
    id: { type: DataTypes.STRING, primaryKey: true },
    name: DataTypes.STRING,
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  });

  Grade.associate = (models) => {
    Grade.hasMany(models.Child, { foreignKey: "graded" });
    Grade.hasMany(models.Code, { foreignKey: "graded" });
  };

  return Grade;
};
