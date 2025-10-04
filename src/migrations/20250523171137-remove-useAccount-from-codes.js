"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // نتأكد إذا العمود موجود قبل ما نحذفه
    const table = await queryInterface.describeTable("Codes");
    if (table.useAccount) {
      await queryInterface.removeColumn("Codes", "useAccount");
    }
  },

  async down(queryInterface, Sequelize) {
    // في حال رجعنا المايجريشن نضيف العمود من جديد
    await queryInterface.addColumn("Codes", "useAccount", {
      type: Sequelize.INTEGER,
      allowNull: true,
    });
  },
};
