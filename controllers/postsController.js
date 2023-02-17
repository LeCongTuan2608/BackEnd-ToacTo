const db = require('../models/index');
const errorController = require('./errorController');
const dotenv = require('dotenv');
const Sequelize = require('sequelize');
dotenv.config();

// const uploadFile = async (file, folder, type) => {
//    const result = await cloudinary.uploader.upload(file, {
//       folder,
//       resource_type: type,
//    });
//    return result;
// };

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
      const formData = { ...req.body };
      // check user
      // if (req.body.userPost !== req.user.user_name) {
      //    return next(
      //       errorController.errorHandler(res, 'You are not allowed to create this post', 403),
      //    );
      // }
      // upload.fields([{ name: 'images' }, { name: 'videos' }]),

      // const newPosts = await db.Posts.create({
      //    audience: formData?.audience || 'public',
      //    content: formData?.content,
      //    user_posts: req.user.user_name,
      // });
      // if (req.files && formData.images && formData.images.length !== 0) {
      //    const listImages = formData.images.map((file) => {
      //       return { img: file.path, posts_id: newPosts.posts_id };
      //    });
      //    await db.Posts_img.bulkCreate(listImages);
      // }
      // if (req.files && formData.videos && formData.videos.length !== 0) {
      //    // const listVideo = formData.videos.map((video) => {
      //    //    return { video: videos.originalname, posts_id: newPosts.posts_id };
      //    // });
      //    // await db.Posts_video.bulkCreate(listVideo);
      //    return next(
      //       res.status(201).json({
      //          formData,
      //          mes: 'create new posts is success!',
      //       }),
      //    );
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
