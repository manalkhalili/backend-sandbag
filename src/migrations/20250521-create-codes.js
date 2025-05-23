"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Codes", {
      code: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.STRING,
      },
      applyDate: {
        type: Sequelize.DATE,
      },
      useAccount: {
        type: Sequelize.INTEGER,
      },
      graded: {
        type: Sequelize.STRING,
        references: {
          model: "Grades",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("Codes");
  },
};
