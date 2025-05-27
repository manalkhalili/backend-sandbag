"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // i romve this     Grade.hasMany(models.Material, { foreignKey: "graded" });

    await queryInterface.dropTable("Materials");
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.createTable("Materials", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      title: {
        type: Sequelize.STRING,
      },
      type: {
        type: Sequelize.ENUM("video", "game", "file"),
      },
      url: {
        type: Sequelize.STRING,
      },
      graded: {
        type: Sequelize.INTEGER,
        references: {
          model: "Grades",
          key: "id",
        },
      },
      createdAt: Sequelize.DATE,
      updatedAt: Sequelize.DATE,
    });
  },
};
