"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add resetPasswordToken column
    await queryInterface.addColumn("Users", "resetPasswordToken", {
      type: Sequelize.STRING, // Match the type in your model
      allowNull: true, // Match the allowNull in your model
    });

    // Add resetPasswordExpires column
    await queryInterface.addColumn("Users", "resetPasswordExpires", {
      type: Sequelize.DATE, // Match the type in your model
      allowNull: true, // Match the allowNull in your model
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Remove resetPasswordExpires column
    await queryInterface.removeColumn("Users", "resetPasswordExpires");

    // Remove resetPasswordToken column
    await queryInterface.removeColumn("Users", "resetPasswordToken");
  },
};
