"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("Codes", "expiryDate", {
      type: Sequelize.DATE,
      allowNull: true,
    });

    await queryInterface.addColumn("Codes", "userId", {
      type: Sequelize.INTEGER,
      references: {
        model: "Users",
        key: "id",
      },
      onDelete: "SET NULL",
    });

    await queryInterface.changeColumn("Codes", "useAccount", {
      type: Sequelize.INTEGER,
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("Codes", "expiryDate");
    await queryInterface.removeColumn("Codes", "userId");
  },
};
