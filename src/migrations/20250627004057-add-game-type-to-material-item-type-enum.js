"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // This assumes your database is MySQL/MariaDB.
    // For PostgreSQL, it's slightly different (ALTER TYPE ... ADD VALUE).
    // If you are using PostgreSQL, let me know, and I can provide the specific syntax.

    await queryInterface.changeColumn("MaterialItems", "type", {
      type: Sequelize.ENUM(
        "youtube",
        "pdf",
        "ppt",
        "link",
        "assignment",
        "game" // Add 'game' here
      ),
      allowNull: false,
      // You might need to re-add any other constraints like defaultValue if they exist
      // defaultValue: 'link', // Example if you had a default value
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Revert the change by removing 'game' from the ENUM
    await queryInterface.changeColumn("MaterialItems", "type", {
      type: Sequelize.ENUM("youtube", "pdf", "ppt", "link", "assignment"),
      allowNull: false,
      // Revert other constraints if needed
      // defaultValue: 'link', // Example
    });
  },
};
