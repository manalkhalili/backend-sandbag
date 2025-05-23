module.exports = (sequelize, DataTypes) => {
  const GameQuestion = sequelize.define("GameQuestion", {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    question: DataTypes.STRING,
    options: DataTypes.JSON,
    correctAnswer: DataTypes.STRING,
    unit: DataTypes.STRING,
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  });

  GameQuestion.associate = (models) => {
    GameQuestion.belongsTo(models.Game, { foreignKey: "gameId" });
    GameQuestion.belongsTo(models.Grade, { foreignKey: "graded" });
  };

  return GameQuestion;
};
