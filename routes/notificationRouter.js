const express = require('express');
const { route } = require('express/lib/router');
const notificationController = require('../controllers/notificationController');
const authenToken = require('../controllers/middlewareController');

const router = express.Router();

// router
//    .route('/by-id/:id')
//    .get([authenToken], notificationController.getAllUsersHandler)
//    .delete([authenToken], notificationController.banUsersHandler);

// get profile this user
router.route('/').get([authenToken], notificationController.getNotificationHandler);

module.exports = router;
