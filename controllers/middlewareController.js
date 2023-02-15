const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const errorController = require('./errorController');
dotenv.config();

// tạo access token
const authenToken = (req, res, next) => {
   try {
      const authorizationHeader = req.headers['authorization'];
      const token = authorizationHeader?.split(' ')[1];
      if (!token) return errorController.errorHandler(res, 'No token provided', 401);
      jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
         if (err) return errorController.errorHandler(res, 'Token invalid', 401);
         delete user.iat;
         delete user.exp;
         req.user = user;
         next();
      });
   } catch (error) {
      console.log('error', error);
      errorController.serverErrorHandle(error, res);
   }
};
module.exports = authenToken;
