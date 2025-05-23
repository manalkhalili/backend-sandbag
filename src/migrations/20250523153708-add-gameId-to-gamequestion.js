"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("GameQuestions", "gameId", {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: "Games",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("GameQuestions", "gameId");
  },
};
