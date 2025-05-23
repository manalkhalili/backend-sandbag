module.exports = (sequelize, DataTypes) => {
  const Score = sequelize.define("Score", {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    score: DataTypes.INTEGER,
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  });

  Score.associate = (models) => {
    Score.belongsTo(models.Child, { foreignKey: "childId" });
    Score.belongsTo(models.Material, { foreignKey: "materialId" });
  };

  return Score;
};
