"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Remove the 'isSubscriptionActive' column from the 'Children' table
    await queryInterface.removeColumn("Children", "isSubscriptionActive");
  },

  async down(queryInterface, Sequelize) {
    // Add the 'isSubscriptionActive' column back to the 'Children' table
    await queryInterface.addColumn("Children", "isSubscriptionActive", {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: true, // Assuming the default value is true
    });
  },
};
