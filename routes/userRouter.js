const express = require('express');
const { route } = require('express/lib/router');
const userController = require('../controllers/userController');
const authenToken = require('../controllers/middlewareController');
const router = express.Router();
const multer = require('multer');
const { storageFile } = require('../utils/cloudinary');
const uploadFile = multer({ storage: storageFile });

// 11 router

// // add follow user other
router.route('/follow/:user_follow').get([authenToken], userController.followHandler);

// // unfollow of user other
router.route('/unfollow/:id').delete([authenToken], userController.unFollowHandler);

// // get user online
// router.route('/online').get([authenToken], userController.getOnlineHandler); // chưa làm

// // get suggest
router.route('/suggest').get([authenToken], userController.getSuggestHandler); // chưa làm

// // search user other
router.route('/search-user/:user_name').get(userController.searchUserHandler);
router.route('/search-user').get(userController.getAllUserHandler);
router.route('/search').get([authenToken], userController.handleSearchAll);

// // get friends
router.route('/friends').get([authenToken], userController.getFriendsHandler); // chưa làm

// //get post of user
// router.route('/:user_name/posts').get([authenToken], userController.getPostHandler); // chưa làm

// // get following of user other
router.route('/following').get([authenToken], userController.getFollowingHandler);

// // get followers of user other
router.route('/followers').get([authenToken], userController.getFollowersHandler);

// // get profile of user other
router.route('/profile/:user_name').get([authenToken], userController.getProfileUserHandler);

// // blocked
router.route('/blocked/:id').delete([authenToken], userController.userUnBlockedHandler);

router
   .route('/blocked-by-username/:userName')
   .get([authenToken], userController.getBlockedByUserName);
router
   .route('/blocked')
   .get([authenToken], userController.getUserBlockedHandler)
   .post([authenToken], userController.userBlockedHandler);
//
router
   .route('/avatar')
   .patch([uploadFile.single('avatar'), authenToken], userController.uploadAvatarHandler);
// // update, delete user
router
   .route('/:user_name')
   .patch([authenToken], userController.updateUserHandler)
   .delete([authenToken], userController.deleteUserHandler);
// // DELETE user for ADMIN

module.exports = router;
