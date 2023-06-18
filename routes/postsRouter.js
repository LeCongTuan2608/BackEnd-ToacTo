const express = require('express');
const router = express.Router();
const { route } = require('express/lib/router');
const postController = require('../controllers/postsController');
const authenToken = require('../controllers/middlewareController');
//
const multer = require('multer');
const { storageFile } = require('../utils/cloudinary');
const uploadFile = multer({ storage: storageFile });

router
   .route('/posts/blocked/:id')
   .get([authenToken], postController.getPostsBlockedByIdHandler)
   .post([authenToken], postController.blockPostsHandler)
   .delete([authenToken], postController.deletePostsBlockedHandler); //get feed posts blocked

router.route('/posts/blocked').get([authenToken], postController.getAllPostsBlockedHandler); //get all posts blocked

router
   .route('/posts/by-id/:id')
   .get([authenToken], postController.getPostsByIdHandler)
   .patch(
      [authenToken, uploadFile.fields([{ name: 'images' }, { name: 'videos' }])],
      postController.updatePostsByIdHandler,
   )
   .delete([authenToken], postController.deletePostsByIdHandler); // get feed post by id

router.route('/posts/liked/:posts_id').get([authenToken], postController.likedPostsHandler);
router.route('/posts/comment/:posts_id').get([authenToken], postController.getCommentPostsHandler);
router.route('/posts/comment').post([authenToken], postController.commentPostsHandler);

router
   .route('/posts/new')
   .post(
      [authenToken, uploadFile.fields([{ name: 'images' }, { name: 'videos' }])],
      postController.newPostsHandler,
   );

// // get post of user other
router.route('/posts/:user_name').get([authenToken], postController.getPostUserHandler);

//
router.route('/').get([authenToken], postController.getAllPostsHandler); //get all feed post

module.exports = router;
