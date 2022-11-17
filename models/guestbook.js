const Sequelize = require('sequelize');

module.exports = class Guestbook extends Sequelize.Model {
    static init(sequelize) {
        return super.init({
            name : {
                type : Sequelize.STRING(30),
                allowNull: false,
            },
            content: {
                type: Sequelize.STRING(140),
                allowNull: false,
            },
            email: {
                type: Sequelize.STRING(50),
                allowNull: true,
            },
        }, {
            sequelize,
            timestamps: true,
            underscored: false,
            modelName: 'Guestbook',
            tableName: 'guestbooks',
            paranoid: false,
            charset: 'utf8mb4',
            collate: 'utf8mb4_general_ci',
        });
    }

    static associate(db) {
      //  db.Guestbook.belongsTo(db.User);
    }
};