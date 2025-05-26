// src/seeders/20250523161000-materials.js

"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert("Materials", [
      {
        title: "Basic Math",
        url: "https://example.com/math-video",
        graded: "G1",
        type: "video",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        title: "English Letters",
        graded: "G2",
        url: "https://example.com/english-video",
        createdAt: new Date(),
        type: "video",
        updatedAt: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("Materials", null, {});
  },
};
