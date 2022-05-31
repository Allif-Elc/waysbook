'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    return Promise.all([
      queryInterface.addColumn(
        'chats', // table name
        'status', // new field name
        {
          type: Sequelize.BOOLEAN,
          allowNull: true,
        },
      ),
    ]);
  },
    

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
  }
};
