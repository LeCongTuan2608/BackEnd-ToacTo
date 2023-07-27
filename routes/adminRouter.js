const express = require('express');
const { route } = require('express/lib/router');
const adminController = require('../controllers/adminController');
const authenToken = require('../controllers/middlewareController');

const router = express.Router();

// // // change password
// // change password
router.route('/delete-posts/:id').delete([authenToken], adminController.deletePostsHandler);

router.route('/ban-users/:user_name').get([authenToken], adminController.banUsersHandler);

router.route('/ban-posts/:id').get([authenToken], adminController.banPostsHandler);

router.route('/posts-banned').get([authenToken], adminController.getBannedPostsHandler);

router.route('/users-banned').get([authenToken], adminController.getBannedUsersHandler);

router.route('/all-users').get([authenToken], adminController.getAllUsersHandler);

// get profile this user
router.route('/all-posts').get([authenToken], adminController.getAllPostsHandler);

module.exports = router;
