module.exports = (sequelize, DataTypes) => {
  const Game = sequelize.define("Game", {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.STRING, allowNull: true },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  });

  Game.associate = (models) => {
    Game.hasMany(models.GameQuestion, { foreignKey: "gameId" });
    Game.belongsTo(models.Grade, { foreignKey: "gradeId" });
  };

  return Game;
};
