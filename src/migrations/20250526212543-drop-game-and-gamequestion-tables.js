"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.dropTable("GameQuestions");
    await queryInterface.dropTable("Games");
  },

  async down(queryInterface, Sequelize) {
    // Optionally recreate the tables if needed (you can leave this empty or restore original structure)
    await queryInterface.createTable("Games", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: Sequelize.STRING,
      description: Sequelize.STRING,
      createdAt: Sequelize.DATE,
      updatedAt: Sequelize.DATE,
    });

    await queryInterface.createTable("GameQuestions", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      question: Sequelize.STRING,
      options: Sequelize.JSON,
      correctAnswer: Sequelize.STRING,
      unit: Sequelize.STRING,
      createdAt: Sequelize.DATE,
      updatedAt: Sequelize.DATE,
    });
  },
};
