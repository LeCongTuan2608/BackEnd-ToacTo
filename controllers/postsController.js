const db = require('../models/index');
const errorController = require('./errorController');
const dotenv = require('dotenv');
const Sequelize = require('sequelize');
const cloudinary = require('../utils/cloudinary');
dotenv.config();

// upload file
const uploadFile = async (file, folder, type) => {
   const result = cloudinary.uploader.upload(file, { folder, resource_type: type });
   return result;
};

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
      if (req.body.userPost !== req.user.user_name) {
         return next(
            errorController.errorHandler(res, 'You are not allowed to create this post', 403),
         );
      }

      const newPosts = await db.Posts.create({
         audience: formData?.audience || 'public',
         content: formData?.content,
         user_posts: req.user.user_name,
      });
      if (formData.images && formData.images.length !== 0) {
         const results = await Promise.all(
            formData?.images.map(async (file) => {
               const file1 = { ...file, url: 'https://bom.so/DxnKdV' }; // test
               const result = await uploadFile(file1.url, 'post', file1.mimetype);

               // return về 1 url của ảnh và 1 type
               return {
                  mimetype: result.resource_type,
                  url: result.secure_url, //url
               };
            }),
         );
         return next(
            res.status(201).json({
               results,
            }),
            // console.log(results),
         );
         // await db.Posts_img.bulkCreate(listImages);
      }
      // if (formData.video && formData.video.length !== 0) {
      //    const listVideo = formData.video.map((item) => {
      //       return { video: item.originalname, posts_id: newPosts.posts_id };
      //    });
      //    await db.Posts_video.bulkCreate(listVideo);
      // }
      next(
         res.status(201).json({
            formData,
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
