"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.removeColumn("Scores", "materialId");
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.addColumn("Scores", "materialId", {
      type: Sequelize.INTEGER,
      references: {
        model: "Materials", 
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    });
  },
};
