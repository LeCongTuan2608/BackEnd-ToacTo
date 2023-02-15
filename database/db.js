const mysql = require('mysql2');
const dotenv = require('dotenv');
const { Sequelize } = require('sequelize');
dotenv.config();

const sequelize = new Sequelize(process.env.DATABASE, process.env.USER, process.env.PASSWORD, {
   host: 'localhost',
   dialect: 'mysql',
   logging: false,
});

const connectDB = async () => {
   try {
      await sequelize.authenticate();
      console.log(
         '==============  Connection has been established successfully :3333.  ==============',
      );
   } catch (error) {
      console.error('Unable to connect to the database:', error);
   }
};
module.exports = connectDB;
