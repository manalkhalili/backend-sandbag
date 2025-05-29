module.exports = (sequelize, DataTypes) => {
  const Card = sequelize.define("Card", {
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  });

  Card.associate = (models) => {
    Card.belongsTo(models.Subject, { foreignKey: "subjectId" });
    Card.hasMany(models.MaterialItem, { foreignKey: "cardId" });
  };

  return Card;
};
