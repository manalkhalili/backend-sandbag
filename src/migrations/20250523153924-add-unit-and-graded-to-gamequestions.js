"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("GameQuestions", "unit");
    await queryInterface.removeColumn("GameQuestions", "graded");
  },
};
