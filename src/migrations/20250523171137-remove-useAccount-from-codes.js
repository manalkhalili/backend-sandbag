"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.removeColumn("Codes", "useAccount");
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.addColumn("Codes", "useAccount", {
      type: Sequelize.INTEGER,
      allowNull: true,
    });
  },
};
