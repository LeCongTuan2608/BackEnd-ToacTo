const db = require('../models/index');
const errorController = require('./errorController');
const dotenv = require('dotenv');
const Sequelize = require('sequelize');
const cloudinary = require('cloudinary').v2;

dotenv.config();

// const uploadFile = async (file, folder, type) => {
//    const result = await cloudinary.uploader.upload(file, {
//       folder,
//       resource_type: type,
//    });
//    return result;
// };
const removeFile = async (files) => {
   let fileList = [];
   if (files.images) fileList = [...files.images];
   if (files.videos) fileList = [...fileList, ...files.videos];
   await cloudinary.api.delete_resources(fileList.map((file) => file.filename));
};

// get all post
module.exports.getAllPostsHandler = async (req, res, next) => {
   try {
      const feedPosts = await db.Posts.findAll({
         order: Sequelize.literal('rand()'),
         // attributes: { exclude: ['createdAt', 'updatedAt'] },
         include: [
            { model: db.Posts_image, as: 'images' },
            { model: db.Posts_video, as: 'videos' },
            { model: db.Comments, as: 'comments' },
            { model: db.Liked, as: 'likes' },
         ],
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
      const formData = {
         ...req.body,
         ...req.files,
      };
      // check user
      if (req.body.userPost !== req.user.user_name) {
         req.files && removeFile(req.files);
         return next(
            errorController.errorHandler(res, 'You are not allowed to create this post', 403),
         );
      }
      const newPosts = await db.Posts.create({
         audience: formData?.audience || 'public',
         content: formData?.content,
         user_posts: req.user.user_name,
      });
      if (req.files) {
         if (formData.images && formData.images.length !== 0) {
            const listImages = formData.images.map((image) => {
               return { url: image.path, file_name: image.filename, posts_id: newPosts.posts_id };
            });
            await db.Posts_image.bulkCreate(listImages);
         }
         if (formData.videos && formData.videos.length !== 0) {
            const listVideo = formData.videos.map((video) => {
               return { url: video.path, file_name: video.filename, posts_id: newPosts.posts_id };
            });
            await db.Posts_video.bulkCreate(listVideo);
         }
      }
      next(
         res.status(201).json({
            formData,
            mes: 'create new posts is success!',
         }),
      );
   } catch (error) {
      removeFile(req.files);
      console.log('error', error);
      errorController.serverErrorHandle(error, res);
   }
};

// get posts by id
module.exports.getPostsByIdHandler = async (req, res, next) => {
   try {
      if (!Number.isInteger(req.params.id)) {
         return next(errorController.errorHandler(res, 'id cannot be blank!', 404));
      }
      const result = await db.Posts.findOne({
         where: { posts_id: req.params.id },
         include: [
            { model: db.Posts_image, as: 'images' },
            { model: db.Posts_video, as: 'videos' },
            { model: db.Comments, as: 'comments' },
            { model: db.Liked, as: 'likes' },
         ],
      });
      if (result === null)
         return next(errorController.errorHandler(res, 'This post could not be found', 404));
      next(
         res.status(200).json({
            result,
         }),
      );
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
      const deletePosts = await db.Posts.destroy({ where: { posts_id: req.params.id } });
      if (deletePosts === 0)
         return next(errorController.errorHandler(res, 'This post could not be found', 404));
      next(res.status(200).json({ mes: 'delete posts is success' }));
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
