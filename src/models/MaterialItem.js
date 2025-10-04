module.exports = (sequelize, DataTypes) => {
  const MaterialItem = sequelize.define("MaterialItem", {
    type: {
      type: DataTypes.ENUM(
        "youtube",
        "pdf",
        "ppt",
        "link",
        "assignment",
        "game",
          "worksheet"
      ),
      allowNull: false,
    },
    title: DataTypes.STRING,
    url: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    gradeId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
// In the MaterialItem.define section, update the semester field:
    semester: {
      type: DataTypes.ENUM("semester1", "semester2", "full_year"),  // Added "full_year"
      allowNull: false,
    },
    cardId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  });

  MaterialItem.associate = (models) => {
    MaterialItem.belongsTo(models.Card, { foreignKey: "cardId" });
    MaterialItem.belongsTo(models.Grade, { foreignKey: "gradeId" });
  };

  return MaterialItem;
};
