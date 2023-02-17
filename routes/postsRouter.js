const express = require('express');
const router = express.Router();
const { route } = require('express/lib/router');
const postController = require('../controllers/postsController');
const authenToken = require('../controllers/middlewareController');
const multer = require('multer');
const { storageFile } = require('../utils/cloudinary');
// const upload = multer({ storage: storageFile });

router
   .route('posts/blocked/:postId')
   .get([authenToken], postController.getPostsBlockedByIdHandler)
   .post([authenToken], postController.blockPostsHandler)
   .delete([authenToken], postController.deletePostsBlockedHandler); //get feed posts blocked

router.route('posts/blocked').get([authenToken], postController.getAllPostsBlockedHandler); //get all posts blocked

router
   .route('/posts/by-id/:id')
   .get([authenToken], postController.getPostsByIdHandler)
   .put([authenToken], postController.updatePostsByIdHandler)
   .delete([authenToken], postController.deletePostsByIdHandler); // get feed post by id

router.route('/posts/new').post(
   [
      authenToken,
      // upload.fields([{ name: 'images' }, { name: 'videos' }]),
   ],
   postController.newPostsHandler,
);
//
router.route('/').get([authenToken], postController.getAllPostsHandler); //get all feed post

module.exports = router;
