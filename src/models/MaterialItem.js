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
    semester: {
      type: DataTypes.ENUM("semester1", "semester2"),
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
