"use strict";

module.exports = {
  async up(queryInterface) {
    await queryInterface.bulkInsert("Children", [
      {
        id: 1,
        name: "Tommy Johnson",
        graded: "G1",
        parentId: 100, // userId من Users role=parent
        birthDate: new Date("2018-05-15"),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 2,
        name: "Lilly Smith",
        graded: "G2",
        parentId: 100,
        birthDate: new Date("2017-03-22"),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 3,
        name: "Kevin Brown",
        graded: "G1",
        parentId: 104,
        birthDate: new Date("2018-11-30"),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete("Children", null, {});
  },
};
