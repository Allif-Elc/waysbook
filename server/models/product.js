'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class product extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      product.belongsTo(models.user,{
        as: "user",
        foreignKey:{
          name: "idUser",
        }
      });
    }
  }
  product.init({
    title: DataTypes.STRING,
    author: DataTypes.STRING,
    publicationDate: DataTypes.STRING,
    pages: DataTypes.INTEGER,
    isbn: DataTypes.INTEGER,
    price: DataTypes.INTEGER,
    desc: DataTypes.TEXT,
    image: DataTypes.STRING,
    bookFile: DataTypes.STRING,
    idUser: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'product',
  });
  return product;
};