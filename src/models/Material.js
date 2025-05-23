module.exports = (sequelize, DataTypes) => {
  const Material = sequelize.define("Material", {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    title: DataTypes.STRING,
    type: DataTypes.ENUM("video", "game", "file"),
    url: DataTypes.STRING,
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  });

  Material.associate = (models) => {
    Material.belongsTo(models.Grade, { foreignKey: "graded" });
    Material.hasMany(models.Score, { foreignKey: "materialId" });
  };

  return Material;
};
