"use strict";
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("MaterialItems", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      type: {
        type: Sequelize.ENUM("youtube", "pdf", "ppt", "link", "assignment"),
        allowNull: false,
      },
      title: {
        type: Sequelize.STRING,
      },
      url: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      gradeId: {
        type: Sequelize.STRING, // <-- هنا تم التعديل من INTEGER إلى STRING
        allowNull: false,
        references: {
          model: "Grades",
          key: "id",
        },
        onDelete: "CASCADE",
      },
      cardId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Cards",
          key: "id",
        },
        onDelete: "CASCADE",
      },
      semester: {
        type: Sequelize.ENUM("semester1", "semester2", "full_year"),
        allowNull: false,
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
    await queryInterface.dropTable("MaterialItems");
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_MaterialItems_type";'
    );
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_MaterialItems_semester";'
    );
  },
};
