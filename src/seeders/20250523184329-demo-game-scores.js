"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert("Scores", [
      {
        score: 92,
        childId: 1,
        materialId: 3,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        score: 76,
        childId: 1,
        materialId: 2,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("Scores", { childId: 1 }, {});
  },
};
