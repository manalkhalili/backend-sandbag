"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("Codes", "type", {
      type: Sequelize.ENUM("semester1", "semester2", "full_year"),
      allowNull: false,
      defaultValue: "semester1",
    });

    await queryInterface.addColumn("Codes", "duration", {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 4,
    });

    await queryInterface.addColumn("Codes", "isUsed", {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    });

    await queryInterface.addColumn("Codes", "usedAt", {
      type: Sequelize.DATE,
      allowNull: true,
    });

    await queryInterface.addColumn("Codes", "childId", {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: "Children",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    });

    await queryInterface.addIndex("Codes", ["isUsed"]);
    await queryInterface.addIndex("Codes", ["type"]);
    await queryInterface.addIndex("Codes", ["graded", "isUsed"]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex("Codes", ["isUsed"]);
    await queryInterface.removeIndex("Codes", ["type"]);
    await queryInterface.removeIndex("Codes", ["graded", "isUsed"]);

    await queryInterface.removeColumn("Codes", "type");
    await queryInterface.removeColumn("Codes", "duration");
    await queryInterface.removeColumn("Codes", "isUsed");
    await queryInterface.removeColumn("Codes", "usedAt");
    await queryInterface.removeColumn("Codes", "childId");
  },
};
