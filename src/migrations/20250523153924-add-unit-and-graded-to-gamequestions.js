"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // حقل الوحدة
    await queryInterface.addColumn("GameQuestions", "unit", {
      type: Sequelize.STRING,
      allowNull: true,
    });

    // ربط بالسنة الدراسية (grade)
    await queryInterface.addColumn("GameQuestions", "graded", {
      type: Sequelize.STRING,
      allowNull: false,
      references: {
        model: "Grades",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("GameQuestions", "unit");
    await queryInterface.removeColumn("GameQuestions", "graded");
  },
};
