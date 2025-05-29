// src/seeders/20250523163000-game-questions.js

"use strict";

const Material = require("../models/Material");

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert("GameQuestions", [
      {
        question: "What is 2 + 3?",
        correctAnswer: "5",
        options: JSON.stringify(["4", "5", "6"]),
        gameId: 1, // مرتبط بـ Math Quiz
        unit: "Unit 1",
        graded: "G1", // تأكد إنه موجود في جدول Grades
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        question: "Which letter comes after B?",
        correctAnswer: "C",
        options: JSON.stringify(["A", "C", "D"]),
        gameId: 2, // مرتبط بـ Alphabet Game
        unit: "Unit 2",
        graded: "G2",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("GameQuestions", null, {});
  },
};
