const mysql = require('mysql2');
const dotenv = require('dotenv');
dotenv.config();

// const conn = mysql.createConnection({
//    host: process.env.HOST,
//    user: process.env.USER,
//    password: process.env.PASSWORD,
//    database: process.env.DATABASE,
//    insecureAuth: true,
//    waitForConnections: true,
//    multipleStatements: true,
// });

// conn.connect(function (err) {
//    if (err) {
//       console.error('error connecting: ' + err.stack);
//       return;
//    }
//    console.log('connected :3');
// });
// module.exports = conn;
const { Sequelize } = require('sequelize');

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
