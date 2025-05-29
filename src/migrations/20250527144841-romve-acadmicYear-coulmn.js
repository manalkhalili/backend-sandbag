"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // i remove the column 'acadmicYear' from the 'Subjects' table
    await queryInterface.removeColumn("Children", "academicYear");
  },

  async down(queryInterface, Sequelize) {
    // i add the column 'acadmicYear' back to the 'Subjects' table
    await queryInterface.addColumn("Children", "academicYear", {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },
};
