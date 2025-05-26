"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.removeColumn("GameQuestions", "materialId");
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.addColumn("GameQuestions", "materialId", {
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
