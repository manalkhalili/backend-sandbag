// src/seeders/20250523162000-games.js

"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert("Games", [
      {
        name: "Math Quiz",
        description: "Answer simple math questions",
        gradeId: "G1",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "Alphabet Game",
        description: "Choose the correct letter",
        gradeId: "G2",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("Games", null, {});
  },
};
