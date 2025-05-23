module.exports = (sequelize, DataTypes) => {
  const Code = sequelize.define("Code", {
    code: { type: DataTypes.STRING, primaryKey: true },
    applyDate: DataTypes.DATE,
    expiryDate: DataTypes.DATE,
    useAccount: DataTypes.INTEGER,
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  });

  Code.associate = (models) => {
    Code.belongsTo(models.Grade, { foreignKey: "graded" });
    Code.belongsTo(models.User, { foreignKey: "userId" });
  };

  return Code;
};
