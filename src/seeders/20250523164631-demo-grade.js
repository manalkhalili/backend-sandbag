"use strict";

module.exports = {
  async up(queryInterface) {
    await queryInterface.bulkInsert("Grades", [
      {
        id: "G1",
        name: "Grade 1",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "G2",
        name: "Grade 2",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "G3",
        name: "Grade 3",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "G4",
        name: "Grade 4",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "G5",
        name: "Grade 5",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete("Grades", null, {});
  },
};
