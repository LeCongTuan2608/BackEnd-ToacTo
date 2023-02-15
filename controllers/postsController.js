const db = require('../models/index');
const errorController = require('./errorController');
const dotenv = require('dotenv');
const Sequelize = require('sequelize');
dotenv.config();

// get all post
module.exports.getAllPostsHandler = async (req, res, next) => {
   try {
      const feedPosts = await db.Posts.findAll({
         order: Sequelize.literal('rand()'),
      });
      next(
         res.status(200).json({
            feedPosts,
         }),
      );
   } catch (error) {
      console.log('error', error);
      errorController.serverErrorHandle(error, res);
   }
};

// new posts
module.exports.newPostsHandler = async (req, res, next) => {
   try {
      const formData = { ...req.body, ...req.files };
      const newPosts = await db.Posts.create({
         audience: formData?.audience || 'public',
         content: formData?.content,
         user_posts: req.user.user_name,
      });
      if (formData.images.lenght !== 0) {
         const listImg = formData.images.map((item) => {
            return { img: item.originalname, posts_id: newPosts.posts_id };
         });
         await db.Posts_img.bulkCreate(listImg);
      }
      if (formData.video.lenght !== 0) {
         const listVideo = formData.video.map((item) => {
            return { video: item.originalname, posts_id: newPosts.posts_id };
         });
         await db.Posts_video.bulkCreate(listVideo);
      }
      next(
         res.status(201).json({
            mes: 'create new posts is success!',
         }),
      );
   } catch (error) {
      console.log('error', error);
      errorController.serverErrorHandle(error, res);
   }
};

// get posts by id
module.exports.getPostsByIdHandler = async (req, res, next) => {
   try {
   } catch (error) {
      console.log('error', error);
      errorController.serverErrorHandle(error, res);
   }
};

// update posts by id
module.exports.updatePostsByIdHandler = async (req, res, next) => {
   try {
   } catch (error) {
      console.log('error', error);
      errorController.serverErrorHandle(error, res);
   }
};

// delete posts by id
module.exports.deletePostsByIdHandler = async (req, res, next) => {
   try {
   } catch (error) {
      console.log('error', error);
      errorController.serverErrorHandle(error, res);
   }
};

// get all posts blocked
module.exports.getAllPostsBlockedHandler = async (req, res, next) => {
   try {
   } catch (error) {
      console.log('error', error);
      errorController.serverErrorHandle(error, res);
   }
};

// get posts blocked by id
module.exports.getPostsBlockedByIdHandler = async (req, res, next) => {
   try {
   } catch (error) {
      console.log('error', error);
      errorController.serverErrorHandle(error, res);
   }
};

// block posts
module.exports.blockPostsHandler = async (req, res, next) => {
   try {
   } catch (error) {
      console.log('error', error);
      errorController.serverErrorHandle(error, res);
   }
};

// delete posts blocked by id
module.exports.deletePostsBlockedHandler = async (req, res, next) => {
   try {
   } catch (error) {
      console.log('error', error);
      errorController.serverErrorHandle(error, res);
   }
};
