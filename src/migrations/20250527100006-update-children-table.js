"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {


    await queryInterface.addColumn("Children", "currentSemester", {
      type: Sequelize.ENUM("semester1", "semester2"),
      allowNull: false,
      defaultValue: "semester1",
    });

    await queryInterface.addColumn("Children", "academicYear", {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: "2024-2025",
    });

    await queryInterface.addColumn("Children", "subscriptionType", {
      type: Sequelize.ENUM("semester1", "semester2", "full_year"),
      allowNull: false,
      defaultValue: "semester1",
    });

    await queryInterface.addColumn("Children", "subscriptionStartDate", {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.NOW,
    });

    await queryInterface.addColumn("Children", "subscriptionEndDate", {
      type: Sequelize.DATE,
      allowNull: true,
    });

    await queryInterface.addColumn("Children", "isSubscriptionActive", {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    });

    await queryInterface.addIndex("Children", ["userId"]);
    await queryInterface.addIndex("Children", ["currentSemester"]);
    await queryInterface.addIndex("Children", ["isSubscriptionActive"]);
    await queryInterface.addIndex("Children", ["subscriptionEndDate"]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex("Children", ["userId"]);
    await queryInterface.removeIndex("Children", ["currentSemester"]);
    await queryInterface.removeIndex("Children", ["isSubscriptionActive"]);
    await queryInterface.removeIndex("Children", ["subscriptionEndDate"]);

    await queryInterface.removeColumn("Children", "userId");
    await queryInterface.removeColumn("Children", "currentSemester");
    await queryInterface.removeColumn("Children", "academicYear");
    await queryInterface.removeColumn("Children", "subscriptionType");
    await queryInterface.removeColumn("Children", "subscriptionStartDate");
    await queryInterface.removeColumn("Children", "subscriptionEndDate");
    await queryInterface.removeColumn("Children", "isSubscriptionActive");
  },
};
