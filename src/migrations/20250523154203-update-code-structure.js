"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {

  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("Codes", "expiryDate");
    await queryInterface.removeColumn("Codes", "userId");
  },
};
