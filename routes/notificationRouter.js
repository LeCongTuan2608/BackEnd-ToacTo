const express = require('express');
const { route } = require('express/lib/router');
const notificationController = require('../controllers/notificationController');
const authenToken = require('../controllers/middlewareController');

const router = express.Router();

router
   .route('/checked-all')
   .get([authenToken], notificationController.checkedAllNotificationHandler);
router
   .route('/by-id/:id')
   .get([authenToken], notificationController.checkedNotificationHandler)
   .delete([authenToken], notificationController.deleteNotificationHandler);

// get profile this user
router.route('/').get([authenToken], notificationController.getNotificationHandler);

module.exports = router;
