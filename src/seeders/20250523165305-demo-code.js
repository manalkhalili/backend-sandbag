"use strict";

module.exports = {
  async up(queryInterface) {
    await queryInterface.bulkInsert("Codes", [
      {
        code: "PROMO2025A",
        applyDate: new Date("2025-01-01"),
        expiryDate: new Date("2025-12-31"),
        graded: "G1",
        userId: 100,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        code: "SUMMER2025",
        applyDate: new Date("2025-06-01"),
        expiryDate: new Date("2025-08-31"),
        graded: "G2",
        userId: 100,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        code: "WINTER2025",
        applyDate: new Date("2025-11-01"),
        expiryDate: new Date("2026-01-31"),
        graded: "G3",
        userId: 104,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete("Codes", null, {});
  },
};
