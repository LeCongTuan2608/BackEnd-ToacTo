const express = require('express');
const { route } = require('express/lib/router');
const authController = require('../controllers/authController');
const authenToken = require('../controllers/middlewareController');

const router = express.Router();
// register
router.route('/register').post(authController.registerHandler);

// login
router.route('/login').post(authController.loginHandler);

// // logout
router.route('/logout').delete(authController.logoutHandler);

// // forgot password
router.route('/forgot-password').post(authController.forgotHandler);

// // change password
router.route('/change-password').patch([authenToken], authController.changePasswordHandler);

// // get profile this user
router.route('/').get([authenToken], authController.getUserHandler);

module.exports = router;
